import Image from "next/image";
import Link from "next/link";

import logo from "../../public/images/logo.webp";

// ✅ Troque essas imagens pelas suas (vou ajustar quando você mandar)
import heroLeft from "../../public/images/bg-hero-2.jpg"; // imagem grande do lado esquerdo do hero
import deviceMock from "../../public/images/image-redacao.jpg"; // imagem mockup (celular / dashboard)

// opcional: ícones
import { FiInstagram } from "react-icons/fi";
import { SlSocialYoutube } from "react-icons/sl";

import RegisterButton from "@/components/RegisterButton";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* HEADER */}
      <header className="sticky top-0 z-50 w-full border-b border-black/5 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <Image src={logo} alt="ENEM Nota Mil" height={44} priority />
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-700 md:flex">
            <a className="hover:text-slate-900" href="#sobre">
              SOBRE
            </a>
            <a className="hover:text-slate-900" href="#como-funciona">
              COMO FUNCIONA
            </a>
            <a className="hover:text-slate-900" href="#precos">
              PREÇO
            </a>
            <a className="hover:text-slate-900" href="#escolas">
              PARA ESCOLAS
            </a>

            <Link
              href="/dashboard"
              className="rounded-md border border-slate-300 px-4 py-2 text-slate-800 hover:bg-slate-50"
            >
              ENTRAR →
            </Link>
          </nav>

          {/* Mobile CTA */}
          <div className="md:hidden">
            <Link
              href="/dashboard"
              className="rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-800"
            >
              ENTRAR →
            </Link>
          </div>
        </div>
      </header>

      {/* HERO (split 50/50) */}
      <section className="w-full">
        <div className="grid min-h-[520px] grid-cols-1 md:grid-cols-2">
          {/* Esquerda - Imagem */}
          <div className="relative min-h-[320px] md:min-h-[520px]">
            <Image
              src={heroLeft}
              alt="Estudante escrevendo"
              fill
              className="object-cover"
              priority
            />
            {/* leve overlay pra ficar igual ao print */}
            <div className="absolute inset-0 bg-black/10" />
          </div>

          {/* Direita - Painel escuro */}
          <div className="relative flex items-center justify-center overflow-hidden bg-slate-900">
            {/* gradiente sutil */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-900/60" />

            <div className="relative mx-auto w-full max-w-xl px-6 py-16 text-center md:px-10 md:text-left">
              <div className="mb-4 inline-flex rounded-full bg-customYellow/15 px-3 py-1 text-xs font-bold tracking-wide text-customYellow">
                REDAÇÃO NOTA 1000
              </div>

              <h1 className="text-balance text-3xl font-extrabold leading-tight text-white sm:text-4xl">
                A MELHOR E MAIS COMPLETA PLATAFORMA DE PRÁTICA E CORREÇÃO DE
                REDAÇÕES DO BRASIL.
              </h1>

              <div className="mt-8 flex flex-col items-center gap-3 md:items-start">
                <a
                  href="#como-funciona"
                  className="inline-flex w-full max-w-xs items-center justify-center rounded-md bg-white px-5 py-3 text-sm font-extrabold text-slate-900 hover:bg-slate-100"
                >
                  VEJA COMO FUNCIONA →
                </a>

                <Link
                  href="/cadastro"
                  className="inline-flex w-full max-w-xs items-center justify-center rounded-md bg-customPurple px-5 py-3 text-sm font-extrabold text-white hover:bg-customPurple/90"
                >
                  SEJA UM ESTUDANTE NOTA MIL ✦
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA (SIMPLES E PRÁTICO) */}
      <section id="como-funciona" className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-3 lg:items-start">
            {/* Título grande */}
            <div className="lg:col-span-1">
              <h2 className="text-4xl font-extrabold leading-none tracking-tight text-slate-800 sm:text-5xl">
                <span className="block">SIMPLES</span>
                <span className="block text-customYellow">E PRÁTICO</span>
              </h2>
            </div>

            {/* Texto + passos */}
            <div className="lg:col-span-2">
              <p className="max-w-2xl text-base leading-relaxed text-slate-600">
                Na ENEM Nota Mil, você recebe correções detalhadas e
                esclarecedoras, com sugestões práticas para evoluir a cada texto.
                É só cadastrar, enviar sua redação e acompanhar sua nota e seus
                apontamentos.
              </p>

              <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <StepCard
                  n="1"
                  title="CADASTRE-SE NA PLATAFORMA"
                  desc="Crie sua conta e acesse o painel."
                />
                <StepCard
                  n="2"
                  title="ADQUIRA UM PACOTE"
                  desc="Escolha a opção ideal para seu objetivo."
                  accent
                />
                <StepCard
                  n="3"
                  title="ENVIE SUA REDAÇÃO"
                  desc="Envie digitada ou manuscrita (foto)."
                  accent
                />
                <StepCard
                  n="4"
                  title="RECEBA SUA CORREÇÃO"
                  desc="Feedback completo por competência."
                />
              </div>
            </div>
          </div>

          {/* Mockup / imagem central */}
          <div className="relative mt-14 overflow-hidden rounded-xl border border-black/5 bg-slate-50 p-4 sm:p-6">
            <div className="relative mx-auto aspect-[16/7] w-full">
              <Image
                src={deviceMock}
                alt="Plataforma - exemplo"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* PACOTES E PLANOS */}
      <section id="precos" className="bg-slate-100">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-start">
            <div>
              <h2 className="text-4xl font-extrabold tracking-tight text-slate-800">
                <span className="text-customGreen">PACOTES</span> <br />
                E PLANOS
              </h2>
            </div>
            <div className="text-slate-600">
              Bora treinar e evoluir na redação?
              <br />
              Veja nossos pacotes e planos especiais:
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <PlanCard
              title="QUERO EXPERIMENTAR"
              subtitle="3 créditos • utilize quando quiser"
              price="GRÁTIS"
              badge="Inicial"
              cta="CADASTRE-SE"
            />
            <PlanCard
              title="QUERO CONTINUAR"
              subtitle="1 crédito • utilize quando quiser"
              price="R$ 9,90"
              badge="Básico"
              cta="COMPRE AGORA"
            />
            <PlanCard
              featured
              title="QUERO MELHORAR"
              subtitle="5 créditos • utilize quando quiser"
              price="R$ 39,90"
              badge="Mais vendido"
              cta="COMPRE AGORA"
            />
            <PlanCard
              title="QUERO ARRASAR"
              subtitle="10 créditos • utilize quando quiser"
              price="R$ 69,90"
              badge="Recomendado"
              cta="COMPRE AGORA"
            />
          </div>

          <div className="mt-10 grid grid-cols-1 gap-3 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-3">
            <FeaturePill text="Avaliação completa com nota total e por competência" />
            <FeaturePill text="Comentários e apontamentos no texto" />
            <FeaturePill text="Sugestões de melhoria por competência" />
            <FeaturePill text="Foco Total no ENEM" />
            <FeaturePill text="Avaliação focada no Tema da Redação" />
            <FeaturePill text="Correção rápida e detalhada " />
          </div>

          <p className="mt-6 text-center text-xs text-slate-500">
            Prazo de correção: até 2 minutos.
          </p>

          {/* CTA final opcional */}
          <div className="mt-8 flex justify-center">
            <RegisterButton
              href="/cadastro"
              backgroundColor="bg-customPurple"
              textColor="text-white"
            >
              Começar agora
            </RegisterButton>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-6 border-t border-black/5 pt-8 md:flex-row">
            <div className="flex items-center gap-3">
              <Image src={logo} alt="ENEM Nota Mil" height={40} />
            </div>

            <nav className="flex flex-wrap items-center justify-center gap-5 text-xs font-semibold text-slate-600">
              <a href="#sobre" className="hover:text-slate-900">
                SOBRE
              </a>
              <a href="#como-funciona" className="hover:text-slate-900">
                COMO FUNCIONA
              </a>
              <a href="#precos" className="hover:text-slate-900">
                PREÇO
              </a>
              <a href="#" className="hover:text-slate-900">
                PARA ESCOLAS
              </a>
              <Link href="/#" className="hover:text-slate-900">
                TERMOS
              </Link>
            </nav>

            <div className="flex items-center gap-3 text-2xl text-slate-700">
              <a href="https:instagram.com/enemnota_mil" target="_blank">
              <FiInstagram />
              </a>
              <SlSocialYoutube />
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-slate-500">
            ©{new Date().getFullYear()} ENEM Nota Mil. Todos os direitos
            reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}

