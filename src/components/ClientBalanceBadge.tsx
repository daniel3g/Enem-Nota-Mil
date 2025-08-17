"use client";

import { useEffect, useState, useRef } from "react";

export default function ClientBalanceBadge({ initial }: { initial: number }) {
  const [balance, setBalance] = useState<number>(initial);
  const loadingRef = useRef(false);

  async function refresh() {
    if (loadingRef.current) return;
    loadingRef.current = true;
    try {
      const r = await fetch("/api/credits", { credentials: "include" });
      const j = await r.json();
      if (r.ok && typeof j.balance === "number") {
        setBalance(j.balance);
      }
    } finally {
      loadingRef.current = false;
    }
  }

  useEffect(() => {
    // Escuta eventos de alteração de crédito
    function onChanged() { refresh(); }
    window.addEventListener("credits:changed", onChanged);

    // Fallback: polling leve a cada 20s
    const id = setInterval(refresh, 20000);

    return () => {
      window.removeEventListener("credits:changed", onChanged);
      clearInterval(id);
    };
  }, []);

  return (
    <span className="inline-flex items-center gap-2 border px-3 py-1 rounded text-sm">
      Créditos: <b>{balance}</b>
    </span>
  );
}
