import Link from "next/link";

function formatDateBR(dateIso: string) {
  const d = new Date(dateIso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function StatusPill({ status }: { status: "corrigida" | "na_fila" | "falhou" }) {
  const base = "inline-flex rounded-md px-2 py-1 text-xs font-extrabold";
  if (status === "corrigida")
    return <span className={`${base} bg-emerald-100 text-emerald-700`}>CORRIGIDA</span>;
  if (status === "falhou")
    return <span className={`${base} bg-red-100 text-red-700`}>FALHOU</span>;
  return <span className={`${base} bg-slate-200 text-slate-700`}>NA FILA</span>;
}

export default function EssayCardModern({
  id,
  title,
  createdAt,
  status,
  score,
  modality,
}: {
  id: string;
  title: string;
  createdAt: string;
  status: "corrigida" | "na_fila" | "falhou";
  score: number | null;
  modality?: string;
}) {
  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      {/* “capa” */}
      <div className="relative h-28 bg-gradient-to-br from-slate-100 to-slate-200">
        <div className="absolute left-4 top-4">
          <span className="inline-flex rounded-md bg-emerald-600 px-3 py-1 text-xs font-extrabold text-white">
            {modality ?? "Redação"}
          </span>
        </div>

        {score !== null && (
          <div className="absolute right-4 top-4">
            <span className="inline-flex rounded-md bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-700">
              NOTA: {score}
            </span>
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-sm font-extrabold uppercase tracking-wide text-slate-800 line-clamp-2">
            {title}
          </h3>
          <StatusPill status={status} />
        </div>

        <div className="mt-4 text-sm text-slate-600">
          <div className="font-semibold text-slate-700">Enviada em:</div>
          <div>{formatDateBR(createdAt)}</div>
        </div>

        <Link
          href={`/dashboard/minhas-redacoes/${id}`}
          className="mt-5 inline-flex w-full items-center justify-center rounded-md bg-lime-600 px-4 py-2.5 text-sm font-extrabold text-white hover:bg-lime-700"
        >
          VEJA A CORREÇÃO
        </Link>
      </div>
    </article>
  );
}
