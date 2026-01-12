import { redirect } from "next/navigation";
import { createClient } from "../../../utils/supabase/server";
import RedacaoForm from "@/components/RedacaoForm";

export default async function NovaRedacaoPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) redirect("/login");

  return (
    <main className="flex min-h-screen w-full justify-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-4xl">
        {/* Card principal */}
        <div className="rounded-xl bg-white shadow-sm border border-slate-200">
          <div className="border-b border-slate-200 px-6 py-4">
            <h1 className="text-xl font-bold text-slate-800">
              Escreva sua redação
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Digite sua redação abaixo e envie para correção.
            </p>
          </div>

          <div className="px-6 py-6">
            <RedacaoForm email={data.user.email ?? ""} />
          </div>
        </div>
      </div>
    </main>
  );
}
