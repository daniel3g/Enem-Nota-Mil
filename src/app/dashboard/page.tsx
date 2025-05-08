import { redirect } from 'next/navigation'
import { createClient } from '../../../utils/supabase/server'
import { signOut } from '../../app/login/actions'

import RedacaoForm from '@/components/RedacaoForm'

import Image from 'next/image'
import Logo from '../../../public/images/logo.webp'

export default async function PrivatePage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/login')
  }

  return (
    <div>
      <header className='flex p-4 border-b'>
        <Image
        src={Logo}
        alt='Logo Enem Nota Mil'
        height={60}
        />
      </header>
      <section className='flex w-full px-4'>
        <div className='flex py-4 h-screen w-1/4 border-r'>
          <p>Daniel</p>
        </div>
        <div className='flex h-screen w-2/4 p-6 overflow-y-auto'>
          <RedacaoForm email={data.user.email!} />
        </div>
        <div className='flex justify-between py-4 pl-4 h-screen w-1/4 border-l'>
          Bem Vindo {data.user.email}
          <form>
            <button
            className='flex justify-center items-center bg-customPurple rounded-md p-2 h-8 w-20 text-white' 
            formAction={signOut}>sair
            </button>
          </form>
        </div>
      </section>    
    </div>
    
  )

}