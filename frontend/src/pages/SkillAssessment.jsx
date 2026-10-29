import { useState, useEffect } from 'react'
import { ClipboardList, Check, X, ChevronRight } from 'lucide-react'
import { skillApi } from '../api/index.js'
import AppLayout from '../layouts/AppLayout.jsx'
import { Button, Card, Badge, Alert, PageLoader, EmptyState, ProgressBar, Select } from '../components/ui.jsx'

const LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
]

function QuizView({ assessmentId, questions, skill, onComplete }) {
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState(Array(questions.length).fill(null))
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const q = questions[current]
  const selected = answers[current]

  const pick = (opt) => {
    const next = [...answers]
    next[current] = opt
    setAnswers(next)
  }

  async function submit() {
    setSubmitting(true)
    try {
      const { data } = await skillApi.submit(assessmentId, answers)
      onComplete(data)
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed.')
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <div className="mb-6">
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>Question {current + 1} of {questions.length}</span>
          <span>{answers.filter(Boolean).length} answered</span>
        </div>
        <ProgressBar value={current + 1} max={questions.length} />
      </div>
      <h2 className="text-lg font-semibold text-slate-900 mb-4">{q.question}</h2>
      <div className="space-y-2">
        {q.options.map((opt) => (
          <button key={opt} type="button" onClick={() => pick(opt)}
            className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition ${
              selected === opt ? 'border-indigo-400 bg-indigo-50 text-indigo-700 font-semibold' : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-200'
            }`}>
            {opt}
          </button>
        ))}
      </div>
      {error && <Alert type="error" className="mt-4">{error}</Alert>}
      <div className="mt-6 flex items-center justify-between">
        <Button variant="secondary" onClick={() => setCurrent(current - 1)} disabled={current === 0}>Back</Button>
        {current < questions.length - 1 ? (
          <Button onClick={() => setCurrent(current + 1)} disabled={!selected}>
            Next <ChevronRight className="size-3.5" />
          </Button>
        ) : (
          <Button onClick={submit} loading={submitting} disabled={answers.some((a) => !a)}>
            Submit answers
          </Button>
        )}
      </div>
    </Card>
  )
}

function ResultView({ result, skill, onRetry }) {
  return (
    <Card className="space-y-5">
      <div className="text-center py-4">
        <div className={`mx-auto mb-4 grid size-20 place-items-center rounded-full text-3xl font-bold ${result.passed ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
          {result.score}%
        </div>
        <h2 className="text-xl font-semibold text-slate-900">{result.passed ? '🎉 Passed!' : 'Keep practicing'}</h2>
        <p className="mt-1 text-sm text-slate-500">
          {result.correctAnswers} of {result.totalQuestions} correct · {skill} assessment
        </p>
      </div>
      <ProgressBar value={result.score} color={result.passed ? 'green' : 'amber'} />

      {result.questions?.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-700">Question review</h3>
          {result.questions.map((q, i) => (
            <div key={i} className={`rounded-xl border p-4 ${q.correct ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50'}`}>
              <div className="flex items-start gap-2">
                {q.correct ? <Check className="mt-0.5 size-4 flex-shrink-0 text-emerald-500" /> : <X className="mt-0.5 size-4 flex-shrink-0 text-rose-500" />}
                <div>
                  <p className="text-sm font-medium text-slate-800">{q.question}</p>
                  {!q.correct && (
                    <>
                      <p className="mt-1 text-xs text-rose-600">Your answer: {q.userAnswer || 'Not answered'}</p>
                      <p className="text-xs text-emerald-700">Correct: {q.correctAnswer}</p>
                    </>
                  )}
                  {q.explanation && <p className="mt-1 text-xs text-slate-500">{q.explanation}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Button onClick={onRetry} variant="secondary" className="w-full">Take another assessment</Button>
    </Card>
  )
}

export default function SkillAssessment() {
  const [skills, setSkills] = useState([])
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedSkill, setSelectedSkill] = useState('')
  const [selectedLevel, setSelectedLevel] = useState('beginner')
  const [starting, setStarting] = useState(false)
  const [phase, setPhase] = useState('select') // select | quiz | result
  const [activeId, setActiveId] = useState(null)
  const [questions, setQuestions] = useState([])
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      skillApi.getSkills().then(({ data }) => { setSkills(data.skills || []); setSelectedSkill(data.skills?.[0] || '') }),
      skillApi.list().then(({ data }) => setHistory(data.assessments || [])),
    ]).catch(() => {}).finally(() => setLoading(false))
  }, [])

  async function startAssessment() {
    setStarting(true)
    setError('')
    try {
      const { data } = await skillApi.start(selectedSkill, selectedLevel)
      setActiveId(data.assessmentId)
      setQuestions(data.questions)
      setPhase('quiz')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start assessment.')
    } finally {
      setStarting(false)
    }
  }

  function handleComplete(data) {
    setResult(data)
    setHistory((h) => [{ _id: activeId, skill: selectedSkill, score: data.score, passed: data.passed, createdAt: new Date() }, ...h])
    setPhase('result')
  }

  if (loading) return <AppLayout><PageLoader /></AppLayout>

  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">Skill Assessments</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Test Your Knowledge</h1>
          <p className="mt-2 text-sm text-slate-500">Take topic-based quizzes to identify strengths and gaps. Scores are calculated server-side.</p>
        </div>

        {error && <Alert type="error">{error}</Alert>}

        {phase === 'select' && (
          <Card className="space-y-4">
            <h2 className="text-base font-semibold text-slate-900">Start a new assessment</h2>
            <Select
              label="Topic"
              id="skill"
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              options={skills.map((s) => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))}
            />
            <Select
              label="Difficulty"
              id="level"
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              options={LEVELS}
            />
            <Button onClick={startAssessment} loading={starting} className="w-full">
              Start assessment
            </Button>
          </Card>
        )}

        {phase === 'quiz' && (
          <QuizView
            assessmentId={activeId}
            questions={questions}
            skill={selectedSkill}
            onComplete={handleComplete}
          />
        )}

        {phase === 'result' && result && (
          <ResultView
            result={result}
            skill={selectedSkill}
            onRetry={() => { setPhase('select'); setResult(null) }}
          />
        )}

        {/* History */}
        {history.length > 0 && phase === 'select' && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Assessment history</h2>
            {history.slice(0, 8).map((a) => (
              <div key={a._id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{a.skill}</p>
                  <p className="text-xs text-slate-400">{new Date(a.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge color={a.passed ? 'green' : 'amber'}>{a.score}%</Badge>
                  {a.passed ? <Check className="size-4 text-emerald-500" /> : <span className="text-xs text-amber-600">Needs work</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
