import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await register(email, password, fullName)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message || 'Could not create your account.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="mx-auto max-w-sm px-6 py-20">
      <p className="font-mono text-xs uppercase tracking-widest text-pen">Get started</p>
      <h1 className="mt-2 font-display text-3xl text-ink">Create an account</h1>
      <p className="mt-2 text-sm text-ink-soft">
        Save your resume history and unlock the career chat and recommendations.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-ink-soft">
            Full name <span className="normal-case text-ink-soft/60">(optional)</span>
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1 w-full rounded-md border border-paper-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-pen"
            placeholder="Jane Doe"
          />
        </div>
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
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-paper-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-pen"
            placeholder="At least 8 characters"
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
          Create account
        </button>
      </form>

      <p className="mt-6 text-sm text-ink-soft">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-pen underline underline-offset-4">
          Log in
        </Link>
      </p>
    </main>
  )
}
