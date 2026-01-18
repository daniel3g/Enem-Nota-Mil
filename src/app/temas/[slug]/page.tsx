import { createClient } from "../../../../utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ slug: string }> };

export default async function TemaDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");

  const { data: theme, error } = await supabase
    .from("themes")
    .select("id,title,slug,year,exam,suggested_use,pdf_path")
    .eq("slug", slug)
    .eq("active", true)
    .single();

  if (error || !theme) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8">
        <p className="text-red-600">Tema não encontrado.</p>
        <Link href="/temas" className="text-slate-700 underline">Voltar</Link>
      </main>
    );
  }

  const { data } = supabase.storage
  .from("themes")
  .getPublicUrl(theme.pdf_path);

const pdfUrl = data.publicUrl;



  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-4 flex items-center justify-between gap-3">
        <Link href="/temas" className="text-sm font-semibold text-slate-600 hover:text-slate-900">
          ← Voltar ao Banco de Temas
        </Link>

        <Link
          href={`/redacao?theme=${theme.id}`}
          target="_blank"
          className="rounded-md bg-customGreen px-5 py-2.5 text-sm font-extrabold text-white hover:opacity-95"
        >
          Escrever redação
        </Link>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-6">
          <div className="text-xs font-extrabold text-customGreen">BANCO DE TEMAS</div>
          <h1 className="mt-1 font-heading text-2xl md:text-3xl font-extrabold text-slate-900">
            {theme.title}
          </h1>

          <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-slate-700 sm:grid-cols-2">
            <div><b>Modalidade:</b> {theme.exam ?? "ENEM"}</div>
            <div><b>Ano:</b> {theme.year ?? "—"}</div>
            {theme.suggested_use && (
              <div className="sm:col-span-2">
                <b>Sugestão de uso:</b> {theme.suggested_use}
              </div>
            )}
          </div>
        </div>

        <div className="p-6">
          {!pdfUrl ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800">
                <b>Não foi possível carregar o PDF.</b>
                <div className="text-sm mt-1">
                
                </div>
            </div>
            ) : (
            <iframe
                src={pdfUrl}
                className="h-[75vh] w-full rounded-lg border border-slate-200 bg-white"
            />
            )}

          <div className="mt-6 flex justify-end">
            <Link
              href={`/redacao?theme=${theme.id}`}
              target="_blank"
              className="rounded-md bg-customGreen px-6 py-3 text-sm font-extrabold text-white hover:opacity-95"
            >
              Escrever redação
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
