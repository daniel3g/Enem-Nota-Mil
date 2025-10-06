"use client";
import { useEffect, useState } from "react";

type ProfileDTO = {
  email: string;
  full_name: string | null;
  phone: string | null;
  cpf_cnpj: string | null;
};

export default function PerfilPage() {
  const [form, setForm] = useState<ProfileDTO>({
    email: "",
    full_name: "",
    phone: "",
    cpf_cnpj: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const r = await fetch("/api/profile", { method: "GET", cache: "no-store" });
      if (r.ok) {
        const data = (await r.json()) as ProfileDTO;
        setForm({
          email: data.email ?? "",
          full_name: data.full_name ?? "",
          phone: data.phone ?? "",
          cpf_cnpj: data.cpf_cnpj ?? "",
        });
      }
      setLoading(false);
    })();
  }, []);

  async function save() {
    setSaving(true);
    setMsg(null);
    const r = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: form.full_name,
        phone: form.phone,
        cpf_cnpj: form.cpf_cnpj,
      }),
    });
    setSaving(false);
    setMsg(r.ok ? "Dados salvos com sucesso!" : "Erro ao salvar.");
  }

  if (loading) return <div className="max-w-md mx-auto p-6">Carregando...</div>;

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-xl font-semibold">Dados do perfil</h1>

      <label className="block">
        <span className="text-sm text-gray-600">Email (não editável)</span>
        <input
          value={form.email}
          readOnly
          className="w-full border rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
        />
      </label>

      <label className="block">
        <span className="text-sm text-gray-600">Nome completo*</span>
        <input
          value={form.full_name ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
          className="w-full border rounded px-3 py-2"
          placeholder="Seu nome"
        />
      </label>

      <label className="block">
        <span className="text-sm text-gray-600">Celular*</span>
        <input
          value={form.phone ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          className="w-full border rounded px-3 py-2"
          placeholder="(11) 91234-5678"
        />
      </label>

      <label className="block">
        <span className="text-sm text-gray-600">CPF/CNPJ*</span>
        <input
          value={form.cpf_cnpj ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, cpf_cnpj: e.target.value }))}
          className="w-full border rounded px-3 py-2"
          placeholder="000.000.000-00"
        />
      </label>

      <button
        onClick={save}
        disabled={saving}
        className="px-4 py-2 rounded bg-black text-white disabled:opacity-60"
      >
        {saving ? "Salvando..." : "Salvar"}
      </button>

      {msg && <p>{msg}</p>}
    </div>
  );
}
