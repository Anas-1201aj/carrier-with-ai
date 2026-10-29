import { useState, useEffect, useRef } from 'react'
import { Brain, Send, CheckCircle, RotateCcw, Trophy, Star, AlertCircle } from 'lucide-react'
import { interviewApi } from '../api/index.js'
import AppLayout from '../layouts/AppLayout.jsx'
import { Button, Card, Badge, Alert, PageLoader, EmptyState, Select } from '../components/ui.jsx'

const TYPES = [
  { value: 'behavioral', label: 'Behavioral' },
  { value: 'technical', label: 'Technical' },
  { value: 'mixed', label: 'Mixed' },
]
const DIFFICULTIES = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
]

function ChatBubble({ msg }) {
  const isAI = msg.role === 'assistant'
  return (
    <div className={`flex ${isAI ? 'justify-start' : 'justify-end'} gap-3`}>
      {isAI && (
        <div className="grid size-8 flex-shrink-0 place-items-center rounded-xl bg-indigo-100 text-indigo-600 self-start mt-1">
          <Brain className="size-4" />
        </div>
      )}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
          isAI ? 'bg-white border border-slate-200 text-slate-700' : 'bg-indigo-600 text-white'
        }`}
      >
        {msg.content}
      </div>
    </div>
  )
}

function FeedbackCard({ feedback }) {
  return (
    <Card className="space-y-4 border-indigo-200 bg-indigo-50">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-indigo-900">Interview Feedback</h3>
        <Badge color="indigo">Score: {feedback.score}/100</Badge>
      </div>
      {feedback.overall && <p className="text-sm text-indigo-800">{feedback.overall}</p>}
      {feedback.strengths?.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide mb-2">Strengths</p>
          <ul className="space-y-1">
            {feedback.strengths.map((s, i) => <li key={i} className="flex gap-2 text-sm text-indigo-800"><Star className="size-3.5 mt-1 flex-shrink-0 text-amber-500" />{s}</li>)}
          </ul>
        </div>
      )}
      {feedback.improvements?.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide mb-2">Areas to improve</p>
          <ul className="space-y-1">
            {feedback.improvements.map((s, i) => <li key={i} className="flex gap-2 text-sm text-indigo-800"><AlertCircle className="size-3.5 mt-1 flex-shrink-0 text-amber-500" />{s}</li>)}
          </ul>
        </div>
      )}
    </Card>
  )
}

function InterviewSetup({ onStart, starting, error }) {
  const [role, setRole] = useState('Frontend Developer')
  const [type, setType] = useState('mixed')
  const [difficulty, setDifficulty] = useState('medium')

  return (
    <Card className="space-y-4">
      <h2 className="text-base font-semibold text-slate-900">Set up your interview</h2>
      <div>
        <label className="text-sm font-semibold text-slate-700 block mb-1.5">Target role</label>
        <input
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="e.g. Frontend Developer"
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Select label="Interview type" id="type" value={type} onChange={(e) => setType(e.target.value)} options={TYPES} />
        <Select label="Difficulty" id="diff" value={difficulty} onChange={(e) => setDifficulty(e.target.value)} options={DIFFICULTIES} />
      </div>
      {error && <Alert type="error">{error}</Alert>}
      <Button onClick={() => onStart({ role, interviewType: type, difficulty })} loading={starting} className="w-full">
        Start interview
      </Button>
    </Card>
  )
}

export default function MockInterview() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [phase, setPhase] = useState('home') // home | setup | chat | feedback
  const [interview, setInterview] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef()

  useEffect(() => {
    interviewApi.list().then(({ data }) => setHistory(data.interviews || [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function startInterview(opts) {
    setStarting(true)
    setError('')
    try {
      const { data } = await interviewApi.start(opts)
      setInterview(data.interview)
      setMessages(data.interview.messages || [])
      setPhase('chat')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start interview.')
    } finally {
      setStarting(false)
    }
  }

  async function sendMessage() {
    if (!input.trim() || sending) return
    const content = input.trim()
    setInput('')
    setSending(true)
    setMessages((m) => [...m, { role: 'user', content }])
    try {
      const { data } = await interviewApi.sendMessage(interview._id, content)
      setMessages((m) => [...m, { role: 'assistant', content: data.reply }])
    } catch {
      setMessages((m) => [...m, { role: 'assistant', content: 'Sorry, I had trouble responding. Please try again.' }])
    } finally {
      setSending(false)
    }
  }

  async function completeInterview() {
    setCompleting(true)
    try {
      const { data } = await interviewApi.complete(interview._id)
      setFeedback(data.feedback)
      setPhase('feedback')
      setHistory((h) => [{ ...interview, completed: true }, ...h])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete interview.')
    } finally {
      setCompleting(false)
    }
  }

  if (loading) return <AppLayout><PageLoader /></AppLayout>

  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">Mock Interview</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Practice Interviews</h1>
            <p className="mt-2 text-sm text-slate-500">Practice with an AI interviewer and get scored feedback on your responses.</p>
          </div>
          {phase !== 'home' && (
            <Button variant="secondary" size="sm" onClick={() => { setPhase('home'); setInterview(null); setMessages([]); setFeedback(null); setError('') }}>
              <RotateCcw className="size-3.5" /> New interview
            </Button>
          )}
        </div>

        {phase === 'home' && (
          <>
            <Button onClick={() => setPhase('setup')}>
              <Brain className="size-4" /> Start new interview
            </Button>
            {history.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Past interviews</h2>
                {history.slice(0, 5).map((iv) => (
                  <div key={iv._id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{iv.role}</p>
                      <p className="text-xs text-slate-400">{iv.interviewType} · {new Date(iv.createdAt).toLocaleDateString()}</p>
                    </div>
                    <Badge color={iv.completed ? 'green' : 'slate'}>{iv.completed ? 'Completed' : 'In progress'}</Badge>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {phase === 'setup' && (
          <InterviewSetup onStart={startInterview} starting={starting} error={error} />
        )}

        {phase === 'chat' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge color="indigo">{interview?.role} · {interview?.interviewType}</Badge>
              <Button size="sm" variant="secondary" onClick={completeInterview} loading={completing}>
                <CheckCircle className="size-3.5" /> Finish & get feedback
              </Button>
            </div>
            <div className="flex h-[500px] flex-col rounded-2xl border border-slate-200 bg-slate-50">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, i) => <ChatBubble key={i} msg={msg} />)}
                {sending && (
                  <div className="flex justify-start gap-3">
                    <div className="grid size-8 place-items-center rounded-xl bg-indigo-100"><Brain className="size-4 text-indigo-600" /></div>
                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                      <div className="flex gap-1"><span className="size-2 rounded-full bg-slate-300 animate-bounce" /><span className="size-2 rounded-full bg-slate-300 animate-bounce [animation-delay:.1s]" /><span className="size-2 rounded-full bg-slate-300 animate-bounce [animation-delay:.2s]" /></div>
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
                  placeholder="Type your answer…"
                  disabled={sending}
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                />
                <Button size="sm" onClick={sendMessage} disabled={!input.trim() || sending}>
                  <Send className="size-4" />
                </Button>
              </div>
            </div>
            {error && <Alert type="error">{error}</Alert>}
          </div>
        )}

        {phase === 'feedback' && feedback && (
          <div className="space-y-4">
            <FeedbackCard feedback={feedback} />
            <Button onClick={() => { setPhase('setup'); setMessages([]); setFeedback(null) }} variant="secondary" className="w-full">
              Practice again
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
