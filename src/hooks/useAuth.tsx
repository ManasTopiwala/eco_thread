import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }).catch(err => {
        console.warn('Supabase auth getSession error:', err)
        setLoading(false)
      })

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
      })

      return () => subscription.unsubscribe()
    } else {
      // Local/Guest storage mode when Supabase is not configured
      const localUser = localStorage.getItem('ecoloop_local_user')
      if (localUser) {
        try {
          const parsed = JSON.parse(localUser)
          setUser(parsed)
        } catch {
          // ignore corrupted local state
        }
      } else {
        // Provide default guest user so user can immediately test and navigate
        const defaultGuest: any = {
          id: 'guest-user-1',
          email: 'demo@ecoloop.io',
          user_metadata: { full_name: 'Demo Engineer' },
        }
        setUser(defaultGuest)
      }
      setLoading(false)
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      return { error }
    } else {
      const mockUser: any = {
        id: `user-${Date.now()}`,
        email,
        user_metadata: { full_name: email.split('@')[0] },
      }
      localStorage.setItem('ecoloop_local_user', JSON.stringify(mockUser))
      setUser(mockUser)
      return { error: null }
    }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      })
      return { error }
    } else {
      const mockUser: any = {
        id: `user-${Date.now()}`,
        email,
        user_metadata: { full_name: fullName || email.split('@')[0] },
      }
      localStorage.setItem('ecoloop_local_user', JSON.stringify(mockUser))
      setUser(mockUser)
      return { error: null }
    }
  }

  const signOut = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut()
    } else {
      localStorage.removeItem('ecoloop_local_user')
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
