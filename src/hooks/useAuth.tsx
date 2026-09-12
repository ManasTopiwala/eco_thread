import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase, isSupabaseConfigured, SUPABASE_ANON_KEY } from '../lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

export interface SignUpParams {
  email: string
  password: string
  fullName: string
  companyName?: string
  industryRole?: string
}

export interface UserProfile {
  id: string
  full_name?: string
  company_name?: string
  industry_role?: string
  created_at?: string
  [key: string]: any
}

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any; data?: any }>
  signUp: (params: SignUpParams) => Promise<{ error: any; data?: any }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async (userId: string, token?: string) => {
    try {
      if (!supabase) return
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (!error && data) {
        setProfile(data)
      } else if (error) {
        console.warn('Profile fetch warning (table may be populated by trigger or empty):', error.message)
      }
    } catch (err) {
      console.warn('Failed to fetch user profile:', err)
    }
  }

  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      // 1. Initial session load
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session)
        const currentUser = session?.user ?? null
        setUser(currentUser)

        if (session?.access_token) {
          localStorage.setItem('ACCESS_TOKEN', session.access_token)
          if (currentUser?.id) {
            localStorage.setItem('USER_ID', currentUser.id)
            fetchProfile(currentUser.id, session.access_token)
          }
        }
        setLoading(false)
      }).catch(err => {
        console.warn('Supabase auth getSession error:', err)
        setLoading(false)
      })

      // 2. Auth state subscription
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session)
        const currentUser = session?.user ?? null
        setUser(currentUser)

        if (session?.access_token) {
          localStorage.setItem('ACCESS_TOKEN', session.access_token)
          if (currentUser?.id) {
            localStorage.setItem('USER_ID', currentUser.id)
            fetchProfile(currentUser.id, session.access_token)
          }
        } else {
          localStorage.removeItem('ACCESS_TOKEN')
          localStorage.removeItem('USER_ID')
          setProfile(null)
        }
      })

      return () => subscription.unsubscribe()
    } else {
      // Fallback local storage mode
      const localUser = localStorage.getItem('ecoloop_local_user')
      if (localUser) {
        try {
          const parsed = JSON.parse(localUser)
          setUser(parsed)
        } catch {
          // ignore corrupted local state
        }
      }
      setLoading(false)
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { error }
      }

      if (data.session) {
        setSession(data.session)
        setUser(data.user)
        localStorage.setItem('ACCESS_TOKEN', data.session.access_token)
        if (data.user?.id) {
          localStorage.setItem('USER_ID', data.user.id)
          fetchProfile(data.user.id, data.session.access_token)
        }
      }

      return { error: null, data }
    } else {
      const mockUser: any = {
        id: `user-${Date.now()}`,
        email,
        user_metadata: { full_name: email.split('@')[0] },
      }
      localStorage.setItem('ecoloop_local_user', JSON.stringify(mockUser))
      setUser(mockUser)
      return { error: null, data: { user: mockUser } }
    }
  }

  const signUp = async ({
    email,
    password,
    fullName,
    companyName = '',
    industryRole = 'factory_operator',
  }: SignUpParams) => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            company_name: companyName,
            industry_role: industryRole,
          },
        },
      })

      if (error) {
        return { error }
      }

      if (data.session) {
        setSession(data.session)
        setUser(data.user)
        localStorage.setItem('ACCESS_TOKEN', data.session.access_token)
        if (data.user?.id) {
          localStorage.setItem('USER_ID', data.user.id)
        }
      } else if (data.user) {
        setUser(data.user)
      }

      return { error: null, data }
    } else {
      const mockUser: any = {
        id: `user-${Date.now()}`,
        email,
        user_metadata: {
          full_name: fullName || email.split('@')[0],
          company_name: companyName,
          industry_role: industryRole,
        },
      }
      localStorage.setItem('ecoloop_local_user', JSON.stringify(mockUser))
      setUser(mockUser)
      return { error: null, data: { user: mockUser } }
    }
  }

  const signOut = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut()
    }
    localStorage.removeItem('ecoloop_local_user')
    localStorage.removeItem('ACCESS_TOKEN')
    localStorage.removeItem('USER_ID')
    setUser(null)
    setSession(null)
    setProfile(null)
  }

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchProfile(user.id, session?.access_token)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
