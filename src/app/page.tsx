import Image from "next/image";
import logo from '../../public/images/logo.webp';
import bgHero from '../../public/images/bg-hero.png';
import imageEbooks from '../../public/images/img-sec-questoes.png';
import imageRedacao from '../../public/images/img-sec-redacao.png';
import imageVideoaulas from '../../public/images/img-sec-estastic.png';

import { FiInstagram } from "react-icons/fi";
import { SlSocialYoutube } from "react-icons/sl";

import RegisterButton from "@/components/RegisterButton";

export default function Home() {
  return (
    <div>
      {/* Header */}
      <header className="flex flex-col sm:flex-row items-center gap-4 sm:gap-0 py-3 px-6 sm:px-40">
        <div className="w-full sm:w-1/2 flex justify-center sm:justify-start">
          <Image src={logo} alt="Logo" height={60} />
        </div>
        <nav className="flex flex-col sm:flex-row w-full sm:w-1/2 items-center sm:justify-between gap-4 sm:gap-0">
          <ul className="flex flex-col sm:flex-row gap-4 sm:gap-8 text-customBlackLight text-lg items-center">
            <li><a href="/sobre">Sobre</a></li>
            <li><a href="/metodo">Nosso Método</a></li>
            <li><a href="/dashboard">Acessar Plataforma</a></li>
          </ul>
          <RegisterButton />
        </nav>
      </header>

      {/* Hero */}
      <div className="relative">
        <section className="flex flex-col-reverse sm:flex-row items-center w-full px-6 sm:px-40 py-16 bg-customYellow gap-10 text-center sm:text-left">
          <div className="w-full sm:w-1/2">
            <h2 className="text-black text-4xl sm:text-5xl">Estude com <strong>Estratégia</strong></h2>
            <h2 className="text-black text-4xl sm:text-5xl">e chegue mais perto</h2>
            <h2 className="text-black text-4xl sm:text-5xl">da sua <strong>Vaga</strong></h2>
          </div>
          <div className="w-full sm:w-1/2">
            <Image src={bgHero} alt="Bg Hero" />
          </div>
        </section>

        {/* Caixa flutuante */}
        <div className="absolute top-[calc(100%-220px)] left-6 sm:left-40 w-[90%] sm:w-1/3 bg-white rounded-lg shadow-lg z-10 p-6 sm:p-10 sm:top-[calc(100%-320px)]">
          <p className="text-base sm:text-lg">
            Estudar para o ENEM e vestibulares nunca foi tão fácil! Com o ENEM Nota Mil você tem acesso a ferramentas poderosas que aceleram sua aprendizagem e aumentam suas chances de aprovação. Nossa plataforma combina tecnologia, acompanhamento especializado e estratégias cientificamente comprovadas para tornar seu estudo mais produtivo.
          </p>
        </div>

        {/* Matrícula */}
        <div className="flex flex-col sm:flex-row px-6 sm:px-40 w-full bg-customPurple h-auto sm:h-52 py-10 sm:py-0">
          <div className="w-full sm:w-1/2"></div>
          <div className="flex flex-col w-full sm:w-1/2">
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

      {/* Seções */}
      <div className="flex flex-col mt-10 items-center justify-center w-full px-6 sm:px-40 py-16 sm:mt-2">
        <h2 className="text-center text-3xl mb-10">Conheça as ferramentas que vão te ajudar <br /> a mandar bem nos estudos!</h2>

        {/* Ebooks */}
        <div className="flex flex-col sm:flex-row items-center justify-center w-full py-10 gap-5 text-center sm:text-left">
          <div className="w-full sm:w-1/2 text-xl">
            <h2 className="text-3xl text-customPurple mb-2">Ebooks</h2>
            <p>
              Aprofunde seus estudos com conteúdos exclusivos elaborados por especialistas. Tenha acesso a materiais digitais criados por professores experientes, com linguagem acessível, foco em resultados e alinhamento com as principais competências exigidas no ENEM e outros vestibulares.
            </p>
          </div>
          <div className="flex w-full sm:w-1/2 justify-center sm:justify-end">
            <Image src={imageEbooks} alt="Ebooks" />
          </div>
        </div>

        {/* Redação */}
        <div className="flex flex-col sm:flex-row items-center justify-center w-full py-10 gap-5 text-center sm:text-left">
          <div className="flex w-full sm:w-1/2 justify-center sm:justify-start">
            <Image src={imageRedacao} alt="Redação" />
          </div>
          <div className="w-full sm:w-1/2 text-xl">
            <h2 className="text-3xl text-customPurple mb-2">Redação</h2>
            <p>
              Receba correções inteligentes e melhore seu desempenho com orientações certeiras. Nossa inteligência artificial, treinada com base nos critérios oficiais e supervisionada por especialistas, oferece feedbacks detalhados que ajudam você a evoluir a cada redação — rumo à tão sonhada nota 1000.
            </p>
          </div>
        </div>

        {/* Videoaulas */}
        <div className="flex flex-col sm:flex-row items-center justify-center w-full py-10 gap-5 text-center sm:text-left">
          <div className="w-full sm:w-1/2 text-xl">
            <h2 className="text-3xl text-customPurple mb-2">Videoaulas</h2>
            <p>
              Aprenda com quem realmente entende de aprovação. Assista a videoaulas objetivas, didáticas e voltadas para o que mais cai na prova. Nossa equipe de professores domina o conteúdo e ensina com clareza, foco e dinamismo para otimizar o seu tempo de estudo.
            </p>
          </div>
          <div className="flex w-full sm:w-1/2 justify-center sm:justify-end">
            <Image src={imageVideoaulas} alt="Videoaulas" />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="flex flex-col sm:flex-row w-full px-6 sm:px-10 py-10 sm:py-20 bg-customPurple items-center sm:items-start text-center sm:text-left gap-10">
        <div className="flex w-full sm:w-1/4 flex-col items-center sm:items-start">
          <Image src={logo} alt="Logo" height={60} />
          <div className="flex text-white text-4xl mt-5 gap-3">
            <FiInstagram />
            <SlSocialYoutube />
          </div>
        </div>
        <div className="flex flex-col w-full sm:w-3/4 items-center sm:items-end">
          <nav>
            <ul className="flex flex-col sm:flex-row gap-4 sm:gap-8 text-white text-lg items-center sm:items-end">
              <li><a href="/sobre">Sobre</a></li>
              <li><a href="/metodo">Nosso Método</a></li>
              <li><a href="/dashboard">Acessar Plataforma</a></li>
            </ul>
          </nav>
          <hr className="border-solid border-white my-4 border w-full sm:my-2" />
          <p className="text-white text-sm">©2025 ENEM Nota Mil, Todos os Direitos Reservados.</p>
        </div>
      </footer>
    </div>
  );
}
