'use client'

import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'

import Image from 'next/image'

import { login } from './actions'
import logo from '../../../public/images/logo-enem-nota-mil-2026.png'
import ImageStudent from '../../../public/images/bg-login.webp'
import { LuEye, LuEyeClosed } from 'react-icons/lu'

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type='submit'
      disabled={pending}
      className={`bg-customPurple mt-2 w-full rounded-sm p-4 text-xl text-white ${
        pending ? 'cursor-not-allowed opacity-60' : ''
      }`}
    >
      {pending ? 'Entrando...' : 'Entrar'}
    </button>
  )
}

export default function LoginPage() {
  const [state, formAction] = useActionState(login, { error: null })
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className='flex h-screen w-full'>
      <div className='relative hidden h-screen w-2/3 sm:block'>
        <div className='absolute inset-0 h-full w-full'>
          <Image
            src={ImageStudent}
            alt='Astronauta do Futuro Estudai'
            fill
            className='-z-10 object-cover brightness-50'
          />
        </div>
      </div>

      <div className='flex w-full flex-col items-center justify-center sm:w-1/3'>
        <a href='/'>
          <Image
            src={logo}
            alt='Logo Enem Nota Mil'
            height={160}
          />
        </a>

        <form className='flex w-full flex-col p-3 sm:w-96' action={formAction}>
          <h2 className='mb-8 text-lg'>Acesse sua conta</h2>

          <label className='text-sm text-gray-500' htmlFor='email'>Email:</label>
          <input
            className='mb-5 flex rounded-sm bg-gray-200 p-3 focus:outline-none focus:ring focus:ring-primary_blue'
            id='email'
            name='email'
            type='email'
            required
          />

          <label className='text-sm text-gray-500' htmlFor='password'>Senha:</label>
          <div className='relative mb-5 flex rounded-sm bg-gray-200 focus-within:ring focus-within:ring-primary_blue'>
            <input
              className='w-full bg-transparent p-3 focus:outline-none'
              id='password'
              name='password'
              type={showPassword ? 'text' : 'password'}
              required
            />
            <button
              type='button'
              onClick={() => setShowPassword(!showPassword)}
              className='absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-500 hover:text-gray-700 focus:outline-none'
            >
              {showPassword ? <LuEyeClosed /> : <LuEye />}
            </button>
          </div>

          {state.error && (
            <div className='mb-4 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700'>
              <p className='font-semibold'>Não foi possível entrar.</p>
              <p className='mt-1'>{state.error}</p>
            </div>
          )}

          <SubmitButton />

          <a href='/cadastro'>
            <div className='mt-5 flex flex-col rounded-md bg-gray-200 p-4 sm:w-full'>
              <p className='text-gray-500'>Ainda não possui uma conta?</p>
              <p className='text-primary_blue'>Se inscreva agora!</p>
            </div>
          </a>
        </form>
      </div>
    </div>
  )
}
