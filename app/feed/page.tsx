import { createClient } from '@/lib/supabase/server'
import Navigation from '@/components/Navigation'
import Link from 'next/link'
import { CheckIn } from '@/lib/types'
import { getReadinessColor, getReadinessLabel } from '@/lib/readiness'

export default async function FeedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: feed } = await supabase
    .from('check_ins')
    .select('*, profiles(username, full_name)')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(50)

  const items = (feed ?? []) as (CheckIn & { profiles: { username: string } })[]

  const { data: profile } = user
    ? await supabase.from('profiles').select('username').eq('id', user.id).single()
    : { data: null }

  return (
    <div className="min-h-screen flex flex-col">
      {user && profile ? (
        <Navigation username={profile.username} />
      ) : (
        <nav className="flex items-center justify-between px-6 py-4 border-b border-[#1f1f1f]">
          <Link href="/" className="text-xl font-bold gradient-text">SocialSleeping</Link>
          <div className="flex gap-3">
            <Link href="/login" className="text-sm text-gray-400 hover:text-white px-3 py-1.5">Log in</Link>
            <Link href="/signup" className="text-sm bg-violet-600 hover:bg-violet-500 px-4 py-1.5 rounded-lg font-medium">Get started</Link>
          </div>
        </nav>
      )}

      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Community Feed</h1>
            <p className="text-gray-500 text-sm mt-0.5">See how everyone&apos;s recovering today</p>
          </div>
          {user && (
            <Link href="/checkin" className="bg-violet-600 hover:bg-violet-500 transition-colors text-white text-sm font-medium px-4 py-2 rounded-xl">
              + Check in
            </Link>
          )}
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-3">🌙</div>
            <p className="text-gray-500">No check-ins yet. Be the first!</p>
            {!user && (
              <Link href="/signup" className="inline-block mt-4 text-sm text-violet-400 hover:text-violet-300">
                Create an account →
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              const color = getReadinessColor(item.readiness_score)
              const label = getReadinessLabel(item.readiness_score)
              const date = new Date(item.date + 'T00:00:00').toLocaleDateString('en-US', {
                month: 'short', day: 'numeric',
              })
              const avgSoreness = Math.round(
                Object.values(item.soreness).reduce((a, b) => a + b, 0) /
                  Object.values(item.soreness).length
              )

              return (
                <Link
                  key={item.id}
                  href={`/card/${item.id}`}
                  className="block bg-[#111] border border-[#1f1f1f] rounded-2xl p-5 hover:border-[#333] transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                        style={{ background: `${color}22`, color }}
                      >
                        {(item.profiles?.username ?? '?')[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">
                          @{item.profiles?.username ?? 'unknown'}
                        </div>
                        <div className="text-xs text-gray-600">{date}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black" style={{ color }}>
                        {item.readiness_score}
                      </div>
                      <div className="text-xs font-medium" style={{ color }}>{label}</div>
                    </div>
                  </div>

                  {item.ai_reasoning && (
                    <p className="mt-3 text-sm text-gray-400 italic leading-relaxed">
                      &ldquo;{item.ai_reasoning}&rdquo;
                    </p>
                  )}

                  <div className="flex gap-4 mt-3 text-xs text-gray-600">
                    <span>😴 {item.sleep_hours}h at {item.sleep_quality}/10</span>
                    <span>💪 {avgSoreness}/10 soreness</span>
                    <span>📅 {item.rest_days_since_last}d rest</span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
