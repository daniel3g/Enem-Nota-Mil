"use client";

import { useMemo, useState } from "react";

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

function labelStatus(s: Essay["status"]) {
  const v = String(s).toLowerCase();
  if (v === "done" || v === "corrected" || v === "corrigida") return "Corrigida";
  if (v === "processing") return "Processando";
  if (v === "queued" || v === "na_fila") return "Na fila";
  if (v === "failed" || v === "falhou") return "Falhou";
  if (v === "draft") return "Rascunho";
  return String(s);
}

function pillClassByStatus(status: string) {
  const v = status.toLowerCase();
  if (v.includes("done") || v.includes("correct")) return "bg-emerald-100 text-emerald-700";
  if (v.includes("processing")) return "bg-amber-100 text-amber-700";
  if (v.includes("queued") || v.includes("fila")) return "bg-slate-200 text-slate-700";
  if (v.includes("failed") || v.includes("falh")) return "bg-red-100 text-red-700";
  return "bg-slate-200 text-slate-700";
}

function formatScore(score: number) {
  return Number.isFinite(score) ? String(score) : "-";
}

export default function EssayCard({ essay }: { essay: Essay }) {
  const [open, setOpen] = useState(false);

  const correctionsSorted = useMemo(() => {
    return [...(essay.essay_corrections || [])].sort((a, b) =>
      a.created_at < b.created_at ? 1 : -1
    );
  }, [essay.essay_corrections]);

  const latestScore =
    correctionsSorted.length > 0 && correctionsSorted[0].score != null
      ? correctionsSorted[0].score
      : null;

  // ✅ Status real: se tem correção, é "done" (corrigida), mesmo que o banco esteja com queued
  const derivedStatus =
    correctionsSorted.length > 0 ? "done" : (essay.status ?? "queued");

  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      {/* Capa */}
      <div className="relative h-28 bg-gradient-to-br from-slate-100 to-slate-200">
        <div className="absolute left-4 top-4">
          <span className="inline-flex rounded-md bg-emerald-600 px-3 py-1 text-xs font-extrabold text-white">
            Dissertação ENEM
          </span>
        </div>

        {latestScore != null && (
          <div className="absolute right-4 top-4">
            <span className="inline-flex rounded-md bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-700">
              NOTA: {formatScore(latestScore)}
            </span>
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-sm font-extrabold uppercase tracking-wide text-slate-800 line-clamp-2">
              {essay.title || "Redação sem título"}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Enviada em: {formatDateBR(essay.created_at)}
            </p>
          </div>

          <span
            className={[
              "inline-flex rounded-md px-2 py-1 text-xs font-extrabold",
              pillClassByStatus(String(derivedStatus)),
            ].join(" ")}
          >
            {labelStatus(derivedStatus)}
          </span>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="mt-5 inline-flex w-full items-center justify-center rounded-md bg-lime-600 px-4 py-2.5 text-sm font-extrabold text-white hover:bg-lime-700"
          type="button"
        >
          {open ? "OCULTAR DETALHES" : "VEJA A CORREÇÃO"}
        </button>

        {open && (
          <div className="mt-5 space-y-5">
            {/* Texto enviado */}
            {essay.content && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-2 text-xs font-extrabold tracking-wide text-slate-700">
                  TEXTO ENVIADO
                </div>
                <div className="whitespace-pre-wrap text-sm text-slate-700">
                  {essay.content}
                </div>
              </div>
            )}

            {/* Correções */}
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="text-xs font-extrabold tracking-wide text-slate-700">
                  CORREÇÕES ({correctionsSorted.length})
                </div>
              </div>

              {correctionsSorted.length === 0 ? (
                <p className="text-sm text-slate-600">
                  Ainda não há correções para esta redação.
                </p>
              ) : (
                <ul className="space-y-3">
                  {correctionsSorted.map((c) => (
                    <li
                      key={c.id}
                      className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-slate-600">
                          {formatDateBR(c.created_at)}
                        </span>

                        <div className="flex flex-wrap items-center gap-2">
                          {c.model && (
                            <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                              Modelo: {c.model}
                            </span>
                          )}
                          {c.score != null && (
                            <span className="rounded-md bg-emerald-100 px-2 py-1 text-xs font-extrabold text-emerald-700">
                              Nota: {formatScore(c.score)}
                            </span>
                          )}
                        </div>
                      </div>

                      {c.feedback && (
                        <div className="mt-3">
                          <FeedbackBlock feedback={c.feedback} />
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

function FeedbackBlock({ feedback }: { feedback: any }) {
  try {
    if (typeof feedback === "object" && feedback !== null) {
      return (
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <pre className="whitespace-pre-wrap text-xs text-slate-700">
            {JSON.stringify(feedback, null, 2)}
          </pre>
        </div>
      );
    }
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700">
        {String(feedback)}
      </div>
    );
  } catch {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-3">
        <pre className="whitespace-pre-wrap text-xs text-slate-700">
          {JSON.stringify(feedback, null, 2)}
        </pre>
      </div>
    );
  }
}
