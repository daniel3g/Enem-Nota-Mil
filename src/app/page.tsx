import Image from "next/image";
import logo from '../../public/images/logo.webp';

import RegisterButton from "@/components/RegisterButton";

export default function Home() {
  return (
    <div>
      <header className='flex items-center py-3 px-40'>
        <div className='w-1/2'>
          <Image
          src={logo}
          alt="Logo Torgansa"
          height={60}
          />
        </div>
        <nav className='flex w-1/2 justify-between items-center'>
          <ul className='flex list-none gap-8 text-customBlackLight text-lg'>
            <li><a href="/sobre">Sobre</a></li>
            <li><a href="/metodo">Nosso Método</a></li>
            <li><a href="/dashboard">Acessar Plataforma</a></li>
          </ul>
          <RegisterButton />
        </nav>
      </header>
      <section className="flex w-full px-40 py-16 bg-customYellow">
        <div>
          <h2 className="text-white text-5xl">Sua <strong className="bg-customPurple px-1 py-1">APROVAÇÃO</strong></h2>
          <h2 className="text-white text-5xl">começa aqui!</h2>
        </div>
        <div></div>
      </section>
      </div>
  );
}
