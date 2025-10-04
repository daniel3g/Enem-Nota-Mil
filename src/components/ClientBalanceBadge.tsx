"use client";

import { useEffect, useState, useRef } from "react";

export default function ClientBalanceBadge({ initial }: { initial: number }) {
  const [balance, setBalance] = useState<number>(initial);
  const loadingRef = useRef(false);

  async function refresh() {
    if (loadingRef.current) return;
    loadingRef.current = true;
    try {
      const r = await fetch("/api/credits", {
        credentials: "include",
        cache: "no-store",      // 👈 evita cache do navegador
      });
      const j = await r.json();
      if (r.ok && typeof j.balance === "number") {
        setBalance(j.balance);
      }
    } finally {
      loadingRef.current = false;
    }
  }

  useEffect(() => {
    // 🚀 atualiza imediatamente no mount
    refresh();

    function onChanged() { refresh(); }
    window.addEventListener("credits:changed", onChanged);

    // Polling leve (pode reduzir para 10s nos 2 primeiros min, se quiser)
    const id = setInterval(refresh, 20000);

    return () => {
      window.removeEventListener("credits:changed", onChanged);
      clearInterval(id);
    };
  }, []);

  return (
    <span className="inline-flex items-center gap-2 border px-3 py-1 rounded text-sm">
      <b>{balance}</b>
    </span>
  );
}
