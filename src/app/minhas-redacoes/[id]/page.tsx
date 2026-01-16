import { createClient } from "../../../../utils/supabase/server";
import { redirect } from "next/navigation";
import PrintButton from "@/components/PrintButton";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import Link from "next/link";

export const dynamic = "force-dynamic";

type Correction = {
  id: string;
  model: string | null;
  score: number | null;
  feedback: any; // JSON estruturado (n8n)
  created_at: string;
};

type Essay = {
  id: string;
  title: string | null;
  content: string | null;
  status: string | null;
  created_at: string;
};

function formatDateBR(dateIso: string) {
  return new Date(dateIso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function normalizeToLevel(score: number) {
  // ENEM usa níveis 0,40,80,120,160,200
  const levels = [0, 40, 80, 120, 160, 200];
  let best = levels[0];
  let bestDiff = Math.abs(score - best);

  for (const lv of levels) {
    const diff = Math.abs(score - lv);
    if (diff < bestDiff) {
      best = lv;
      bestDiff = diff;
    }
  }
  return best;
}

function badgeClassByScore(score: number) {
  if (score <= 40) return "bg-red-100 text-red-700 border-red-200";
  if (score <= 80) return "bg-orange-100 text-orange-700 border-orange-200";
  if (score <= 120) return "bg-amber-100 text-amber-800 border-amber-200";
  if (score <= 160) return "bg-lime-100 text-lime-800 border-lime-200";
  return "bg-emerald-100 text-emerald-700 border-emerald-200"; // 200
}

function CriteriaDistributionTable({
  competencias,
}: {
  competencias: Array<{ nome: string; pontos: number; max?: number }>;
}) {
  const levels = [0, 40, 80, 120, 160, 200];

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse">
          <thead>
            <tr className="text-left">
              <th className="w-[320px] border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm font-extrabold text-slate-700">
                Distribuição de critérios
              </th>

              {levels.map((lv) => (
                <th
                  key={lv}
                  className={[
                    "border-b border-slate-200 px-4 py-3 text-center text-xs font-extrabold text-slate-700",
                    lv === 0
                      ? "bg-slate-200"
                      : lv === 40
                      ? "bg-red-200"
                      : lv === 80
                      ? "bg-orange-200"
                      : lv === 120
                      ? "bg-amber-200"
                      : lv === 160
                      ? "bg-lime-200"
                      : "bg-emerald-200",
                  ].join(" ")}
                >
                  {lv}
                </th>
              ))}

              <th className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-center text-sm font-extrabold text-slate-700">
                Nota
              </th>
            </tr>
          </thead>

          <tbody>
            {competencias.map((c, idx) => {
              const raw = Number(c.pontos ?? 0);
              const level = normalizeToLevel(raw);

              return (
                <tr key={idx} className="odd:bg-white even:bg-slate-50">
                  <td className="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-800">
                    {c.nome}
                  </td>

                  {levels.map((lv) => (
                    <td
                      key={lv}
                      className={[
                        "border-b border-slate-200 px-4 py-3 text-center font-extrabold",
                        lv === 0
                          ? "bg-slate-100"
                          : lv === 40
                          ? "bg-red-50"
                          : lv === 80
                          ? "bg-orange-50"
                          : lv === 120
                          ? "bg-amber-50"
                          : lv === 160
                          ? "bg-lime-50"
                          : "bg-emerald-50",
                      ].join(" ")}
                    >
                      {level === lv ? "✓" : ""}
                    </td>
                  ))}

                  <td className="border-b border-slate-200 px-4 py-3 text-center text-sm font-extrabold text-slate-800">
                    {raw}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ✅ Next 15: params precisa ser awaited
type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EssayDetailPage({ params }: PageProps) {
  const { id } = await params;

  const supabase = await createClient();

  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");

  const userId = auth.user.id;

  // busca redação (garante que é do usuário)
  const { data: essay, error: essayErr } = await supabase
    .from("essays")
    .select("id,title,content,status,created_at,user_id")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (essayErr || !essay) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8">
        <p className="text-red-600">Redação não encontrada.</p>
        <Link href="/minhas-redacoes" className="text-slate-700 underline">
          Voltar
        </Link>
      </main>
    );
  }

  // busca correções (pega a mais recente)
  const { data: corrections } = await supabase
    .from("essay_corrections")
    .select("id,model,score,feedback,created_at")
    .eq("essay_id", id)
    .order("created_at", { ascending: false })
    .limit(1);

  const latest = (corrections?.[0] ?? null) as Correction | null;

  // perfil (para mostrar aluno)
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", userId)
    .maybeSingle();

  const studentName = profile?.full_name ?? "Aluno";

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      {/* topo */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <Link
          href="/minhas-redacoes"
          className="text-sm font-semibold text-slate-600 hover:text-slate-900"
        >
          ← Voltar para Minhas redações
        </Link>

        <div className="flex gap-2">
          <PrintButton />
        </div>
      </div>

      {/* “Folha” */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm print:shadow-none print:border-none">
        <div className="border-b border-slate-200 px-6 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="text-xs font-bold text-slate-500">LAUDO</div>
              <h1 className="text-2xl font-extrabold text-slate-900">
                FOLHA DE CORREÇÃO
              </h1>

              <div className="mt-3 grid grid-cols-1 gap-1 text-sm text-slate-700 sm:grid-cols-2">
                <div>
                  <b>Aluno:</b> {studentName}
                </div>
                <div>
                  <b>Data:</b> {formatDateBR(essay.created_at)}
                </div>
                <div>
                  <b>Tema:</b> {essay.title ?? "Redação sem título"}
                </div>
                <div>
                  <b>Modalidade:</b> ENEM
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs font-bold text-slate-500">NOTA</div>
                <div className="text-3xl font-extrabold">
                  {latest?.score ?? "—"}
                  <span className="text-sm text-slate-500">/1000</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* conteúdo */}
        <div className="grid grid-cols-1 gap-6 px-6 py-6 lg:grid-cols-12">
          {/* texto */}
          <section className="lg:col-span-5">
            <div className="rounded-lg border border-slate-200 p-4">
              <div className="text-xs font-extrabold tracking-wide text-slate-700">
                REDAÇÃO
              </div>
              <div className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-800">
                {essay.content}
              </div>
            </div>
          </section>

          {/* painel de correção */}
          <section className="lg:col-span-7">
            {!latest ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800">
                <b>Em correção:</b> sua redação ainda não recebeu um laudo.
              </div>
            ) : (
              <CorrectionReport
                feedback={latest.feedback}
                model={latest.model}
                createdAt={latest.created_at}
              />
            )}
          </section>
        </div>
      </div>

      {/* CSS de print */}
      <style>{`
        @media print {
          .print\\:hidden { display: none !important; }
          body { background: white !important; }
        }
      `}</style>
    </main>
  );
}

function CorrectionReport({
  feedback,
  model,
  createdAt,
}: {
  feedback: any;
  model: string | null;
  createdAt: string;
}) {
  const total = feedback?.score_total ?? null;
  const competencias = feedback?.competencias ?? [];
  const resumo = feedback?.resumo ?? "";
  const highlights = feedback?.highlights ?? [];

  function finalScoreClass(score: number) {
    if (score === 0) return "bg-black text-white border-black";
    if (score <= 200) return "bg-red-100 text-red-700 border-red-200";
    if (score <= 400) return "bg-orange-100 text-orange-700 border-orange-200";
    if (score <= 600) return "bg-amber-100 text-amber-800 border-amber-200";
    if (score <= 800) return "bg-lime-100 text-lime-800 border-lime-200";
    return "bg-emerald-100 text-emerald-700 border-emerald-200";
  }

  return (
    <div className="space-y-4">
      {/* cabeçalho lateral */}
      <div className="rounded-lg border border-slate-200 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-slate-700">
            <b>Correção:</b> {new Date(createdAt).toLocaleString("pt-BR")}
          </div>
          <div className="flex items-center gap-2">
            {model && (
              <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">
                Modelo: {model}
              </span>
            )}
            {total != null && (
              <span
                className={[
                  "rounded-md border px-2 py-1 text-xs font-extrabold",
                  finalScoreClass(total),
                ].join(" ")}
              >
                Nota: {total}
              </span>
            )}
          </div>
        </div>

        {resumo && (
          <div className="mt-3 text-sm text-slate-700">
            <b>Resumo:</b> {resumo}
          </div>
        )}
      </div>

      {/* ✅ quadro */}
      {Array.isArray(competencias) && competencias.length > 0 && (
        <CriteriaDistributionTable competencias={competencias} />
      )}

      {/* competências */}
      <div className="rounded-lg border border-slate-200 p-4">
        <div className="text-xs font-extrabold tracking-wide text-slate-700">
          COMPETÊNCIAS
        </div>

        {Array.isArray(competencias) && competencias.length > 0 ? (
          <div className="mt-4 space-y-3">
            {competencias.map((c: any, idx: number) => {
              const score = Number(c.pontos ?? 0);
              return (
                <div
                  key={idx}
                  className="rounded-lg bg-slate-50 border border-slate-200 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-extrabold text-slate-800">
                      {c.nome ?? `Competência ${idx + 1}`}
                    </div>

                    <div
                      className={[
                        "rounded-md border px-2 py-1 text-xs font-extrabold",
                        badgeClassByScore(score),
                      ].join(" ")}
                    >
                      {score} / {c.max ?? 200}
                    </div>
                  </div>

                  {c.feedback && (
                    <div className="mt-2 text-sm text-slate-700">
                      {c.feedback}
                    </div>
                  )}

                  {Array.isArray(c.itens) && c.itens.length > 0 && (
                    <ul className="mt-3 list-disc pl-5 text-sm text-slate-700 space-y-1">
                      {c.itens.map((item: string, i: number) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-3 text-sm text-slate-600">
            Não foi possível exibir as competências (feedback ainda não está
            estruturado).
            <div className="mt-2 rounded-md bg-slate-50 border border-slate-200 p-3 text-xs whitespace-pre-wrap">
              {JSON.stringify(feedback, null, 2)}
            </div>
          </div>
        )}
      </div>

      {/* destaques */}
      {Array.isArray(highlights) && highlights.length > 0 && (
        <div className="rounded-lg border border-slate-200 p-4">
          <div className="text-xs font-extrabold tracking-wide text-slate-700">
            TRECHOS & APONTAMENTOS
          </div>

          <div className="mt-3 space-y-3">
            {highlights.map((h: any, idx: number) => (
              <div
                key={idx}
                className="rounded-lg border border-slate-200 bg-slate-50 p-4"
              >
                {h.trecho && (
                  <div className="text-sm text-slate-800 whitespace-pre-wrap">
                    <b>Trecho:</b> {h.trecho}
                  </div>
                )}
                {h.comentario && (
                  <div className="mt-2 text-sm text-slate-700">
                    <b>Comentário:</b> {h.comentario}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* observações */}
      {feedback?.observacoes && (
        <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <h3 className="font-bold mb-2">Observações</h3>
          <MarkdownRenderer content={feedback.observacoes} />
        </section>
      )}
    </div>
  );
}
