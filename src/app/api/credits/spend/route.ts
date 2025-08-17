import { NextResponse } from "next/server";
import { createClient } from "../../../../../utils/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { amount = 1, reason = "essay_submission" } = await request.json().catch(() => ({}));

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { error } = await supabase.rpc("spend_credits", {
    p_amount: amount,
    p_reason: reason,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
