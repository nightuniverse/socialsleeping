'use client'

import { useEffect, useState } from 'react'

type Platform = 'android' | 'ios' | 'desktop' | null

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISS_KEY = 'install-prompt-dismissed'
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days

export default function InstallPrompt() {
  const [platform, setPlatform] = useState<Platform>(null)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)
  const [showIosSteps, setShowIosSteps] = useState(false)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    // Already running as installed PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true)
      return
    }
    // iOS standalone check
    if ((navigator as { standalone?: boolean }).standalone) {
      setInstalled(true)
      return
    }

    // Dismissed recently
    const dismissed = localStorage.getItem(DISMISS_KEY)
    if (dismissed && Date.now() - Number(dismissed) < DISMISS_DURATION) return

    const ua = navigator.userAgent
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !('MSStream' in window)
    const isAndroid = /Android/.test(ua)

    if (isIOS) {
      setPlatform('ios')
      const timer = setTimeout(() => setVisible(true), 2500)
      return () => clearTimeout(timer)
    }

    // Android + desktop Chrome both support beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setPlatform(isAndroid ? 'android' : 'desktop')
      setTimeout(() => setVisible(true), 2500)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  function dismiss() {
    setVisible(false)
    localStorage.setItem(DISMISS_KEY, Date.now().toString())
  }

  async function handleInstall() {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') setVisible(false)
    setDeferredPrompt(null)
  }

  if (!visible || installed) return null

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4 flex justify-center">
      <div
        className="w-full max-w-sm rounded-2xl border border-[#2d1f4a] p-4 shadow-2xl"
        style={{
          background: 'linear-gradient(160deg, #130d24 0%, #1a0e2e 100%)',
          boxShadow: '0 -4px 40px rgba(139,92,246,0.15), 0 20px 60px rgba(0,0,0,0.6)',
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #6d28d9, #8b5cf6)' }}
          >
            SS
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-white text-sm">SocialSleeping</div>
            <div className="text-xs text-gray-400 mt-0.5">Add to your home screen</div>
          </div>
          <button
            onClick={dismiss}
            className="text-gray-600 hover:text-gray-400 transition-colors p-1 flex-shrink-0"
            aria-label="Dismiss"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {platform === 'ios' && !showIosSteps && (
          <>
            <p className="text-xs text-gray-400 mb-3 leading-relaxed">
              Install SocialSleeping for quick access — check your recovery in seconds every morning.
            </p>
            <button
              onClick={() => setShowIosSteps(true)}
              className="w-full text-sm font-semibold py-2.5 rounded-xl text-white"
              style={{ background: 'linear-gradient(135deg, #6d28d9, #8b5cf6)' }}
            >
              Show me how
            </button>
          </>
        )}

        {platform === 'ios' && showIosSteps && (
          <div className="space-y-2">
            {[
              { step: '1', icon: '⬆️', text: 'Tap the Share button at the bottom of Safari' },
              { step: '2', icon: '➕', text: 'Scroll down and tap "Add to Home Screen"' },
              { step: '3', icon: '✅', text: 'Tap "Add" — done!' },
            ].map((s) => (
              <div key={s.step} className="flex items-center gap-3 bg-white/5 rounded-xl px-3 py-2">
                <span className="text-lg">{s.icon}</span>
                <span className="text-xs text-gray-300">{s.text}</span>
              </div>
            ))}
            <button onClick={dismiss} className="w-full text-xs text-gray-500 mt-1 py-1">
              Got it
            </button>
          </div>
        )}

        {(platform === 'android' || platform === 'desktop') && (
          <>
            <p className="text-xs text-gray-400 mb-3 leading-relaxed">
              Install SocialSleeping for quick access — check your recovery in seconds every morning.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleInstall}
                className="flex-1 text-sm font-semibold py-2.5 rounded-xl text-white"
                style={{ background: 'linear-gradient(135deg, #6d28d9, #8b5cf6)' }}
              >
                Install app
              </button>
              <button
                onClick={dismiss}
                className="px-4 text-sm text-gray-500 border border-[#1f1f1f] rounded-xl"
              >
                Not now
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
