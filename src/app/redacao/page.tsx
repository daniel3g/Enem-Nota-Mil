import { redirect } from "next/navigation";
import { createClient } from "../../../utils/supabase/server";
import RedacaoForm from "@/components/RedacaoForm";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ theme?: string }>;
};

export default async function RedacaoPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const themeId = sp?.theme ?? null;
  const supabase = await createClient();

  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");

  const { data: theme } = await supabase
    .from("themes")
    .select("id,title")
    .eq("id", themeId)
    .eq("active", true)
    .maybeSingle();

  if (!theme) redirect("/temas");

  return (
    <div className="flex m-auto items-center min-h-dvh p-4 sm:p-6 overflow-y-auto">
      <RedacaoForm
        email={auth.user.email ?? ""}
        themeId={theme.id}
        themeTitle={theme.title}
      />
    </div>
  );
}
