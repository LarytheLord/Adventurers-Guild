'use client'

export interface User {
  id: string
  email: string
  name: string
  role: 'student' | 'company' | 'admin'
  rank?: 'F' | 'D' | 'C' | 'B' | 'A' | 'S'
  xp?: number
  avatar_url?: string
  company_name?: string
  created_at: string
}

export class MockAuthService {
  private static STORAGE_KEY = 'adventurers_guild_user'

  // Get current user from localStorage
  static getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null
    
    const userData = localStorage.getItem(this.STORAGE_KEY)
    return userData ? JSON.parse(userData) : null
  }

  // Sign up new user
  static signUp(userData: {
    email: string
    password: string
    name: string
    role: 'student' | 'company'
    company_name?: string
  }): User {
    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      email: userData.email,
      name: userData.name,
      role: userData.role,
      rank: userData.role === 'student' ? 'F' : undefined,
      xp: userData.role === 'student' ? 0 : undefined,
      company_name: userData.company_name,
      created_at: new Date().toISOString()
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user))
    return user
  }

  // Sign in user
  static signIn(email: string, password: string): User | null {
    // For demo purposes, create a user if they don't exist
    const existingUser = this.getCurrentUser()
    
    if (existingUser && existingUser.email === email) {
      return existingUser
    }

    // Create demo users for testing
    const demoUsers: Record<string, User> = {
      'student@demo.com': {
        id: 'student-1',
        email: 'student@demo.com',
        name: 'Alex Student',
        role: 'student',
        rank: 'B',
        xp: 5500,
        created_at: new Date().toISOString()
      },
      'company@demo.com': {
        id: 'company-1',
        email: 'company@demo.com',
        name: 'Tech Corp',
        role: 'company',
        company_name: 'Tech Corp Solutions',
        created_at: new Date().toISOString()
      }
    }

    const user = demoUsers[email]
    if (user) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user))
      return user
    }

    return null
  }

  // Sign out
  static signOut(): void {
    localStorage.removeItem(this.STORAGE_KEY)
  }

  // Update user profile
  static updateProfile(updates: Partial<User>): User | null {
    const currentUser = this.getCurrentUser()
    if (!currentUser) return null

    const updatedUser = { ...currentUser, ...updates }
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedUser))
    return updatedUser
  }
}