import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin-auth";
import { listAdminUsers } from "@/lib/admin-users";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const admin = await requireAdminUser();
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  try {
    const users = await listAdminUsers();
    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao carregar usuarios.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
