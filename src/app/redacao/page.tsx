import { redirect } from 'next/navigation'

import RedacaoForm from "@/components/RedacaoForm"
import { createClient } from '../../../utils/supabase/server'

import HeaderDashboard from '@/components/SidebarDashboard'

export default async function Redacao() {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.getUser()

    if (!data.user) {
        redirect('/login')
    }

    const user = data.user!

    return (
        <div>            
            <div className='flex m-auto items-center h-screen p-6 overflow-y-auto'>
                <RedacaoForm email={user.email ?? ''} />
            </div>
        </div>
    )
}

