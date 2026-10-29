import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Target, ArrowRight, Check, RefreshCw, ChevronRight } from 'lucide-react'
import { assessmentApi, roadmapApi } from '../api/index.js'
import AppLayout from '../layouts/AppLayout.jsx'
import { Button, Badge, Card, Alert, PageLoader, EmptyState } from '../components/ui.jsx'

const QUESTIONS = [
  {
    id: 'educationLevel',
    label: 'What is your current education level?',
    type: 'single',
    options: ['High School', 'Undergraduate', 'Graduate', 'Bootcamp', 'Self-taught'],
  },
  {
    id: 'experienceLevel',
    label: 'How would you describe your professional experience?',
    type: 'single',
    options: [
      { value: 'no-experience', label: 'No experience yet' },
      { value: 'some-projects', label: 'Personal / academic projects only' },
      { value: 'internship', label: 'Internship or part-time work' },
      { value: 'professional', label: 'Professional full-time experience' },
    ],
  },
  {
    id: 'technicalSkills',
    label: 'Which technical skills do you already have? (select all that apply)',
    type: 'multi',
    options: ['JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'Java', 'TypeScript', 'CSS/HTML', 'Git', 'Docker', 'AWS', 'Machine Learning'],
  },
  {
    id: 'interests',
    label: 'What areas interest you most?',
    type: 'multi',
    options: ['Web Development', 'Mobile Apps', 'Data Science', 'AI/ML', 'DevOps', 'Cybersecurity', 'UX/Design', 'Product Management', 'Cloud Computing', 'Blockchain'],
  },
  {
    id: 'preferredWorkStyle',
    label: 'What is your preferred work style?',
    type: 'single',
    options: [
      { value: 'remote', label: 'Fully remote' },
      { value: 'hybrid', label: 'Hybrid' },
      { value: 'onsite', label: 'On-site' },
      { value: 'flexible', label: 'Flexible / no preference' },
    ],
  },
  {
    id: 'learningStyle',
    label: 'How do you learn best?',
    type: 'single',
    options: [
      { value: 'videos', label: 'Video courses & tutorials' },
      { value: 'reading', label: 'Reading documentation & articles' },
      { value: 'projects', label: 'Building hands-on projects' },
      { value: 'mentorship', label: 'Guided mentorship' },
    ],
  },
  {
    id: 'careerGoals',
    label: 'Describe your career goal in a sentence (optional)',
    type: 'text',
  },
]

function MatchBar({ pct }) {
  const color = pct >= 70 ? 'bg-emerald-500' : pct >= 50 ? 'bg-indigo-500' : 'bg-amber-400'
  return (
    <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100">
      <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
    </div>
  )
}

function Results({ assessment, onRetake, onGenerateRoadmap, generatingRoadmap }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Your Career Recommendations</h2>
          <p className="mt-1 text-sm text-slate-500">Based on your skills, interests, and goals.</p>
        </div>
        <Button variant="secondary" size="sm" onClick={onRetake}>
          <RefreshCw className="size-3.5" /> Retake
        </Button>
      </div>

      <div className="space-y-4">
        {assessment.recommendedPaths?.map((path, i) => (
          <Card key={i} className={`relative ${i === 0 ? 'border-indigo-300 ring-1 ring-indigo-200' : ''}`}>
            {i === 0 && (
              <span className="absolute right-4 top-4">
                <Badge color="indigo">Best match</Badge>
              </span>
            )}
            <div className="flex items-start gap-4 pr-24">
              <div className={`grid size-9 flex-shrink-0 place-items-center rounded-xl text-sm font-bold ${i === 0 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900">{path.title}</p>
                <p className="mt-1 text-sm text-slate-500">{path.description}</p>
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Match score</span>
                    <span className="font-semibold text-slate-700">{path.match}%</span>
                  </div>
                  <MatchBar pct={path.match} />
                </div>
                {path.skills?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {path.skills.slice(0, 6).map((s) => (
                      <Badge key={s} color="slate">{s}</Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {i === 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
                <Button size="sm" onClick={() => onGenerateRoadmap(path)} loading={generatingRoadmap}>
                  Generate my roadmap <ArrowRight className="size-3.5" />
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}

export default function CareerAssessment() {
  const [loading, setLoading] = useState(true)
  const [existing, setExisting] = useState(null)
  const [taking, setTaking] = useState(false)
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [generatingRoadmap, setGeneratingRoadmap] = useState(false)
  const [roadmapDone, setRoadmapDone] = useState(false)

  useEffect(() => {
    assessmentApi.get().then(({ data }) => {
      if (data.assessment) setExisting(data.assessment)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const q = QUESTIONS[step]

  const setAnswer = (val) => setAnswers((a) => ({ ...a, [q.id]: val }))

  const toggleMulti = (opt) => {
    const cur = answers[q.id] || []
    const val = typeof opt === 'object' ? opt.value : opt
    setAnswers((a) => ({
      ...a,
      [q.id]: cur.includes(val) ? cur.filter((v) => v !== val) : [...cur, val],
    }))
  }

  const canNext = () => {
    if (q.type === 'text') return true
    if (q.type === 'multi') return (answers[q.id] || []).length > 0
    return !!answers[q.id]
  }

  async function handleSubmit() {
    setSubmitting(true)
    setError('')
    try {
      const { data } = await assessmentApi.submit(answers)
      setExisting(data.assessment)
      setTaking(false)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit assessment.')
    } finally {
      setSubmitting(false)
    }
  }

  async function generateRoadmap(path) {
    setGeneratingRoadmap(true)
    try {
      await roadmapApi.generate(path.id || path.title?.toLowerCase().replace(/\s+/g, '-'))
      setRoadmapDone(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not generate roadmap. Please try from the Roadmap page.')
    } finally {
      setGeneratingRoadmap(false)
    }
  }

  if (loading) return <AppLayout><PageLoader /></AppLayout>

  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">Career Assessment</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Discover your path</h1>
          <p className="mt-2 text-sm text-slate-500">Answer a few questions and we'll recommend the best career paths for you.</p>
        </div>

        {roadmapDone && (
          <Alert type="success">
            Roadmap generated! <Link to="/roadmap" className="font-semibold underline">View your roadmap →</Link>
          </Alert>
        )}

        {error && <Alert type="error">{error}</Alert>}

        {!taking && existing ? (
          <Results
            assessment={existing}
            onRetake={() => { setTaking(true); setStep(0); setAnswers({}); setError('') }}
            onGenerateRoadmap={generateRoadmap}
            generatingRoadmap={generatingRoadmap}
          />
        ) : !taking ? (
          <Card>
            <EmptyState
              icon={Target}
              title="No assessment taken yet"
              description="The assessment takes about 3 minutes and will match you with the best career paths."
              action={<Button onClick={() => setTaking(true)}>Start assessment</Button>}
            />
          </Card>
        ) : (
          <Card>
            {/* Progress */}
            <div className="mb-6">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Question {step + 1} of {QUESTIONS.length}</span>
                <span>{Math.round(((step) / QUESTIONS.length) * 100)}% complete</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${(step / QUESTIONS.length) * 100}%` }} />
              </div>
            </div>

            <h2 className="text-lg font-semibold text-slate-900 mb-4">{q.label}</h2>

            {q.type === 'text' ? (
              <textarea
                value={answers[q.id] || ''}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your goal here… (optional)"
                rows={3}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 resize-none"
              />
            ) : q.type === 'multi' ? (
              <div className="flex flex-wrap gap-2">
                {q.options.map((opt) => {
                  const val = typeof opt === 'object' ? opt.value : opt
                  const label = typeof opt === 'object' ? opt.label : opt
                  const sel = (answers[q.id] || []).includes(val)
                  return (
                    <button key={val} type="button" onClick={() => toggleMulti(opt)}
                      className={`rounded-xl border px-3.5 py-2 text-sm transition ${sel ? 'border-indigo-400 bg-indigo-50 text-indigo-700 font-semibold' : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-200'}`}>
                      {sel && <Check className="mr-1.5 inline size-3.5" />}{label}
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {q.options.map((opt) => {
                  const val = typeof opt === 'object' ? opt.value : opt
                  const label = typeof opt === 'object' ? opt.label : opt
                  const sel = answers[q.id] === val
                  return (
                    <button key={val} type="button" onClick={() => setAnswer(val)}
                      className={`rounded-xl border px-4 py-3 text-left text-sm transition ${sel ? 'border-indigo-400 bg-indigo-50 text-indigo-700 font-semibold' : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-200'}`}>
                      {sel && <Check className="mr-1.5 inline size-3.5" />}{label}
                    </button>
                  )
                })}
              </div>
            )}

            <div className="mt-6 flex items-center justify-between">
              <Button variant="secondary" onClick={() => setStep(step - 1)} disabled={step === 0}>Back</Button>
              {step < QUESTIONS.length - 1 ? (
                <Button onClick={() => setStep(step + 1)} disabled={!canNext()}>
                  Next <ChevronRight className="size-3.5" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} loading={submitting}>
                  Submit & see results
                </Button>
              )}
            </div>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}
