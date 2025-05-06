'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '../../../utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    // redirecionar se quiser, aqui ainda está rodando no server
    return { error }
  }

  revalidatePath('/', 'layout')
  return { error: null }
}

export async function signup(formData: FormData): Promise<{ error: Error | null }> {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signUp(data)

  if (!error) {
    revalidatePath('/', 'layout')
  }

  return { error } // ⬅️ Retorna sempre, não redireciona
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
}
