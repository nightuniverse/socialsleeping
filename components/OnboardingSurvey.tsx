'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { SportType, SPORT_OPTIONS } from '@/lib/types'

export default function OnboardingSurvey({ userId }: { userId: string }) {
  const router = useRouter()
  const [selected, setSelected] = useState<SportType[]>([])
  const [saving, setSaving] = useState(false)

  function toggle(key: SportType) {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]
    )
  }

  async function handleSave() {
    if (selected.length === 0) return
    setSaving(true)
    const supabase = createClient()
    await supabase
      .from('profiles')
      .update({ sports: selected, onboarded: true })
      .eq('id', userId)
    router.refresh()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-md bg-[#111] border border-[#1f1f1f] rounded-3xl p-6 sm:p-8">
        <div className="mb-6">
          <div className="text-2xl mb-2">🏅</div>
          <h2 className="text-xl font-bold mb-1">What do you train?</h2>
          <p className="text-gray-400 text-sm">
            Select all that apply — we&apos;ll personalise your recovery tracking.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-6">
          {SPORT_OPTIONS.map(({ key, label, emoji }) => {
            const active = selected.includes(key)
            return (
              <button
                key={key}
                onClick={() => toggle(key)}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium transition-all text-left ${
                  active
                    ? 'bg-violet-600/20 border-violet-500 text-violet-300'
                    : 'bg-[#0a0a0a] border-[#1f1f1f] text-gray-400 hover:border-[#333]'
                }`}
              >
                <span className="text-lg">{emoji}</span>
                <span>{label}</span>
                {active && (
                  <span className="ml-auto text-violet-400">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2 7l4 4 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                )}
              </button>
            )
          })}
        </div>

        <button
          onClick={handleSave}
          disabled={selected.length === 0 || saving}
          className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-white font-semibold py-3 rounded-xl"
        >
          {saving ? 'Saving…' : `Let's go →`}
        </button>

        <p className="text-center text-xs text-gray-600 mt-3">
          You can change this later in settings
        </p>
      </div>
    </div>
  )
}
