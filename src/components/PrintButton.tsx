"use client";

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-md bg-slate-700 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800"
    >
      Imprimir
    </button>
  );
}
