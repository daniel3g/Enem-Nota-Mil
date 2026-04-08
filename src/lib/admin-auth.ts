import { createClient } from "../../utils/supabase/server";
import { supabaseAdmin } from "../../utils/supabase/admin";

type AdminAuthResult =
  | { ok: true; userId: string }
  | { ok: false; status: 401 | 403 | 500; error: string };

function hasAdminAppMetadata(appMetadata: Record<string, unknown> | null | undefined) {
  if (!appMetadata) return false;

  if (appMetadata.role === "admin" || appMetadata.is_admin === true) {
    return true;
  }

  if (Array.isArray(appMetadata.roles)) {
    return appMetadata.roles.includes("admin");
  }

  return false;
}

export async function requireAdminUser(): Promise<AdminAuthResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { ok: false, status: 401, error: "Unauthorized" };
  }

  if (hasAdminAppMetadata(user.app_metadata)) {
    return { ok: true, userId: user.id };
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    const message = profileError.message.toLowerCase();
    if (profileError.code === "42703" || message.includes("role")) {
      return {
        ok: false,
        status: 500,
        error:
          "Admin role is not configured. Add profiles.role or set app_metadata.role to admin.",
      };
    }

    return { ok: false, status: 500, error: profileError.message };
  }

  if (profile?.role !== "admin") {
    return { ok: false, status: 403, error: "Forbidden" };
  }

  return { ok: true, userId: user.id };
}
