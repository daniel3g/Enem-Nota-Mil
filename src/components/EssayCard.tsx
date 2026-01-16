"use client";

import { useMemo } from "react";
import Link from "next/link";

type Correction = {
  id: string;
  model: string | null;
  score: number | null; // 0–1000
  feedback: any;
  created_at: string;
};

type Essay = {
  id: string;
  title: string | null;
  content: string | null;
  status: "draft" | "queued" | "processing" | "done" | "failed" | string;
  created_at: string;
  essay_corrections?: Correction[];
};

function formatDateBR(dateIso: string) {
  const d = new Date(dateIso);
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function labelStatus(raw: Essay["status"]) {
  const v = String(raw).toLowerCase();
  if (v === "done" || v.includes("correct") || v.includes("corrig")) return "Corrigida";
  if (v.includes("processing")) return "Processando";
  if (v.includes("queued") || v.includes("fila")) return "Na fila";
  if (v.includes("failed") || v.includes("falh") || v.includes("error")) return "Falhou";
  if (v.includes("draft")) return "Rascunho";
  return String(raw);
}

function statusPillClass(raw: string) {
  const v = raw.toLowerCase();
  if (v.includes("done") || v.includes("correct") || v.includes("corrig")) {
    return "bg-customGreen/15 text-customGreen ring-1 ring-customGreen/30";
  }
  if (v.includes("processing")) {
    return "bg-customYellow/20 text-[#7A5600] ring-1 ring-customYellow/40";
  }
  if (v.includes("queued") || v.includes("fila")) {
    return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
  }
  if (v.includes("failed") || v.includes("falh") || v.includes("error")) {
    return "bg-red-100 text-red-700 ring-1 ring-red-200";
  }
  return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
}

// ✅ escala 0–1000 (mesma regra que você usou na folha)
function scoreBadgeClass(score: number) {
  if (score === 0) return "bg-black text-white ring-1 ring-black/20";
  if (score <= 200) return "bg-red-100 text-red-700 ring-1 ring-red-200";
  if (score <= 400) return "bg-orange-100 text-orange-700 ring-1 ring-orange-200";
  if (score <= 600) return "bg-amber-100 text-amber-800 ring-1 ring-amber-200";
  if (score <= 800) return "bg-lime-100 text-lime-800 ring-1 ring-lime-200";
  return "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200";
}

function formatScore(score: number) {
  return Number.isFinite(score) ? String(score) : "—";
}

export default function EssayCard({ essay }: { essay: Essay }) {
  const correctionsSorted = useMemo(() => {
    return [...(essay.essay_corrections || [])].sort((a, b) =>
      a.created_at < b.created_at ? 1 : -1
    );
  }, [essay.essay_corrections]);

  const latest = correctionsSorted[0] ?? null;

  // ✅ status derivado
  const derivedStatus = latest ? "done" : (essay.status ?? "queued");
  const statusLabel = labelStatus(derivedStatus);

  const hasCorrection = Boolean(latest?.score != null);
  const latestScore = latest?.score ?? null;

  // CTA
  const ctaHref = `/minhas-redacoes/${essay.id}`;
  const ctaLabel = hasCorrection ? "Ver correção" : "Acompanhar status";

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      {/* faixa superior (identidade visual) */}
      <div className="h-1 w-full bg-gradient-to-r from-customPurple via-customGreen to-customYellow" />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2">
              <span className="rounded-md bg-customPurple/10 px-2 py-1 text-[11px] font-extrabold tracking-wide text-customPurple">
                DISSERTAÇÃO ENEM
              </span>

              <span
                className={[
                  "rounded-md px-2 py-1 text-[11px] font-extrabold tracking-wide",
                  statusPillClass(String(derivedStatus)),
                ].join(" ")}
              >
                {statusLabel}
              </span>
            </div>

            <h3 className="mt-3 text-base font-extrabold text-customBlackLight leading-snug line-clamp-2">
              {essay.title || "Redação sem título"}
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Enviada em {formatDateBR(essay.created_at)}
            </p>
          </div>

          {/* Nota */}
          {latestScore != null && (
            <div className="shrink-0 text-right">
              <div className="text-[10px] font-extrabold tracking-wide text-slate-500">
                NOTA
              </div>
              <div
                className={[
                  "mt-1 inline-flex items-center rounded-lg px-3 py-2 text-sm font-extrabold",
                  scoreBadgeClass(Number(latestScore)),
                ].join(" ")}
                title="Nota mais recente"
              >
                {formatScore(Number(latestScore))}
                <span className="ml-1 text-[11px] font-bold opacity-70">/1000</span>
              </div>
            </div>
          )}
        </div>

        {/* Preview curto do texto (opcional, mas fica elegante) */}
        {essay.content && (
          <p className="mt-4 text-sm text-slate-700 line-clamp-3">
            {essay.content}
          </p>
        )}

        {/* Footer */}
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-slate-500">
            {latest ? (
              <>
                Última correção: <b>{formatDateBR(latest.created_at)}</b>
              </>
            ) : (
              <>
                Ainda não há correção disponível.
              </>
            )}
          </div>

          <Link
            href={ctaHref}
            className="inline-flex items-center justify-center rounded-xl bg-customPurple px-5 py-2.5 text-sm font-extrabold text-white transition hover:opacity-95 active:scale-[0.99]"
          >
            {ctaLabel}
          </Link>
        </div>
      </div>
    </article>
  );
}
