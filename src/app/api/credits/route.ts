export const dynamic = "force-dynamic"       // evita cache em dev/prod
export const revalidate = 0                  // idem

import { NextResponse } from "next/server"
import { createClient } from "../../../../utils/supabase/server"

export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // soma direto na tabela (evita depender de view)
  const { data, error } = await supabase
    .from("credit_transactions")
    .select("amount")
    .eq("user_id", user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  const balance = (data ?? []).reduce((acc, r: any) => acc + (r.amount ?? 0), 0)
  return NextResponse.json({ balance })
}
