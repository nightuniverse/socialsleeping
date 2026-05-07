'use client'

import { useState } from 'react'
import { BodyPart, InjuryAssessmentResult, InjurySymptoms } from '@/lib/types'

const BODY_PARTS: { key: BodyPart; label: string; emoji: string }[] = [
  { key: 'shoulder', label: 'Shoulder', emoji: '💪' },
  { key: 'elbow', label: 'Elbow', emoji: '🦾' },
  { key: 'wrist', label: 'Wrist', emoji: '✋' },
  { key: 'neck', label: 'Neck', emoji: '🧠' },
  { key: 'back', label: 'Back', emoji: '🔙' },
  { key: 'hip', label: 'Hip', emoji: '🦴' },
  { key: 'knee', label: 'Knee', emoji: '🦵' },
  { key: 'ankle', label: 'Ankle', emoji: '🦶' },
  { key: 'foot', label: 'Foot', emoji: '👟' },
  { key: 'other', label: 'Other', emoji: '❓' },
]

const PAIN_TYPES = ['Sharp', 'Dull', 'Burning', 'Throbbing', 'Aching', 'Stabbing', 'Tight']
const ONSET_OPTIONS = [
  { value: 'sudden', label: 'Sudden — happened in one moment' },
  { value: 'today', label: 'Today — came on gradually today' },
  { value: 'days', label: 'A few days ago' },
  { value: 'weeks', label: 'Building up over weeks' },
  { value: 'chronic', label: 'Long-term / recurring' },
]
const TRIGGER_OPTIONS = [
  'Movement / exercise',
  'Pressing on it',
  'Specific positions',
  'At rest / night',
  'Lifting / loading',
  'Twisting motions',
  'Running / impact',
]

const SEVERITY_LABELS: Record<number, string> = {
  1: 'Barely noticeable', 2: 'Mild', 3: 'Noticeable', 4: 'Uncomfortable',
  5: 'Moderate', 6: 'Distracting', 7: 'Significant', 8: 'Severe',
  9: 'Very severe', 10: 'Worst possible',
}

const SEVERITY_COLORS: Record<string, string> = {
  minor: '#22c55e',
  moderate: '#f59e0b',
  severe: '#ef4444',
}

type Step = 'bodypart' | 'pain' | 'onset' | 'triggers' | 'severity' | 'notes' | 'result'

