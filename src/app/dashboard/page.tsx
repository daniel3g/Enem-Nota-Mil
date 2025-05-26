import HeaderDashboard from '@/components/HeaderDashboard'
import Image from 'next/image'
import Link from 'next/link'
import bgDashboard from '../../../public/images/bg-dashboard.webp'

export default function Dashboard() {
  return (
    <>
      <HeaderDashboard />
      <div className='w-3/4 m-auto mt-10'>
        <Image 
          src={bgDashboard}
          alt='Banner Dashboard'
        />
        <div className='flex w-full gap-3 mt-10'>
          <div className='flex flex-col w-1/3 bg-white rounded-lg p-5'>
            <h2 className='text-lg'>Redações</h2>
            <p className='mt-3'>Receba correções personalizadas e aumente suas chances de tirar nota 1000 na redação.</p>
            <Link href="/redacao">
              <button className='flex bg-customPurple justify-center py-2 px-8 text-white rounded-lg mt-5'>Enviar Redação</button>
            </Link>
          </div>
          <div className='flex flex-col w-1/3 bg-white rounded-lg p-5'>
            <h2 className='text-lg'>Ebooks</h2>
            <p className='mt-3'>Tenha acesso a conteúdos exclusivos e otimize seus estudos com profundidade e foco.</p>
            <Link href="/ebooks">
              <button className='flex bg-customPurple justify-center py-2 px-8 text-white rounded-lg mt-5'>Acessar Ebooks</button>
            </Link>
          </div>
          <div className='flex flex-col w-1/3 bg-white rounded-lg p-5'>
            <h2 className='text-lg'>Videoaulas</h2>
            <p className='mt-3'>Aprenda mais vendo videoaulas com os melhores professores.</p>
            <Link href="/videoaulas">
              <button className='flex bg-customPurple justify-center py-2 px-8 text-white rounded-lg mt-5'>Assistir Videoaulas</button>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}