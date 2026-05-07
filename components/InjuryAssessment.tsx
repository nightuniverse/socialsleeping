'use client'

import { useState } from 'react'
import {
  BodyPart, InjuryAssessmentResult, InjurySymptoms, SportType,
  ReferralType, ReferralUrgency,
} from '@/lib/types'

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
  { value: 'today', label: 'Came on gradually today' },
  { value: 'days', label: 'A few days ago' },
  { value: 'weeks', label: 'Building up over weeks' },
  { value: 'chronic', label: 'Long-term / recurring' },
]
const TRIGGER_OPTIONS = [
  'Movement / exercise', 'Pressing on it', 'Specific positions',
  'At rest / night', 'Lifting / loading', 'Twisting motions', 'Running / impact',
]
const SEVERITY_LABELS: Record<number, string> = {
  1: 'Barely noticeable', 2: 'Mild', 3: 'Noticeable', 4: 'Uncomfortable',
  5: 'Moderate', 6: 'Distracting', 7: 'Significant', 8: 'Severe',
  9: 'Very severe', 10: 'Unbearable',
}

const SEVERITY_COLORS = { minor: '#22c55e', moderate: '#f59e0b', severe: '#ef4444' }

const REFERRAL_LABELS: Record<ReferralType, { label: string; icon: string }> = {
  emergency_room: { label: 'Emergency Room', icon: '🚨' },
  orthopedic: { label: 'Orthopedic Surgeon', icon: '🦴' },
  sports_medicine: { label: 'Sports Medicine Clinic', icon: '🏥' },
}
const URGENCY_LABELS: Record<ReferralUrgency, { label: string; color: string }> = {
  go_now: { label: 'Go now', color: '#ef4444' },
  within_24h: { label: 'Within 24 hours', color: '#f97316' },
  this_week: { label: 'This week', color: '#f59e0b' },
  when_convenient: { label: 'When convenient', color: '#22c55e' },
}

type Step = 'bodypart' | 'pain' | 'onset' | 'triggers' | 'severity' | 'notes' | 'result'
type ResultTab = 'phases' | 'stretches' | 'massage' | 'training' | 'return'

