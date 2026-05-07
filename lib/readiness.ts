import { Soreness } from './types'

export function computeReadinessScore(
  sleepHours: number,
  sleepQuality: number,
  soreness: Soreness,
  restDaysSinceLast: number
): number {
  const sleepHoursNorm = Math.min(sleepHours / 8, 1)
  const sleepScore = sleepHoursNorm * (sleepQuality / 10)

  const sorenessValues = Object.values(soreness)
  const avgSoreness = sorenessValues.reduce((a, b) => a + b, 0) / sorenessValues.length
  const sorenessScore = 1 - avgSoreness / 10

  const restScore = Math.min(restDaysSinceLast / 2, 1)

  const readiness = sleepScore * 0.4 + sorenessScore * 0.35 + restScore * 0.25
  return Math.round(readiness * 100)
}

export function getReadinessLabel(score: number): string {
  if (score >= 80) return 'Ready to crush it'
  if (score >= 60) return 'Good to go'
  if (score >= 40) return 'Take it easy'
  return 'Rest day recommended'
}

export function getReadinessColor(score: number): string {
  if (score >= 80) return '#22c55e'
  if (score >= 60) return '#a78bfa'
  if (score >= 40) return '#f59e0b'
  return '#ef4444'
}

export function getSorenessMuscleGroups(): { key: keyof Soreness; label: string; emoji: string }[] {
  return [
    { key: 'chest', label: 'Chest', emoji: '💪' },
    { key: 'back', label: 'Back', emoji: '🔙' },
    { key: 'legs', label: 'Legs', emoji: '🦵' },
    { key: 'shoulders', label: 'Shoulders', emoji: '🏋️' },
    { key: 'arms', label: 'Arms', emoji: '💪' },
    { key: 'core', label: 'Core', emoji: '🔥' },
  ]
}
