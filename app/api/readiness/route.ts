import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { Soreness } from '@/lib/types'
import { computeReadinessScore } from '@/lib/readiness'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sleepHours, sleepQuality, soreness, restDaysSinceLast } = body as {
      sleepHours: number
      sleepQuality: number
      soreness: Soreness
      restDaysSinceLast: number
    }

    const score = computeReadinessScore(sleepHours, sleepQuality, soreness, restDaysSinceLast)

    const sorenessSummary = Object.entries(soreness)
      .filter(([, v]) => v > 0)
      .map(([k, v]) => `${k}: ${v}/10`)
      .join(', ')

    const prompt = `You are a knowledgeable fitness recovery coach. A gym athlete has the following recovery metrics:
- Sleep: ${sleepHours} hours at quality ${sleepQuality}/10
- Muscle soreness: ${sorenessSummary || 'none'}
- Days since last workout: ${restDaysSinceLast}
- Computed readiness score: ${score}/100

Write ONE sentence (max 20 words) of plain-English coaching advice. Be direct and specific. Mention the most limiting factor. Example format: "Your chest is still recovering from Monday — prioritize legs or active rest today."`

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 80,
      messages: [{ role: 'user', content: prompt }],
    })

    const reasoning = (message.content[0] as { type: string; text: string }).text.trim()

    return NextResponse.json({ score, reasoning })
  } catch (err) {
    console.error('Readiness API error:', err)
    return NextResponse.json({ error: 'Failed to compute readiness' }, { status: 500 })
  }
}
