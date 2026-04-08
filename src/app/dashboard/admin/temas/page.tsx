import { redirect } from "next/navigation";
import AdminThemeForm from "@/components/AdminThemeForm";
import { requireAdminUser } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function AdminThemesPage() {
  const admin = await requireAdminUser();

  if (!admin.ok) {
    if (admin.status === 401) {
      redirect("/login");
    }

    return (
      <div className="mx-auto max-w-3xl">
        <div className="rounded-lg border border-red-200 bg-red-50 px-6 py-5 text-red-700">
          {admin.error}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <AdminThemeForm />
    </div>
  );
}
