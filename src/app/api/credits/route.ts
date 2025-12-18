// app/api/credits/route.ts
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { createClient } from "../../../../utils/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 👇 Lê direto da view que já calcula grant/use/purchase corretamente
  const { data, error } = await supabase
    .from("user_credit_balance")
    .select("balance")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error && error.code !== "PGRST116") {
    // PGRST116 = no rows, tratamos como 0 créditos
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const balance = data?.balance ?? 0;
  return NextResponse.json({ balance });
}
