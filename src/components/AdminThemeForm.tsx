"use client";

import { useState } from "react";

type CreatedTheme = {
  id: string;
  title: string;
  slug: string;
};

const INITIAL_FORM = {
  title: "",
  slug: "",
  year: "2026",
  exam: "ENEM",
  suggestedUse: "",
  active: true,
};

export default function AdminThemeForm() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploadedPdfPath, setUploadedPdfPath] = useState("");
  const [uploadedCoverPath, setUploadedCoverPath] = useState("");
  const [createdTheme, setCreatedTheme] = useState<CreatedTheme | null>(null);

  function updateField<K extends keyof typeof INITIAL_FORM>(
    key: K,
    value: (typeof INITIAL_FORM)[K]
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function uploadPdf() {
    if (!pdfFile) {
      throw new Error("Selecione o PDF do tema.");
    }

    const data = new FormData();
    data.append("file", pdfFile);

    const res = await fetch("/api/admin/themes/upload", {
      method: "POST",
      body: data,
      credentials: "include",
    });

    const payload = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(payload?.error || "Nao foi possivel enviar o PDF.");
    }

    return payload as { path: string; publicUrl: string };
  }

  async function uploadCover() {
    if (!coverFile) {
      return null;
    }

    const data = new FormData();
    data.append("file", coverFile);

    const res = await fetch("/api/admin/themes/upload-cover", {
      method: "POST",
      body: data,
      credentials: "include",
    });

    const payload = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(payload?.error || "Nao foi possivel enviar a capa.");
    }

    return payload as { path: string; publicUrl: string };
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setSuccess("");
    setCreatedTheme(null);
    setUploadedPdfPath("");
    setUploadedCoverPath("");

    try {
      const [uploadedPdf, uploadedCover] = await Promise.all([
        uploadPdf(),
        uploadCover(),
      ]);
      setUploadedPdfPath(uploadedPdf.path);
      setUploadedCoverPath(uploadedCover?.path ?? "");

      const body = {
        title: form.title,
        slug: form.slug || undefined,
        year: form.year ? Number(form.year) : null,
        exam: form.exam,
        suggestedUse: form.suggestedUse || null,
        coverUrl: uploadedCover?.publicUrl ?? null,
        pdfPath: uploadedPdf.path,
        active: form.active,
      };

      const res = await fetch("/api/admin/themes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(payload?.error || "Nao foi possivel cadastrar o tema.");
      }

      const theme = payload?.theme as CreatedTheme;
      setCreatedTheme(theme);
      setSuccess("Tema cadastrado com sucesso.");
      setForm(INITIAL_FORM);
      setPdfFile(null);
      setCoverFile(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro inesperado.";
      setError(message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-5">
        <div className="text-xs font-extrabold text-customGreen">ADMIN</div>
        <h1 className="mt-1 font-heading text-2xl font-extrabold text-slate-900">
          Cadastrar tema de redacao
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          O PDF sera enviado para o bucket <b>themes</b>, na pasta <b>enem-2026</b>.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Field label="Titulo do tema">
            <input
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-customGreen"
            />
          </Field>

          <Field label="Slug (opcional)">
            <input
              value={form.slug}
              onChange={(e) => updateField("slug", e.target.value)}
              placeholder="gerado automaticamente se vazio"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-customGreen"
            />
          </Field>

          <Field label="Ano">
            <input
              type="number"
              value={form.year}
              onChange={(e) => updateField("year", e.target.value)}
              min={1900}
              max={2100}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-customGreen"
            />
          </Field>

          <Field label="Modalidade">
            <input
              value={form.exam}
              onChange={(e) => updateField("exam", e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-customGreen"
            />
          </Field>

          <Field label="Sugestao de uso">
            <input
              value={form.suggestedUse}
              onChange={(e) => updateField("suggestedUse", e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-customGreen"
            />
          </Field>

          <Field label="Imagem de capa (opcional)">
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/jpg"
              onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-slate-700 file:mr-4 file:rounded-md file:border-0 file:bg-slate-800 file:px-4 file:py-2 file:font-semibold file:text-white"
            />
          </Field>
        </div>

        <Field label="PDF do tema">
          <input
            type="file"
            accept="application/pdf,.pdf"
            required
            onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-slate-700 file:mr-4 file:rounded-md file:border-0 file:bg-customGreen file:px-4 file:py-2 file:font-semibold file:text-white"
          />
        </Field>

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => updateField("active", e.target.checked)}
            className="h-4 w-4 rounded border-slate-300"
          />
          Deixar tema ativo assim que for criado
        </label>

        <button
          type="submit"
          disabled={busy}
          className="rounded-md bg-customGreen px-5 py-3 text-sm font-extrabold text-white disabled:opacity-60"
        >
          {busy ? "Enviando e cadastrando..." : "Cadastrar tema"}
        </button>

        {uploadedPdfPath && !success && (
          <div className="rounded-md border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
            PDF enviado para: <b>{uploadedPdfPath}</b>
          </div>
        )}

        {uploadedCoverPath && !success && (
          <div className="rounded-md border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
            Capa enviada para: <b>{uploadedCoverPath}</b>
          </div>
        )}

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && createdTheme && (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            <div>{success}</div>
            <div className="mt-1">
              Tema criado: <b>{createdTheme.title}</b>
            </div>
            <div className="mt-1">
              Slug: <b>{createdTheme.slug}</b>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>
      {children}
    </label>
  );
}
