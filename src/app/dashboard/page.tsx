import { redirect } from 'next/navigation'
import { createClient } from '../../../utils/supabase/server'
import { signOut } from '../../app/login/actions'

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
        <div className='flex h-screen w-2/4'></div>
        <div className='flex py-4 pl-4 h-screen w-1/4 border-l'>
          <p>Bem Vindo {data.user.email}</p>
        </div>
      </section>
    
    <button formAction={signOut}>sair</button>
    
    </div>
    
  )

}