export default function InjuryAssessment() {
  const [step, setStep] = useState<Step>('bodypart')
  const [bodyPart, setBodyPart] = useState<BodyPart | null>(null)
  const [painTypes, setPainTypes] = useState<string[]>([])
  const [onset, setOnset] = useState('')
  const [triggers, setTriggers] = useState<string[]>([])
  const [severity, setSeverity] = useState(5)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<InjuryAssessmentResult | null>(null)
  const [error, setError] = useState('')

  function togglePainType(t: string) {
    setPainTypes((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t])
  }
  function toggleTrigger(t: string) {
    setTriggers((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t])
  }

  function reset() {
    setStep('bodypart')
    setBodyPart(null)
    setPainTypes([])
    setOnset('')
    setTriggers([])
    setSeverity(5)
    setNotes('')
    setResult(null)
    setError('')
  }

  async function handleSubmit() {
    if (!bodyPart) return
    setLoading(true)
    setError('')
    setStep('result')
    try {
      const symptoms: InjurySymptoms = { bodyPart, painTypes, onset, triggers, severity, notes }
      const res = await fetch('/api/injury', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(symptoms),
      })
      if (!res.ok) throw new Error('Request failed')
      const data = await res.json()
      setResult(data)
    } catch {
      setError('Assessment failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const progressSteps: Step[] = ['bodypart', 'pain', 'onset', 'triggers', 'severity', 'notes']
  const progressIndex = progressSteps.indexOf(step)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold mb-1">Injury Assessment</h1>
        <p className="text-gray-500 text-sm">Answer a few questions to get a sports medicine reference.</p>
      </div>

      {/* Progress bar */}
      {step !== 'result' && (
        <div className="flex gap-1">
          {progressSteps.map((s, i) => (
            <div
              key={s}
              className="flex-1 h-1 rounded-full transition-all"
              style={{ background: i <= progressIndex ? '#8b5cf6' : '#1f1f1f' }}
            />
          ))}
        </div>
      )}

      {/* Step: Body Part */}
      {step === 'bodypart' && (
        <div className="bg-[#111] border border-[#1f1f1f] rounded-2xl p-6">
          <h2 className="font-semibold mb-4">Where does it hurt?</h2>
          <div className="grid grid-cols-2 gap-2">
            {BODY_PARTS.map(({ key, label, emoji }) => (
              <button
                key={key}
                onClick={() => { setBodyPart(key); setStep('pain') }}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium transition-all text-left ${
                  bodyPart === key
                    ? 'bg-violet-600/20 border-violet-500 text-violet-300'
                    : 'bg-[#0a0a0a] border-[#1f1f1f] text-gray-300 hover:border-[#333]'
                }`}
              >
                <span className="text-xl">{emoji}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step: Pain Type */}
      {step === 'pain' && (
        <div className="bg-[#111] border border-[#1f1f1f] rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{BODY_PARTS.find(b => b.key === bodyPart)?.emoji}</span>
            <h2 className="font-semibold">What does the pain feel like?</h2>
          </div>
          <p className="text-xs text-gray-500 mb-4">Select all that apply</p>
          <div className="flex flex-wrap gap-2 mb-6">
            {PAIN_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => togglePainType(t)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                  painTypes.includes(t)
                    ? 'bg-violet-600/20 border-violet-500 text-violet-300'
                    : 'bg-[#0a0a0a] border-[#1f1f1f] text-gray-400 hover:border-[#333]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <button
            onClick={() => setStep('onset')}
            disabled={painTypes.length === 0}
            className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-white font-semibold py-2.5 rounded-xl text-sm"
          >
            Next →
          </button>
        </div>
      )}

      {/* Step: Onset */}
      {step === 'onset' && (
        <div className="bg-[#111] border border-[#1f1f1f] rounded-2xl p-6">
          <h2 className="font-semibold mb-4">When did it start?</h2>
          <div className="space-y-2">
            {ONSET_OPTIONS.map((o) => (
              <button
                key={o.value}
                onClick={() => { setOnset(o.value); setStep('triggers') }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm text-left transition-all ${
                  onset === o.value
                    ? 'bg-violet-600/20 border-violet-500 text-violet-300'
                    : 'bg-[#0a0a0a] border-[#1f1f1f] text-gray-300 hover:border-[#333]'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step: Triggers */}
      {step === 'triggers' && (
        <div className="bg-[#111] border border-[#1f1f1f] rounded-2xl p-6">
          <h2 className="font-semibold mb-1">What makes it worse?</h2>
          <p className="text-xs text-gray-500 mb-4">Select all that apply</p>
          <div className="flex flex-wrap gap-2 mb-6">
            {TRIGGER_OPTIONS.map((t) => (
              <button
                key={t}
                onClick={() => toggleTrigger(t)}
                className={`px-3 py-2 rounded-full text-sm font-medium border transition-all ${
                  triggers.includes(t)
                    ? 'bg-violet-600/20 border-violet-500 text-violet-300'
                    : 'bg-[#0a0a0a] border-[#1f1f1f] text-gray-400 hover:border-[#333]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <button
            onClick={() => setStep('severity')}
            className="w-full bg-violet-600 hover:bg-violet-500 transition-colors text-white font-semibold py-2.5 rounded-xl text-sm"
          >
            Next →
          </button>
        </div>
      )}

      {/* Step: Severity */}
      {step === 'severity' && (
        <div className="bg-[#111] border border-[#1f1f1f] rounded-2xl p-6">
          <h2 className="font-semibold mb-4">How severe is the pain right now?</h2>
          <div className="text-center mb-6">
            <div
              className="text-6xl font-black tabular-nums mb-1"
              style={{ color: severity <= 3 ? '#22c55e' : severity <= 6 ? '#f59e0b' : '#ef4444' }}
            >
              {severity}
            </div>
            <div className="text-sm text-gray-400">{SEVERITY_LABELS[severity]}</div>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            value={severity}
            onChange={(e) => setSeverity(parseInt(e.target.value))}
            className="w-full accent-violet-500 mb-2"
          />
          <div className="flex justify-between text-xs text-gray-600 mb-6">
            <span>1 — No pain</span><span>10 — Unbearable</span>
          </div>
          <button
            onClick={() => setStep('notes')}
            className="w-full bg-violet-600 hover:bg-violet-500 transition-colors text-white font-semibold py-2.5 rounded-xl text-sm"
          >
            Next →
          </button>
        </div>
      )}

      {/* Step: Notes */}
      {step === 'notes' && (
        <div className="bg-[#111] border border-[#1f1f1f] rounded-2xl p-6">
          <h2 className="font-semibold mb-1">Anything else to add?</h2>
          <p className="text-xs text-gray-500 mb-4">Optional — describe specific movements, history, or context</p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Pain came on after heavy bench press, clicking sound when I move my arm overhead, had this 6 months ago..."
            className="w-full bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-600 transition-colors resize-none text-gray-300 placeholder-gray-600 mb-4"
            rows={4}
          />
          <button
            onClick={handleSubmit}
            className="w-full bg-violet-600 hover:bg-violet-500 transition-colors text-white font-semibold py-3 rounded-xl"
          >
            Get my assessment →
          </button>
        </div>
      )}

      {/* Step: Result */}
      {step === 'result' && (
        <div className="space-y-4">
          {loading && (
            <div className="bg-[#111] border border-[#1f1f1f] rounded-2xl p-10 text-center">
              <div className="text-3xl mb-3 animate-pulse">🔍</div>
              <p className="text-gray-400 text-sm">Analysing your symptoms…</p>
            </div>
          )}

          {error && (
            <div className="bg-[#111] border border-red-900/50 rounded-2xl p-6 text-center">
              <p className="text-red-400 text-sm mb-3">{error}</p>
              <button onClick={reset} className="text-sm text-violet-400 hover:text-violet-300">Try again</button>
            </div>
          )}

          {result && (
            <>
              {/* Diagnosis card */}
              <div
                className="rounded-2xl p-6 border"
                style={{
                  borderColor: `${SEVERITY_COLORS[result.severity]}33`,
                  background: `${SEVERITY_COLORS[result.severity]}0a`,
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-xs uppercase tracking-wider mb-1" style={{ color: SEVERITY_COLORS[result.severity] }}>
                      {result.severity} injury · {result.confidence} confidence
                    </div>
                    <h2 className="text-xl font-bold text-white">{result.likelyInjury}</h2>
                  </div>
                  <div
                    className="text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: `${SEVERITY_COLORS[result.severity]}22`, color: SEVERITY_COLORS[result.severity] }}
                  >
                    {result.severity.toUpperCase()}
                  </div>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed">{result.explanation}</p>
              </div>

              {/* Immediate steps */}
              <div className="bg-[#111] border border-[#1f1f1f] rounded-2xl p-5">
                <h3 className="font-semibold text-sm mb-3 text-amber-400">⚡ Do this now</h3>
                <ul className="space-y-2">
                  {result.immediateSteps.map((s, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-gray-300">
                      <span className="text-amber-500 font-bold mt-0.5 flex-shrink-0">{i + 1}.</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recovery tips */}
              <div className="bg-[#111] border border-[#1f1f1f] rounded-2xl p-5">
                <h3 className="font-semibold text-sm mb-3 text-violet-400">🔄 Recovery tips</h3>
                <ul className="space-y-2">
                  {result.recoveryTips.map((t, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-gray-300">
                      <span className="text-violet-500 mt-0.5 flex-shrink-0">•</span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>

              {/* See a doctor */}
              <div className="bg-red-950/20 border border-red-900/40 rounded-2xl p-5">
                <h3 className="font-semibold text-sm mb-2 text-red-400">🚨 See a doctor if…</h3>
                <p className="text-sm text-gray-300">{result.seeDoctor}</p>
              </div>

              {/* Disclaimer */}
              <p className="text-xs text-gray-600 text-center px-4">{result.disclaimer}</p>

              <button
                onClick={reset}
                className="w-full border border-[#1f1f1f] hover:border-[#333] transition-colors text-gray-400 font-medium py-3 rounded-xl text-sm"
              >
                Start new assessment
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
