import { redirect } from 'next/navigation'
import { createClient } from '../../../utils/supabase/server'
import { signOut } from '../../app/login/actions'

import RedacaoForm from '@/components/RedacaoForm'

import Image from 'next/image'
import Logo from '../../../public/images/logo.webp'
import AvatarDefault from '../../../public/images/avatar.png'

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
      <header className='flex p-4 border-b'>
        <Image src={Logo} alt='Logo Enem Nota Mil' height={60} />
      </header>

      <section className='flex w-full px-4'>
        <div className='flex py-4 h-screen w-1/4 border-r'>
          <p>{firstName}</p>
        </div>

        <div className='flex h-screen w-2/4 p-6 overflow-y-auto'>
        <RedacaoForm email={user.email ?? ''} />
        </div>

        <div className='flex justify-between items-center gap-4 py-4 pl-4 h-screen w-1/4 border-l'>
          <div className='flex items-center gap-3'>
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
              className='bg-customPurple rounded-md p-2 h-8 w-20 text-white' 
              formAction={signOut}
            >
              sair
            </button>
          </form>
        </div>
      </section>    
    </div>
  )
}
