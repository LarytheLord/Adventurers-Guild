'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

type UserProfile = Database['public']['Tables']['users']['Row']

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signUp: (
    email: string,
    password: string,
    userData: { name?: string; role?: 'student' | 'company'; company_name?: string }
  ) => Promise<any>
  signIn: (email: string, password: string) => Promise<any>
  signInWithOAuth: (provider: 'google' | 'github') => Promise<any>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<UserProfile>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // Resolve at build-time; if not configured, we use mock auth
  const isSupabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        if (isSupabaseConfigured) {
          const { getBrowserSupabaseClient } = await import('@/lib/supabase')
          const { AuthService } = await import('@/lib/auth')
          const supabase = getBrowserSupabaseClient()
          const { data: { session } } = await supabase.auth.getSession()
          setUser(session?.user ?? null)
          if (session?.user) {
            const userProfile = await AuthService.getCurrentUser()
            setProfile(userProfile)
          }
        } else {
          const { MockAuthService } = await import('@/lib/mockAuth')
          const mockUser = MockAuthService.getCurrentUser() as any
          if (mockUser) {
            // Map mock user to DB profile shape minimally
            setUser({
              id: mockUser.id,
              app_metadata: {},
              user_metadata: {},
              aud: 'mock',
              created_at: mockUser.created_at,
              email: mockUser.email,
              phone: ''
            } as unknown as User)
            setProfile({
              id: mockUser.id,
              email: mockUser.email,
              name: mockUser.name,
              username: null,
              avatar_url: mockUser.avatar_url ?? null,
              role: mockUser.role,
              rank: mockUser.rank ?? 'F',
              xp: mockUser.xp ?? 0,
              total_earnings: 0,
              bio: null,
              github_url: mockUser.github_url ?? null,
              linkedin_url: mockUser.linkedin_url ?? null,
              location: null,
              skills: {},
              is_active: true,
              created_at: mockUser.created_at,
              updated_at: mockUser.created_at
            } as UserProfile)
          }
        }
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    if (isSupabaseConfigured) {
      let unsub: () => void = () => {}
      ;(async () => {
        const { getBrowserSupabaseClient } = await import('@/lib/supabase')
        const { AuthService } = await import('@/lib/auth')
        const supabase = getBrowserSupabaseClient()
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (_event, session) => {
            setUser(session?.user ?? null)
            if (session?.user) {
              const userProfile = await AuthService.getCurrentUser()
              setProfile(userProfile)
            } else {
              setProfile(null)
            }
            setLoading(false)
          }
        )
        unsub = () => subscription.unsubscribe()
      })()
      return () => unsub()
    }
    return () => {}
  }, [])

  const setMockStateFromUser = (mockUser: any) => {
    setUser({
      id: mockUser.id,
      app_metadata: {},
      user_metadata: {},
      aud: 'mock',
      created_at: mockUser.created_at,
      email: mockUser.email,
      phone: ''
    } as unknown as User)
    setProfile({
      id: mockUser.id,
      email: mockUser.email,
      name: mockUser.name,
      username: null,
      avatar_url: mockUser.avatar_url ?? null,
      role: mockUser.role,
      rank: mockUser.rank ?? 'F',
      xp: mockUser.xp ?? 0,
      total_earnings: 0,
      bio: null,
      github_url: mockUser.github_url ?? null,
      linkedin_url: mockUser.linkedin_url ?? null,
      location: null,
      skills: {},
      is_active: true,
      created_at: mockUser.created_at,
      updated_at: mockUser.created_at
    } as UserProfile)
  }

  const signUp = async (
    email: string,
    password: string,
    userData: { name?: string; role?: 'student' | 'company'; company_name?: string }
  ) => {
    if (isSupabaseConfigured) {
      const { AuthService } = await import('@/lib/auth')
      return AuthService.signUp(email, password, userData)
    }
    const { MockAuthService } = await import('@/lib/mockAuth')
    const mockUser = MockAuthService.signUp({
      email,
      password,
      name: userData.name || '',
      role: (userData.role as 'student' | 'company') || 'student',
      company_name: userData.company_name
    })
    setMockStateFromUser(mockUser)
    return mockUser
  }

  const signIn = async (email: string, password: string) => {
    if (isSupabaseConfigured) {
      const { AuthService } = await import('@/lib/auth')
      return AuthService.signIn(email, password)
    }
    const { MockAuthService } = await import('@/lib/mockAuth')
    const mockUser = MockAuthService.signIn(email, password)
    if (mockUser) setMockStateFromUser(mockUser)
    return mockUser
  }

  const signInWithOAuth = async (provider: 'google' | 'github') => {
    if (isSupabaseConfigured) {
      const { AuthService } = await import('@/lib/auth')
      return AuthService.signInWithOAuth(provider)
    }
    throw new Error('OAuth not available in mock mode')
  }

  const signOut = async () => {
    if (isSupabaseConfigured) {
      const { AuthService } = await import('@/lib/auth')
      await AuthService.signOut()
    } else {
      const { MockAuthService } = await import('@/lib/mockAuth')
      MockAuthService.signOut()
      setUser(null)
      setProfile(null)
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error('No user logged in')
    if (isSupabaseConfigured) {
      const { AuthService } = await import('@/lib/auth')
      const updatedProfile = await AuthService.updateProfile(user.id, updates)
      setProfile(updatedProfile)
      return updatedProfile
    } else {
      const { MockAuthService } = await import('@/lib/mockAuth')
      const mapped = MockAuthService.updateProfile(updates as any)
      setProfile(mapped as any)
      return mapped as any
    }
  }

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signInWithOAuth,
    signOut,
    updateProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}