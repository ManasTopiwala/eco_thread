import { createClient, SupabaseClient } from '@supabase/supabase-js'

export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://ozppryakvgcpkdqtrnzy.supabase.co'

export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96cHByeWFrdmdjcGtkcXRybnp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkxNTc5NDgsImV4cCI6MjEwNDczMzk0OH0.qu2a0gXvF0oHRB23hgcsch5Nc5Qk3r8xHAc7z_D1gvw'

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL &&
  SUPABASE_ANON_KEY &&
  SUPABASE_URL.startsWith('http') &&
  !SUPABASE_URL.includes('your-project')
)

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
