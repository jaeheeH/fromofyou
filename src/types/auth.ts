import type { User } from '@supabase/supabase-js'
export interface Profile {
  id: string
  email: string
  name: string | null
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  role: 'user' | 'editor' | 'admin'
  is_active: boolean
  email_verified: boolean
  website_url: string | null
  location: string | null
  birth_year: number | null
  favorite_genres: string[] | null
  art_experience_level: 'beginner' | 'intermediate' | 'advanced' | 'expert' | null
  preferred_exhibition_types: string[] | null
  notification_enabled: boolean
  newsletter_subscribed: boolean
  marketing_agreed: boolean
  total_reviews: number
  total_likes: number
  total_series_created: number
  total_visits: number
  created_at: string
  updated_at: string
  last_active_at: string | null
}

export interface AuthState {
  user: User | null
  profile: Profile | null
  loading: boolean
  isAuthenticated: boolean
  isEditor: boolean
  isAdmin: boolean
}

export interface LoginFormData {
  email: string
  password: string
}

export interface SignUpFormData {
  email: string
  password: string
  name: string
  confirmPassword: string
}