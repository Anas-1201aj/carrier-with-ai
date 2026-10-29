import { useState, useEffect, useRef } from 'react'
import { MessageCircle, Send, Plus, Trash2 } from 'lucide-react'
import { mentorApi } from '../api/index.js'
import AppLayout from '../layouts/AppLayout.jsx'
import { Button, Alert, PageLoader, EmptyState } from '../components/ui.jsx'

function ChatBubble({ msg }) {
  const isAI = msg.role === 'assistant'
  return (
    <div className={`flex ${isAI ? 'justify-start' : 'justify-end'} gap-3`}>
      {isAI && (
        <div className="grid size-8 flex-shrink-0 place-items-center rounded-xl bg-indigo-100 text-indigo-600 self-start mt-1 text-xs font-bold">
          AI
        </div>
      )}
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${isAI ? 'bg-white border border-slate-200 text-slate-700' : 'bg-indigo-600 text-white'}`}>
        {msg.content}
      </div>
    </div>
  )
}

export default function Mentor() {
  const [conversations, setConversations] = useState([])
  const [active, setActive] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef()

  useEffect(() => {
    mentorApi.list().then(({ data }) => setConversations(data.conversations || [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function openConversation(conv) {
    setActive(conv)
    try {
      const { data } = await mentorApi.get(conv._id)
      setMessages(data.conversation.messages || [])
    } catch { setMessages([]) }
  }

  async function startNew() {
    setCreating(true)
    setError('')
    try {
      const { data } = await mentorApi.start()
      setConversations((c) => [data.conversation, ...c])
      await openConversation(data.conversation)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start conversation.')
    } finally {
      setCreating(false)
    }
  }

  async function sendMessage() {
    if (!input.trim() || sending || !active) return
    const content = input.trim()
    setInput('')
    setSending(true)
    setMessages((m) => [...m, { role: 'user', content }])
    try {
      const { data } = await mentorApi.sendMessage(active._id, content)
      setMessages((m) => [...m, { role: 'assistant', content: data.reply }])
    } catch {
      setMessages((m) => [...m, { role: 'assistant', content: "I'm having trouble connecting right now. Please try again." }])
    } finally {
      setSending(false)
    }
  }

  if (loading) return <AppLayout><PageLoader /></AppLayout>

  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-10rem)] gap-4">
        {/* Sidebar */}
        <div className="hidden w-64 flex-shrink-0 flex-col gap-3 lg:flex">
          <Button onClick={startNew} loading={creating} size="sm">
            <Plus className="size-4" /> New conversation
          </Button>
          <div className="flex-1 overflow-y-auto space-y-1">
            {conversations.map((c) => (
              <button key={c._id} onClick={() => openConversation(c)}
                className={`w-full rounded-xl px-3 py-2.5 text-left text-sm transition ${active?._id === c._id ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}>
                <p className="truncate font-medium">{c.title}</p>
                <p className="text-xs text-slate-400">{new Date(c.updatedAt).toLocaleDateString()}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Chat */}
        <div className="flex flex-1 flex-col rounded-2xl border border-slate-200 bg-slate-50 min-w-0">
          {active ? (
            <>
              <div className="border-b border-slate-200 bg-white px-5 py-3 rounded-t-2xl">
                <p className="text-sm font-semibold text-slate-900">{active.title}</p>
                <p className="text-xs text-slate-400">Your personal AI career mentor</p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, i) => <ChatBubble key={i} msg={msg} />)}
                {sending && (
                  <div className="flex justify-start gap-3">
                    <div className="grid size-8 place-items-center rounded-xl bg-indigo-100 text-xs font-bold text-indigo-600">AI</div>
                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                      <div className="flex gap-1">
                        <span className="size-2 rounded-full bg-slate-300 animate-bounce" />
                        <span className="size-2 rounded-full bg-slate-300 animate-bounce [animation-delay:.1s]" />
                        <span className="size-2 rounded-full bg-slate-300 animate-bounce [animation-delay:.2s]" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
              <div className="border-t border-slate-200 bg-white p-3 flex gap-2 rounded-b-2xl">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                  placeholder="Ask your career mentor…"
                  disabled={sending}
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                />
                <Button size="sm" onClick={sendMessage} disabled={!input.trim() || sending}>
                  <Send className="size-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
              <div className="grid size-16 place-items-center rounded-2xl bg-indigo-50 text-indigo-400">
                <MessageCircle className="size-8" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">Your AI Career Mentor</p>
                <p className="mt-1 text-sm text-slate-500">Ask anything about careers, job search, interviews, or skills.</p>
              </div>
              <Button onClick={startNew} loading={creating}>
                <Plus className="size-4" /> Start a conversation
              </Button>
              {error && <Alert type="error">{error}</Alert>}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
