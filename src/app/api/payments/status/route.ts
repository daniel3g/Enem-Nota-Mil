import { NextResponse } from "next/server";
import { asaas } from "../../../../../lib/asaas/client";
import { supabaseAdmin } from "../../../../../utils/supabase/admin";
import { createClient } from "../../../../../utils/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const PROVIDER = "asaas";
const CREDIT_TYPE_PURCHASE = "credit_purchase";
const PAID_STATUSES = new Set(["RECEIVED", "CONFIRMED", "RECEIVED_IN_CASH"]);
const FAIL_STATUSES = new Set(["OVERDUE", "DELETED", "CANCELED", "CANCELLED"]);

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

function normalizeRaw(raw: unknown) {
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }

  if (!raw || typeof raw !== "object") return {};
  return raw;
}

async function syncPaymentWithAsaas(payment: {
  id: number;
  user_id: string;
  status: string;
  amount_cents: number;
  raw: unknown;
  external_id: string;
}) {
  const { data: asaasPayment } = await asaas.get(`/payments/${payment.external_id}`);
  const remoteStatus = String(asaasPayment?.status ?? "").toUpperCase();
  const rawSafe = normalizeRaw(payment.raw);
  const mergedRaw = {
    ...rawSafe,
    asaasPayment,
    last_status_sync_at: new Date().toISOString(),
    last_status_sync_source: "/api/payments/status",
  };

  if (PAID_STATUSES.has(remoteStatus)) {
    await supabaseAdmin
      .from("payments")
      .update({ status: "paid", raw: mergedRaw })
      .eq("id", payment.id);

    let credits: number | null =
      typeof rawSafe?.package?.credits === "number" ? rawSafe.package.credits : null;

    if (!credits) {
      credits =
        inferCreditsFromExtRef(asaasPayment?.externalReference) ??
        inferCreditsFromAmountCents(payment.amount_cents);
    }

    if (credits && credits > 0) {
      const { data: existingCredit } = await supabaseAdmin
        .from("credit_transactions")
        .select("id")
        .contains("meta", { external_payment_id: payment.external_id })
        .maybeSingle();

      if (!existingCredit) {
        await supabaseAdmin.from("credit_transactions").insert({
          user_id: payment.user_id,
          type: CREDIT_TYPE_PURCHASE,
          amount: Number(credits),
          meta: {
            provider: PROVIDER,
            payment_id: payment.id,
            external_payment_id: payment.external_id,
            package_key: rawSafe?.package?.key ?? null,
            externalReference: asaasPayment?.externalReference ?? null,
            source: "payments/status-sync",
          },
        });
      }
    }

    return "paid";
  }

  if (FAIL_STATUSES.has(remoteStatus)) {
    await supabaseAdmin
      .from("payments")
      .update({ status: "failed", raw: mergedRaw })
      .eq("id", payment.id);

    return "failed";
  }

  await supabaseAdmin
    .from("payments")
    .update({ raw: mergedRaw })
    .eq("id", payment.id);

  return payment.status;
}

export async function GET(req: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const ext = searchParams.get("external");
  if (!ext) return NextResponse.json({ error: "external required" }, { status: 400 });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("payments")
    .select("id, user_id, status, amount_cents, raw, external_id")
    .eq("external_id", ext)
    .single();

  if (error || !data || data.user_id !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let status = data.status;

  if (status !== "paid") {
    try {
      status = await syncPaymentWithAsaas(data);
    } catch (err: any) {
      console.error("[payments/status] sync error:", err?.response?.data || err);
    }
  }

  return NextResponse.json({ status });
}
