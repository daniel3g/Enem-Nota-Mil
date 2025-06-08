import Image from "next/image";
import logo from '../../public/images/logo.webp';
import bgHero from '../../public/images/bg-hero.png'
import imageEbooks from '../../public/images/img-sec-questoes.png'
import imageRedacao from '../../public/images/img-sec-redacao.png'
import imageVideoaulas from '../../public/images/img-sec-estastic.png'

import { FiInstagram } from "react-icons/fi";
import { SlSocialYoutube } from "react-icons/sl";


import RegisterButton from "@/components/RegisterButton";

export default function Home() {
  return (
    <div>
      <header className='flex items-center py-3 px-40'>
        <div className='w-1/2'>
          <Image
          src={logo}
          alt="Logo"
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
      <div className="relative">
      <section className="flex items-center w-full px-40 py-16 bg-customYellow gap-10">
        <div className="flex flex-col w-1/2">
          <h2 className="text-black text-5xl">Estude com <strong className="text-black">Estratégia</strong></h2>
          <h2 className="text-black text-5xl">e chegue mais perto</h2>
          <h2 className="text-black text-5xl">da sua <strong className="text-black">Vaga</strong></h2>
        </div>
        <div className="flex w-1/2">
          <Image 
          src={bgHero}
          alt="Bg Hero"
          />
        </div>
      </section>
      <div className="absolute left-40 top-[calc(100%-320px)] w-1/3 bg-white rounded-lg shadow-lg z-10 p-10">
      <p className="text-lg">Estudar para o ENEM e vestibulares nunca foi tão fácil! Com o ENEM Nota Mil você tem acesso a ferramentas poderosas que aceleram sua aprendizagem e aumentam suas chances de aprovação. Nossa plataforma combina tecnologia, acompanhamento especializado e estratégias cientificamente comprovadas para tornar seu estudo mais produtivo.</p>
      </div>

      <div className="flex px-40 w-full bg-customPurple h-52">
        <div className="w-1/2"></div>
          <div className="flex flex-col py-10 w-1/2">
            <h2 className="text-white text-2xl">Faça a sua <strong>Matrícula Agora!</strong></h2>
            <p className="text-white my-2 text-xl">O próximo passo da sua jornada!</p>
            <RegisterButton 
              href="/cadastro" 
              backgroundColor="bg-customYellow" 
              textColor="text-black"
            >
              Garanta sua Vaga!
            </RegisterButton>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center w-full px-40 py-16">
        <h2 className="text-center text-3xl">Conheça as ferramentas que vão te ajudar <br /> a mandar bem nos estudos!</h2>
        <div className="flex items-center justify-center w-full px-40 py-16 gap-5">
          <div className="w-1/2 text-xl">
            <h2 className="text-3xl text-customPurple">Ebooks</h2>
            <p>Aprofunde seus estudos com conteúdos exclusivos elaborados por especialistas. Tenha acesso a materiais digitais criados por professores experientes, com linguagem acessível, foco em resultados e alinhamento com as principais competências exigidas no ENEM e outros vestibulares.</p>
          </div>
          <div className="flex w-1/2 justify-end">
            <Image 
            src={imageEbooks}
            alt="Ebooks"
            />
          </div>
        </div>
        <div className="flex items-center justify-center w-full px-40 py-16 gap-5">
          <div className="w-1/2">
            <Image 
            src={imageRedacao}
            alt="Ebooks"
            />
          </div>
          <div className="w-1/2 text-xl">
            <h2 className="text-3xl text-customPurple">Redação</h2>
            <p>Receba correções inteligentes e melhore seu desempenho com orientações certeiras. Nossa inteligência artificial, treinada com base nos critérios oficiais e supervisionada por especialistas, oferece feedbacks detalhados que ajudam você a evoluir a cada redação — rumo à tão sonhada nota 1000.</p>
          </div>
        </div>
        <div className="flex items-center justify-center w-full px-40 py-16 gap-5">
          <div className="w-1/2 text-xl">
            <h2 className="text-3xl text-customPurple">Videoaulas</h2>
            <p>Aprenda com quem realmente entende de aprovação. Assista a videoaulas objetivas, didáticas e voltadas para o que mais cai na prova. Nossa equipe de professores domina o conteúdo e ensina com clareza, foco e dinamismo para otimizar o seu tempo de estudo.</p>
          </div>
          <div className="flex w-1/2 justify-end">
            <Image 
            src={imageVideoaulas}
            alt="Ebooks"
            />
          </div>
        </div>
      </div>
      <footer className="flex w-full px-10 py-20 bg-customPurple items-center">
        <div className="flex w-1/4 flex-col">
          <Image
          src={logo}
          alt="Logo"
          height={60}
          />
          <div className="flex text-white text-5xl mt-5 gap-3">
            <FiInstagram />
            <SlSocialYoutube />
          </div>
        </div>
        <div className='flex flex-col w-3/4 items-end'>
          <nav>
          <ul className='flex list-none gap-8 text-white text-lg'>
            <li><a href="/sobre">Sobre</a></li>
            <li><a href="/metodo">Nosso Método</a></li>
            <li><a href="/dashboard">Acessar Plataforma</a></li>
          </ul>
          </nav>
          <hr className="border-solid border-white my-4 border w-full sm:my-2" />
          <p className="text-white text-sm">Copyright ©2025 ENEM Nota Mil, Todos os Direitos Reservados.</p>
        </div>
      </footer>
    </div>
  );
}
