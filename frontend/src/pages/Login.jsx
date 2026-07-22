import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message || 'Could not log in. Check your email and password.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="mx-auto max-w-sm px-6 py-20">
      <p className="font-mono text-xs uppercase tracking-widest text-pen">Welcome back</p>
      <h1 className="mt-2 font-display text-3xl text-ink">Log in</h1>
      <p className="mt-2 text-sm text-ink-soft">
        Access your resume history, career chat, and internship recommendations.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-ink-soft">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border border-paper-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-pen"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-ink-soft">
            Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-paper-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-pen"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-pen">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-ink px-4 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-ink/90 disabled:opacity-60"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Log in
        </button>
      </form>

      <p className="mt-6 text-sm text-ink-soft">
        Don't have an account?{' '}
        <Link to="/register" className="font-medium text-pen underline underline-offset-4">
          Create one
        </Link>
      </p>
    </main>
  )
}
