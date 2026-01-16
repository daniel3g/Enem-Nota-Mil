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
import Logo from "../../public/images/logo.webp";
import AvatarDefault from "../../public/images/avatar.png";
import ClientBalanceBadge from "@/components/ClientBalanceBadge";

type Props = {
  children: React.ReactNode;
  firstName: string;
  avatarUrl: string | null;
  initialCredits: number;
};

const NAV = [
  { href: "/dashboard", label: "Meu painel", icon: <RxHome /> },
  { href: "/minhas-redacoes", label: "Minhas redações", icon: <BsFileText /> },
  { href: "/redacao", label: "Nova redação", icon: <RiStickyNoteAddLine /> },
  { href: "/ebooks", label: "Meus Ebooks", icon: <PiBooksLight /> },
  { href: "/comprar", label: "Comprar créditos", icon: <MdAttachMoney /> },
  { href: "/perfil", label: "Atualizar perfil", icon: <CgProfile /> },
];

export default function ClientSidebarDashboard({
  children,
  firstName,
  avatarUrl,
  initialCredits,
}: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Fecha ao trocar de rota
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Trava o scroll do body quando drawer abre
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  // Fecha ao apertar ESC
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="min-h-dvh bg-gray-100 text-gray-800">
      {/* TOP BAR (mobile) */}
      <header className="sticky top-0 z-50 flex items-center justify-between gap-3 bg-white/95 backdrop-blur border-b border-slate-200 px-4 py-3 lg:hidden">
        

        <Link href="/dashboard" className="flex items-center gap-2">
          <Image src={Logo} alt="Logo" height={42} priority />
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

      {/* OVERLAY (mobile) */}
      <div
        className={[
          "fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* DRAWER SIDEBAR (mobile) */}
      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 w-[75vw] max-w-[320px] bg-[#111827] text-white shadow-2xl transform transition-transform duration-300 lg:hidden",
          open ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between p-3 px-5 border-b border-white/10">
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

        <nav className="px-3 py-4 space-y-1">
          {NAV.map((item) => (
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

        <div className="absolute bottom-0 w-full p-4 border-t border-white/10 space-y-3">
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
            <span className="text-sm">Créditos</span>
          </div>

          <form>
            <button
              className="w-full bg-customPurple rounded-md py-2 text-sm font-medium"
              formAction={signOut}
              onClick={() => setOpen(false)}
            >
              Sair
            </button>
          </form>
        </div>
      </aside>

      {/* SIDEBAR DESKTOP (igual ao seu, fixa) */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 z-40 w-64 bg-[#111827] text-white shadow-xl">
        <div className="flex items-center p-3 px-5 border-b border-white/10">
          <Link href="/dashboard" className="flex items-center gap-3">
            <Image src={Logo} alt="Logo Enem Nota Mil" height={100} />
          </Link>
        </div>

        <nav className="px-3 py-4 space-y-1">
          {NAV.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              active={pathname === item.href}
            />
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-white/10 space-y-3">
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
            <span className="text-sm">Créditos</span>
          </div>

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

      {/* CONTEÚDO */}
      <main className="lg:pl-64 p-4 lg:p-8">{children}</main>
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
        "flex items-center gap-3 px-3 py-2 rounded-lg transition",
        active ? "bg-white/15" : "hover:bg-white/10",
      ].join(" ")}
    >
      <span className="text-lg">{icon}</span>
      <span className="font-medium">{label}</span>
    </Link>
  );
}
