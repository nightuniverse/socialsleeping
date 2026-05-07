'use client'

import { CheckIn } from '@/lib/types'
import { getReadinessColor, getReadinessLabel } from '@/lib/readiness'

const MUSCLE_LABELS: Record<string, string> = {
  chest: 'Chest',
  back: 'Back',
  legs: 'Legs',
  shoulders: 'Shoulders',
  arms: 'Arms',
  core: 'Core',
}

export default function RecoveryCard({ checkin, username }: { checkin: CheckIn; username: string }) {
  const color = getReadinessColor(checkin.readiness_score)
  const label = getReadinessLabel(checkin.readiness_score)
  const date = new Date(checkin.date + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })

  const soreEntries = Object.entries(checkin.soreness).filter(([, v]) => v > 0)

  return (
    <div
      id="recovery-card"
      className="w-[340px] rounded-3xl overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, #0f0f0f 0%, #1a0a2e 50%, #0f0a1a 100%)',
        border: '1px solid #2d1f4a',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b" style={{ borderColor: '#2d1f4a' }}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-medium" style={{ color: '#a78bfa' }}>SocialSleeping</div>
            <div className="text-[10px] text-gray-600 mt-0.5">{date}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400">@{username}</div>
          </div>
        </div>
      </div>

      {/* Score section */}
      <div className="px-6 py-6 text-center">
        <div className="text-[80px] font-black leading-none tabular-nums" style={{ color }}>
          {checkin.readiness_score}
        </div>
        <div className="text-sm font-semibold mt-1" style={{ color }}>
          {label}
        </div>
        {checkin.ai_reasoning && (
          <div className="mt-4 text-xs text-gray-400 italic leading-relaxed px-2">
            &ldquo;{checkin.ai_reasoning}&rdquo;
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 px-4 pb-4">
        {[
          { label: 'Sleep', value: `${checkin.sleep_hours}h`, sub: `${checkin.sleep_quality}/10` },
          {
            label: 'Soreness', value: `${Math.round(
              Object.values(checkin.soreness).reduce((a, b) => a + b, 0) /
                Object.values(checkin.soreness).length
            )}/10`, sub: 'avg'
          },
          { label: 'Rest', value: `${checkin.rest_days_since_last}d`, sub: 'off' },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl py-3 text-center"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{s.label}</div>
            <div className="text-lg font-bold text-white">{s.value}</div>
            <div className="text-[10px] text-gray-600">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Soreness breakdown */}
      {soreEntries.length > 0 && (
        <div className="px-4 pb-4">
          <div className="rounded-2xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Soreness</div>
            <div className="space-y-1.5">
              {soreEntries.map(([key, val]) => (
                <div key={key} className="flex items-center gap-2">
                  <div className="text-xs text-gray-400 w-16">{MUSCLE_LABELS[key]}</div>
                  <div className="flex-1 h-1.5 rounded-full" style={{ background: '#1f1f1f' }}>
                    <div
                      className="h-1.5 rounded-full transition-all"
                      style={{
                        width: `${(val / 10) * 100}%`,
                        background: val <= 3 ? '#22c55e' : val <= 6 ? '#f59e0b' : '#ef4444',
                      }}
                    />
                  </div>
                  <div className="text-xs text-gray-600 w-4 text-right">{val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-6 pb-5 pt-2 text-center">
        <div className="text-[10px] text-gray-700">socialsleeping.app</div>
      </div>
    </div>
  )
}
