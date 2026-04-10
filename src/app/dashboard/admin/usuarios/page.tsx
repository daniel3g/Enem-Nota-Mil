import { redirect } from "next/navigation";
import { requireAdminUser } from "@/lib/admin-auth";
import { listAdminUsers } from "@/lib/admin-users";

export const dynamic = "force-dynamic";

function formatDateTime(value: string | null) {
  if (!value) return "Nunca";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(value));
}

function renderValue(value: string | null) {
  return value && value.trim() ? value : "-";
}

export default async function AdminUsersPage() {
  const admin = await requireAdminUser();

  if (!admin.ok) {
    if (admin.status === 401) {
      redirect("/login");
    }

    return (
      <div className="mx-auto max-w-7xl">
        <div className="rounded-lg border border-red-200 bg-red-50 px-6 py-5 text-red-700">
          {admin.error}
        </div>
      </div>
    );
  }

  try {
    const users = await listAdminUsers();

    return (
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <div className="text-xs font-extrabold text-customGreen">ADMIN</div>
            <h1 className="mt-1 font-heading text-2xl font-extrabold text-slate-900">
              Usuarios cadastrados
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Visualize os dados principais dos usuarios da plataforma em um unico lugar.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 border-b border-slate-200 px-6 py-5 sm:grid-cols-3">
            <StatCard label="Total de usuarios" value={String(users.length)} />
            <StatCard
              label="Administradores"
              value={String(users.filter((user) => user.role === "admin").length)}
            />
            <StatCard
              label="Emails confirmados"
              value={String(users.filter((user) => Boolean(user.email_confirmed_at)).length)}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Usuario</th>
                  <th className="px-4 py-3 font-semibold">Contato</th>
                  <th className="px-4 py-3 font-semibold">Perfil</th>
                  <th className="px-4 py-3 font-semibold">Creditos</th>
                  <th className="px-4 py-3 font-semibold">Cadastro</th>
                  <th className="px-4 py-3 font-semibold">Ultimo acesso</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t border-slate-100 align-top">
                    <td className="px-4 py-4">
                      <div className="font-semibold text-slate-900">
                        {renderValue(user.full_name)}
                      </div>
                      <div className="mt-1 text-xs text-slate-500">{user.id}</div>
                    </td>
                    <td className="px-4 py-4 text-slate-700">
                      <div>{renderValue(user.email)}</div>
                      <div className="mt-1">{renderValue(user.phone)}</div>
                      <div className="mt-1 text-xs text-slate-500">
                        CPF/CNPJ: {renderValue(user.cpf_cnpj)}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-700">
                      <span
                        className={[
                          "inline-flex rounded-full px-2.5 py-1 text-xs font-bold uppercase",
                          user.role === "admin"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-700",
                        ].join(" ")}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-semibold text-slate-900">{user.balance}</td>
                    <td className="px-4 py-4 text-slate-700">{formatDateTime(user.created_at)}</td>
                    <td className="px-4 py-4 text-slate-700">
                      {formatDateTime(user.last_sign_in_at)}
                    </td>
                    <td className="px-4 py-4 text-slate-700">
                      <div>{user.email_confirmed_at ? "Email confirmado" : "Email pendente"}</div>
                      <div className="mt-1 text-xs text-slate-500">Ativo</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao carregar usuarios.";

    return (
      <div className="mx-auto max-w-7xl">
        <div className="rounded-lg border border-red-200 bg-red-50 px-6 py-5 text-red-700">
          {message}
        </div>
      </div>
    );
  }
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-extrabold text-slate-900">{value}</div>
    </div>
  );
}
