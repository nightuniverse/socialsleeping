export interface Profile {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  sport: 'gym'
  created_at: string
}

export interface Soreness {
  chest: number
  back: number
  legs: number
  shoulders: number
  arms: number
  core: number
}

export interface CheckIn {
  id: string
  user_id: string
  date: string
  sleep_hours: number
  sleep_quality: number
  soreness: Soreness
  rest_days_since_last: number
  readiness_score: number
  ai_reasoning: string | null
  is_public: boolean
  created_at: string
  profiles?: Profile
}
