import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../../utils/supabase/admin";

const PROVIDER = "asaas";
const CREDIT_TYPE_PURCHASE = "credit_purchase";
const CREDIT_TYPE_REVERSAL = "credit_reversal";

const PAID_EVENTS = new Set(["PAYMENT_CONFIRMED", "PAYMENT_RECEIVED"]);
const REFUND_EVENTS = new Set(["PAYMENT_REFUNDED", "PAYMENT_CHARGEBACK", "PAYMENT_REVERSED"]);
const FAIL_EVENTS = new Set(["PAYMENT_OVERDUE", "PAYMENT_DELETED", "PAYMENT_CANCELLED"]);

function getPaymentFromPayload(payload: any) {
  return payload?.payment ?? payload?.data ?? payload?.object ?? null;
}
function inferCreditsFromExtRef(extRef?: string): number | null {
  if (!extRef) return null;
  const parts = String(extRef).split(":");
  const pkg = parts[1];
  if (pkg === "p1") return 1;
  if (pkg === "p5") return 5;
  if (pkg === "p10") return 10;
  return null;
}
function inferCreditsFromAmountCents(amountCents?: number): number | null {
  if (amountCents == null) return null;
  if (amountCents === 990) return 1;
  if (amountCents === 3990) return 5;
  if (amountCents === 6990) return 10;
  return null;
}

export async function POST(req: Request) {
  try {
    // (opcional) segredo
    const url = new URL(req.url);
    const secret = url.searchParams.get("secret");
    if (process.env.WEBHOOK_ASAAS_SECRET && secret !== process.env.WEBHOOK_ASAAS_SECRET) {
      return NextResponse.json({ error: "Unauthorized webhook" }, { status: 401 });
    }

    const payload = await req.json();
    const eventType: string | undefined = payload?.event || payload?.type;
    const payment = getPaymentFromPayload(payload);
    const externalId: string | undefined = payment?.id;
    const externalReference: string | undefined = payment?.externalReference;

    if (!eventType) return NextResponse.json({ error: "Missing event type" }, { status: 400 });

    // 1) Log + idempotência
    if (!externalId) {
      await supabaseAdmin.from("webhook_events").insert({
        provider: PROVIDER, external_id: null, event_type: eventType, payload,
      });
      return NextResponse.json({ warning: "No payment.id; logged." }, { status: 202 });
    }

    const { data: existingEvt } = await supabaseAdmin
      .from("webhook_events")
      .select("id, processed_at")
      .eq("provider", PROVIDER)
      .eq("external_id", externalId)
      .eq("event_type", eventType)
      .maybeSingle();

    if (existingEvt?.processed_at) {
      return NextResponse.json({ ok: true, alreadyProcessed: true });
    }

    let webhookId: number | null = null;
    if (!existingEvt) {
      const { data: ins } = await supabaseAdmin
        .from("webhook_events")
        .insert({ provider: PROVIDER, external_id: externalId, event_type: eventType, payload })
        .select("id")
        .single();
      webhookId = ins?.id ?? null;
    } else {
      webhookId = existingEvt.id;
      await supabaseAdmin.from("webhook_events").update({ payload }).eq("id", webhookId);
    }

    // 2) Localiza payment interno
    const { data: dbPayment } = await supabaseAdmin
      .from("payments")
      .select("id, user_id, status, amount_cents, raw")
      .eq("provider", PROVIDER)
      .eq("external_id", externalId)
      .single();

    if (!dbPayment) {
      if (webhookId) {
        await supabaseAdmin.from("webhook_events")
          .update({ processed_at: new Date().toISOString() })
          .eq("id", webhookId);
      }
      return NextResponse.json({ warning: "Payment not found; event logged." }, { status: 202 });
    }

    // 🔐 raw pode vir string => parse seguro
    let rawSafe: any = dbPayment.raw;
    if (typeof rawSafe === "string") {
      try { rawSafe = JSON.parse(rawSafe); } catch { rawSafe = {}; }
    } else if (!rawSafe || typeof rawSafe !== "object") {
      rawSafe = {};
    }

    const mergedRaw = { ...rawSafe, last_webhook_event: eventType, last_webhook_payload: payload };

    // 3) Ação por tipo de evento
    // ...
if (PAID_EVENTS.has(eventType)) {
  if (dbPayment.status !== "paid") {
    await supabaseAdmin
      .from("payments")
      .update({ status: "paid", raw: mergedRaw })
      .eq("id", dbPayment.id);

    // Descobrir créditos
    let credits: number | null = rawSafe?.package?.credits ?? null;
    if (!credits) {
      credits = inferCreditsFromExtRef(externalReference)
        ?? inferCreditsFromAmountCents(dbPayment.amount_cents)
        ?? null;
    }

    if (credits && credits > 0) {
      // Idempotência
      const { data: existsCredit, error: existsErr } = await supabaseAdmin
        .from("credit_transactions")
        .select("id")
        .contains("meta", { external_payment_id: externalId })
        .maybeSingle();

      if (existsErr) {
        console.error("[asaas/webhook] existsCredit error:", existsErr);
      }

      if (!existsCredit) {
        const insertPayload = {
          user_id: dbPayment.user_id,
          type: CREDIT_TYPE_PURCHASE,
          amount: Number(credits),
          meta: {
            provider: PROVIDER,
            payment_id: dbPayment.id,
            external_payment_id: externalId,
            package_key: rawSafe?.package?.key ?? null,
            externalReference: externalReference ?? null,
          },
        };

        const { data: insCredit, error: insErr } = await supabaseAdmin
          .from("credit_transactions")
          .insert(insertPayload)
          .select("id")
          .single();

        if (insErr) {
          console.error("[asaas/webhook] credit insert error:", insErr, "payload:", insertPayload);
        } else {
          console.log("[asaas/webhook] credited OK:", { credit_id: insCredit?.id, credits, externalId });
        }
      } else {
        console.log("[asaas/webhook] credit already exists (idempotent)", { externalId, credit_id: existsCredit.id });
      }
    } else {
      console.error("[asaas/webhook] could not infer credits", {
        paymentId: dbPayment.id,
        extRef: externalReference,
        amount_cents: dbPayment.amount_cents,
        rawPackage: rawSafe?.package,
      });
    }
  } else {
    console.log("[asaas/webhook] payment already paid (skip)", { externalId });
  }
}
// ...


    // 4) Marca processado
    if (webhookId) {
      await supabaseAdmin
        .from("webhook_events")
        .update({ processed_at: new Date().toISOString() })
        .eq("id", webhookId);
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Asaas webhook error:", err?.response?.data || err);
    return NextResponse.json({ error: "Webhook handling failed" }, { status: 500 });
  }
}
