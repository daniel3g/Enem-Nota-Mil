'use client'

import { login } from './actions'
import { useState } from 'react'

import Image from "next/image";
import logo from '../../../public/images/logo.webp';
import ImageStudent from '../../../public/images/adolescente-estudando.webp'

import { LuEye, LuEyeClosed } from 'react-icons/lu'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const togglePasswordVisibility = () => setShowPassword(!showPassword)

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
            alt="Logo Enem Nota Mil"
            height={60}
          />
        </a>
      
        <form className='flex flex-col w-full p-3 sm:w-96'>
          <h2 className='mb-8 text-lg'>Acesse sua conta</h2>

          <label className='text-gray-500 text-sm' htmlFor="email">Email:</label>
          <input
            className='flex bg-gray-200 p-3 mb-5 focus:outline-none focus:ring focus:ring-primary_blue rounded-sm'
            id="email"
            name="email"
            type="email"
            required
          />

          <label className='text-gray-500 text-sm' htmlFor="password">Senha:</label>
          <div className='relative bg-gray-200 flex mb-5 focus-within:ring focus-within:ring-primary_blue rounded-sm'>
            <input
              className='w-full bg-gray-200 p-3 bg-transparent focus:outline-none'
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none'
            >
              {showPassword ? <LuEyeClosed /> : <LuEye />}
            </button>
          </div>

          <button className='bg-customPurple p-4 rounded-sm mt-2 text-xl text-white' formAction={login}>Entrar</button>

          <a href="/cadastro">
            <div className='flex flex-col bg-gray-200 sm:w-full p-4 mt-5 rounded-md'>
              <p className='text-gray-500'>Ainda não possui uma conta?</p>
              <p className='text-primary_blue'>Se inscreva agora!</p>
            </div>
          </a>
        </form>
      </div>
    </div>
  )
}
