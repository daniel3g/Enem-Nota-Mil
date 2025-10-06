// app/comprar/page.tsx (trecho do botão comprar)
"use client";
import { useState } from "react";

export default function Comprar() {
  const [waiting, setWaiting] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");

  async function buy(packageKey: "p1"|"p5"|"p10") {
    const r = await fetch("/api/payments/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ packageKey }),
    });
    const j = await r.json();
    if (!r.ok) {
      alert(j.error || "Erro ao criar pagamento");
      if (j.error?.includes("CPF")) location.href = "/perfil?need=cpf=1";
      return;
    }

    const { checkoutUrl, externalPaymentId } = j;
    // abre checkout em nova aba
    window.open(checkoutUrl, "_blank", "noopener,noreferrer");

    // fica esperando nesta aba
    setWaiting(externalPaymentId);
    setStatus("pending");

    // polling agressivo nos 90s iniciais, depois leve
    const start = Date.now();
    const timer = setInterval(async () => {
      const rr = await fetch(`/api/payments/status?external=${externalPaymentId}`, { cache: "no-store" });
      const jj = await rr.json();
      if (rr.ok) {
        setStatus(jj.status);
        if (jj.status === "paid") {
          clearInterval(timer);
          // atualiza saldo do badge
          window.dispatchEvent(new CustomEvent("credits:changed"));
          alert("Pagamento confirmado! Créditos adicionados 🎉");
          setWaiting(null);
        }
      }
      if (Date.now() - start > 120000 && jj.status !== "paid") {
        // reduz a frequência após 2min
        clearInterval(timer);
        const slow = setInterval(async () => {
          const r2 = await fetch(`/api/payments/status?external=${externalPaymentId}`, { cache: "no-store" });
          const j2 = await r2.json();
          if (r2.ok && j2.status === "paid") {
            clearInterval(slow);
            window.dispatchEvent(new CustomEvent("credits:changed"));
            alert("Pagamento confirmado! Créditos adicionados 🎉");
            setWaiting(null);
          }
        }, 15000);
      }
    }, 3000);
  }

  return (
    <div className="flex flex-col w-full m-8 my-3 bg-white border-t-4 rounded-lg border-customGreen p-6 space-y-4">
      <strong className="text-xl text-customGreen">PREÇOS</strong>
      <h2 className="text-3xl font-heading font-extrabold">PACOTES E PLANOS</h2>
      <hr />
      <div className="flex w-full gap-6">
        <div className="flex flex-col p-5 w-1/3 border border-zinc-200 rounded-lg gap-1">
          <strong className="font-heading text-xl font-extrabold">QUERO EXPERIMENTAR</strong>
          <p>1 CRÉDITO</p>
          <p className="text-customPurple">Utilize quando quiser</p>
          <hr />
          <s className="mt-5">de R$ 14,90</s>
          <strong className="text-2xl text-customPurple">por R$ 9,90</strong>
          <p>1 correção detalhada</p>
          <button onClick={() => buy("p1")} className="px-4 py-2 border-2 border-customPurple rounded mt-8 text-customPurple">COMPRE AGORA</button>
        </div>
        <div className="flex flex-col p-5 w-1/3 border border-zinc-200 rounded-lg gap-1">
          <strong className="font-heading text-xl font-extrabold">QUERO EXPERIMENTAR</strong>
          <p>1 CRÉDITO</p>
          <p className="text-customPurple">Utilize quando quiser</p>
          <hr />
          <s className="mt-5">de R$ 49,90</s>
          <strong className="text-2xl text-customPurple">por R$ 39,90</strong>
          <p>5 correções detalhadas</p>
          <button onClick={() => buy("p5")} className="px-4 py-2 border-2 border-customPurple rounded mt-8 text-customPurple">COMPRE AGORA</button>
        </div>
        <div className="flex flex-col p-5 w-1/3 border border-zinc-200 rounded-lg gap-1">
          <strong className="font-heading text-xl font-extrabold">QUERO EXPERIMENTAR</strong>
          <p>1 CRÉDITO</p>
          <p className="text-customPurple">Utilize quando quiser</p>
          <hr />
          <s className="mt-5">de R$ 99,90</s>
          <strong className="text-2xl text-customPurple">por R$ 69,90</strong>
          <p>10 correções detalhadas</p>
          <button onClick={() => buy("p10")} className="px-4 py-2 border-2 border-customPurple rounded mt-8 text-customPurple">COMPRE AGORA</button>
        </div>
      </div>
      
      
      
      {waiting && (
        <div className="mt-6 p-4 border rounded bg-yellow-50">
          <b>Aguardando pagamento…</b>
          <div>Status: {status}</div>
          <div className="text-sm text-gray-600">
            Finalize na aba do Asaas. Assim que for confirmado, seus créditos aparecem aqui.
          </div>
        </div>
      )}
    </div>
  );
}
