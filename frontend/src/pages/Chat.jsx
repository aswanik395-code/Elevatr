import { useEffect, useRef, useState } from 'react'
import { AlertTriangle, Loader2, Send, Sparkles } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { api, sendChatMessage, streamSSE } from '../lib/api.js'

// The model sometimes replies with **bold** markdown. Rather than pull in a
// full markdown library for one feature, just parse **bold** spans inline.
function renderMarkdownLite(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={i}>{part.slice(2, -2)}</strong>
    }
    return <span key={i}>{part}</span>
  })
}

export default function Chat() {
  const { token } = useAuth()
  const [messages, setMessages] = useState(null) // null = still loading history
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    api
      .chatHistory(token)
      .then((history) => {
        if (!cancelled) {
          setMessages(
            history.map((m) => ({ role: m.role, content: m.content, id: m.id })),
          )
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || 'Could not load chat history.')
          setMessages([])
        }
      })
    return () => {
      cancelled = true
    }
  }, [token])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    const text = draft.trim()
    if (!text || sending) return

    setError('')
    setDraft('')
    setSending(true)

    // Optimistically show the user's message, plus an empty assistant
    // bubble we'll fill in as tokens stream.
    setMessages((prev) => [
      ...(prev || []),
      { role: 'user', content: text, id: `local-${Date.now()}` },
      { role: 'assistant', content: '', id: `stream-${Date.now()}` },
    ])

    try {
      const res = await sendChatMessage(text, token)
      for await (const { event, data } of streamSSE(res)) {
        if (event === 'token') {
          setMessages((prev) => {
            const next = [...prev]
            next[next.length - 1] = {
              ...next[next.length - 1],
              content: next[next.length - 1].content + data.text,
            }
            return next
          })
        } else if (event === 'error') {
          setError(data.error || 'The chat model had trouble replying.')
        }
        // 'done' needs no handling — the message is already fully rendered.
      }
    } catch (err) {
      setError(err.message || 'Could not reach the career chat right now.')
    } finally {
      setSending(false)
    }
  }

  return (
    <main className="mx-auto flex h-[calc(100vh-73px)] max-w-3xl flex-col px-6">
      <div className="pb-2 pt-8">
        <p className="font-mono text-xs uppercase tracking-widest text-pen">Career chat</p>
        <h1 className="mt-1 font-display text-2xl text-ink">Ask your career coach</h1>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto py-6">
        {messages === null && (
          <div className="flex items-center gap-2 text-sm text-ink-soft">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading conversation…
          </div>
        )}

        {messages?.length === 0 && (
          <div className="rounded-lg border border-dashed border-paper-line bg-white/60 px-6 py-10 text-center">
            <Sparkles className="mx-auto h-5 w-5 text-marker" />
            <p className="mt-3 text-sm text-ink-soft">
              Ask about interview prep, career pivots, resume strategy, or anything else on
              your mind.
            </p>
          </div>
        )}

        {messages?.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] whitespace-pre-wrap rounded-lg px-4 py-2.5 text-sm leading-6 ${
                m.role === 'user'
                  ? 'bg-ink text-paper'
                  : 'border border-paper-line bg-white text-ink'
              }`}
            >
              {m.content ? (
                renderMarkdownLite(m.content)
              ) : (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-ink-soft" />
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {error && (
        <div className="flex items-center gap-2 pb-2 text-sm text-pen">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-paper-line py-4">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type your question…"
          disabled={sending}
          className="flex-1 rounded-md border border-paper-line bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-pen disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={sending || !draft.trim()}
          className="flex items-center gap-2 rounded-md bg-ink px-4 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-ink/90 disabled:opacity-60"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </form>
    </main>
  )
}
