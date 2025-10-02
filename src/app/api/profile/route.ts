// app/api/profile/route.ts
import { NextResponse } from "next/server";
import { createClient } from "../../../../utils/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { cpf_cnpj } = await req.json();
  const { error } = await supabase.from("profiles").update({ cpf_cnpj }).eq("id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
