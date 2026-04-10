import { supabaseAdmin } from "../../utils/supabase/admin";

type AuthUserSummary = {
  id: string;
  email: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
};

export type AdminUserRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  cpf_cnpj: string | null;
  avatar_url: string | null;
  role: string;
  balance: number;
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
};

async function listAllAuthUsers() {
  const users: AuthUserSummary[] = [];
  let page = 1;
  const perPage = 1000;

  while (true) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });

    if (error) {
      throw new Error(error.message);
    }

    const currentBatch = (data.users ?? []).map((user) => ({
      id: user.id,
      email: user.email ?? null,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at ?? null,
      email_confirmed_at: user.email_confirmed_at ?? null,
    }));

    users.push(...currentBatch);

    if (currentBatch.length < perPage) {
      break;
    }

    page += 1;
  }

  return users;
}

export async function listAdminUsers(): Promise<AdminUserRow[]> {
  const authUsers = await listAllAuthUsers();

  const [{ data: profiles, error: profilesError }, { data: balances, error: balancesError }] =
    await Promise.all([
      supabaseAdmin
        .from("profiles")
        .select("id, full_name, phone, cpf_cnpj, avatar_url, role"),
      supabaseAdmin.from("user_credit_balance").select("user_id, balance"),
    ]);

  if (profilesError) {
    throw new Error(profilesError.message);
  }

  if (balancesError) {
    throw new Error(balancesError.message);
  }

  const profileMap = new Map((profiles ?? []).map((profile) => [profile.id, profile]));
  const balanceMap = new Map(
    (balances ?? []).map((balance) => [balance.user_id, Number(balance.balance ?? 0)])
  );

  return authUsers
    .map((user) => {
      const profile = profileMap.get(user.id);

      return {
        id: user.id,
        email: user.email,
        full_name: profile?.full_name ?? null,
        phone: profile?.phone ?? null,
        cpf_cnpj: profile?.cpf_cnpj ?? null,
        avatar_url: profile?.avatar_url ?? null,
        role: profile?.role ?? "user",
        balance: balanceMap.get(user.id) ?? 0,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
        email_confirmed_at: user.email_confirmed_at,
      };
    })
    .sort((a, b) => {
      if (a.created_at === b.created_at) return 0;
      return a.created_at < b.created_at ? 1 : -1;
    });
}
