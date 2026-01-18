import Link from "next/link";
import Image from "next/image";
import { createClient } from "../../../utils/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type Theme = {
  id: string;
  title: string;
  slug: string;
  year: number | null;
  exam: string | null;
  suggested_use: string | null;
  cover_url: string | null;
};

export default async function TemasPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");

  const { data, error } = await supabase
    .from("themes")
    .select("id,title,slug,year,exam,suggested_use,cover_url")
    .eq("active", true)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl font-heading font-extrabold text-customBlackLight">
          Banco de Temas
        </h1>
        <p className="mt-4 text-red-600">Erro ao carregar: {error.message}</p>
      </main>
    );
  }

  const themes = (data ?? []) as Theme[];

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <div className="text-xs font-extrabold text-customGreen">BANCO DE TEMAS</div>
        <h1 className="mt-1 text-3xl md:text-4xl font-heading font-extrabold text-customBlackLight">
          Escolha um tema para escrever
        </h1>
        <p className="mt-2 text-slate-600">
          Abra a proposta em PDF e depois clique em <b>Escrever redação</b>.
        </p>
      </div>

      {themes.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-slate-700">Ainda não há temas cadastrados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {themes.map((t) => (
            <Link
              key={t.id}
              href={`/temas/${t.slug}`}
              className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
            >
              <div className="relative h-40 bg-slate-100">
                {t.cover_url ? (
                  <Image
                    src={t.cover_url}
                    alt={t.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-slate-100 to-slate-200" />
                )}

                <div className="absolute left-3 top-3">
                  <span className="inline-flex rounded-md bg-customGreen px-3 py-1 text-xs font-extrabold text-white">
                    {t.exam ?? "ENEM"}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-heading font-extrabold text-sm text-slate-900 line-clamp-2">
                  {t.title}
                </h3>

                <div className="mt-3 space-y-1 text-xs text-slate-600">
                  {t.suggested_use && (
                    <div>
                      <b>Sugestão:</b> {t.suggested_use}
                    </div>
                  )}
                  <div>
                    <b>Ano:</b> {t.year ?? "—"} • <b>Modelo:</b> {t.exam ?? "ENEM"}
                  </div>
                </div>

                <div className="mt-4 inline-flex items-center text-sm font-extrabold text-customPurple group-hover:underline">
                  Abrir tema →
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
