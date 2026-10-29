import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { Sparkles, Check } from 'lucide-react'
import { profileApi } from '../api/index.js'
import { Button, Alert } from '../components/ui.jsx'

const EDUCATION_LEVELS = ['High School', 'Undergraduate', 'Graduate', 'Bootcamp', 'Self-taught', 'Other']
const DEGREES = ['Computer Science', 'Information Systems', 'Software Engineering', 'Data Science', 'Design / UX', 'Business', 'Mathematics', 'Other']
const GRAD_YEARS = ['2024', '2025', '2026', '2027', '2028', '2029', '2030', 'Already graduated']
const EXPERIENCE_LEVELS = [
  { value: 'no-experience', label: 'No experience yet' },
  { value: 'some-projects', label: 'Some personal projects' },
  { value: 'internship', label: 'Internship or part-time' },
  { value: 'professional', label: 'Professional experience' },
]
const SKILLS = ['JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'Java', 'TypeScript', 'CSS/HTML', 'Git', 'Docker', 'AWS', 'Data Analysis']
const INTERESTS = ['Web Development', 'Mobile Apps', 'Data Science', 'AI/ML', 'DevOps', 'Cybersecurity', 'UX/Design', 'Product Management', 'Game Development', 'Blockchain']
const TARGET_ROLES = ['Frontend Developer', 'Backend Developer', 'Full-Stack Developer', 'Data Scientist', 'Data Analyst', 'DevOps Engineer', 'UX/UI Designer', 'Product Manager', 'ML Engineer', 'QA Engineer']
const WEEKLY_TIMES = [
  { value: 5, label: '< 5 hours/week' },
  { value: 10, label: '5–10 hours/week' },
  { value: 20, label: '10–20 hours/week' },
  { value: 40, label: '20+ hours/week' },
]

function MultiSelect({ options, value = [], onChange, limit }) {
  const toggle = (opt) => {
    if (value.includes(opt)) {
      onChange(value.filter((v) => v !== opt))
    } else if (!limit || value.length < limit) {
      onChange([...value, opt])
    }
  }
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const label = typeof opt === 'object' ? opt.label : opt
        const val = typeof opt === 'object' ? opt.value : opt
        const selected = value.includes(val)
        return (
          <button
            key={val}
            type="button"
            onClick={() => toggle(val)}
            className={`rounded-xl border px-3.5 py-2 text-sm transition ${
              selected
                ? 'border-indigo-400 bg-indigo-50 text-indigo-700 font-semibold'
                : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:bg-indigo-50/50'
            }`}
          >
            {selected && <Check className="mr-1 inline size-3.5 text-indigo-500" />}
            {label}
          </button>
        )
      })}
    </div>
  )
}

