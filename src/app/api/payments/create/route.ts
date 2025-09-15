import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient as createSupabaseServer } from "../../../../../utils/supabase/server";
import { asaas } from "../../../../../lib/asaas/client";

const BodySchema = z.object({
  packageKey: z.enum(["p1", "p5", "p10"]),
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

export async function POST(req: Request) {
  // usa teu util SSR que já lê os cookies do Next
  const supabase = await createSupabaseServer();

  try {
    // 1) Auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 2) Body
    const body = await req.json();
    const { packageKey } = BodySchema.parse(body);
    const pack = PACKS[packageKey];

    // 3) Buscar profile com asaas_customer_id
    const { data: profile, error: pErr } = await supabase
      .from("profiles")
      .select("asaas_customer_id, full_name")
      .eq("id", user.id)
      .single();

    if (pErr || !profile) {
      return NextResponse.json({ error: "Perfil não encontrado." }, { status: 400 });
    }
    if (!profile.asaas_customer_id) {
      return NextResponse.json(
        { error: "Usuário sem asaas_customer_id. Vincule o customer no Asaas." },
        { status: 400 }
      );
    }

    // 4) Criar cobrança Asaas
    const dueDate = addDays(new Date(), 3);
    const paymentPayload = {
      customer: profile.asaas_customer_id,
      billingType: "PIX", // ou "UNDEFINED" se preferir deixar a página decidir
      value: Number(pack.price.toFixed(2)),
      description: `${pack.description} - ${pack.credits} créditos`,
      dueDate,
      externalReference: `${user.id}:${packageKey}:${Date.now()}`,
    };

    const { data: asaasPayment } = await asaas.post("/payments", paymentPayload);
    const paymentId: string | undefined = asaasPayment?.id;
    const checkoutUrl: string | undefined =
      asaasPayment?.invoiceUrl || asaasPayment?.bankSlipUrl || asaasPayment?.transactionReceiptUrl;

    if (!paymentId || !checkoutUrl) {
      return NextResponse.json({ error: "Falha ao gerar link de pagamento no Asaas." }, { status: 502 });
    }

    // 5) Persistir em payments (pending)
    const { error: insErr } = await supabase.from("payments").insert({
      user_id: user.id,
      provider: "asaas",
      external_id: paymentId,
      status: "pending",
      amount_cents: toCents(pack.price),
      raw: {
        asaasPayment,
        package: { key: packageKey, ...pack },
        created_by_route: "/api/payments/create",
      },
    });

    if (insErr) {
      return NextResponse.json(
        {
          warning: "Pagamento criado no Asaas, mas falhou ao registrar em payments.",
          checkoutUrl,
          externalPaymentId: paymentId,
        },
        { status: 207 }
      );
    }

    // 6) Retorno
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
