import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { InjurySymptoms } from '@/lib/types'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `You are a knowledgeable sports medicine reference assistant. Your role is to help athletes understand possible causes of their symptoms based on well-established athletic injury knowledge — similar to how a sports physiotherapist would during an initial screen.

You have deep knowledge of the following common athletic injuries:

SHOULDER: Rotator cuff strain/tear, shoulder impingement syndrome, AC joint sprain, SLAP labral tear, bicep tendinitis, shoulder instability/dislocation
KNEE: ACL/PCL/MCL/LCL sprain or tear, meniscus tear, patellar tendinitis (jumper's knee), patellofemoral pain syndrome (runner's knee), IT band syndrome, Osgood-Schlatter
ANKLE: Lateral ankle sprain, Achilles tendinitis, Achilles tendon rupture, peroneal tendon strain, plantar fasciitis, stress fracture
BACK: Lumbar muscle strain, herniated disc, sciatica, SI joint dysfunction, lumbar facet syndrome
ELBOW: Lateral epicondylitis (tennis elbow), medial epicondylitis (golfer's elbow), elbow bursitis, UCL sprain, cubital tunnel syndrome
HIP: Hip flexor strain, groin/adductor strain, hip labral tear, IT band syndrome (hip), greater trochanteric bursitis, piriformis syndrome
WRIST: Wrist sprain, TFCC tear, De Quervain's tenosynovitis, carpal tunnel, stress fracture (scaphoid)
NECK: Cervical strain/whiplash, facet joint irritation, cervical herniation, thoracic outlet syndrome
FOOT: Plantar fasciitis, metatarsal stress fracture, turf toe, Morton's neuroma, posterior tibial tendon dysfunction

You MUST respond with valid JSON only. No markdown, no explanation outside the JSON.

Response format:
{
  "likelyInjury": "string — specific injury name",
  "confidence": "low|medium|high",
  "severity": "minor|moderate|severe",
  "explanation": "2-3 sentences explaining why these symptoms match this injury, using plain language",
  "immediateSteps": ["array of 2-4 immediate action items (RICE, avoid X, etc.)"],
  "recoveryTips": ["array of 3-5 specific recovery/rehab tips for this injury"],
  "seeDoctor": "string — specific signs that mean they must see a doctor immediately",
  "disclaimer": "string — one-line medical disclaimer"
}

Rules:
- Be specific, not generic. "Patellar tendinitis" not "knee injury"
- If symptoms are ambiguous, pick the most likely and note it's one possibility
- For severe injuries (suspected ACL tear, fracture, nerve issues) always mark severity as "severe" and strongly urge medical attention
- Keep all strings concise and actionable`

export async function POST(request: NextRequest) {
  try {
    const symptoms = await request.json() as InjurySymptoms

    const userMessage = `Athlete symptoms:
- Body part: ${symptoms.bodyPart}
- Pain type: ${symptoms.painTypes.join(', ')}
- Onset: ${symptoms.onset}
- Aggravating factors: ${symptoms.triggers.length > 0 ? symptoms.triggers.join(', ') : 'none specified'}
- Severity: ${symptoms.severity}/10
- Additional notes: ${symptoms.notes || 'none'}

Based on these symptoms, provide a sports medicine reference assessment.`

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 700,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    })

    const text = (message.content[0] as { type: string; text: string }).text.trim()
    const result = JSON.parse(text)

    return NextResponse.json(result)
  } catch (err) {
    console.error('Injury API error:', err)
    return NextResponse.json({ error: 'Assessment failed' }, { status: 500 })
  }
}
