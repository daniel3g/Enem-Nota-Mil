import ClientBalanceBadge from "@/components/ClientBalanceBadge";
import EssayCard from "@/components/EssayCard";
import Link from "next/link";
import { createClient } from "../../../utils/supabase/server";

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

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data } = await supabase.auth.getUser();
  const user = data.user!;

  // nome (se quiser usar depois)
  await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  // saldo de créditos
  let initial = 0;
  {
    const { data: balanceRow, error: balanceError } = await supabase
      .from("user_credit_balance")
      .select("balance")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!balanceError && balanceRow?.balance != null) {
      initial = balanceRow.balance;
    }
  }

  // 🔽 Busca as 3 últimas redações do usuário (mesmo formato de minhas-redacoes)
  const { data: essays, error: essaysError } = await supabase
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
    .order("created_at", { ascending: false })
    .limit(3);

  const lastEssays = (essays ?? []) as Essay[];

  return (
    <div className="space-y-8">
      {/* REDAÇÕES PENDENTES (mantido) */}
      <section className="rounded-xl bg-white shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-extrabold tracking-tight text-customBlackLight">
            REDAÇÕES PENDENTES
          </h2>
        </div>

        <div className="p-6">
          <div className="rounded-lg border px-4 py-3 bg-[#E7F3C9] text-[#2E5C1A] border-[#cfe7a1]">
            <div className="font-bold">Lista vazia</div>
            <div className="text-sm">Nenhuma redação com erro.</div>
          </div>
        </div>
      </section>

      {/* REDAÇÕES (sem filtros) */}
      <section className="rounded-xl bg-white shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-end justify-between gap-4">
          <div className="flex items-baseline gap-3">
            <span className="text-customGreen font-bold text-sm">2026</span>
            <h2 className="text-2xl font-extrabold tracking-tight text-customBlackLight">
              REDAÇÕES
            </h2>
          </div>

          <Link
            href="/minhas-redacoes"
            className="text-sm font-semibold text-slate-600 hover:text-slate-800"
          >
            Ver todas →
          </Link>
        </div>

        <div className="p-6 space-y-6">
          {/* Créditos + botões (responsivo) */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-slate-700">Você possui</span>

              <span className="inline-flex items-center text-sm font-semibold px-2 py-1 rounded-lg bg-customGreen/10 text-customGreen border border-customGreen/30">
                <ClientBalanceBadge initial={initial} />
              </span>

              <span className="text-sm text-slate-700">
                créditos para redação.
              </span>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Link
                href="/comprar"
                className="px-4 py-2 rounded-md bg-slate-700 hover:bg-slate-800 text-white font-semibold text-sm text-center"
              >
                Comprar créditos
              </Link>

              <Link
                href="/redacao"
                className="px-4 py-2 rounded-md bg-customGreen hover:bg-green-700 text-white font-semibold text-sm text-center"
              >
                Iniciar redação
              </Link>
            </div>
          </div>

          {/* Lista: 3 últimas redações OU vazio */}
          {essaysError ? (
            <div className="rounded-lg border px-4 py-3 bg-red-50 text-red-700 border-red-200">
              <div className="font-bold">Erro ao carregar</div>
              <div className="text-sm">{essaysError.message}</div>
            </div>
          ) : lastEssays.length === 0 ? (
            <div className="rounded-lg border px-4 py-3 bg-[#DCE9FF] text-[#0F3E8A] border-[#b9d0ff]">
              <div className="font-bold">Lista vazia</div>
              <div className="text-sm">
                Você ainda não enviou nenhuma redação. Clique em{" "}
                <b>Iniciar redação</b> para começar.
              </div>
            </div>
          ) : (
            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {lastEssays.map((e) => (
                <li key={e.id}>
                  <EssayCard essay={e} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
