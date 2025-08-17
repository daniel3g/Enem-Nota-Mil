"use client";

import { useState } from "react";

type Correction = {
  id: string;
  model: string | null;
  score: number | null; // 0–100 ou escala que você usar
  feedback: any;        // JSON (ex.: rubrica, observações, etc.)
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

export default function EssayCard({ essay }: { essay: Essay }) {
  const [open, setOpen] = useState(false);

  const created = new Date(essay.created_at);
  const dateStr = created.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const statusColor =
    essay.status === "done" ? "bg-green-100 text-green-800 border-green-300"
    : essay.status === "processing" ? "bg-yellow-100 text-yellow-800 border-yellow-300"
    : essay.status === "queued" ? "bg-blue-100 text-blue-800 border-blue-300"
    : essay.status === "failed" ? "bg-red-100 text-red-800 border-red-300"
    : "bg-gray-100 text-gray-800 border-gray-300";

  const corrections = (essay.essay_corrections || []).sort((a, b) =>
    a.created_at < b.created_at ? 1 : -1
  );

  const latestScore =
    corrections.length > 0 && corrections[0].score != null
      ? corrections[0].score
      : null;

  return (
    <div className="border rounded-md p-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">
            {essay.title || "Redação sem título"}
          </h2>
          <p className="text-sm text-gray-600">Enviada em {dateStr}</p>
          <div className="flex items-center gap-2">
            <span className={`text-xs border px-2 py-0.5 rounded ${statusColor}`}>
              Status: {labelStatus(essay.status)}
            </span>
            {latestScore != null && (
              <span className="text-xs border px-2 py-0.5 rounded bg-emerald-50 border-emerald-200 text-emerald-800">
                Nota mais recente: <b>{formatScore(latestScore)}</b>
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="self-start md:self-auto border px-3 py-1.5 rounded hover:bg-gray-50"
        >
          {open ? "Ocultar detalhes" : "Ver detalhes"}
        </button>
      </div>

      {open && (
        <div className="mt-4 space-y-4">
          {/* Conteúdo original (colapsável) */}
          {essay.content && (
            <div>
              <h3 className="text-sm font-medium mb-2">Texto enviado</h3>
              <div className="bg-gray-50 border rounded p-3 whitespace-pre-wrap text-sm">
                {essay.content}
              </div>
            </div>
          )}

          {/* Correções */}
          <div>
            <h3 className="text-sm font-medium mb-2">
              Correções ({corrections.length})
            </h3>

            {corrections.length === 0 ? (
              <p className="text-sm text-gray-600">
                Ainda não há correções para esta redação.
              </p>
            ) : (
              <ul className="space-y-3">
                {corrections.map((c) => (
                  <li key={c.id} className="border rounded p-3">
                    <div className="flex flex-wrap items-center gap-2 justify-between">
                      <span className="text-sm text-gray-700">
                        {new Date(c.created_at).toLocaleString("pt-BR")}
                      </span>
                      <div className="flex items-center gap-2">
                        {c.model && (
                          <span className="text-xs border px-2 py-0.5 rounded bg-gray-50">
                            Modelo: {c.model}
                          </span>
                        )}
                        {c.score != null && (
                          <span className="text-xs border px-2 py-0.5 rounded bg-emerald-50 border-emerald-200 text-emerald-800">
                            Nota: <b>{formatScore(c.score)}</b>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Feedback em JSON (renderização simples) */}
                    {c.feedback && (
                      <div className="mt-2 text-sm">
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
  );
}

function labelStatus(s: Essay["status"]) {
  switch (s) {
    case "done": return "Concluída";
    case "processing": return "Processando";
    case "queued": return "Na fila";
    case "failed": return "Falhou";
    case "draft": return "Rascunho";
    default: return s;
  }
}

function formatScore(score: number) {
  // ajuste se sua escala for 0–1000 etc.
  return Number.isFinite(score) ? String(score) : "-";
}

function FeedbackBlock({ feedback }: { feedback: any }) {
  // Se o n8n salvar feedback estruturado (ex.: {competencias: {...}, observacoes: "..."}):
  // Renderiza de forma amigável; fallback para JSON bonito.
  try {
    if (typeof feedback === "object" && feedback !== null) {
      // Renderização simples: chaves/valores
      return (
        <div className="bg-gray-50 border rounded p-3">
          <pre className="whitespace-pre-wrap">
            {JSON.stringify(feedback, null, 2)}
          </pre>
        </div>
      );
    }
    // Se vier string, mostra direto:
    return <p className="bg-gray-50 border rounded p-3">{String(feedback)}</p>;
  } catch {
    return (
      <div className="bg-gray-50 border rounded p-3">
        <pre className="whitespace-pre-wrap">
          {JSON.stringify(feedback, null, 2)}
        </pre>
      </div>
    );
  }
}
