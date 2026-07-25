import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { AuthService } from '@/services/auth/auth.services'
import type { Session, User } from '@supabase/supabase-js'
import type { UserProfile, UserSettings, AdminSystemSettings } from '@/types/user.types'

export const useAuthStore = defineStore('auth', () => {
  const session = ref<Session | null>(null)
  const user = ref<User | null>(null)
  const profile = ref<UserProfile | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Local storage backed user settings
  const userSettings = ref<UserSettings>({
    email_notifications: true,
    anniversary_reminders: true,
    default_privacy: 'private',
    theme: 'light',
  })

  // System settings for Admin
  const systemSettings = ref<AdminSystemSettings>({
    default_letter_limit: 2,
    allow_registrations: true,
    maintenance_mode: false,
    announcement_banner: 'Welcome to Lovia — Modern Digital Keepsakes.',
    default_theme: 'light',
    qr_code_url: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=MAYA-PAYMENT-LOVIA-09171234567',
    payment_account_name: 'Lovia Keepsakes (Maya/GCash)',
    payment_account_number: '0917 123 4567',
  })

  const adminUsersList = ref<UserProfile[]>([])

  // Computed helper for Admin check
  const isAdmin = computed(() => {
    if (profile.value?.role === 'admin') return true
    if (user.value?.email?.toLowerCase().includes('admin')) return true
    return false
  })

  // Listen to auth changes — ensure profile exists on sign in
  AuthService.onAuthStateChange(async (_event, newSession) => {
    session.value = newSession
    user.value = newSession?.user || null

    if (newSession?.user) {
      try {
        const fetchedProfile = await AuthService.getProfile(newSession.user.id)
        if (fetchedProfile) {
          profile.value = fetchedProfile
        } else {
          const newProf = await AuthService.upsertProfile(newSession.user.id, {
            email: newSession.user.email || '',
            role: newSession.user.email?.toLowerCase().includes('admin') ? 'admin' : 'user',
            letter_limit: 2,
          })
          profile.value = newProf
        }
      } catch {
        profile.value = {
          id: newSession.user.id,
          email: newSession.user.email || '',
          role: newSession.user.email?.toLowerCase().includes('admin') ? 'admin' : 'user',
          letter_limit: 2,
        }
      }
    } else {
      profile.value = null
    }
  })

  const signUp = async (email: string, password: string) => {
    loading.value = true
    error.value = null
    try {
      await AuthService.signUp(email, password)
    } catch (err: any) {
      error.value = err.message || 'Registration failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  const signIn = async (email: string, password: string) => {
    loading.value = true
    error.value = null
    try {
      await AuthService.signIn(email, password)
    } catch (err: any) {
      error.value = err.message || 'Login failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  const signOut = async () => {
    loading.value = true
    error.value = null
    try {
      await AuthService.signOut()
      session.value = null
      user.value = null
      profile.value = null
    } catch (err: any) {
      error.value = err.message || 'Logout failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  const getSession = async () => {
    loading.value = true
    error.value = null
    try {
      const currentSession = await AuthService.getSession()
      session.value = currentSession
      user.value = currentSession?.user || null
      if (currentSession?.user) {
        try {
          const prof = await AuthService.getProfile(currentSession.user.id)
          profile.value = prof
        } catch {
          profile.value = {
            id: currentSession.user.id,
            email: currentSession.user.email || '',
            role: currentSession.user.email?.toLowerCase().includes('admin') ? 'admin' : 'user',
            letter_limit: 2,
          }
        }
      }
      return currentSession
    } catch (err: any) {
      error.value = err.message || 'Failed to get session'
      throw err
    } finally {
      loading.value = false
    }
  }

  const getProfile = async (userId: string) => {
    loading.value = true
    error.value = null
    try {
      const res = await AuthService.getProfile(userId)
      profile.value = res
      return res
    } catch (err: any) {
      error.value = err.message || 'Failed to load profile'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateProfile = async (userId: string, updates: Record<string, any>) => {
    loading.value = true
    error.value = null
    try {
      const updated = await AuthService.updateProfile(userId, updates)
      profile.value = { ...profile.value, ...updated }
      return updated
    } catch (err: any) {
      error.value = err.message || 'Failed to update profile'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updatePassword = async (newPassword: string) => {
    loading.value = true
    error.value = null
    try {
      await AuthService.updatePassword(newPassword)
    } catch (err: any) {
      error.value = err.message || 'Failed to change password'
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchAdminUsers = async () => {
    loading.value = true
    try {
      const users = await AuthService.fetchAllProfiles()
      adminUsersList.value = users
      return users
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch users'
      return []
    } finally {
      loading.value = false
    }
  }

  const updateUserRole = async (userId: string, role: 'user' | 'admin') => {
    try {
      await AuthService.updateUserRole(userId, role)
      const u = adminUsersList.value.find((item) => item.id === userId)
      if (u) u.role = role
      if (profile.value && profile.value.id === userId) profile.value.role = role
    } catch (err: any) {
      error.value = err.message || 'Failed to update role'
      throw err
    }
  }

  const updateUserLimit = async (userId: string, limit: number) => {
    try {
      await AuthService.updateUserLimit(userId, limit)
      const u = adminUsersList.value.find((item) => item.id === userId)
      if (u) u.letter_limit = limit
      if (profile.value && profile.value.id === userId) profile.value.letter_limit = limit
    } catch (err: any) {
      error.value = err.message || 'Failed to update letter limit'
      throw err
    }
  }

  const updateUserSettings = (newSettings: Partial<UserSettings>) => {
    userSettings.value = { ...userSettings.value, ...newSettings }
  }

  const updateSystemSettings = (newSettings: Partial<AdminSystemSettings>) => {
    systemSettings.value = { ...systemSettings.value, ...newSettings }
  }

  return {
    session,
    user,
    profile,
    isAdmin,
    userSettings,
    systemSettings,
    adminUsersList,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    getSession,
    getProfile,
    updateProfile,
    updatePassword,
    fetchAdminUsers,
    updateUserRole,
    updateUserLimit,
    updateUserSettings,
    updateSystemSettings,
  }
})
