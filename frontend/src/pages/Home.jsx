import { Link } from 'react-router-dom'
import { ArrowRight, Target, Flame, BriefcaseBusiness, Sparkles, CheckCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

const FEATURES = [
  { icon: Target, title: 'Career Assessment', desc: 'Discover which careers align with your skills and interests.' },
  { icon: Flame, title: 'Personalized Roadmap', desc: 'Get a step-by-step learning plan built around your goals.' },
  { icon: BriefcaseBusiness, title: 'AI Resume Analyzer', desc: 'Upload your resume and get actionable, specific feedback.' },
  { icon: Sparkles, title: 'Mock Interviews', desc: 'Practice with an AI interviewer and get scored feedback.' },
]

const BENEFITS = [
  'Role-specific learning roadmaps',
  'AI-powered resume analysis',
  'Mock interviews with real feedback',
  'Career mentor chatbot',
  'Skill assessments with explanations',
  'Job application tracker',
]

export default function Home() {
  const { user } = useAuth()

  return (
    <main className="min-h-screen bg-[#fbfcff] text-slate-900">
      {/* Header */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6">
        <Link to="/" className="flex items-center gap-2.5 font-bold text-slate-900">
          <span className="grid size-9 place-items-center rounded-xl bg-[#172554] text-white">
            <Sparkles className="size-4" />
          </span>
          CareerPilot <span className="text-indigo-600">AI</span>
        </Link>
        <div className="flex items-center gap-5 text-sm">
          {user ? (
            <Link to="/dashboard" className="rounded-xl bg-[#172554] px-4 py-2.5 font-semibold text-white hover:bg-[#1e3a8a]">
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="font-semibold text-slate-600 hover:text-slate-900">Sign in</Link>
              <Link to="/register" className="rounded-xl bg-[#172554] px-4 py-2.5 font-semibold text-white hover:bg-[#1e3a8a]">
                Get started
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-5 py-28 text-center">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-indigo-600">
          Your career. Your roadmap. Your future.
        </p>
        <h1 className="mx-auto mt-5 max-w-3xl text-5xl font-semibold tracking-tight text-slate-950 sm:text-7xl">
          Make your next step{' '}
          <span className="text-indigo-600">clear.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-slate-500">
          CareerPilot helps students find direction, build the right skills, and get career-ready with a plan made just for them.
        </p>
        <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            to="/register"
            className="inline-flex items-center rounded-xl bg-[#172554] px-6 py-3.5 text-sm font-semibold text-white hover:bg-[#1e3a8a]"
          >
            Build my roadmap <ArrowRight className="ml-2 size-4" />
          </Link>
          <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-slate-900">
            Already have an account? Sign in →
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="mb-4 grid size-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                <Icon className="size-5" />
              </div>
              <h3 className="font-semibold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="mx-auto max-w-3xl px-5 py-16 text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-slate-950">Everything you need to land your first job</h2>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 text-left">
          {BENEFITS.map((b) => (
            <div key={b} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3">
              <CheckCircle className="size-4 flex-shrink-0 text-indigo-500" />
              <span className="text-sm text-slate-700">{b}</span>
            </div>
          ))}
        </div>
        <Link
          to="/register"
          className="mt-10 inline-flex items-center rounded-xl bg-[#172554] px-6 py-3.5 text-sm font-semibold text-white hover:bg-[#1e3a8a]"
        >
          Start for free <ArrowRight className="ml-2 size-4" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} CareerPilot AI. All rights reserved.
      </footer>
    </main>
  )
}
