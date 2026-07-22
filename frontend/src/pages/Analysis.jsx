import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Loader2, Info, AlertTriangle } from 'lucide-react'
import ScoreBadge from '../components/ScoreBadge.jsx'
import ResumeAnnotated from '../components/ResumeAnnotated.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { analyzeResume, streamSSE } from '../lib/api.js'

export default function Analysis() {
  const location = useLocation()
  const file = location.state?.file
  const fileName = location.state?.fileName || file?.name
  const { token, user } = useAuth()

  const [stages, setStages] = useState([])
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const started = useRef(false)

  useEffect(() => {
    if (!file || started.current) return
    started.current = true

    async function run() {
      try {
        const res = await analyzeResume(file, token)
        for await (const { event, data } of streamSSE(res)) {
          if (event === 'stage') {
            setStages((prev) => [...prev, data.message])
          } else if (event === 'result') {
            setResult(data)
          } else if (event === 'error') {
            setError(data.error || 'Something went wrong while analyzing your resume.')
          }
        }
      } catch (err) {
        setError(err.message || 'Could not reach the analysis service.')
      }
    }
    run()
  }, [file, token])

  if (!fileName) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-24 text-center">
        <p className="text-ink-soft">Upload a resume first to see your analysis.</p>
        <Link to="/" className="mt-4 inline-block font-medium text-pen underline underline-offset-4">
          Go to upload
        </Link>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      {!user && (
        <div className="mb-8 flex items-start gap-2 rounded-md border border-marker/40 bg-marker/10 px-4 py-3 text-sm text-ink-soft">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-ink-soft" />
          <p>
            You're analyzing as a guest — this result won't be saved.{' '}
            <Link to="/login" className="font-medium text-pen underline underline-offset-4">
              Log in
            </Link>{' '}
            to keep a history and unlock internship recommendations.
          </p>
        </div>
      )}

      <p className="font-mono text-xs uppercase tracking-widest text-pen">Analyzing</p>
      <h1 className="mt-2 font-display text-2xl text-ink">{fileName}</h1>

      {/* Streaming status */}
      <div className="mt-6 space-y-2">
        {stages.map((stage, i) => {
          const active = i === stages.length - 1 && !result && !error
          return (
            <div key={`${stage}-${i}`} className="flex items-center gap-2 text-sm">
              {active ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-pen" />
              ) : (
                <span className="h-1.5 w-1.5 rounded-full bg-sage" />
              )}
              <span className={active ? 'text-ink' : 'text-ink-soft'}>{stage}</span>
            </div>
          )
        })}
      </div>

      {error && (
        <div className="mt-6 flex items-center gap-2 text-sm text-pen">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {result && (
        <div className="mt-12 space-y-12">
          {/* Overall + ATS breakdown */}
          <section className="grid gap-8 sm:grid-cols-[auto_1fr] sm:items-center">
            <ScoreBadge score={result.overallScore} label="Overall resume score" />
            <div className="grid grid-cols-2 gap-4">
              {result.atsBreakdown.map((c) => (
                <div key={c.label} className="rounded-md border border-paper-line bg-white px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-ink-soft">{c.label}</p>
                  <p className="font-mono text-xl font-semibold text-ink">{c.score}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Strengths / weaknesses */}
          <section className="grid gap-6 sm:grid-cols-2">
            <div>
              <h2 className="font-display text-lg text-sage">Strengths</h2>
              <ul className="mt-3 space-y-2 text-sm text-ink-soft">
                {result.strengths.map((s) => (
                  <li key={s} className="flex gap-2">
                    <span className="text-sage">✓</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="font-display text-lg text-pen">Weaknesses</h2>
              <ul className="mt-3 space-y-2 text-sm text-ink-soft">
                {result.weaknesses.map((w) => (
                  <li key={w} className="flex gap-2">
                    <span className="text-pen">✗</span>
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Signature element: line-by-line mark-up */}
          <section>
            <h2 className="font-display text-lg text-ink">Line-by-line mark-up</h2>
            <p className="mt-1 text-sm text-ink-soft">
              Exactly what a recruiter's red pen would leave on your resume.
            </p>
            <div className="mt-4">
              <ResumeAnnotated annotations={result.annotations} />
            </div>
          </section>

          {user && (
            <p className="text-sm text-ink-soft">
              Saved to your{' '}
              <Link to="/history" className="font-medium text-pen underline underline-offset-4">
                history
              </Link>
              .
            </p>
          )}
        </div>
      )}
    </main>
  )
}
