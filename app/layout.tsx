import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SocialSleeping — Recovery Intelligence',
  description: 'Track your recovery. Know when to push, when to rest. Share your readiness.',
  openGraph: {
    title: 'SocialSleeping',
    description: 'AI-powered gym recovery tracking for serious athletes.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-[#0a0a0a] text-white">{children}</body>
    </html>
  )
}
