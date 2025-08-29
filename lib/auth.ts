import { Database } from '@/types/supabase'
import { getBrowserSupabaseClient, createServerSupabaseClient } from './supabase'

type User = Database['public']['Tables']['users']['Row']
type UserRole = 'student' | 'company' | 'admin'

export class AuthService {
  private static getClient(isServer: boolean = false) {
    return isServer ? createServerSupabaseClient() : getBrowserSupabaseClient()
  }

  private static getAppUrl(): string {
    return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  }

  // Sign up with email
  static async signUp(email: string, password: string, userData: {
    name?: string
    role?: UserRole
    company_name?: string
  }) {
    const supabase = this.getClient()
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: userData.name,
          role: userData.role || 'student',
          company_name: userData.company_name
        },
        emailRedirectTo: `${this.getAppUrl()}/auth/callback`
      }
    })

    if (authError) throw authError

    // Profile will be created automatically via database trigger
    return authData
  }

  // Sign in with email
  static async signIn(email: string, password: string) {
    const supabase = this.getClient()
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error
    return data
  }

  // Sign in with OAuth (Google, GitHub)
  static async signInWithOAuth(provider: 'google' | 'github') {
    const supabase = this.getClient()
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${this.getAppUrl()}/auth/callback`,
        scopes: provider === 'github' ? 'read:user user:email' : undefined
      }
    })

    if (error) throw error
    return data
  }

  // Sign out
  static async signOut() {
    const supabase = this.getClient()
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  // Get current user
  static async getCurrentUser(isServer: boolean = false): Promise<User | null> {
    const supabase = this.getClient(isServer)
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return null

    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    return profile
  }

  // Get session
  static async getSession(isServer: boolean = false) {
    const supabase = this.getClient(isServer)
    const { data: { session } } = await supabase.auth.getSession()
    return session
  }

  // Update user profile
  static async updateProfile(userId: string, updates: Partial<User>) {
    const supabase = this.getClient()
    
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Reset password
  static async resetPassword(email: string) {
    const supabase = this.getClient()
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${this.getAppUrl()}/auth/reset-password`
    })

    if (error) throw error
  }

  // Update password
  static async updatePassword(newPassword: string) {
    const supabase = this.getClient()
    
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) throw error
  }

  // Verify email with OTP
  static async verifyOtp(email: string, token: string) {
    const supabase = await this.getClient()
    
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email'
    })

    if (error) throw error
    return data
  }
}
