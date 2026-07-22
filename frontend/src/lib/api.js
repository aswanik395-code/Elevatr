// Central place for talking to the Elevatr backend.
// In local dev, set VITE_API_URL in .env (see .env.example) — defaults to
// localhost:8000. In production, the backend serves this frontend's built
// files itself, so requests can just go to the same origin (empty string
// base = relative URLs like "/api/...").
export const API_URL =
  import.meta.env.VITE_API_URL ?? (import.meta.env.PROD ? '' : 'http://localhost:8000')

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function parseErrorDetail(res) {
  try {
    const data = await res.json()
    if (typeof data.detail === 'string') return data.detail
    if (Array.isArray(data.detail)) {
      // FastAPI validation errors come back as a list of {msg, loc, ...}
      return data.detail.map((d) => d.msg).join(', ')
    }
    return res.statusText
  } catch {
    return res.statusText
  }
}

async function request(path, { method = 'GET', token, body } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...authHeaders(token),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) throw new Error(await parseErrorDetail(res))
  if (res.status === 204) return null
  return res.json()
}

export const api = {
  register: (email, password, fullName) =>
    request('/api/auth/register', {
      method: 'POST',
      body: { email, password, full_name: fullName || null },
    }),

  login: async (email, password) => {
    const form = new URLSearchParams()
    form.set('username', email)
    form.set('password', password)
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form,
    })
    if (!res.ok) throw new Error(await parseErrorDetail(res))
    return res.json() // { access_token, token_type }
  },

  me: (token) => request('/api/users/me', { token }),

  listResumes: (token) => request('/api/resumes', { token }),
  getResume: (id, token) => request(`/api/resumes/${id}`, { token }),
  getRecommendations: (id, token) => request(`/api/resumes/${id}/recommendations`, { token }),

  chatHistory: (token) => request('/api/chat/history', { token }),
}

// ---------------------------------------------------------------------------
// Server-Sent Events over fetch (used for /api/analyze-resume and
// /api/chat/send, both of which are POST requests — the native EventSource
// API only supports GET, so we parse the SSE wire format ourselves).
// ---------------------------------------------------------------------------
export async function* streamSSE(response) {
  if (!response.ok || !response.body) {
    throw new Error(await parseErrorDetail(response))
  }
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    let boundary
    while ((boundary = buffer.indexOf('\n\n')) !== -1) {
      const raw = buffer.slice(0, boundary)
      buffer = buffer.slice(boundary + 2)

      let event = 'message'
      let dataLines = []
      for (const line of raw.split('\n')) {
        if (line.startsWith('event:')) event = line.slice(6).trim()
        else if (line.startsWith('data:')) dataLines.push(line.slice(5).trim())
      }
      const dataStr = dataLines.join('\n')
      let data = {}
      if (dataStr) {
        try {
          data = JSON.parse(dataStr)
        } catch {
          data = { raw: dataStr }
        }
      }
      yield { event, data }
    }
  }
}

export function analyzeResume(file, token) {
  const form = new FormData()
  form.append('file', file)
  return fetch(`${API_URL}/api/analyze-resume`, {
    method: 'POST',
    headers: authHeaders(token), // optional — anonymous uploads still work
    body: form,
  })
}

export function sendChatMessage(message, token) {
  return fetch(`${API_URL}/api/chat/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify({ message }),
  })
}
