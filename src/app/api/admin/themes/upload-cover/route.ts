import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin-auth";
import { supabaseAdmin } from "../../../../../../utils/supabase/admin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const BUCKET = "themes";
const BASE_FOLDER = "cover-2026";

function sanitizeFileName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function getExtension(file: File) {
  const lower = file.name.toLowerCase();
  if (lower.endsWith(".png")) return "png";
  if (lower.endsWith(".webp")) return "webp";
  return "jpg";
}

export async function POST(req: Request) {
  const admin = await requireAdminUser();
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const form = await req.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Arquivo de capa obrigatorio." }, { status: 400 });
  }

  const isImage = /^image\/(png|jpe?g|webp)$/i.test(file.type);
  if (!isImage) {
    return NextResponse.json(
      { error: "Envie uma imagem PNG, JPG ou WEBP." },
      { status: 400 }
    );
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const baseName = sanitizeFileName(file.name.replace(/\.(png|jpe?g|webp)$/i, "")) || "capa";
  const ext = getExtension(file);
  const path = `${BASE_FOLDER}/${Date.now()}-${baseName}.${ext}`;

  const { error } = await supabaseAdmin.storage.from(BUCKET).upload(path, bytes, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);

  return NextResponse.json(
    {
      path,
      publicUrl: data.publicUrl,
    },
    { status: 201 }
  );
}
