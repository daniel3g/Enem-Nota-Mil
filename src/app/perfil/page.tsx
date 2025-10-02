// app/perfil/page.tsx
"use client";
import { useState } from "react";

export default function PerfilPage() {
  const [cpf, setCpf] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    const r = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cpf_cnpj: cpf }),
    });
    setSaving(false);
    setMsg(r.ok ? "Salvo!" : "Erro ao salvar.");
  }

  return (
    <div className="max-w-md mx-auto p-6 space-y-3">
      <h1 className="text-xl font-semibold">Dados do perfil</h1>
      <label className="block">
        <span>CPF/CNPJ*</span>
        <input
          value={cpf}
          onChange={e => setCpf(e.target.value)}
          className="w-full border rounded px-3 py-2"
          placeholder="000.000.000-00"
        />
      </label>
      <button onClick={save} disabled={saving} className="px-4 py-2 rounded bg-black text-white">
        {saving ? "Salvando..." : "Salvar"}
      </button>
      {msg && <p>{msg}</p>}
    </div>
  );
}
