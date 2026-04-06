'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { getAuthErrorMessage } from '@/lib/auth-error-message'
import { createClient } from '../../../utils/supabase/server'

type LoginFormState = {
  error: string | null
}

export async function login(
  _prevState: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { error: getAuthErrorMessage(error.message) }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    redirect(`/error?type=signup&message=${encodeURIComponent(getAuthErrorMessage(error.message))}`)
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
