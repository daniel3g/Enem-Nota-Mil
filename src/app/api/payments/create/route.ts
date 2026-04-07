import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient as createSupabaseServer } from "../../../../../utils/supabase/server";
import { asaas, asaasEnvDebug } from "../../../../../lib/asaas/client";

const BodySchema = z.object({
  packageKey: z.enum(["p1", "p5", "p10"]),
  billingType: z.enum(["PIX", "CREDIT_CARD"]),
});

const PACKS = {
  p1: { credits: 1,  price: 9.90,  description: "Pacote 1 crédito" },
  p5: { credits: 5,  price: 39.90, description: "Pacote 5 créditos" },
  p10:{ credits: 10, price: 69.90, description: "Pacote 10 créditos" },
} as const;

function toCents(v: number) { return Math.round(v * 100); }
function addDays(base: Date, days: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

function getAsaasErrorCode(err: any) {
  return err?.response?.data?.errors?.[0]?.code;
}

function isInvalidAsaasCustomer(err: any) {
  return getAsaasErrorCode(err) === "invalid_customer";
}

async function createAsaasCustomer(params: {
  name: string;
  email?: string;
  cpfCnpj: string;
}) {
  const customer = await asaas.post("/customers", {
    name: params.name,
    email: params.email,
    cpfCnpj: params.cpfCnpj,
  });

  const asaasId: string | undefined = customer?.data?.id;
  if (!asaasId) {
    console.error("[payments/create] Asaas customer response without id:", customer?.data);
    throw new Error("Falha ao criar cliente no Asaas.");
  }

  return asaasId;
}

export async function POST(req: Request) {
  const supabase = await createSupabaseServer();

  console.log(
    "[payments/create] ENV CHECK:",
    "ASAAS_BASE_URL:", asaasEnvDebug.baseURL,
    "ASAAS_API_KEY_LEN:", asaasEnvDebug.accessTokenLength,
    "ASAAS_API_KEY_PREFIX:", asaasEnvDebug.accessTokenPrefix,
    "ASAAS_API_KEY_SUFFIX:", asaasEnvDebug.accessTokenSuffix,
    "ASAAS_API_KEY_HAS_LEADING_BACKSLASH:", asaasEnvDebug.hasLeadingBackslash,
    "ASAAS_API_KEY_HAS_LEADING_DOLLAR:", asaasEnvDebug.hasLeadingDollar,
    "ASAAS_API_KEY_HAS_WHITESPACE:", asaasEnvDebug.hasWhitespace
  );

  if (!asaasEnvDebug.accessTokenLength || !asaasEnvDebug.baseURL) {
    return NextResponse.json(
      { error: "Configuração do Asaas ausente. Defina ASAAS_API_KEY e ASAAS_BASE_URL no .env.local" },
      { status: 500 }
    );
  }

  try {
    // 1) Auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = user.id;
    const userEmail = user.email;

    // 2) Body
    const body = await req.json();
    const { packageKey, billingType } = BodySchema.parse(body);
    const pack = PACKS[packageKey];

    // 3) Garantir profile (agora incluindo cpf_cnpj)
    let { data: profile, error: pErr } = await supabase
      .from("profiles")
      .select("id, full_name, cpf_cnpj, asaas_customer_id")
      .eq("id", userId)
      .single();

    if (pErr || !profile) {
      const fallbackName =
        (user.user_metadata?.full_name as string) ||
        (user.user_metadata?.name as string) ||
        (userEmail?.split("@")[0] as string) ||
        "Usuário";

      const { data: upserted, error: upErr } = await supabase
        .from("profiles")
        .upsert({ id: userId, full_name: fallbackName }, { onConflict: "id" })
        .select("id, full_name, cpf_cnpj, asaas_customer_id")
        .single();

      if (upErr || !upserted) {
        console.error("[payments/create] profiles upsert error:", upErr);
        return NextResponse.json({ error: "Falha ao criar/recuperar perfil." }, { status: 400 });
      }
      profile = upserted;
    }

    // 3.1 Exigir CPF/CNPJ (seu Asaas está pedindo)
    if (!profile.cpf_cnpj) {
      return NextResponse.json(
        { error: "Para continuar, informe seu CPF/CNPJ no perfil." },
        { status: 400 }
      );
    }

    const fallbackName =
      profile.full_name ||
      (user.user_metadata?.full_name as string) ||
      (user.user_metadata?.name as string) ||
      (userEmail?.split("@")[0] as string) ||
      "Usuario";

    async function persistAsaasCustomerId(asaasId: string) {
      const { error: updErr } = await supabase
        .from("profiles")
        .update({ asaas_customer_id: asaasId })
        .eq("id", userId);

      if (updErr) {
        console.error("[payments/create] failed to persist asaas_customer_id:", updErr);
        return false;
      }

      profile!.asaas_customer_id = asaasId;
      return true;
    }

    // 3.2 Garantir customer Asaas com cpfCnpj
    if (!profile.asaas_customer_id) {
      console.log("[payments/create] creating Asaas customer for:", userEmail);

      const asaasId = await createAsaasCustomer({
        name: fallbackName,
        email: userEmail,
        cpfCnpj: profile.cpf_cnpj,
      });

      if (!(await persistAsaasCustomerId(asaasId))) {
        return NextResponse.json({ error: "Falha ao vincular asaas_customer_id ao perfil." }, { status: 400 });
      }
    } else {
      // Se já existe customer e o CPF/CNPJ não está no Asaas, tentamos atualizar (best-effort)
      try {
        await asaas.put(`/customers/${profile.asaas_customer_id}`, {
          cpfCnpj: profile.cpf_cnpj,
        });
      } catch (e: any) {
        if (isInvalidAsaasCustomer(e)) {
          console.warn("[payments/create] existing Asaas customer is invalid; recreating:", profile.asaas_customer_id);

          const asaasId = await createAsaasCustomer({
            name: fallbackName,
            email: userEmail,
            cpfCnpj: profile.cpf_cnpj,
          });

          if (!(await persistAsaasCustomerId(asaasId))) {
            return NextResponse.json({ error: "Falha ao vincular novo asaas_customer_id ao perfil." }, { status: 400 });
          }
        } else {
          console.warn("[payments/create] warn: failed to update cpfCnpj on Asaas (continuando):", e?.response?.data ?? e);
        }
      }
    }

    // 4) Criar cobrança Asaas somente com os meios permitidos
    const dueDate = addDays(new Date(), 3);
    const paymentPayload = {
      customer: profile.asaas_customer_id!,
      billingType,
      value: Number(pack.price.toFixed(2)),
      description: `${pack.description} - ${pack.credits} créditos`,
      dueDate,
      externalReference: `${userId}:${packageKey}:${Date.now()}`,
    };

    console.log("[payments/create] creating Asaas payment:", {
      customer: paymentPayload.customer,
      value: paymentPayload.value,
      billingType: paymentPayload.billingType,
      dueDate: paymentPayload.dueDate,
    });

    let asaasPayment;
    try {
      ({ data: asaasPayment } = await asaas.post("/payments", paymentPayload));
    } catch (e: any) {
      if (!isInvalidAsaasCustomer(e)) throw e;

      console.warn("[payments/create] invalid_customer while creating payment; recreating customer and retrying:", profile.asaas_customer_id);

      const asaasId = await createAsaasCustomer({
        name: fallbackName,
        email: userEmail,
        cpfCnpj: profile.cpf_cnpj,
      });

      if (!(await persistAsaasCustomerId(asaasId))) {
        return NextResponse.json({ error: "Falha ao vincular novo asaas_customer_id ao perfil." }, { status: 400 });
      }

      paymentPayload.customer = asaasId;
      ({ data: asaasPayment } = await asaas.post("/payments", paymentPayload));
    }

    const paymentId: string | undefined = asaasPayment?.id;
    const checkoutUrl: string | undefined =
      asaasPayment?.invoiceUrl || asaasPayment?.bankSlipUrl || asaasPayment?.transactionReceiptUrl;

    if (!paymentId || !checkoutUrl) {
      console.error("[payments/create] Asaas payment missing id/checkoutUrl:", {
        billingType,
        asaasPayment,
      });
      return NextResponse.json(
        {
          error: "Falha ao gerar link de pagamento no Asaas.",
          details: "A resposta do Asaas nao retornou uma URL de checkout para o meio escolhido.",
        },
        { status: 502 }
      );
    }

    // 5) Persistir em payments (pending)
    const { error: insErr } = await supabase.from("payments").insert({
      user_id: userId,
      provider: "asaas",
      external_id: paymentId,
      status: "pending",
      amount_cents: toCents(pack.price),
      raw: {
        asaasPayment,
        billingType,
        package: { key: packageKey, ...pack },
        created_by_route: "/api/payments/create",
      },
    });

    if (insErr) {
      console.error("[payments/create] failed to insert into payments:", insErr);
      return NextResponse.json(
        {
          warning: "Pagamento criado no Asaas, mas falhou ao registrar em payments.",
          checkoutUrl,
          externalPaymentId: paymentId,
        },
        { status: 207 }
      );
    }

    return NextResponse.json(
      { ok: true, checkoutUrl, externalPaymentId: paymentId },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("payments/create error:", err?.response?.data || err);
    const message =
      err?.response?.data?.errors?.[0]?.description ||
      err?.message ||
      "Erro inesperado ao criar pagamento.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
