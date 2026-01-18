"use client";

import { useState } from "react";
import Link from "next/link";

interface RedacaoFormProps {
  email: string;
  themeId: string;
  themeTitle: string;
}

export default function RedacaoForm({ themeId, themeTitle }: RedacaoFormProps) {
  const [redaction, setRedaction] = useState("");
  const [responseMessage, setResponseMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setResponseMessage("");

    if (!themeId) {
      setResponseMessage("Selecione um tema para enviar sua redação.");
      return;
    }

    if (!redaction.trim()) {
      setResponseMessage("Digite o conteúdo da redação.");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/essays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: themeTitle,       // ✅ tema vira o título fixo
          content: redaction,
          themeId,
          themeTitle,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setResponseMessage(data?.error || "Erro ao enviar redação.");
      } else {
        setResponseMessage("Redação enviada com sucesso! Em breve você verá o laudo.");
        setRedaction("");

        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("credits:changed"));
        }
      }
    } catch {
      setResponseMessage("Erro ao enviar redação. Por favor, tente novamente.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="w-full max-w-4xl rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-5">
        <div className="text-xs font-extrabold text-customGreen">TEMA SELECIONADO</div>
        <div className="mt-1 font-heading text-lg sm:text-xl font-extrabold text-slate-900">
          {themeTitle}
        </div>

        <div className="mt-3 text-sm text-slate-600">
          Leia a proposta e escreva sua redação abaixo.
          {" "}
          <Link href="/temas" className="font-semibold text-customPurple hover:underline">
            Trocar tema
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Escreva sua redação
          </label>

          <textarea
            value={redaction}
            onChange={(e) => setRedaction(e.target.value)}
            required
            rows={18}
            placeholder="Digite aqui sua redação..."
            className="w-full resize-none rounded-lg border border-slate-300 p-4 text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-customGreen/20"
          />
        </div>

        <button
          type="submit"
          disabled={busy || !redaction.trim()}
          className="w-full rounded-lg bg-customGreen py-3 text-sm font-extrabold text-white hover:opacity-95 disabled:opacity-50"
        >
          {busy ? "Enviando..." : "Enviar redação"}
        </button>

        {responseMessage && (
          <div
            className={[
              "rounded-lg border px-4 py-3 text-sm",
              responseMessage.toLowerCase().includes("sucesso")
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-red-200 bg-red-50 text-red-700",
            ].join(" ")}
          >
            {responseMessage}
          </div>
        )}
      </form>
    </div>
  );
}
