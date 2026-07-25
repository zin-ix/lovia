import { supabase } from '@/plugins/supabase'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'

export const AuthService = {
  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) {
      throw new Error(error.message)
    }
  },

  async verifyOtp(email: string, token: string, type: 'signup' | 'email_change' = 'signup') {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: type as any,
    })
    if (error) {
      throw new Error(error.message)
    }
    return data
  },

  async resendOtp(email: string, type: 'signup' | 'email_change' = 'signup') {
    const { data, error } = await supabase.auth.resend({
      type,
      email,
    })
    if (error) {
      throw new Error(error.message)
    }
    return data
  },

  async resetPasswordForEmail(email: string, redirectTo?: string) {
    const targetUrl = redirectTo || `${window.location.origin}/auth/reset-password`
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: targetUrl,
    })
    if (error) {
      throw new Error(error.message)
    }
    return data
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      throw new Error(error.message)
    }
  },
  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw new Error(error.message)
    }
  },
  async getSession() {
    const { data, error } = await supabase.auth.getSession()
    if (error) {
      throw new Error(error.message)
    }
    return data.session
  },

  async getProfile(userId: string) {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()
    if (error) {
      // Return empty profile object on non-existent profile instead of crashing
      return { id: userId, email: '', role: 'user', letter_limit: 2 }
    }
    return data
  },

  async updateProfile(userId: string, updates: Record<string, any>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    if (error) {
      throw new Error(error.message)
    }
    return data
  },

  async upsertProfile(userId: string, updates: Record<string, any>) {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({ id: userId, ...updates })
      .select()
      .single()
    if (error) throw error
    return data
  },

  async updatePassword(newPassword: string) {
    const { data, error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      throw new Error(error.message)
    }
    return data
  },

  async fetchAllProfiles() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) {
      return []
    }
    return data || []
  },

  async updateUserRole(userId: string, role: 'user' | 'admin') {
    return this.updateProfile(userId, { role })
  },

  async updateUserLimit(userId: string, letter_limit: number) {
    return this.updateProfile(userId, { letter_limit })
  },

  onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback)
  },
}

