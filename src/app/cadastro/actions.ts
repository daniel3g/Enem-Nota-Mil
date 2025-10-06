'use server'

import { createClient } from '../../../utils/supabase/server'

export async function signup(formData: FormData): Promise<{ error: Error | null }> {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const full_name = formData.get('nome') as string
  const phone = formData.get('phone') as string

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/email-confirm`,
      data: { full_name, phone }, // <- grava nos metadados do usuário
    },
  })

  if (error || !data?.user?.id) {
    return { error: error ?? new Error('Erro ao cadastrar usuário') }
  }

  await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/create-profile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: data.user.id, full_name, phone }),
  })

  return { error: null }
}
