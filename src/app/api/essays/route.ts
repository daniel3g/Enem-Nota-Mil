import { NextResponse } from "next/server";
import { createClient } from "../../../../utils/supabase/server";

const WEBHOOK_URL = "https://workflows.guarumidia.com/webhook-test/647c8eda-c8f3-4e60-a0f7-fb9444c8d604";

export async function POST(req: Request) {
  const supabase = await createClient();

  // 1) Confirma usuário logado
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2) Lê body (title opcional; content obrigatório)
  const body = await req.json().catch(() => ({}));
  const title: string | null = body?.title ?? null;
  const content: string | null = body?.content ?? null;

  if (!content || !content.trim()) {
    return NextResponse.json({ error: "Conteúdo da redação é obrigatório." }, { status: 400 });
  }

  // 3) Debita 1 crédito e cria a redação (status 'queued') de forma ATÔMICA
  const { data: essayId, error: rpcErr } = await supabase.rpc("submit_essay", {
    p_title: title,
    p_content: content,
  });

  if (rpcErr) {
    return NextResponse.json({ error: rpcErr.message }, { status: 400 });
  }

  // 4) Encaminha para o n8n (se falhar, marca failed + REFUND 1 crédito)
  try {
    const payload = {
      email: user.email,    // você já passava email no client; aqui usamos o do auth
      redaction: content,   // mantém o mesmo campo que seu fluxo usa
      essayId,              // útil para o retorno associar a correção
      title: title ?? undefined,
      userId: user.id,
    };

    const r = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!r.ok) {
      // Webhook falhou: marca a redação como failed e estorna 1 crédito
      await supabase
        .from("essays")
        .update({ status: "failed" })
        .eq("id", essayId);

      await supabase.from("credit_transactions").insert({
        user_id: user.id,
        type: "refund",
        amount: 1,
        meta: { reason: "webhook_failed", essayId },
      });

      return NextResponse.json(
        { error: "Falha ao enviar ao processador. Seu crédito foi estornado." },
        { status: 502 }
      );
    }
  } catch (e: any) {
    // Network/exception: idem
    await supabase
      .from("essays")
      .update({ status: "failed" })
      .eq("id", essayId);

    await supabase.from("credit_transactions").insert({
      user_id: user.id,
      type: "refund",
      amount: 1,
      meta: { reason: "webhook_exception", essayId, message: String(e?.message || e) },
    });

    return NextResponse.json(
      { error: "Erro de rede ao enviar ao processador. Crédito estornado." },
      { status: 502 }
    );
  }

  // 5) Sucesso: segue 'queued'
  return NextResponse.json({ id: essayId, status: "queued" });
}
