// app/api/payments/status/route.ts
import { NextResponse } from "next/server";
import { createClient } from "../../../../../utils/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const ext = searchParams.get("external");
  if (!ext) return NextResponse.json({ error: "external required" }, { status: 400 });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("payments")
    .select("id, user_id, status")
    .eq("external_id", ext)
    .single();

  if (error || !data || data.user_id !== user.id)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ status: data.status });
}