export default function InjuryAssessment({ userSports = [] }: { userSports?: SportType[] }) {
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
  const [activeTab, setActiveTab] = useState<ResultTab>('phases')
  const [locating, setLocating] = useState(false)

  function togglePainType(t: string) {
    setPainTypes(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t])
  }
  function toggleTrigger(t: string) {
    setTriggers(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t])
  }
  function reset() {
    setStep('bodypart'); setBodyPart(null); setPainTypes([]); setOnset('')
    setTriggers([]); setSeverity(5); setNotes(''); setResult(null); setError('')
    setActiveTab('phases')
  }

  async function handleSubmit() {
    if (!bodyPart) return
    setLoading(true); setError(''); setStep('result')
    try {
      const symptoms: InjurySymptoms = { bodyPart, painTypes, onset, triggers, severity, notes, sports: userSports }
      const res = await fetch('/api/injury', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(symptoms),
      })
      if (!res.ok) throw new Error()
      setResult(await res.json())
    } catch {
      setError('Assessment failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function openHospitalFinder(searchQuery: string) {
    setLocating(true)
    const query = encodeURIComponent(searchQuery || 'sports medicine clinic')
    if (!navigator.geolocation) {
      window.open(`https://www.google.com/maps/search/${query}`, '_blank')
      setLocating(false)
      return
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const url = `https://www.google.com/maps/search/${query}/@${coords.latitude},${coords.longitude},14z`
        window.open(url, '_blank')
        setLocating(false)
      },
      () => {
        window.open(`https://www.google.com/maps/search/${query}`, '_blank')
        setLocating(false)
      },
      { timeout: 6000 }
    )
  }

  const progressSteps: Step[] = ['bodypart', 'pain', 'onset', 'triggers', 'severity', 'notes']
  const progressIndex = progressSteps.indexOf(step)
  const sevColor = result ? SEVERITY_COLORS[result.severity] : '#8b5cf6'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Injury Assessment</h1>
        <p className="text-gray-500 text-sm">Describe your symptoms — get a personalised treatment protocol.</p>
      </div>

      {step !== 'result' && (
        <div className="flex gap-1">
          {progressSteps.map((s, i) => (
            <div key={s} className="flex-1 h-1 rounded-full transition-all"
              style={{ background: i <= progressIndex ? '#8b5cf6' : '#1f1f1f' }} />
          ))}
        </div>
      )}

      {/* ── Step 1: Body Part ── */}
      {step === 'bodypart' && (
        <div className="bg-[#111] border border-[#1f1f1f] rounded-2xl p-6">
          <h2 className="font-semibold mb-4">Where does it hurt?</h2>
          <div className="grid grid-cols-2 gap-2">
            {BODY_PARTS.map(({ key, label, emoji }) => (
              <button key={key} onClick={() => { setBodyPart(key); setStep('pain') }}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium transition-all text-left ${
                  bodyPart === key ? 'bg-violet-600/20 border-violet-500 text-violet-300'
                    : 'bg-[#0a0a0a] border-[#1f1f1f] text-gray-300 hover:border-[#333]'}`}>
                <span className="text-xl">{emoji}</span><span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Step 2: Pain Type ── */}
      {step === 'pain' && (
        <div className="bg-[#111] border border-[#1f1f1f] rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{BODY_PARTS.find(b => b.key === bodyPart)?.emoji}</span>
            <h2 className="font-semibold">What does the pain feel like?</h2>
          </div>
          <p className="text-xs text-gray-500 mb-4">Select all that apply</p>
          <div className="flex flex-wrap gap-2 mb-6">
            {PAIN_TYPES.map(t => (
              <button key={t} onClick={() => togglePainType(t)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                  painTypes.includes(t) ? 'bg-violet-600/20 border-violet-500 text-violet-300'
                    : 'bg-[#0a0a0a] border-[#1f1f1f] text-gray-400 hover:border-[#333]'}`}>
                {t}
              </button>
            ))}
          </div>
          <button onClick={() => setStep('onset')} disabled={painTypes.length === 0}
            className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-white font-semibold py-2.5 rounded-xl text-sm">
            Next →
          </button>
        </div>
      )}

      {/* ── Step 3: Onset ── */}
      {step === 'onset' && (
        <div className="bg-[#111] border border-[#1f1f1f] rounded-2xl p-6">
          <h2 className="font-semibold mb-4">When did it start?</h2>
          <div className="space-y-2">
            {ONSET_OPTIONS.map(o => (
              <button key={o.value} onClick={() => { setOnset(o.value); setStep('triggers') }}
                className="w-full flex items-center px-4 py-3 rounded-xl border text-sm text-left transition-all bg-[#0a0a0a] border-[#1f1f1f] text-gray-300 hover:border-violet-600 hover:text-violet-300">
                {o.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Step 4: Triggers ── */}
      {step === 'triggers' && (
        <div className="bg-[#111] border border-[#1f1f1f] rounded-2xl p-6">
          <h2 className="font-semibold mb-1">What makes it worse?</h2>
          <p className="text-xs text-gray-500 mb-4">Select all that apply</p>
          <div className="flex flex-wrap gap-2 mb-6">
            {TRIGGER_OPTIONS.map(t => (
              <button key={t} onClick={() => toggleTrigger(t)}
                className={`px-3 py-2 rounded-full text-sm font-medium border transition-all ${
                  triggers.includes(t) ? 'bg-violet-600/20 border-violet-500 text-violet-300'
                    : 'bg-[#0a0a0a] border-[#1f1f1f] text-gray-400 hover:border-[#333]'}`}>
                {t}
              </button>
            ))}
          </div>
          <button onClick={() => setStep('severity')}
            className="w-full bg-violet-600 hover:bg-violet-500 transition-colors text-white font-semibold py-2.5 rounded-xl text-sm">
            Next →
          </button>
        </div>
      )}

      {/* ── Step 5: Severity ── */}
      {step === 'severity' && (
        <div className="bg-[#111] border border-[#1f1f1f] rounded-2xl p-6">
          <h2 className="font-semibold mb-4">How severe is it right now?</h2>
          <div className="text-center mb-6">
            <div className="text-6xl font-black tabular-nums mb-1"
              style={{ color: severity <= 3 ? '#22c55e' : severity <= 6 ? '#f59e0b' : '#ef4444' }}>
              {severity}
            </div>
            <div className="text-sm text-gray-400">{SEVERITY_LABELS[severity]}</div>
          </div>
          <input type="range" min={1} max={10} value={severity}
            onChange={e => setSeverity(parseInt(e.target.value))}
            className="w-full accent-violet-500 mb-2" />
          <div className="flex justify-between text-xs text-gray-600 mb-6">
            <span>1 — No pain</span><span>10 — Unbearable</span>
          </div>
          <button onClick={() => setStep('notes')}
            className="w-full bg-violet-600 hover:bg-violet-500 transition-colors text-white font-semibold py-2.5 rounded-xl text-sm">
            Next →
          </button>
        </div>
      )}

      {/* ── Step 6: Notes ── */}
      {step === 'notes' && (
        <div className="bg-[#111] border border-[#1f1f1f] rounded-2xl p-6">
          <h2 className="font-semibold mb-1">Anything else?</h2>
          <p className="text-xs text-gray-500 mb-4">Optional — specific movements, history, sounds (pop/click), swelling</p>
          <textarea value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="e.g. Heard a pop when I landed, immediate swelling, happened during a jump shot..."
            className="w-full bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-600 transition-colors resize-none text-gray-300 placeholder-gray-600 mb-4"
            rows={4} />
          <button onClick={handleSubmit}
            className="w-full bg-violet-600 hover:bg-violet-500 transition-colors text-white font-semibold py-3 rounded-xl">
            Get my treatment plan →
          </button>
        </div>
      )}

      {/* ── Result ── */}
      {step === 'result' && (
        <div className="space-y-4">
          {loading && (
            <div className="bg-[#111] border border-[#1f1f1f] rounded-2xl p-12 text-center">
              <div className="text-3xl mb-3 animate-pulse">🔬</div>
              <p className="text-gray-400 text-sm font-medium">Building your treatment protocol…</p>
              <p className="text-gray-600 text-xs mt-1">Analysing symptoms against injury database</p>
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
              {/* ── Diagnosis header ── */}
              <div className="rounded-2xl p-5 border"
                style={{ borderColor: `${sevColor}33`, background: `${sevColor}08` }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs uppercase tracking-wider font-semibold"
                        style={{ color: sevColor }}>{result.severity}</span>
                      <span className="text-gray-600 text-xs">·</span>
                      <span className="text-xs text-gray-500">{result.confidence} confidence</span>
                    </div>
                    <h2 className="text-xl font-bold text-white">{result.likelyInjury}</h2>
                    {result.sportNote && (
                      <p className="text-xs text-violet-400 mt-1">{result.sportNote}</p>
                    )}
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0"
                    style={{ background: `${sevColor}22`, color: sevColor }}>
                    {result.treatmentPath === 'self_treat' ? '🏠 Self-treat' : '🏥 See doctor'}
                  </span>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed mt-3">{result.explanation}</p>
              </div>

              {/* ══ SELF-TREAT PATH ══ */}
              {result.treatmentPath === 'self_treat' && (
                <>
                  {/* Tab bar */}
                  <div className="flex gap-1 bg-[#111] border border-[#1f1f1f] rounded-2xl p-1.5">
                    {([
                      { key: 'phases', label: '📋 Protocol' },
                      { key: 'stretches', label: '🧘 Stretches' },
                      { key: 'massage', label: '💆 Massage' },
                      { key: 'training', label: '🏋️ Training' },
                    ] as { key: ResultTab; label: string }[]).map(t => (
                      <button key={t.key} onClick={() => setActiveTab(t.key)}
                        className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${
                          activeTab === t.key
                            ? 'bg-violet-600 text-white'
                            : 'text-gray-500 hover:text-gray-300'}`}>
                        {t.label}
                      </button>
                    ))}
                  </div>

                  {/* Protocol tab */}
                  {activeTab === 'phases' && result.phases && (
                    <div className="space-y-3">
                      {result.phases.map((phase, i) => (
                        <div key={i} className="bg-[#111] border border-[#1f1f1f] rounded-2xl p-5">
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-semibold text-sm text-white">{phase.name}</span>
                            <span className="text-xs text-violet-400 bg-violet-900/30 px-2.5 py-1 rounded-full">
                              {phase.duration}
                            </span>
                          </div>
                          <ul className="space-y-2">
                            {phase.steps.map((s, j) => (
                              <li key={j} className="flex items-start gap-2.5 text-sm text-gray-300">
                                <span className="w-5 h-5 rounded-full bg-violet-900/40 text-violet-400 text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                                  {j + 1}
                                </span>
                                {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}

                      {/* Return to sport */}
                      {result.returnToSport && result.returnToSport.length > 0 && (
                        <div className="bg-green-950/20 border border-green-900/40 rounded-2xl p-5">
                          <h3 className="font-semibold text-sm text-green-400 mb-3">✅ Return to sport when…</h3>
                          <ul className="space-y-2">
                            {result.returnToSport.map((c, i) => (
                              <li key={i} className="flex items-start gap-2.5 text-sm text-gray-300">
                                <span className="text-green-500 mt-0.5 flex-shrink-0">○</span>{c}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Stretches tab */}
                  {activeTab === 'stretches' && result.stretches && (
                    <div className="space-y-3">
                      {result.stretches.length === 0 && (
                        <p className="text-gray-500 text-sm text-center py-6">No specific stretches for acute phase — check back in Protocol.</p>
                      )}
                      {result.stretches.map((s, i) => (
                        <div key={i} className="bg-[#111] border border-[#1f1f1f] rounded-2xl p-5">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-sm text-white">{s.name}</span>
                            <span className="text-xs text-amber-400 bg-amber-900/20 px-2.5 py-1 rounded-full">{s.sets}</span>
                          </div>
                          <p className="text-sm text-gray-300 leading-relaxed">{s.technique}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Massage tab */}
                  {activeTab === 'massage' && result.massageTechniques && (
                    <div className="space-y-3">
                      {result.massageTechniques.length === 0 && (
                        <p className="text-gray-500 text-sm text-center py-6">No massage recommended in acute phase — return after 48-72 hours.</p>
                      )}
                      {result.massageTechniques.map((m, i) => (
                        <div key={i} className="bg-[#111] border border-[#1f1f1f] rounded-2xl p-5">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-sm text-white">{m.name}</span>
                            <span className="text-xs text-violet-400 bg-violet-900/20 px-2.5 py-1 rounded-full">{m.duration}</span>
                          </div>
                          <p className="text-sm text-gray-300 leading-relaxed">{m.technique}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Training mods tab */}
                  {activeTab === 'training' && (
                    <div className="space-y-3">
                      {result.trainingModifications && result.trainingModifications.length > 0 && (
                        <div className="bg-[#111] border border-[#1f1f1f] rounded-2xl p-5">
                          <h3 className="font-semibold text-sm text-amber-400 mb-3">🔄 Training swaps</h3>
                          <ul className="space-y-2">
                            {result.trainingModifications.map((m, i) => (
                              <li key={i} className="flex items-start gap-2.5 text-sm text-gray-300">
                                <span className="text-amber-500 mt-0.5 flex-shrink-0">→</span>{m}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {result.prevention && result.prevention.length > 0 && (
                        <div className="bg-[#111] border border-[#1f1f1f] rounded-2xl p-5">
                          <h3 className="font-semibold text-sm text-violet-400 mb-3">🛡 Prevent recurrence</h3>
                          <ul className="space-y-2">
                            {result.prevention.map((p, i) => (
                              <li key={i} className="flex items-start gap-2.5 text-sm text-gray-300">
                                <span className="text-violet-500 mt-0.5 flex-shrink-0">•</span>{p}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* ══ SEE DOCTOR PATH ══ */}
              {result.treatmentPath === 'see_doctor' && result.referralType && result.referralUrgency && (
                <div className="space-y-4">
                  {/* Referral card */}
                  <div className="bg-[#111] border border-[#1f1f1f] rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{REFERRAL_LABELS[result.referralType].icon}</span>
                        <div>
                          <div className="font-semibold text-white text-sm">
                            {REFERRAL_LABELS[result.referralType].label}
                          </div>
                          <div className="text-xs font-semibold mt-0.5"
                            style={{ color: URGENCY_LABELS[result.referralUrgency].color }}>
                            {URGENCY_LABELS[result.referralUrgency].label}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Hospital finder button */}
                    <button
                      onClick={() => openHospitalFinder(result.referralSearchQuery ?? 'sports medicine clinic')}
                      disabled={locating}
                      className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-semibold text-sm transition-all text-white"
                      style={{ background: 'linear-gradient(135deg, #6d28d9, #8b5cf6)' }}
                    >
                      {locating ? (
                        <><span className="animate-pulse">📍</span> Finding your location…</>
                      ) : (
                        <><span>📍</span> Find clinics near me</>
                      )}
                    </button>
                    <p className="text-center text-xs text-gray-600 mt-2">
                      Opens Google Maps · sorted by rating · near your location
                    </p>
                  </div>

                  {/* Immediate steps */}
                  {result.immediateSteps && result.immediateSteps.length > 0 && (
                    <div className="bg-red-950/20 border border-red-900/40 rounded-2xl p-5">
                      <h3 className="font-semibold text-sm text-red-400 mb-3">⚡ Do this right now</h3>
                      <ul className="space-y-2">
                        {result.immediateSteps.map((s, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-sm text-gray-300">
                            <span className="text-red-400 font-bold mt-0.5 flex-shrink-0">{i + 1}.</span>{s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* What to tell the doctor */}
                  {result.whatToTellDoctor && result.whatToTellDoctor.length > 0 && (
                    <div className="bg-[#111] border border-[#1f1f1f] rounded-2xl p-5">
                      <h3 className="font-semibold text-sm text-amber-400 mb-3">💬 Tell your doctor</h3>
                      <ul className="space-y-2">
                        {result.whatToTellDoctor.map((s, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-sm text-gray-300">
                            <span className="text-amber-500 mt-0.5 flex-shrink-0">→</span>{s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Prevention */}
                  {result.prevention && result.prevention.length > 0 && (
                    <div className="bg-[#111] border border-[#1f1f1f] rounded-2xl p-5">
                      <h3 className="font-semibold text-sm text-violet-400 mb-3">🛡 After recovery</h3>
                      <ul className="space-y-2">
                        {result.prevention.map((p, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-sm text-gray-300">
                            <span className="text-violet-500 mt-0.5 flex-shrink-0">•</span>{p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Disclaimer + reset */}
              <p className="text-xs text-gray-600 text-center px-4 leading-relaxed">{result.disclaimer}</p>
              <button onClick={reset}
                className="w-full border border-[#1f1f1f] hover:border-[#333] transition-colors text-gray-400 font-medium py-3 rounded-xl text-sm">
                Start new assessment
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
