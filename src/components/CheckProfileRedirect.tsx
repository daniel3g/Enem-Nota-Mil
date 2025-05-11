'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../utils/supabase/client'

export default function CheckProfileRedirect() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Delay opcional para evitar race condition
      await new Promise((resolve) => setTimeout(resolve, 500))

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: false }) // ← importante
        .eq('id', user.id)
        .maybeSingle()


      console.log('Usuário logado:', user.id)
      console.log('Perfil encontrado:', profile)
      console.log('Erro ao buscar perfil:', error)

      if (!profile || error) {
        router.replace('/completar-perfil')
      }
    }

    checkProfile()
  }, [router, supabase])

  return null
}
