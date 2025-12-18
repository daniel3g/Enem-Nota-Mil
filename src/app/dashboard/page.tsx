import ClientBalanceBadge from "@/components/ClientBalanceBadge"
import { createClient } from '../../../utils/supabase/server'

export default async function DashboardPage() {

  const supabase = await createClient()
    const { data, error } = await supabase.auth.getUser()
  
    const user = data.user!
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()
  
    let initial = 0;
  {
    const { data: balanceRow, error: balanceError } = await supabase
      .from("user_credit_balance")
      .select("balance")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!balanceError && balanceRow?.balance != null) {
      initial = balanceRow.balance;
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-xl bg-white shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-extrabold tracking-tight text-customBlackLight">
            REDAÇÕES PENDENTES
          </h2>
        </div>
        <div className="p-6">
          <div className="rounded-lg border px-4 py-3 bg-[#E7F3C9] text-[#2E5C1A] border-[#cfe7a1]">
            <div className="font-bold">Lista vazia</div>
            <div className="text-sm">Nenhuma redação com erro.</div>
          </div>
        </div>
      </section>

      <section className="rounded-xl bg-white shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-end justify-between">
          <div className="flex items-baseline gap-3">
            <span className="text-customGreen font-bold text-sm">2025</span>
            <h2 className="text-2xl font-extrabold tracking-tight text-customBlackLight">
              REDAÇÕES
            </h2>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* filtros (pode virar client depois) */}
          <div className="space-y-6">
            <div className="rounded-lg border border-gray-200 bg-white">
              <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-bold text-customBlackLight tracking-wide">SELECIONAR</h3>
                <span className="text-customGreen">—</span>
              </div>
              <div className="p-4">
                <button className="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300 text-sm font-medium">
                  Redações
                </button>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white">
              <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-bold text-customBlackLight tracking-wide">FILTRAR</h3>
                <span className="text-customGreen">—</span>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <label className="block text-sm mb-1">Ano letivo</label>
                  <select className="w-full rounded border-gray-300">
                    <option>2025</option>
                    <option>2024</option>
                    <option>2023</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-1">Tema</label>
                  <input className="w-full rounded border-gray-300" placeholder="Tema" />
                </div>
              </div>
            </div>
          </div>

          {/* lista + créditos */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm">Você possui</span>
                <span className="inline-flex items-center text-sm font-semibold px-1 py-1 rounded-lg bg-customGreen/10 text-customGreen border border-customGreen/30">
                  <ClientBalanceBadge initial={initial} />
                </span>
                <span className="text-sm">créditos para redação.</span>
              </div>
              <a
                href="/comprar"
                className="px-4 py-2 rounded bg-slate-600 hover:bg-slate-700 text-white font-medium"
              >
                Comprar créditos
              </a>

              <a
                href="/redacao"
                className="px-4 py-2 rounded bg-customGreen hover:bg-green-700 text-white font-medium"
              >
                Iniciar redação
              </a>
            </div>

            <div className="rounded-lg border px-4 py-3 bg-[#DCE9FF] text-[#0F3E8A] border-[#b9d0ff]">
              <div className="font-bold">Lista vazia</div>
              <div className="text-sm">Nenhuma redação para exibir. Tente alterar os filtros ao lado.</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}