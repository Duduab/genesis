/** GET/PUT `/api/v1/users/me` (current user profile). */

export type GenesisMeProfile = {
  user_id: string
  display_name?: string | null
  email?: string | null
  phone?: string | null
  avatar_url?: string | null
  language?: string | null
  dark_mode?: boolean
  role?: string | null
  two_factor_enabled?: boolean
}

export type UpdateMyProfileBody = {
  display_name?: string
  phone?: string
  language?: 'he' | 'en'
  dark_mode?: boolean
}
