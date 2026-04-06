'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import Image from 'next/image'

import { signup } from './actions'
import { LuEyeClosed, LuEye } from 'react-icons/lu'
import logo from '../../../public/images/logo-enem-nota-mil-2026.png'
import ImageStudent from '../../../public/images/bg-login.webp'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const togglePasswordVisibility = () => setShowPassword(!showPassword)
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    const form = event.target as HTMLFormElement
    const formData = new FormData(form)

    const senha = formData.get('password') as string
    const senhaConfirmacao = formData.get('confirmPassword') as string

    const senhaForteRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_])[A-Za-z\d@$!%*?&_]{8,}$/

    if (!senhaForteRegex.test(senha)) {
      setError(
        'A senha deve conter no mínimo 8 caracteres, incluindo uma letra maiúscula, uma letra minúscula, um número e um caractere especial (_@$!%*?&).'
      )
      setIsLoading(false)
      return
    }

    if (senha !== senhaConfirmacao) {
      setError('As senhas não coincidem.')
      setIsLoading(false)
      return
    }

    try {
      const result = await signup(formData)

      if (result?.error) {
        setError(result.error.message || 'Erro ao cadastrar.')
        setIsLoading(false)
        return
      }

      router.push('/email-confirm')
    } catch (err) {
      console.error('Erro ao cadastrar:', err)
      setError('Erro interno no cadastro.')
      setIsLoading(false)
    }
  }

  return (
    <div className='flex h-full w-full'>
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

        <form className='flex w-full flex-col p-3 sm:w-96' onSubmit={handleSubmit}>
          <h2 className='mb-8 text-lg'>Cadastre-se agora</h2>

          <label htmlFor='nome' className='text-sm text-gray-500'>Nome Completo:</label>
          <input
            className='mb-5 flex rounded-sm bg-gray-200 p-3 focus:outline-none focus:ring focus:ring-primary_blue'
            placeholder='Seu nome completo'
            id='nome'
            name='nome'
            type='text'
            required
          />

          <label htmlFor='phone' className='text-sm text-gray-500'>Celular:</label>
          <input
            className='mb-5 flex rounded-sm bg-gray-200 p-3 focus:outline-none focus:ring focus:ring-primary_blue'
            placeholder='(11) 91234-5678'
            id='phone'
            name='phone'
            type='tel'
            required
          />

          <label htmlFor='email' className='text-sm text-gray-500'>Email:</label>
          <input
            className='mb-5 flex rounded-sm bg-gray-200 p-3 focus:outline-none focus:ring focus:ring-primary_blue'
            placeholder='Seu e-mail'
            id='email'
            name='email'
            type='email'
            required
          />

          <label htmlFor='password' className='text-sm text-gray-500'>Senha:</label>
          <div className='relative mb-5 flex rounded-sm bg-gray-200 focus-within:ring focus-within:ring-primary_blue'>
            <input
              className='m-auto w-full bg-transparent p-3 focus:outline-none'
              placeholder='Deve ter no mínimo 8 caracteres'
              id='password'
              name='password'
              type={showPassword ? 'text' : 'password'}
              required
            />
            <button
              type='button'
              onClick={togglePasswordVisibility}
              className='absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-500 hover:text-gray-700 focus:outline-none'
            >
              {showPassword ? <LuEyeClosed /> : <LuEye />}
            </button>
          </div>

          <label htmlFor='confirmPassword' className='text-sm text-gray-500'>Confirmar Senha:</label>
          <div className='relative mb-5 flex rounded-sm bg-gray-200 focus-within:ring focus-within:ring-primary_blue'>
            <input
              className='m-auto w-full bg-transparent p-3 focus:outline-none sm:w-96'
              placeholder='Deve ter no mínimo 8 caracteres'
              id='confirmPassword'
              name='confirmPassword'
              type={showConfirmPassword ? 'text' : 'password'}
              required
            />
            <button
              type='button'
              onClick={toggleConfirmPasswordVisibility}
              className='absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-500 hover:text-gray-700 focus:outline-none'
            >
              {showConfirmPassword ? <LuEyeClosed /> : <LuEye />}
            </button>
          </div>

          {error && (
            <div className='mb-4 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700'>
              <p className='font-semibold'>Não foi possível concluir seu cadastro.</p>
              <p className='mt-1'>{error}</p>
            </div>
          )}

          <p className='mb-5 text-xs text-gray-500'>
            Ao se cadastrar, você aceita nossos termos de uso e a nossa política de privacidade.
          </p>

          <button
            type='submit'
            disabled={isLoading}
            className={`bg-customPurple mt-2 w-full rounded-sm p-4 text-xl text-white ${
              isLoading ? 'cursor-not-allowed opacity-60' : ''
            }`}
          >
            {isLoading ? 'Cadastrando...' : 'Cadastrar'}
          </button>

          <a href='/login'>
            <div className='mt-5 flex flex-col rounded-md bg-gray-200 p-4 sm:w-full'>
              <p className='text-gray-500'>Já possui uma conta?</p>
              <p className='text-primary_blue'>Entre na plataforma!</p>
            </div>
          </a>
        </form>
      </div>
    </div>
  )
}
