import { createBrowserClient } from '@supabase/ssr'

export type SupabaseBrowserClient = ReturnType<typeof createBrowserClient> | null

export function createClient(): SupabaseBrowserClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Supabase environment variables are missing; Supabase features are disabled until they are provided.')
    }
    return null
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
