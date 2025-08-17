import { createClient } from "../../../utils/supabase/server";
import { redirect } from "next/navigation";
import EssayCard from "../../components/EssayCard";

export const dynamic = "force-dynamic";

export default async function MinhasRedacoesPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr || !user) redirect("/login");

  // Busca todas as redações do usuário + correções relacionadas
  const { data: essays, error } = await supabase
    .from("essays")
    .select(
      `
      id,
      title,
      content,
      status,
      created_at,
      essay_corrections (
        id,
        model,
        score,
        feedback,
        created_at
      )
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">Minhas Redações</h1>
        <p className="text-red-600">Erro ao carregar: {error.message}</p>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Minhas Redações</h1>

      {(!essays || essays.length === 0) ? (
        <div className="border rounded-md p-6">
          <p className="text-gray-700">
            Você ainda não enviou nenhuma redação.
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {essays.map((e) => (
            <li key={e.id}>
              <EssayCard essay={e} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
