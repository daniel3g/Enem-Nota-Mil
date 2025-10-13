"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../../utils/supabase/client";
import AvatarCropUpload from "@/components/AvatarCropUpload";

type ProfileDTO = {
  email: string;
  full_name: string | null;
  phone: string | null;
  cpf_cnpj: string | null;
  avatar_url: string | null;
};

export default function PerfilPage() {
  const [form, setForm] = useState<ProfileDTO>({
    email: "",
    full_name: "",
    phone: "",
    cpf_cnpj: "",
    avatar_url: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

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
          avatar_url: data.avatar_url ?? null,
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

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] || null;
    setFile(f || null);
    if (f) {
      const url = URL.createObjectURL(f);
      setPreview(url);
    } else {
      setPreview(null);
    }
  }

  async function uploadAvatar() {
    if (!file) return;
    setUploading(true);
    setMsg(null);

    const fd = new FormData();
    fd.append("file", file);

    const r = await fetch("/api/profile/avatar", { method: "POST", body: fd });
    setUploading(false);

    if (r.ok) {
      const data = await r.json();
      setForm((f) => ({ ...f, avatar_url: data.avatar_url }));
      setPreview(null);
      setFile(null);
      setMsg("Foto atualizada!");
    } else {
      setMsg("Erro ao enviar foto.");
    }
  }

  if (loading) return <div className="max-w-md mx-auto p-6">Carregando...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-xl font-semibold mb-4">Dados do perfil</h1>

      <AvatarCropUpload initialUrl={form.avatar_url} />

      <div className="max-w-md mx-auto p-6 space-y-5">
        
        {/* Email readonly */}
        <label className="block">
          <span className="text-sm text-gray-600">Email (não editável)</span>
          <input
            value={form.email}
            readOnly
            className="w-full border rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
          />
        </label>

        {/* Nome */}
        <label className="block">
          <span className="text-sm text-gray-600">Nome completo*</span>
          <input
            value={form.full_name ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
            className="w-full border rounded px-3 py-2"
            placeholder="Seu nome"
          />
        </label>

        {/* Celular */}
        <label className="block">
          <span className="text-sm text-gray-600">Celular*</span>
          <input
            value={form.phone ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            className="w-full border rounded px-3 py-2"
            placeholder="(11) 91234-5678"
          />
        </label>

        {/* CPF/CNPJ */}
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
    </div>
  );
}
