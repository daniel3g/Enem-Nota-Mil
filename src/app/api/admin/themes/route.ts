import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminUser } from "@/lib/admin-auth";
import { supabaseAdmin } from "../../../../../utils/supabase/admin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const ThemeSchema = z.object({
  title: z.string().trim().min(3, "Titulo do tema e obrigatorio."),
  slug: z.string().trim().min(3).optional(),
  year: z.coerce.number().int().min(1900).max(2100).nullable().optional(),
  exam: z.string().trim().min(1).max(50).default("ENEM"),
  suggestedUse: z.string().trim().max(255).nullable().optional(),
  pdfPath: z.string().trim().min(1, "Caminho do PDF e obrigatorio."),
  coverUrl: z.string().trim().url().nullable().optional(),
  active: z.boolean().default(true),
});

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export async function POST(req: Request) {
  const admin = await requireAdminUser();
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const body = await req.json().catch(() => null);
  const parsed = ThemeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request body", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const theme = parsed.data;
  const slug = theme.slug ? slugify(theme.slug) : slugify(theme.title);

  if (!slug) {
    return NextResponse.json({ error: "Slug invalido." }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("themes")
    .insert({
      title: theme.title,
      slug,
      year: theme.year ?? null,
      exam: theme.exam,
      suggested_use: theme.suggestedUse ?? null,
      pdf_path: theme.pdfPath,
      cover_url: theme.coverUrl ?? null,
      active: theme.active,
    })
    .select("id,title,slug,year,exam,suggested_use,pdf_path,cover_url,active")
    .single();

  if (error) {
    const isUniqueError = error.code === "23505";
    return NextResponse.json(
      {
        error: isUniqueError
          ? "Ja existe um tema com esse slug."
          : error.message,
      },
      { status: isUniqueError ? 409 : 400 }
    );
  }

  return NextResponse.json({ theme: data }, { status: 201 });
}
