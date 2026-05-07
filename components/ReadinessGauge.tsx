'use client'

import { getReadinessColor, getReadinessLabel } from '@/lib/readiness'

export default function ReadinessGauge({ score }: { score: number }) {
  const color = getReadinessColor(score)
  const label = getReadinessLabel(score)
  const radius = 70
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference - (score / 100) * circumference

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-44 h-44">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
          {/* Track */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="#1f1f1f"
            strokeWidth="10"
          />
          {/* Progress */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 1s ease-out, stroke 0.5s' }}
          />
        </svg>
        {/* Score text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold tabular-nums" style={{ color }}>
            {score}
          </span>
          <span className="text-xs text-gray-500 mt-1">/ 100</span>
        </div>
      </div>
      <span className="mt-3 text-sm font-medium" style={{ color }}>{label}</span>
    </div>
  )
}
