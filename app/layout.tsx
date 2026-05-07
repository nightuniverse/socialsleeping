import type { Metadata, Viewport } from 'next'
import './globals.css'
import InstallPrompt from '@/components/InstallPrompt'

export const metadata: Metadata = {
  title: 'SocialSleeping — Recovery Intelligence',
  description: 'Track your recovery. Know when to push, when to rest. Share your readiness.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SocialSleeping',
  },
  openGraph: {
    title: 'SocialSleeping',
    description: 'AI-powered gym recovery tracking for serious athletes.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#8b5cf6',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-[#0a0a0a] text-white">
        {children}
        <InstallPrompt />
      </body>
    </html>
  )
}
