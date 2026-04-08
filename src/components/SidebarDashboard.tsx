import { redirect } from "next/navigation";
import { createClient } from "../../utils/supabase/server";
import ClientSidebarDashboard from "@/components/ClientSidebarDashboard";

export default async function SidebarDashboard({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) redirect("/login");

  const user = data.user;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url, role")
    .eq("id", user.id)
    .single();

  let initial = 0;
  {
    const { data: balanceRow, error: balanceError } = await supabase
      .from("user_credit_balance")
      .select("balance")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!balanceError && balanceRow?.balance != null) initial = balanceRow.balance;
  }

  const firstName = profile?.full_name?.split(" ")[0] ?? "Usuario";
  const avatarUrl = profile?.avatar_url || null;
  const isAdmin = profile?.role === "admin";

  return (
    <ClientSidebarDashboard
      firstName={firstName}
      avatarUrl={avatarUrl}
      initialCredits={initial}
      isAdmin={isAdmin}
    >
      {children}
    </ClientSidebarDashboard>
  );
}
