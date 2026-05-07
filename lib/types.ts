export type SportType =
  | 'gym'
  | 'basketball'
  | 'running'
  | 'soccer'
  | 'swimming'
  | 'cycling'
  | 'martial_arts'
  | 'tennis'
  | 'volleyball'
  | 'baseball'
  | 'other'

export const SPORT_OPTIONS: { key: SportType; label: string; emoji: string }[] = [
  { key: 'gym', label: 'Weight Training', emoji: '🏋️' },
  { key: 'basketball', label: 'Basketball', emoji: '🏀' },
  { key: 'running', label: 'Running', emoji: '🏃' },
  { key: 'soccer', label: 'Soccer', emoji: '⚽' },
  { key: 'swimming', label: 'Swimming', emoji: '🏊' },
  { key: 'cycling', label: 'Cycling', emoji: '🚴' },
  { key: 'martial_arts', label: 'Martial Arts', emoji: '🥊' },
  { key: 'tennis', label: 'Tennis', emoji: '🎾' },
  { key: 'volleyball', label: 'Volleyball', emoji: '🏐' },
  { key: 'baseball', label: 'Baseball', emoji: '⚾' },
  { key: 'other', label: 'Other', emoji: '🏅' },
]

export interface Profile {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  sport: string
  sports: SportType[]
  onboarded: boolean
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

export type BodyPart =
  | 'shoulder'
  | 'knee'
  | 'ankle'
  | 'back'
  | 'elbow'
  | 'hip'
  | 'wrist'
  | 'neck'
  | 'foot'
  | 'other'

export interface InjurySymptoms {
  bodyPart: BodyPart
  painTypes: string[]
  onset: string
  triggers: string[]
  severity: number
  notes: string
}

export interface InjuryAssessmentResult {
  likelyInjury: string
  confidence: 'low' | 'medium' | 'high'
  severity: 'minor' | 'moderate' | 'severe'
  explanation: string
  immediateSteps: string[]
  recoveryTips: string[]
  seeDoctor: string
  disclaimer: string
}