function SingleSelect({ options, value, onChange }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {options.map((opt) => {
        const label = typeof opt === 'object' ? opt.label : opt
        const val = typeof opt === 'object' ? opt.value : opt
        const selected = value === val
        return (
          <button
            key={val}
            type="button"
            onClick={() => onChange(val)}
            className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
              selected
                ? 'border-indigo-400 bg-indigo-50 text-indigo-700 font-semibold'
                : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-200'
            }`}
          >
            {selected && <Check className="mr-1.5 inline size-3.5 text-indigo-500" />}
            {label}
          </button>
        )
      })}
    </div>
  )
}

const STEPS = [
  { title: 'Your foundation', eyebrow: "Let's personalize your plan" },
  { title: 'Your strengths', eyebrow: 'Tell us about your skills' },
  { title: 'Your direction', eyebrow: 'Where do you want to go?' },
  { title: 'Your schedule', eyebrow: 'Set realistic expectations' },
]

export default function Onboarding() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Form state
  const [form, setForm] = useState({
    educationLevel: '',
    degree: '',
    graduationYear: '',
    experienceLevel: '',
    technicalSkills: [],
    interests: [],
    targetRoles: [],
    careerGoals: '',
    skillsToLearn: [],
    weeklyLearningTime: 10,
  })

  // Load existing profile on mount
  useEffect(() => {
    profileApi.get().then(({ data }) => {
      if (data.profile) {
        const p = data.profile
        setForm((f) => ({
          ...f,
          educationLevel: p.educationLevel || '',
          degree: p.degree || '',
          graduationYear: p.graduationYear || '',
          experienceLevel: p.experienceLevel || '',
          technicalSkills: p.technicalSkills || [],
          interests: p.interests || [],
          targetRoles: p.targetRoles || [],
          careerGoals: p.careerGoals || '',
          skillsToLearn: p.skillsToLearn || [],
          weeklyLearningTime: p.weeklyLearningTime || 10,
        }))
        // Resume to last saved step
        if (typeof p.onboardingStep === 'number' && p.onboardingStep > 0 && !p.onboardingComplete) {
          setStep(Math.min(p.onboardingStep, STEPS.length - 1))
        }
      }
    }).catch(() => {})
  }, [])

  const set = (field) => (val) => setForm((f) => ({ ...f, [field]: val }))

  async function saveStep(nextStep) {
    setSaving(true)
    setError('')
    try {
      await profileApi.update({ ...form, onboardingStep: nextStep })
      setStep(nextStep)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save progress.')
    } finally {
      setSaving(false)
    }
  }

  async function finish() {
    setSaving(true)
    setError('')
    try {
      await profileApi.update({ ...form, onboardingComplete: true, onboardingStep: STEPS.length })
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save profile.')
      setSaving(false)
    }
  }

  const canAdvance = [
    form.educationLevel && form.degree && form.graduationYear,
    form.technicalSkills.length > 0 && form.experienceLevel,
    form.targetRoles.length > 0,
    form.weeklyLearningTime,
  ][step]

  return (
    <main className="min-h-screen bg-[#fbfcff] text-slate-900">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-6">
        <Link to="/" className="flex items-center gap-2.5 font-bold">
          <span className="grid size-9 place-items-center rounded-xl bg-[#172554] text-white">
            <Sparkles className="size-4" />
          </span>
          CareerPilot <span className="text-indigo-600">AI</span>
        </Link>
        <span className="text-sm text-slate-500">Step {step + 1} of {STEPS.length}</span>
      </div>

      <div className="mx-auto max-w-xl px-5 pb-14">
        {/* Progress bar */}
        <div className="mb-10 flex gap-2">
          {STEPS.map((_, i) => (
            <div key={i} className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
              <div className={`h-full rounded-full bg-indigo-600 transition-all ${i < step ? 'w-full' : i === step ? 'w-3/4' : 'w-0'}`} />
            </div>
          ))}
        </div>

        <p className="text-xs font-bold uppercase tracking-[.18em] text-indigo-600">{STEPS[step].eyebrow}</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{STEPS[step].title}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">Choose the options that feel closest. You can refine these later.</p>

        <div className="mt-8 flex flex-col gap-6">
          {step === 0 && (
            <>
              <div>
                <p className="mb-2 text-sm font-semibold text-slate-700">Education level</p>
                <SingleSelect options={EDUCATION_LEVELS} value={form.educationLevel} onChange={set('educationLevel')} />
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold text-slate-700">Degree or field</p>
                <SingleSelect options={DEGREES} value={form.degree} onChange={set('degree')} />
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold text-slate-700">Expected graduation year</p>
                <SingleSelect options={GRAD_YEARS} value={form.graduationYear} onChange={set('graduationYear')} />
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div>
                <p className="mb-2 text-sm font-semibold text-slate-700">Your experience level</p>
                <SingleSelect options={EXPERIENCE_LEVELS} value={form.experienceLevel} onChange={set('experienceLevel')} />
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold text-slate-700">Technical skills you already have <span className="text-slate-400 font-normal">(select all that apply)</span></p>
                <MultiSelect options={SKILLS} value={form.technicalSkills} onChange={set('technicalSkills')} />
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold text-slate-700">Areas of interest</p>
                <MultiSelect options={INTERESTS} value={form.interests} onChange={set('interests')} />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <p className="mb-2 text-sm font-semibold text-slate-700">Target roles <span className="text-slate-400 font-normal">(up to 3)</span></p>
                <MultiSelect options={TARGET_ROLES} value={form.targetRoles} onChange={set('targetRoles')} limit={3} />
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold text-slate-700">Skills you want to learn</p>
                <MultiSelect options={SKILLS} value={form.skillsToLearn} onChange={set('skillsToLearn')} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Career goal (optional)</label>
                <textarea
                  value={form.careerGoals}
                  onChange={(e) => set('careerGoals')(e.target.value)}
                  placeholder="e.g. Land a junior frontend developer role at a product company within 12 months."
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 resize-none"
                />
              </div>
            </>
          )}

          {step === 3 && (
            <div>
              <p className="mb-2 text-sm font-semibold text-slate-700">How many hours per week can you dedicate to learning?</p>
              <SingleSelect options={WEEKLY_TIMES} value={form.weeklyLearningTime} onChange={set('weeklyLearningTime')} />
            </div>
          )}

          {error && <Alert type="error">{error}</Alert>}

          <div className="flex gap-3">
            {step > 0 && (
              <Button variant="secondary" onClick={() => setStep(step - 1)} disabled={saving}>
                Back
              </Button>
            )}
            {step < STEPS.length - 1 ? (
              <Button onClick={() => saveStep(step + 1)} loading={saving} disabled={!canAdvance} className="flex-1">
                Continue
              </Button>
            ) : (
              <Button onClick={finish} loading={saving} disabled={!canAdvance} className="flex-1">
                Finish my profile →
              </Button>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
