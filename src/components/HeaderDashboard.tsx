import { redirect } from 'next/navigation'
import { createClient } from '../../utils/supabase/server'
import { signOut } from '../app/login/actions'
import Link from 'next/link'
import { RxHome } from "react-icons/rx"
import { BsFileText } from "react-icons/bs"
import { PiBooksLight } from "react-icons/pi"

import Image from 'next/image'
import Logo from '../../public/images/logo.webp'
import AvatarDefault from '../../public/images/avatar.png'

export default async function PrivatePage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/login')
  }

  const user = data.user!

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const firstName = profile?.full_name?.split(' ')[0] ?? 'Usuário'

  return (
    <div>
      <header className='flex p-4 border-b items-center'>
        <div className='flex w-1/4'>
          <Link href="/dashboard">
            <Image src={Logo} alt='Logo Enem Nota Mil' height={60} />
          </Link>
        </div>
        <div className='flex w-1/2 gap-2'>
          <Link href="/dashboard">
            <div className='flex items-center gap-2 py-2 px-5 text-lg rounded-md hover:bg-customPurple hover:text-white'>
              <RxHome /> Meu painel
            </div>
          </Link>      

          <Link href="/redacao">
            <div className='flex items-center gap-2 py-2 px-5 text-lg rounded-md hover:bg-customPurple hover:text-white'>
              <BsFileText /> Minhas redações
            </div>
          </Link>

          <Link href="/ebooks">
            <div className='flex items-center gap-2 py-2 px-5 text-lg rounded-md hover:bg-customPurple hover:text-white'>
              <PiBooksLight /> Meus Ebooks
            </div>
          </Link>    
        </div>
        <div className='flex justify-end w-1/4 items-center gap-5'>
          <div className='flex gap-3 items-center'>
            <Image
                src={AvatarDefault}
                alt='Foto de perfil'
                width={40}
                height={40} 
                className='rounded-full'
              />
            <span className='text-gray-800 font-medium'>Bem-vindo, {firstName}</span>
          </div>
          <form>
            <button
              className='flex items-center justify-center bg-customPurple rounded-md p-2 h-8 w-20 text-white' 
              formAction={signOut}
            >
              sair
            </button>
          </form>
        </div>        
      </header>       
    </div>
  )
}
