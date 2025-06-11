'use client'

import { signup } from './actions'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { LuEyeClosed, LuEye } from "react-icons/lu"

import Image from "next/image";
import logo from '../../../public/images/logo.webp';
import ImageStudent from '../../../public/images/adolescente-estudando.webp'


export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const togglePasswordVisibility = () => setShowPassword(!showPassword)
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const form = event.target as HTMLFormElement
    const formData = new FormData(form)

    const senha = formData.get('password') as string
    const senhaConfirmacao = formData.get('confirmPassword') as string

    const senhaForteRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_])[A-Za-z\d@$!%*?&_]{8,}$/

    if (!senhaForteRegex.test(senha)) {
      setError('A senha deve conter no mínimo 8 caracteres, incluindo uma letra maiúscula, uma letra minúscula, um número e um caractere especial (_@$!%*?&).')
      return
    }

    if (senha !== senhaConfirmacao) {
      setError('As senhas não coincidem.')
      return
    }

    try {
      const result = await signup(formData)

      if (result.error) {
        setError(result.error.message || 'Erro ao cadastrar.')
        return
      }

      router.push('/email-confirm')
    } catch (err) {
      console.error('Erro ao cadastrar:', err)
      setError('Erro interno no cadastro.')
    }
  }

  return (
    <div className='flex w-full h-full'>
      <div className='hidden sm:block w-2/3 h-screen relative'>
        <div className='absolute inset-0 w-full h-full'>
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
        <form className='flex flex-col w-full p-3 sm:w-96' onSubmit={handleSubmit}>
          <h2 className='mb-8 text-lg'>Cadastre-se agora</h2>

          <label htmlFor='nome' className='text-gray-500 text-sm'>Nome Completo:</label>
          <input className='flex bg-gray-200 p-3 mb-5 focus:outline-none focus:ring focus:ring-primary_blue rounded-sm' placeholder='Seu nome completo' id='nome' name='nome' type='text' required />
          
          <label htmlFor='phone' className='text-gray-500 text-sm'>Celular:</label>
          <input
            className='flex bg-gray-200 p-3 mb-5 focus:outline-none focus:ring focus:ring-primary_blue rounded-sm'
            placeholder='(11) 91234-5678'
            id='phone'
            name='phone'
            type='tel'
            required
          />

          <label htmlFor='email' className='text-gray-500 text-sm'>Email:</label>
          <input className='flex bg-gray-200 p-3 mb-5 focus:outline-none focus:ring focus:ring-primary_blue rounded-sm' placeholder='Seu e-mail' id='email' name='email' type='email' required />

          <label htmlFor='password' className='text-gray-500 text-sm'>Senha:</label>
          <div className='relative bg-gray-200 flex mb-5 focus-within:ring focus-within:ring-primary_blue rounded-sm'>
            <input
              className='w-full bg-gray-200 m-auto p-3 bg-transparent focus:outline-none'
              placeholder='Deve ter no mínimo 8 caracteres'
              id='password'
              name='password'
              type={showPassword ? 'text' : 'password'}
              required
            />
            <button type='button' onClick={togglePasswordVisibility} className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none'>
            {showPassword ? <LuEyeClosed /> : <LuEye />}
            </button>
          </div>

          <label htmlFor='confirmPassword' className='text-gray-500 text-sm'>Confirmar Senha:</label>
          <div className='relative bg-gray-200 flex mb-5 focus-within:ring focus-within:ring-primary_blue rounded-sm'>
            <input
              className='w-full bg-gray-200 m-auto p-3 sm:w-96 bg-transparent focus:outline-none'
              placeholder='Deve ter no mínimo 8 caracteres'
              id='confirmPassword'
              name='confirmPassword'
              type={showConfirmPassword ? 'text' : 'password'}
              required
            />
            <button type='button' onClick={toggleConfirmPasswordVisibility} className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none'>
            {showConfirmPassword ? <LuEyeClosed /> : <LuEye />}
            </button>
          </div>

          {error && <p className='text-red-500 text-sm'>{error}</p>}

          <p className='text-gray-500 text-xs mb-5'>Ao se cadastrar, você aceita nossos termos de uso e a nossa política de privacidade.</p>

          <button type='submit' className='bg-customPurple p-4 rounded-sm mt-2 text-xl text-white'>Cadastrar</button>

          <a href='/login'>
            <div className='flex bg-gray-200 flex-col sm:w-full p-4 mt-5 rounded-md'>
              <p className='text-gray-500'>Já possui uma conta?</p>
              <p className='text-primary_blue'>Entre na plataforma!</p>
            </div>
          </a>
        </form>
      </div>
    </div>
  )
}
