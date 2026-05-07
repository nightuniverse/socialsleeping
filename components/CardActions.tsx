'use client'

import { useState } from 'react'

export default function CardActions({ checkinId }: { checkinId: string }) {
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/card/${checkinId}`
    : ''

  async function handleCopyLink() {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleDownload() {
    setDownloading(true)
    try {
      const html2canvas = (await import('html2canvas')).default
      const card = document.getElementById('recovery-card')
      if (!card) return
      const canvas = await html2canvas(card, {
        backgroundColor: null,
        scale: 3,
        useCORS: true,
      })
      const link = document.createElement('a')
      link.download = `recovery-${checkinId.slice(0, 8)}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="flex gap-3">
      <button
        onClick={handleDownload}
        disabled={downloading}
        className="flex-1 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 transition-colors text-white font-semibold py-3 rounded-xl text-sm"
      >
        {downloading ? 'Generating…' : '⬇ Save as image'}
      </button>
      <button
        onClick={handleCopyLink}
        className="flex-1 border border-[#1f1f1f] hover:border-[#333] transition-colors text-gray-300 font-medium py-3 rounded-xl text-sm"
      >
        {copied ? '✓ Copied!' : '🔗 Copy link'}
      </button>
    </div>
  )
}
