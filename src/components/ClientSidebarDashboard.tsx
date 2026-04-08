"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

import { RxHome } from "react-icons/rx";
import { BsFileText } from "react-icons/bs";
import { PiBooksLight } from "react-icons/pi";
import { MdAttachMoney } from "react-icons/md";
import { RiStickyNoteAddLine } from "react-icons/ri";
import { CgProfile } from "react-icons/cg";
import { HiOutlineMenuAlt2 } from "react-icons/hi";
import { HiXMark } from "react-icons/hi2";

import { signOut } from "@/app/login/actions";
import Logo from "../../public/images/logo-enem-nota-mil-2026.png";
import AvatarDefault from "../../public/images/avatar.png";
import ClientBalanceBadge from "@/components/ClientBalanceBadge";

type Props = {
  children: React.ReactNode;
  firstName: string;
  avatarUrl: string | null;
  initialCredits: number;
  isAdmin?: boolean;
};

const NAV = [
  { href: "/dashboard", label: "Meu painel", icon: <RxHome /> },
  { href: "/minhas-redacoes", label: "Minhas redacoes", icon: <BsFileText /> },
  { href: "/redacao", label: "Nova redacao", icon: <RiStickyNoteAddLine /> },
  { href: "/ebooks", label: "Meus Ebooks", icon: <PiBooksLight /> },
  { href: "/comprar", label: "Comprar creditos", icon: <MdAttachMoney /> },
  { href: "/perfil", label: "Atualizar perfil", icon: <CgProfile /> },
];

export default function ClientSidebarDashboard({
  children,
  firstName,
  avatarUrl,
  initialCredits,
  isAdmin = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const navItems = isAdmin
    ? [
        ...NAV,
        {
          href: "/dashboard/admin/temas",
          label: "Cadastrar temas",
          icon: <RiStickyNoteAddLine />,
        },
      ]
    : NAV;

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="min-h-dvh bg-gray-100 text-gray-800">
      <header className="sticky top-0 z-50 flex items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image src={Logo} alt="Logo" height={82} priority />
        </Link>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center justify-center rounded-md p-2 text-slate-700 hover:bg-slate-100"
          aria-label="Abrir menu"
        >
          <HiOutlineMenuAlt2 className="text-2xl" />
        </button>
      </header>

      <div
        className={[
          "fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 w-[75vw] max-w-[320px] transform bg-[#111827] text-white shadow-2xl transition-transform duration-300 lg:hidden",
          open ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b border-white/10 p-3 px-5">
          <Link href="/dashboard" className="flex items-center gap-3">
            <Image src={Logo} alt="Logo Enem Nota Mil" height={90} />
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-md p-2 hover:bg-white/10"
            aria-label="Fechar menu"
          >
            <HiXMark className="text-2xl" />
          </button>
        </div>

        <nav className="space-y-1 px-3 py-4">
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              active={pathname === item.href}
              onClick={() => setOpen(false)}
            />
          ))}
        </nav>

        <div className="absolute bottom-0 w-full space-y-3 border-t border-white/10 p-4">
          <div className="flex items-center gap-3">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt="Avatar"
                width={36}
                height={36}
                unoptimized
                className="rounded-full"
              />
            ) : (
              <Image
                src={AvatarDefault}
                alt="Foto de perfil"
                width={36}
                height={36}
                className="rounded-full"
              />
            )}

            <div className="text-sm leading-5">
              <div className="opacity-70">Bem-vindo,</div>
              <div className="font-medium">{firstName}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ClientBalanceBadge initial={initialCredits} />
            <span className="text-sm">Creditos</span>
          </div>

          <form>
            <button
              className="w-full rounded-md bg-customPurple py-2 text-sm font-medium"
              formAction={signOut}
              onClick={() => setOpen(false)}
            >
              Sair
            </button>
          </form>
        </div>
      </aside>

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 bg-[#111827] text-white shadow-xl lg:block">
        <div className="flex items-center border-b border-white/10 p-3 px-5">
          <Link href="/dashboard" className="flex items-center gap-3">
            <Image src={Logo} alt="Logo Enem Nota Mil" height={120} />
          </Link>
        </div>

        <nav className="space-y-1 px-3 py-4">
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              active={pathname === item.href}
            />
          ))}
        </nav>

        <div className="absolute bottom-0 w-full space-y-3 border-t border-white/10 p-4">
          <div className="flex items-center gap-3">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt="Avatar"
                width={36}
                height={36}
                unoptimized
                className="rounded-full"
              />
            ) : (
              <Image
                src={AvatarDefault}
                alt="Foto de perfil"
                width={36}
                height={36}
                className="rounded-full"
              />
            )}

            <div className="text-sm leading-5">
              <div className="opacity-70">Bem-vindo,</div>
              <div className="font-medium">{firstName}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ClientBalanceBadge initial={initialCredits} />
            <span className="text-sm">Creditos</span>
          </div>

          <form>
            <button
              className="w-full rounded-md bg-customPurple py-2 text-sm font-medium"
              formAction={signOut}
            >
              Sair
            </button>
          </form>
        </div>
      </aside>

      <main className="p-4 lg:pl-64 lg:p-8">{children}</main>
    </div>
  );
}

function NavItem({
  href,
  icon,
  label,
  active,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={[
        "flex items-center gap-3 rounded-lg px-3 py-2 transition",
        active ? "bg-white/15" : "hover:bg-white/10",
      ].join(" ")}
    >
      <span className="text-lg">{icon}</span>
      <span className="font-medium">{label}</span>
    </Link>
  );
}
