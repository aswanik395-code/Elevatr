import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { AlertTriangle, ArrowLeft, Compass, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../lib/api.js'
import ScoreBadge from '../components/ScoreBadge.jsx'
import ResumeAnnotated from '../components/ResumeAnnotated.jsx'
import RecommendationCard from '../components/RecommendationCard.jsx'

export default function ResumeDetail() {
  const { id } = useParams()
  const { token } = useAuth()

  const [resume, setResume] = useState(null)
  const [error, setError] = useState('')

  const [recommendations, setRecommendations] = useState(null)
  const [recLoading, setRecLoading] = useState(false)
  const [recError, setRecError] = useState('')

  useEffect(() => {
    let cancelled = false
    setResume(null)
    setRecommendations(null)
    api
      .getResume(id, token)
      .then((data) => {
        if (!cancelled) setResume(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Could not load this analysis.')
      })
    return () => {
      cancelled = true
    }
  }, [id, token])

  const loadRecommendations = async () => {
    setRecLoading(true)
    setRecError('')
    try {
      const data = await api.getRecommendations(id, token)
      setRecommendations(data)
    } catch (err) {
      setRecError(err.message || 'Could not generate recommendations right now.')
    } finally {
      setRecLoading(false)
    }
  }

  if (error) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-24 text-center">
        <p className="flex items-center justify-center gap-2 text-sm text-pen">
          <AlertTriangle className="h-4 w-4" />
          {error}
        </p>
        <Link to="/history" className="mt-4 inline-block font-medium text-pen underline underline-offset-4">
          Back to history
        </Link>
      </main>
    )
  }

  if (!resume) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-24 text-center text-sm text-ink-soft">
        <Loader2 className="mx-auto h-5 w-5 animate-spin" />
        <p className="mt-3">Loading analysis…</p>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Link
        to="/history"
        className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to history
      </Link>

      <p className="mt-6 font-mono text-xs uppercase tracking-widest text-pen">Analysis</p>
      <h1 className="mt-2 font-display text-2xl text-ink">{resume.filename}</h1>
      <p className="mt-1 text-xs text-ink-soft">
        Analyzed{' '}
        {new Date(resume.createdAt).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })}
      </p>

      <div className="mt-10 space-y-12">
        <section className="grid gap-8 sm:grid-cols-[auto_1fr] sm:items-center">
          <ScoreBadge score={resume.overallScore} label="Overall resume score" />
          <div className="grid grid-cols-2 gap-4">
            {resume.atsBreakdown.map((c) => (
              <div key={c.label} className="rounded-md border border-paper-line bg-white px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-ink-soft">{c.label}</p>
                <p className="font-mono text-xl font-semibold text-ink">{c.score}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 sm:grid-cols-2">
          <div>
            <h2 className="font-display text-lg text-sage">Strengths</h2>
            <ul className="mt-3 space-y-2 text-sm text-ink-soft">
              {resume.strengths.map((s) => (
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
              {resume.weaknesses.map((w) => (
                <li key={w} className="flex gap-2">
                  <span className="text-pen">✗</span>
                  {w}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section>
          <h2 className="font-display text-lg text-ink">Line-by-line mark-up</h2>
          <p className="mt-1 text-sm text-ink-soft">
            Exactly what a recruiter's red pen would leave on your resume.
          </p>
          <div className="mt-4">
            <ResumeAnnotated annotations={resume.annotations} />
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg text-ink">Internship recommendations</h2>
              <p className="mt-1 text-sm text-ink-soft">
                AI-generated role suggestions based on this analysis — illustrative examples,
                not live postings.
              </p>
            </div>
            {!recommendations && (
              <button
                onClick={loadRecommendations}
                disabled={recLoading}
                className="flex shrink-0 items-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper transition-colors hover:bg-ink/90 disabled:opacity-60"
              >
                {recLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Compass className="h-4 w-4" />
                )}
                {recLoading ? 'Generating…' : 'Get recommendations'}
              </button>
            )}
          </div>

          {recError && (
            <div className="mt-4 flex items-center gap-2 text-sm text-pen">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {recError}
            </div>
          )}

          {recommendations && (
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {recommendations.map((rec, i) => (
                <RecommendationCard key={i} rec={rec} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
