import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Loader2, AlertTriangle } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../lib/api.js'

function scoreColor(score) {
  if (score >= 80) return 'text-sage'
  if (score >= 60) return 'text-ink'
  return 'text-pen'
}

export default function History() {
  const { token } = useAuth()
  const [resumes, setResumes] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    api
      .listResumes(token)
      .then((data) => {
        if (!cancelled) setResumes(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Could not load your history.')
      })
    return () => {
      cancelled = true
    }
  }, [token])

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-widest text-pen">Your history</p>
      <h1 className="mt-2 font-display text-3xl text-ink">Past analyses</h1>
      <p className="mt-2 text-sm text-ink-soft">
        Every resume you've had graded while logged in, saved here for reference.
      </p>

      {error && (
        <div className="mt-8 flex items-center gap-2 text-sm text-pen">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {!resumes && !error && (
        <div className="mt-10 flex items-center gap-2 text-sm text-ink-soft">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading your history…
        </div>
      )}

      {resumes && resumes.length === 0 && (
        <div className="mt-10 rounded-lg border border-dashed border-paper-line bg-white/60 px-6 py-10 text-center">
          <p className="text-sm text-ink-soft">
            No analyses yet.{' '}
            <Link to="/" className="font-medium text-pen underline underline-offset-4">
              Upload a resume
            </Link>{' '}
            to get started.
          </p>
        </div>
      )}

      {resumes && resumes.length > 0 && (
        <ul className="mt-8 space-y-3">
          {resumes.map((r) => (
            <li key={r.id}>
              <Link
                to={`/resumes/${r.id}`}
                className="flex items-center justify-between rounded-md border border-paper-line bg-white px-4 py-3 transition-colors hover:border-ink-soft/40"
              >
                <span className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-ink-soft" />
                  <span className="text-sm text-ink">{r.filename}</span>
                </span>
                <span className="flex items-center gap-4">
                  <span className="text-xs text-ink-soft">
                    {new Date(r.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  <span className={`font-mono text-sm font-semibold ${scoreColor(r.overallScore)}`}>
                    {r.overallScore}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
