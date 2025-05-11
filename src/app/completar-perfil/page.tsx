'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../../utils/supabase/client'

export default function CompletarPerfil() {
    const [fullName, setFullName] = useState('')
    const [phone, setPhone] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()
  
    useEffect(() => {
      const checkIfAlreadyCompleted = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }

        const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile) {
        router.push('/dashboard')
      }
    }

    checkIfAlreadyCompleted()
  }, [router, supabase])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      setError('Sessão expirada. Faça login novamente.')
      router.push('/login')
      return
    }

    const { error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        full_name: fullName,
        phone: phone,
      })

    if (insertError) {
      setError(insertError.message)
    } else {
        window.location.href = '/dashboard'
    }

    setLoading(false)
  }

  return (
    <div className='max-w-md mx-auto mt-10 px-4'>
      <h1 className='text-2xl font-bold mb-4'>Complete seu perfil</h1>

      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <div>
          <label htmlFor='fullName' className='text-sm text-gray-600'>Nome completo</label>
          <input
            type='text'
            id='fullName'
            name='fullName'
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className='w-full p-3 border border-gray-300 rounded'
            required
          />
        </div>

        <div>
          <label htmlFor='phone' className='text-sm text-gray-600'>Celular</label>
          <input
            type='tel'
            id='phone'
            name='phone'
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className='w-full p-3 border border-gray-300 rounded'
            required
          />
        </div>

        {error && <p className='text-red-600 text-sm'>{error}</p>}

        <button
          type='submit'
          disabled={loading}
          className='bg-primary_blue text-white p-3 rounded hover:bg-blue-600 transition'
        >
          {loading ? 'Salvando...' : 'Salvar'}
        </button>
      </form>
    </div>
  )
}
