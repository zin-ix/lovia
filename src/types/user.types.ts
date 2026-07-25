export interface UserProfile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  bio?: string
  partner_name?: string
  anniversary_date?: string
  role?: 'user' | 'admin'
  letter_limit?: number
  created_at?: string
  updated_at?: string
}

export interface UserSettings {
  email_notifications: boolean
  anniversary_reminders: boolean
  default_privacy: 'private' | 'public'
  theme: 'light' | 'dark' | 'system'
}

export interface AdminUserItem extends UserProfile {
  letter_count?: number
  last_sign_in_at?: string
}

export interface AdminSystemSettings {
  default_letter_limit: number
  allow_registrations: boolean
  maintenance_mode: boolean
  announcement_banner: string
  default_theme: string
  qr_code_url?: string
  payment_account_name?: string
  payment_account_number?: string
}
