'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Soreness } from '@/lib/types'
import { getSorenessMuscleGroups } from '@/lib/readiness'

const MUSCLES = getSorenessMuscleGroups()

const defaultSoreness: Soreness = { chest: 0, back: 0, legs: 0, shoulders: 0, arms: 0, core: 0 }

export default function CheckinForm({
  userId,
  existingCheckinId,
}: {
  userId: string
  existingCheckinId: string | null
}) {
  const router = useRouter()
  const [sleepHours, setSleepHours] = useState(7.5)
  const [sleepQuality, setSleepQuality] = useState(7)
  const [soreness, setSoreness] = useState<Soreness>(defaultSoreness)
  const [restDays, setRestDays] = useState(1)
  const [isPublic, setIsPublic] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function setSorenessFor(key: keyof Soreness, value: number) {
    setSoreness((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/readiness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sleepHours,
          sleepQuality,
          soreness,
          restDaysSinceLast: restDays,
        }),
      })
      if (!res.ok) throw new Error('Readiness API failed')
      const { score, reasoning } = await res.json()

      const supabase = createClient()
      const today = new Date().toISOString().split('T')[0]

      const payload = {
        user_id: userId,
        date: today,
        sleep_hours: sleepHours,
        sleep_quality: sleepQuality,
        soreness,
        rest_days_since_last: restDays,
        readiness_score: score,
        ai_reasoning: reasoning,
        is_public: isPublic,
      }

      let checkInId: string

      if (existingCheckinId) {
        const { data, error: updateError } = await supabase
          .from('check_ins')
          .update(payload)
          .eq('id', existingCheckinId)
          .select('id')
          .single()
        if (updateError) throw updateError
        checkInId = data.id
      } else {
        const { data, error: insertError } = await supabase
          .from('check_ins')
          .insert(payload)
          .select('id')
          .single()
        if (insertError) throw insertError
        checkInId = data.id
      }

      router.push(`/dashboard?checkin=${checkInId}`)
    } catch (err) {
      console.error(err)
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">Morning check-in</h1>
        <p className="text-gray-500 text-sm">Takes 30 seconds. Gets smarter every day.</p>
      </div>

      {/* Sleep */}
      <section className="bg-[#111] border border-[#1f1f1f] rounded-2xl p-6 space-y-5">
        <h2 className="font-semibold text-base flex items-center gap-2">😴 Sleep</h2>

        <div>
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Hours slept</span>
            <span className="text-white font-medium">{sleepHours}h</span>
          </div>
          <input
            type="range"
            min={3}
            max={12}
            step={0.5}
            value={sleepHours}
            onChange={(e) => setSleepHours(parseFloat(e.target.value))}
            className="w-full accent-violet-500"
          />
          <div className="flex justify-between text-xs text-gray-600 mt-1">
            <span>3h</span><span>12h</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Sleep quality</span>
            <span className="text-white font-medium">{sleepQuality}/10</span>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setSleepQuality(n)}
                className={`flex-1 h-8 rounded-lg text-xs font-semibold transition-all ${
                  n <= sleepQuality
                    ? 'bg-violet-600 text-white'
                    : 'bg-[#0a0a0a] border border-[#1f1f1f] text-gray-600'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Soreness */}
      <section className="bg-[#111] border border-[#1f1f1f] rounded-2xl p-6 space-y-4">
        <h2 className="font-semibold text-base flex items-center gap-2">💪 Muscle Soreness</h2>
        <p className="text-xs text-gray-500">0 = no soreness, 10 = can&apos;t move</p>
        <div className="space-y-3">
          {MUSCLES.map(({ key, label }) => (
            <div key={key}>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-gray-300">{label}</span>
                <span className={`font-medium ${
                  soreness[key] === 0 ? 'text-gray-500' :
                  soreness[key] <= 3 ? 'text-green-400' :
                  soreness[key] <= 6 ? 'text-amber-400' : 'text-red-400'
                }`}>
                  {soreness[key] === 0 ? 'None' : soreness[key]}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={10}
                step={1}
                value={soreness[key]}
                onChange={(e) => setSorenessFor(key, parseInt(e.target.value))}
                className="w-full accent-violet-500"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Rest days */}
      <section className="bg-[#111] border border-[#1f1f1f] rounded-2xl p-6">
        <h2 className="font-semibold text-base flex items-center gap-2 mb-4">📅 Rest Days</h2>
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>Days since last workout</span>
          <span className="text-white font-medium">{restDays === 0 ? 'Trained today' : `${restDays} day${restDays > 1 ? 's' : ''}`}</span>
        </div>
        <input
          type="range"
          min={0}
          max={7}
          step={1}
          value={restDays}
          onChange={(e) => setRestDays(parseInt(e.target.value))}
          className="w-full accent-violet-500"
        />
        <div className="flex justify-between text-xs text-gray-600 mt-1">
          <span>Today</span><span>7+ days</span>
        </div>
      </section>

      {/* Public toggle */}
      <div className="flex items-center justify-between bg-[#111] border border-[#1f1f1f] rounded-2xl px-5 py-4">
        <div>
          <div className="text-sm font-medium">Share to feed</div>
          <div className="text-xs text-gray-500 mt-0.5">Let others see your recovery</div>
        </div>
        <button
          type="button"
          onClick={() => setIsPublic(!isPublic)}
          className={`w-11 h-6 rounded-full transition-colors relative ${isPublic ? 'bg-violet-600' : 'bg-[#1f1f1f]'}`}
        >
          <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isPublic ? 'left-6' : 'left-1'}`} />
        </button>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white font-semibold py-3.5 rounded-xl"
      >
        {loading ? 'Calculating your score…' : 'Get my readiness score →'}
      </button>
    </form>
  )
}
