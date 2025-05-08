import { login } from './actions'

import Image from "next/image";
import logo from '../../../public/images/logo.webp';
import ImageStudent from '../../../public/images/adolescente-estudando.webp'


export default function LoginPage() {
  return (
    <div className='flex w-full h-screen'>
      <div className="hidden sm:block w-2/3 h-screen relative">
        <div className="absolute inset-0 w-full h-full">
          <Image
            src={ImageStudent}
            alt="Astronauta do Futuro Estudai"
            layout="fill"
            objectFit="cover"
            className="-z-10 brightness-50"
          />
        </div>
      </div>
      <div className='flex flex-col w-full justify-center items-center sm:w-1/3'>
        <a href='/'>
          <Image
            src={logo}
            alt="Logo Torgansa"
            height={60}
          />
        </a>
      
        <form className='flex flex-col w-full p-3 sm:w-96'>
          <h2 className='mb-8 text-lg'>Acesse sua conta</h2>
          <label className='text-gray-500 text-sm' htmlFor="email">Email:</label>
          <input className='flex bg-gray-100 p-3 mb-5 focus:outline-none focus:ring focus:ring-primary_blue rounded-sm' id="email" name="email" type="email" required />
          <label className='text-gray-500 text-sm' htmlFor="password">Senha:</label>
          <input className='flex bg-gray-100 p-3 mb-5 focus:outline-none focus:ring focus:ring-primary_blue rounded-sm' id="password" name="password" type="password" required />
          <button className='bg-primary_blue p-4 rounded-sm mt-2 text-xl' formAction={login}>Entrar</button>

          <a href="/cadastro"><div className='flex flex-col bg-gray-100 sm:w-full p-4 mt-5 rounded-md'>
            <p className='text-gray-500'>Ainda não possui uma conta?</p>
            <p className='text-primary_blue'>Se inscreva agora!</p>
          </div></a>

        </form>
      </div>
    </div>
    
  )
}