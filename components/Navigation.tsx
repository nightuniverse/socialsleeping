'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function Navigation({ username }: { username: string }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const links = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/checkin', label: 'Check-in' },
    { href: '/injury', label: 'Injury' },
    { href: '/feed', label: 'Feed' },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-[#0a0a0a]/90 backdrop-blur border-b border-[#1f1f1f]">
      <div className="max-w-2xl mx-auto px-4 flex items-center justify-between h-14">
        <Link href="/dashboard" className="font-bold gradient-text text-base">
          SocialSleeping
        </Link>
        <div className="flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === l.href
                  ? 'bg-violet-600/20 text-violet-300'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {l.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="ml-2 text-xs text-gray-500 hover:text-gray-300 transition-colors px-2 py-1"
          >
            @{username}
          </button>
        </div>
      </div>
    </nav>
  )
}
