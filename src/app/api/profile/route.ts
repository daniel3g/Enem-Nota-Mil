import { NextRequest } from "next/server";
import { createClient } from "../../../../utils/supabase/server";

export async function GET() {
  const supabase = await createClient();

  // 1) Tenta pegar o usuário
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  let user = userData?.user ?? null;

  // Fallback (alguns ambientes): tenta pela sessão
  if (!user) {
    const { data: sessData } = await supabase.auth.getSession();
    user = sessData?.session?.user ?? null;
  }

  if (userErr || !user) {
    return new Response(JSON.stringify({ error: "Não autenticado" }), { status: 401 });
  }

  // 2) Busca o perfil (pode não existir ainda)
  const { data: profile, error: profErr } = await supabase
    .from("profiles")
    .select("full_name, phone, cpf_cnpj")
    .eq("id", user.id)
    .maybeSingle();

  if (profErr && profErr.code !== "PGRST116") {
    return new Response(JSON.stringify({ error: profErr.message }), { status: 500 });
  }

  // 3) Preenche com metadados do Auth se o perfil ainda não tiver valores
  const meta = user.user_metadata ?? {};
  const full_name = profile?.full_name ?? meta.full_name ?? null;
  const phone = profile?.phone ?? meta.phone ?? null;
  const cpf_cnpj = profile?.cpf_cnpj ?? null;

  return new Response(
    JSON.stringify({
      email: user.email ?? "",      // <- garante e-mail
      full_name,
      phone,
      cpf_cnpj,
    }),
    { status: 200 }
  );
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  if (!user) {
    return new Response(JSON.stringify({ error: "Não autenticado" }), { status: 401 });
  }

  const { full_name, phone, cpf_cnpj } = await req.json();

  // Upsert no próprio perfil
  const { error: upErr } = await supabase
    .from("profiles")
    .upsert({ id: user.id, full_name, phone, cpf_cnpj }, { onConflict: "id" });

  if (upErr) {
    return new Response(JSON.stringify({ error: upErr.message }), { status: 500 });
  }

  // Mantém metadados de nome/phone também no Auth (opcional, mas útil)
  await supabase.auth.updateUser({ data: { full_name: full_name ?? "", phone: phone ?? "" } });

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
