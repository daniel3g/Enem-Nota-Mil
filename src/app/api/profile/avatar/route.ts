import { NextRequest } from "next/server";
import { createClient } from "../../../../../utils/supabase/server";

function getExt(filename: string) {
  const m = filename.toLowerCase().match(/\.(jpg|jpeg|png|webp|gif)$/i);
  return m ? m[0] : ".png";
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) return new Response(JSON.stringify({ error: "Não autenticado" }), { status: 401 });

  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return new Response(JSON.stringify({ error: "Arquivo ausente" }), { status: 400 });

  // valida tipos
  const mime = file.type || "image/png";
  if (!/^image\/(png|jpe?g|webp|gif)$/i.test(mime)) {
    return new Response(JSON.stringify({ error: "Tipo de imagem inválido" }), { status: 400 });
  }

  const arrayBuf = await file.arrayBuffer();
  const ext = getExt(file.name || "avatar.png");
  const path = `${user.id}/${Date.now()}${ext}`;

  // upload
  const { error: upErr } = await supabase.storage
    .from("avatars")
    .upload(path, new Uint8Array(arrayBuf), { contentType: mime, upsert: false });

  if (upErr) {
    return new Response(JSON.stringify({ error: upErr.message }), { status: 500 });
  }

  // URL pública
  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(path);

  // salva no perfil
  const { error: profErr } = await supabase
    .from("profiles")
    .update({ avatar_url: publicUrl })
    .eq("id", user.id);

  if (profErr) {
    return new Response(JSON.stringify({ error: profErr.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ avatar_url: publicUrl }), { status: 200 });
}
