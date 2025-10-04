// components/SidebarDashboard.tsx
import { redirect } from 'next/navigation'
import { createClient } from '../../utils/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { RxHome } from "react-icons/rx"
import { BsFileText } from "react-icons/bs"
import { PiBooksLight } from "react-icons/pi"
import { MdAttachMoney } from "react-icons/md"
import { signOut } from '@/app/login/actions'
import Logo from '../../public/images/logo.webp'
import AvatarDefault from '../../public/images/avatar.png'
import ClientBalanceBadge from "@/components/ClientBalanceBadge"

export default async function SidebarDashboard({
  children,
}: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) redirect('/login')

  const user = data.user!
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  let initial = 0
  {
    const { data } = await supabase
      .from("credit_transactions")
      .select("amount")
      .eq("user_id", user.id)
    initial = (data ?? []).reduce((a, r: any) => a + (r.amount ?? 0), 0)
  }

  const firstName = profile?.full_name?.split(' ')[0] ?? 'Usuário'

  return (
    <div className="min-h-dvh bg-gray-100 text-gray-800">
      {/* SIDEBAR */}
      <aside className="fixed inset-y-0 left-0 z-40 w-64 bg-[#111827] text-white shadow-xl">
        <div className="flex items-center p-3 px-5 border-b border-white/10">
          <Link href="/dashboard" className="flex items-center gap-3">
            <Image src={Logo} alt="Logo Enem Nota Mil" height={100} />
          </Link>
        </div>

        <nav className="px-3 py-4 space-y-1">
          <NavItem href="/dashboard" icon={<RxHome />} label="Meu painel" />
          <NavItem href="/minhas-redacoes" icon={<BsFileText />} label="Minhas redações" />
          <NavItem href="/ebooks" icon={<PiBooksLight />} label="Meus Ebooks" />
          <NavItem href="/comprar" icon={<MdAttachMoney />} label="Comprar créditos" />
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-white/10 space-y-3">
          <div className="flex items-center gap-3">
            <Image src={AvatarDefault} alt="Foto de perfil" width={36} height={36} className="rounded-full" />
            <div className="text-sm leading-5">
              <div className="opacity-70">Bem-vindo,</div>
              <div className="font-medium">{firstName}</div>
            </div>
          </div>

          <ClientBalanceBadge initial={initial} /> Créditos

          <form>
            <button
              className="w-full bg-customPurple rounded-md py-2 text-sm font-medium"
              formAction={signOut}
            >
              Sair
            </button>
          </form>
        </div>
      </aside>

      {/* MAIN */}
      <main className="lg:pl-64 p-4 lg:p-8">{children}</main>
    </div>
  )
}

function NavItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition"
    >
      <span className="text-lg">{icon}</span>
      <span className="font-medium">{label}</span>
    </Link>
  )
}
