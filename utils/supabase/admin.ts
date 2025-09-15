import { createClient } from '@supabase/supabase-js'

export const supabaseAdmin = createClient(
  // pode usar NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_URL (o importante é NÃO expor a service key no cliente)
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { persistSession: false, autoRefreshToken: false },
  }
)
