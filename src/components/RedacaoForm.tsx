"use client";

import { useState } from "react";

export default function RedacaoForm({ email }: { email: string }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!content.trim()) {
      setError("Digite sua redação antes de enviar.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/essays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          email,
        }),
      });

      if (!res.ok) {
        throw new Error("Erro ao enviar redação.");
      }

      // limpa o campo após sucesso
      setContent("");
      alert("Redação enviada com sucesso!");
    } catch (err) {
      setError("Não foi possível enviar sua redação. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Textarea */}
      <div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Digite aqui sua redação..."
          rows={14}
          className="w-full resize-none rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
          disabled={loading}
        />
      </div>

      {/* Erro */}
      {error && (
        <div className="rounded-md bg-red-50 px-4 py-2 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      )}

      {/* Botão */}
      <button
        type="submit"
        disabled={loading}
        className={`
          flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 
          text-sm font-bold text-white transition
          ${loading
            ? "bg-slate-400 cursor-not-allowed"
            : "bg-emerald-600 hover:bg-emerald-700"}
        `}
      >
        {loading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Enviando redação…
          </>
        ) : (
          "Enviar redação"
        )}
      </button>
    </form>
  );
}
