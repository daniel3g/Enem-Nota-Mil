import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin-auth";
import { supabaseAdmin } from "../../../../../../utils/supabase/admin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const BUCKET = "themes";
const BASE_FOLDER = "enem-2026";

function sanitizeFileName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export async function POST(req: Request) {
  const admin = await requireAdminUser();
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const form = await req.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Arquivo PDF obrigatorio." }, { status: 400 });
  }

  const isPdf =
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

  if (!isPdf) {
    return NextResponse.json({ error: "Envie um arquivo PDF valido." }, { status: 400 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const fileName = sanitizeFileName(file.name.replace(/\.pdf$/i, "")) || "tema";
  const path = `${BASE_FOLDER}/${Date.now()}-${fileName}.pdf`;

  const { error } = await supabaseAdmin.storage.from(BUCKET).upload(path, bytes, {
    contentType: "application/pdf",
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
