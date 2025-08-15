'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { AuthService } from '@/lib/auth'
import { Database } from '@/types/supabase'

type UserProfile = Database['public']['Tables']['users']['Row']

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signUp: (email: string, password: string, userData: { name?: string; role?: 'student' | 'company' }) => Promise<any>
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

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      
      if (session?.user) {
        const userProfile = await AuthService.getCurrentUser()
        setProfile(userProfile)
      }
      
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
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

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, userData: { name?: string; role?: 'student' | 'company' }) => {
    const result = await AuthService.signUp(email, password, userData)
    return result
  }

  const signIn = async (email: string, password: string) => {
    const result = await AuthService.signIn(email, password)
    return result
  }

  const signInWithOAuth = async (provider: 'google' | 'github') => {
    const result = await AuthService.signInWithOAuth(provider)
    return result
  }

  const signOut = async () => {
    await AuthService.signOut()
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error('No user logged in')
    
    const updatedProfile = await AuthService.updateProfile(user.id, updates)
    setProfile(updatedProfile)
    return updatedProfile
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