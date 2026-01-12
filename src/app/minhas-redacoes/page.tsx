import { createClient } from "../../../utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import EssayCard from "@/components/EssayCard";

export const dynamic = "force-dynamic";

type Correction = {
  id: string;
  model: string | null;
  score: number | null;
  feedback: any;
  created_at: string;
};

type Essay = {
  id: string;
  title: string | null;
  content: string | null;
  status: "draft" | "queued" | "processing" | "done" | "failed";
  created_at: string;
  essay_corrections?: Correction[];
};

export default async function MinhasRedacoesPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) redirect("/login");

  // Créditos (opcional)
  const { data: creditRow } = await supabase
    .from("user_credit_balance")
    .select("balance")
    .eq("user_id", user.id)
    .maybeSingle();

  const credits = creditRow?.balance ?? 0;

  // Redações + correções (inclui content, model, feedback)
  const { data: essays, error } = await supabase
    .from("essays")
    .select(
      `
        id,
        title,
        content,
        status,
        created_at,
        essay_corrections (
          id,
          model,
          score,
          feedback,
          created_at
        )
      `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="mx-auto w-full max-w-5xl px-4 py-8">
        <h1 className="text-2xl font-semibold mb-4">Minhas Redações</h1>
        <p className="text-red-600">Erro ao carregar: {error.message}</p>
      </main>
    );
  }

  const typedEssays = (essays ?? []) as Essay[];

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8">
      {/* Topo */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="px-6 py-6">
          <div className="text-emerald-600 font-semibold">
            {new Date().getFullYear()}
          </div>

          <h1 className="mt-1 text-4xl font-extrabold tracking-tight text-slate-800">
            REDAÇÕES
          </h1>

          <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p className="text-slate-600">
              Você possui{" "}
              <span className="inline-flex items-center rounded-md bg-emerald-100 px-2 py-0.5 text-sm font-bold text-emerald-700">
                {credits}
              </span>{" "}
              créditos para redação.
            </p>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Link
                href="/redacao"
                className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700"
              >
                ENVIAR NOVA REDAÇÃO
              </Link>

              <Link
                href="/comprar"
                className="inline-flex items-center justify-center rounded-md bg-slate-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-slate-800"
              >
                COMPRAR CRÉDITOS
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200" />

        {/* Lista 1 por linha */}
        <div className="px-6 py-6">
          {typedEssays.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <p className="text-slate-700">Você ainda não enviou nenhuma redação.</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {typedEssays.map((e) => (
                <li key={e.id}>
                  {/* Card retangular por linha */}
                  <EssayCard essay={e} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
