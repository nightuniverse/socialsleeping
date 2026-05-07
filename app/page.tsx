import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function LandingPage() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) redirect('/dashboard')
  } catch {
    // If Supabase is unavailable, render the landing page anyway
  }

  return (
    <main className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-[#1f1f1f]">
        <span className="text-xl font-bold gradient-text">SocialSleeping</span>
        <div className="flex gap-3">
          <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5">
            Log in
          </Link>
          <Link href="/signup" className="text-sm bg-violet-600 hover:bg-violet-500 transition-colors px-4 py-1.5 rounded-lg font-medium">
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-24">
        <div className="inline-flex items-center gap-2 bg-violet-950/40 border border-violet-800/40 text-violet-300 text-xs font-medium px-3 py-1.5 rounded-full mb-8">
          <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse" />
          Built for gym athletes
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 max-w-3xl">
          Know when to
          <span className="gradient-text"> push.</span>
          <br />
          Know when to
          <span className="gradient-text"> rest.</span>
        </h1>

        <p className="text-gray-400 text-lg md:text-xl max-w-xl mb-10 leading-relaxed">
          Log your sleep and soreness every morning. Get an AI-powered readiness score
          that tells you exactly how hard to train today.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/signup" className="bg-violet-600 hover:bg-violet-500 transition-colors text-white font-semibold px-8 py-3.5 rounded-xl text-base">
            Start tracking free
          </Link>
          <Link href="/feed" className="border border-[#1f1f1f] hover:border-[#333] transition-colors text-gray-300 font-medium px-8 py-3.5 rounded-xl text-base">
            See the feed →
          </Link>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-20 max-w-3xl w-full text-left">
          {[
            {
              icon: '🧠',
              title: 'AI Reasoning',
              desc: 'Claude tells you in plain English why your score is what it is — and what to do about it.',
            },
            {
              icon: '📊',
              title: 'Readiness Score',
              desc: 'Sleep + soreness + rest days combined into one honest number every morning.',
            },
            {
              icon: '🃏',
              title: 'Shareable Card',
              desc: 'Post your recovery card on Instagram Stories. Your training journey, beautifully designed.',
            },
          ].map((f) => (
            <div key={f.title} className="bg-[#111] border border-[#1f1f1f] rounded-2xl p-5">
              <div className="text-2xl mb-3">{f.icon}</div>
              <div className="font-semibold text-white mb-1">{f.title}</div>
              <div className="text-gray-400 text-sm leading-relaxed">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <footer className="text-center text-xs text-gray-600 py-6">
        Built solo in 2 weeks before military service. ✊
      </footer>
    </main>
  )
}
