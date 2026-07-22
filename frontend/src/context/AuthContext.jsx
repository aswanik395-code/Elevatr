import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { api } from '../lib/api.js'

const TOKEN_KEY = 'elevatr_token'
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }
    setLoading(true)
    api
      .me(token)
      .then((u) => {
        if (!cancelled) setUser(u)
      })
      .catch(() => {
        // Token expired or invalid — drop it silently.
        if (!cancelled) {
          localStorage.removeItem(TOKEN_KEY)
          setToken(null)
          setUser(null)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [token])

  const login = useCallback(async (email, password) => {
    const { access_token } = await api.login(email, password)
    localStorage.setItem(TOKEN_KEY, access_token)
    const me = await api.me(access_token)
    setToken(access_token)
    setUser(me)
    return me
  }, [])

  const register = useCallback(
    async (email, password, fullName) => {
      await api.register(email, password, fullName)
      return login(email, password)
    },
    [login],
  )

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ token, user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
