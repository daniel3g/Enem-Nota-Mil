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

export async function POST(req: Request) {
  try {
    // (Opcional) segredo simples
    const url = new URL(req.url);
    const secret = url.searchParams.get("secret");
    if (process.env.WEBHOOK_ASAAS_SECRET && secret !== process.env.WEBHOOK_ASAAS_SECRET) {
      return NextResponse.json({ error: "Unauthorized webhook" }, { status: 401 });
    }

    const payload = await req.json();
    const eventType: string | undefined = payload?.event || payload?.type;

    const payment = getPaymentFromPayload(payload);
    const externalId: string | undefined = payment?.id;

    if (!eventType) return NextResponse.json({ error: "Missing event type" }, { status: 400 });

    // 1) Log + idempotência em webhook_events
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
      const { data: ins, error: evtErr } = await supabaseAdmin
        .from("webhook_events")
        .insert({ provider: PROVIDER, external_id: externalId, event_type: eventType, payload })
        .select("id")
        .single();
      if (!evtErr) webhookId = ins.id;
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

    // 3) Ação por tipo de evento
    const mergedRaw = { ...(dbPayment.raw || {}), last_webhook_event: eventType, last_webhook_payload: payload };

    if (PAID_EVENTS.has(eventType)) {
      if (dbPayment.status !== "paid") {
        await supabaseAdmin.from("payments").update({ status: "paid", raw: mergedRaw }).eq("id", dbPayment.id);

        const pack = dbPayment.raw?.package;
        const credits: number | undefined = pack?.credits;
        const packageKey: string | undefined = pack?.key;

        if (credits && credits > 0) {
          // evita duplicar crédito
          const { data: existsCredit } = await supabaseAdmin
            .from("credit_transactions")
            .select("id")
            .contains("meta", { external_payment_id: externalId })
            .maybeSingle();

          if (!existsCredit) {
            await supabaseAdmin.from("credit_transactions").insert({
              user_id: dbPayment.user_id,
              type: CREDIT_TYPE_PURCHASE,
              amount: credits,
              meta: {
                provider: PROVIDER,
                payment_id: dbPayment.id,
                external_payment_id: externalId,
                package_key: packageKey,
              },
            });
          }
        } else {
          console.error("payments.raw.package ausente/sem credits:", dbPayment.id);
        }
      }
    } else if (REFUND_EVENTS.has(eventType)) {
      await supabaseAdmin.from("payments").update({ status: "refunded", raw: mergedRaw }).eq("id", dbPayment.id);

      const pack = dbPayment.raw?.package;
      const credits: number | undefined = pack?.credits;
      const packageKey: string | undefined = pack?.key;

      if (credits && credits > 0) {
        const { data: credited } = await supabaseAdmin
          .from("credit_transactions")
          .select("id")
          .contains("meta", { external_payment_id: externalId })
          .eq("type", CREDIT_TYPE_PURCHASE)
          .maybeSingle();

        const { data: reversed } = await supabaseAdmin
          .from("credit_transactions")
          .select("id")
          .contains("meta", { external_payment_id: externalId })
          .eq("type", CREDIT_TYPE_REVERSAL)
          .maybeSingle();

        if (credited && !reversed) {
          await supabaseAdmin.from("credit_transactions").insert({
            user_id: dbPayment.user_id,
            type: CREDIT_TYPE_REVERSAL,
            amount: -credits,
            meta: {
              provider: PROVIDER,
              payment_id: dbPayment.id,
              external_payment_id: externalId,
              package_key: packageKey,
              reason: eventType,
            },
          });
        }
      }
    } else if (FAIL_EVENTS.has(eventType)) {
      const newStatus = eventType === "PAYMENT_CANCELLED" ? "canceled" : "failed";
      await supabaseAdmin.from("payments").update({ status: newStatus, raw: mergedRaw }).eq("id", dbPayment.id);
    } else {
      await supabaseAdmin.from("payments").update({ raw: mergedRaw }).eq("id", dbPayment.id);
    }

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
