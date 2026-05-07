import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import ReadinessGauge from '@/components/ReadinessGauge'
import OnboardingSurvey from '@/components/OnboardingSurvey'
import { CheckIn, Profile } from '@/lib/types'
import { getReadinessColor } from '@/lib/readiness'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const p = profile as Profile | null

  const today = new Date().toISOString().split('T')[0]
  const { data: todayCheckin } = await supabase
    .from('check_ins')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', today)
    .single()

  const { data: history } = await supabase
    .from('check_ins')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .limit(14)

  const checkin = todayCheckin as CheckIn | null
  const historyItems = (history ?? []) as CheckIn[]

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation username={p?.username ?? 'you'} />

      {/* Onboarding survey — shown until user completes it */}
      {p && !p.onboarded && <OnboardingSurvey userId={user.id} />}

      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Good morning, {p?.username ?? 'athlete'} 👋</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              {p?.sports && p.sports.length > 0 && (
                <span className="ml-2 text-violet-400">
                  {p.sports.slice(0, 2).map(s => {
                    const labels: Record<string, string> = {
                      gym: '🏋️', basketball: '🏀', running: '🏃', soccer: '⚽',
                      swimming: '🏊', cycling: '🚴', martial_arts: '🥊',
                      tennis: '🎾', volleyball: '🏐', baseball: '⚾', other: '🏅',
                    }
                    return labels[s] ?? ''
                  }).join(' ')}
                </span>
              )}
            </p>
          </div>
          <Link
            href="/checkin"
            className="bg-violet-600 hover:bg-violet-500 transition-colors text-white text-sm font-medium px-4 py-2 rounded-xl"
          >
            {checkin ? 'Update' : '+ Check in'}
          </Link>
        </div>

        {/* Today's card */}
        {checkin ? (
          <div className="bg-[#111] border border-[#1f1f1f] rounded-2xl p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Today&apos;s Readiness</div>
                <div className="text-xs text-gray-600">Based on sleep, soreness &amp; rest</div>
              </div>
              <Link
                href={`/card/${checkin.id}`}
                className="text-xs text-violet-400 hover:text-violet-300 border border-violet-900/50 px-3 py-1.5 rounded-lg"
              >
                Share card →
              </Link>
            </div>

            <div className="flex flex-col items-center mb-6">
              <ReadinessGauge score={checkin.readiness_score} />
            </div>

            {checkin.ai_reasoning && (
              <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl px-4 py-3 text-sm text-gray-300 italic">
                &ldquo;{checkin.ai_reasoning}&rdquo;
              </div>
            )}

            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="bg-[#0a0a0a] rounded-xl p-3 text-center">
                <div className="text-xs text-gray-500 mb-1">Sleep</div>
                <div className="text-lg font-bold text-white">{checkin.sleep_hours}h</div>
                <div className="text-xs text-gray-600">{checkin.sleep_quality}/10 quality</div>
              </div>
              <div className="bg-[#0a0a0a] rounded-xl p-3 text-center">
                <div className="text-xs text-gray-500 mb-1">Soreness</div>
                <div className="text-lg font-bold text-white">
                  {Math.round(
                    Object.values(checkin.soreness).reduce((a, b) => a + b, 0) /
                      Object.values(checkin.soreness).length
                  )}/10
                </div>
                <div className="text-xs text-gray-600">avg</div>
              </div>
              <div className="bg-[#0a0a0a] rounded-xl p-3 text-center">
                <div className="text-xs text-gray-500 mb-1">Rest</div>
                <div className="text-lg font-bold text-white">{checkin.rest_days_since_last}d</div>
                <div className="text-xs text-gray-600">since last gym</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-[#111] border border-[#1f1f1f] rounded-2xl p-8 text-center">
            <div className="text-4xl mb-3">☀️</div>
            <h2 className="text-lg font-semibold mb-2">No check-in yet today</h2>
            <p className="text-gray-500 text-sm mb-5">Takes 30 seconds. Find out if you should push or rest.</p>
            <Link href="/checkin" className="inline-block bg-violet-600 hover:bg-violet-500 transition-colors text-white font-semibold px-6 py-2.5 rounded-xl text-sm">
              Do today&apos;s check-in →
            </Link>
          </div>
        )}

        {/* Quick links */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/injury" className="bg-[#111] border border-[#1f1f1f] hover:border-[#333] transition-colors rounded-2xl p-4 flex items-center gap-3">
            <span className="text-2xl">🩹</span>
            <div>
              <div className="text-sm font-medium">Injury check</div>
              <div className="text-xs text-gray-500">Assess symptoms</div>
            </div>
          </Link>
          <Link href="/feed" className="bg-[#111] border border-[#1f1f1f] hover:border-[#333] transition-colors rounded-2xl p-4 flex items-center gap-3">
            <span className="text-2xl">👥</span>
            <div>
              <div className="text-sm font-medium">Community</div>
              <div className="text-xs text-gray-500">See the feed</div>
            </div>
          </Link>
        </div>

        {/* History */}
        {historyItems.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">History</h2>
            <div className="space-y-2">
              {historyItems.map((c) => {
                const color = getReadinessColor(c.readiness_score)
                return (
                  <Link
                    key={c.id}
                    href={`/card/${c.id}`}
                    className="flex items-center justify-between bg-[#111] border border-[#1f1f1f] rounded-xl px-4 py-3 hover:border-[#333] transition-colors"
                  >
                    <div className="text-sm text-gray-300">
                      {new Date(c.date + 'T00:00:00').toLocaleDateString('en-US', {
                        weekday: 'short', month: 'short', day: 'numeric'
                      })}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-xs text-gray-600">{c.sleep_hours}h sleep</div>
                      <div className="font-bold text-sm" style={{ color }}>
                        {c.readiness_score}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
