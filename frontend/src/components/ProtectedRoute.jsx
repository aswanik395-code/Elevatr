import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function ProtectedRoute({ children }) {
  const { token, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <main className="mx-auto max-w-md px-6 py-24 text-center text-sm text-ink-soft">
        Loading…
      </main>
    )
  }

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}