function StepCard({
  n,
  title,
  desc,
  accent,
}: {
  n: string;
  title: string;
  desc: string;
  accent?: boolean;
}) {
  return (
    <div
      className={[
        "rounded-lg border p-5",
        accent
          ? "border-customYellow/50 bg-customYellow/10"
          : "border-black/5 bg-white",
      ].join(" ")}
    >
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-customYellow text-lg font-extrabold text-white">
          {n}
        </div>
        <h3 className="text-sm font-extrabold tracking-wide text-slate-800">
          {title}
        </h3>
      </div>
      <p className="text-sm leading-relaxed text-slate-600">{desc}</p>
    </div>
  );
}

function PlanCard({
  title,
  subtitle,
  price,
  badge,
  cta,
  featured,
}: {
  title: string;
  subtitle: string;
  price: string;
  badge: string;
  cta: string;
  featured?: boolean;
}) {
  return (
    <div
      className={[
        "rounded-xl border p-6 shadow-sm transition",
        featured
          ? "border-red-200 bg-red-50 ring-2 ring-red-200"
          : "border-black/5 bg-white hover:shadow-md",
      ].join(" ")}
    >
      <div className="text-xs font-extrabold tracking-wide text-slate-600">
        {badge}
      </div>
      <h3 className="mt-2 text-sm font-extrabold text-slate-900">{title}</h3>
      <p className="mt-2 text-xs text-slate-600">{subtitle}</p>

      <div className="mt-6 text-2xl font-extrabold text-slate-900">{price}</div>

      <Link href="/cadastro">
      <button
        className={[
          "mt-6 w-full rounded-md px-4 py-3 text-xs font-extrabold tracking-wide",
          featured
            ? "bg-red-600 text-white hover:bg-red-700"
            : "bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50",
        ].join(" ")}
        type="button"
      >
        {cta}
      </button>
      </Link>
    </div>
  );
}

function FeaturePill({ text }: { text: string }) {
  return (
    <div className="rounded-md border border-black/5 bg-white px-4 py-3 text-center">
      {text}
    </div>
  );
}
