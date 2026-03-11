import OpenAI from "openai";
import { NextResponse } from "next/server";
import { createClient } from "../../../../utils/supabase/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const correctionSchema = {
  name: "essay_correction",
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      score_total: { type: "number" },
      resumo: { type: "string" },
      competencias: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            nome: { type: "string" },
            pontos: { type: "number" },
            max: { type: "number" },
            feedback: { type: "string" },
            itens: {
              type: "array",
              items: { type: "string" },
            },
          },
          required: ["nome", "pontos", "max", "feedback", "itens"],
        },
      },
      highlights: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            trecho: { type: "string" },
            comentario: { type: "string" },
          },
          required: ["trecho", "comentario"],
        },
      },
      observacoes: { type: "string" },
    },
    required: [
      "score_total",
      "resumo",
      "competencias",
      "highlights",
      "observacoes",
    ],
  },
  strict: true,
} as const;

function buildSystemPrompt(themeTitle: string, themeYear?: number | null) {
  return `
Você é um corretor especialista em redação do ENEM.

Avalie a redação do aluno com rigor e didática.
Considere que o tema oficial desta redação é:
"${themeTitle}"${themeYear ? ` (${themeYear})` : ""}.

Regras obrigatórias:
- Use o modelo ENEM.
- A nota total vai de 0 a 1000.
- Cada competência vai de 0 a 200.
- Cada competência só pode assumir um destes valores: 0, 40, 80, 120, 160 ou 200.
- A nota total deve ser exatamente a soma das 5 competências.
- As 5 competências devem ser:
  1. Domínio da norma padrão
  2. Compreensão do tema
  3. Argumentação
  4. Coesão
  5. Proposta de intervenção
- Se houver tangenciamento, reflita isso principalmente nas competências 2, 3 e 5.
- Se houver fuga total ao tema, a nota total deve ser 0 e isso deve ficar explícito.
- Em "highlights", cite até 5 trechos curtos do texto com comentários úteis.
- Em "observacoes", escreva em markdown pedagógico, bonito e claro.
- Responda somente no formato estruturado exigido pelo schema.
`.trim();
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function normalizeEnemScore(score: number) {
  const allowed = [0, 40, 80, 120, 160, 200];
  const safe = clamp(Number(score || 0), 0, 200);

  let best = allowed[0];
  let bestDiff = Math.abs(safe - best);

  for (const candidate of allowed) {
    const diff = Math.abs(safe - candidate);
    if (diff < bestDiff) {
      best = candidate;
      bestDiff = diff;
    }
  }

  return best;
}

type CompetenciaNormalizada = {
  nome: string;
  pontos: number;
  max: number;
  feedback: string;
  itens: string[];
};

function normalizeCorrection(feedback: any) {
  const competenciasRaw = Array.isArray(feedback?.competencias)
    ? feedback.competencias
    : [];

  const competencias: CompetenciaNormalizada[] = competenciasRaw
    .slice(0, 5)
    .map((c: any, index: number) => {
      const pontos = normalizeEnemScore(Number(c?.pontos ?? 0));

      return {
        nome: String(c?.nome ?? `Competência ${index + 1}`),
        pontos,
        max: 200,
        feedback: String(c?.feedback ?? ""),
        itens: Array.isArray(c?.itens)
          ? c.itens.map((item: any) => String(item))
          : [],
      };
    });

  while (competencias.length < 5) {
    competencias.push({
      nome: `Competência ${competencias.length + 1}`,
      pontos: 0,
      max: 200,
      feedback: "",
      itens: [],
    });
  }

  const score_total = competencias.reduce((acc: number, c) => acc + c.pontos, 0);

  return {
    score_total,
    resumo: String(feedback?.resumo ?? ""),
    competencias,
    highlights: Array.isArray(feedback?.highlights)
      ? feedback.highlights.map((h: any) => ({
          trecho: String(h?.trecho ?? ""),
          comentario: String(h?.comentario ?? ""),
        }))
      : [],
    observacoes: String(feedback?.observacoes ?? ""),
  };
}

export async function POST(req: Request) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const content: string | null = body?.content ?? null;
  const themeId: string | null = body?.themeId ?? null;

  if (!themeId) {
    return NextResponse.json({ error: "Tema é obrigatório." }, { status: 400 });
  }

  if (!content || !content.trim()) {
    return NextResponse.json(
      { error: "Conteúdo da redação é obrigatório." },
      { status: 400 }
    );
  }

  const { data: theme, error: themeErr } = await supabase
    .from("themes")
    .select("id,title,slug,year,exam,suggested_use,pdf_path")
    .eq("id", themeId)
    .eq("active", true)
    .single();

  if (themeErr || !theme) {
    return NextResponse.json(
      { error: "Tema inválido ou inativo." },
      { status: 400 }
    );
  }

  const fixedTitle = theme.title;

  const { data: essayId, error: rpcErr } = await supabase.rpc("submit_essay", {
    p_title: fixedTitle,
    p_content: content,
    p_theme_id: theme.id,
  });

  if (rpcErr || !essayId) {
    return NextResponse.json(
      { error: rpcErr?.message ?? "Erro ao enviar." },
      { status: 400 }
    );
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "developer",
          content: buildSystemPrompt(theme.title, theme.year),
        },
        {
          role: "user",
          content: `Tema: ${theme.title}

Redação do aluno:
${content}`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: correctionSchema,
      },
      temperature: 0.2,
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      throw new Error("A OpenAI não retornou conteúdo de correção.");
    }

    const parsed = JSON.parse(raw);
    const feedback = normalizeCorrection(parsed);
    const score = feedback.score_total;

    const { error: correctionErr } = await supabase
      .from("essay_corrections")
      .insert({
        essay_id: essayId,
        model: "gpt-4o-mini",
        score,
        feedback,
      });

    if (correctionErr) {
      throw new Error(`Erro ao salvar correção: ${correctionErr.message}`);
    }

    const { error: updateErr } = await supabase
      .from("essays")
      .update({ status: "done" })
      .eq("id", essayId);

    if (updateErr) {
      throw new Error(`Erro ao atualizar status: ${updateErr.message}`);
    }

    return NextResponse.json({ id: essayId, status: "done" });
  } catch {
    await supabase
      .from("essays")
      .update({ status: "failed" })
      .eq("id", essayId);

    await supabase.from("credit_transactions").insert({
      user_id: user.id,
      type: "refund",
      amount: 1,
      meta: {
        reason: "openai_exception",
        essayId,
      },
    });

    return NextResponse.json(
      { error: "Falha ao processar a correção. Crédito estornado." },
      { status: 502 }
    );
  }
}