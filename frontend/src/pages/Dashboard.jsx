import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Target, Flame, BriefcaseBusiness, Check, ArrowRight, Map, FileText,
  Brain, MessageCircle, ClipboardList, FolderOpen, ChevronRight,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { profileApi, roadmapApi } from '../api/index.js'
import AppLayout from '../layouts/AppLayout.jsx'
import { Card, ProgressBar, Badge, PageLoader, EmptyState, Button } from '../components/ui.jsx'

function StatCard({ icon: Icon, label, value, sub, color = 'indigo' }) {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-600',
    amber: 'bg-amber-50 text-amber-600',
    green: 'bg-emerald-50 text-emerald-600',
  }
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500">{label}</span>
        <div className={`grid size-8 place-items-center rounded-lg text-xs ${colors[color]}`}>
          <Icon className="size-4" />
        </div>
      </div>
      <p className="mt-4 text-2xl font-semibold text-slate-950">{value ?? '—'}</p>
      {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
    </Card>
  )
}

function QuickAction({ to, icon: Icon, label, desc }) {
  return (
    <Link to={to} className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-indigo-200 hover:shadow-sm">
      <div className="grid size-10 flex-shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-100">
        <Icon className="size-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900">{label}</p>
        <p className="text-xs text-slate-500 truncate">{desc}</p>
      </div>
      <ChevronRight className="size-4 flex-shrink-0 text-slate-300 group-hover:text-indigo-400" />
    </Link>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [roadmap, setRoadmap] = useState(null)
  const [unread, setUnread] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    profileApi.get().then(({ data }) => {
      setProfile(data.profile)
      setRoadmap(data.roadmap)
      setUnread(data.unreadNotifications || 0)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const firstName = user?.name?.split(' ')[0] || 'there'

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  if (loading) {
    return <AppLayout><PageLoader /></AppLayout>
  }

  const readiness = profile?.readinessScore ?? 0
  const onboardingPct = profile?.onboardingComplete ? 100 : Math.round(((profile?.onboardingStep ?? 0) / 4) * 100)
  const roadmapPct = roadmap?.progressPercent ?? 0
  const streak = 0 // TODO: implement streak tracking
  const targetRoles = profile?.targetRoles || []
  const skills = profile?.technicalSkills || []

  // Upcoming milestones from roadmap
  const pendingMilestones = roadmap?.milestones?.filter((m) => !m.completed).slice(0, 3) || []
  const completedCount = roadmap?.milestones?.filter((m) => m.completed).length ?? 0

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">{today}</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
              {greeting}, {firstName}
            </h1>
          </div>
          {unread > 0 && (
            <Link to="/notifications">
              <Badge color="indigo">{unread} new</Badge>
            </Link>
          )}
        </div>

        {/* Onboarding prompt */}
        {!profile?.onboardingComplete && (
          <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <p className="font-semibold text-indigo-900">Complete your profile</p>
                <p className="mt-1 text-sm text-indigo-700">Finish setup to unlock your personalised roadmap and recommendations.</p>
                <div className="mt-3">
                  <ProgressBar value={onboardingPct} label="Profile complete" color="indigo" />
                </div>
              </div>
              <Link to="/onboarding">
                <Button size="sm">Continue →</Button>
              </Link>
            </div>
          </div>
        )}

        {/* Stat cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard icon={Target} label="Career Readiness" value={`${readiness}/100`} sub="Based on your profile & roadmap" color="indigo" />
          <StatCard icon={Flame} label="Learning Streak" value={streak > 0 ? `${streak} days` : 'Not started'} sub="Keep showing up every day" color="amber" />
          <StatCard icon={BriefcaseBusiness} label="Target Role" value={targetRoles[0] || 'Not set'} sub={targetRoles.length > 1 ? `+${targetRoles.length - 1} more` : 'Set in career assessment'} color="green" />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Roadmap */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Your Roadmap</h2>
                <Link to="/roadmap" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
                  View all →
                </Link>
              </div>
              {roadmap ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{roadmap.title}</p>
                    <div className="mt-2">
                      <ProgressBar value={roadmapPct} label={`${completedCount} of ${roadmap.milestones?.length ?? 0} milestones complete`} color="indigo" />
                    </div>
                  </div>
                  {pendingMilestones.length > 0 && (
                    <div className="space-y-2 mt-4">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Up next</p>
                      {pendingMilestones.map((m, i) => (
                        <div key={i} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                          <span className="grid size-7 place-items-center rounded-lg bg-indigo-100 text-xs font-bold text-indigo-700">{i + 1}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-800 truncate">{m.title}</p>
                            {m.estimatedDays && <p className="text-xs text-slate-400">{m.estimatedDays} days</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <EmptyState
                  icon={Map}
                  title="No roadmap yet"
                  description="Take the career assessment to generate your personalised learning plan."
                  action={
                    <Link to="/career-assessment">
                      <Button size="sm">Start assessment <ArrowRight className="size-3.5" /></Button>
                    </Link>
                  }
                />
              )}
            </Card>

            {/* Skills */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-slate-900">Your Skills</h2>
                <Link to="/profile" className="text-xs font-semibold text-indigo-600">Edit →</Link>
              </div>
              {skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {skills.map((s) => (
                    <Badge key={s} color="indigo">{s}</Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No skills added yet. Complete your profile to add skills.</p>
              )}
            </Card>
          </div>

          {/* Quick actions */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Quick actions</h2>
            <QuickAction to="/career-assessment" icon={Target} label="Career Assessment" desc="Discover your best-fit career paths" />
            <QuickAction to="/resume" icon={FileText} label="Resume Analyzer" desc="Get AI feedback on your resume" />
            <QuickAction to="/mock-interview" icon={Brain} label="Mock Interview" desc="Practice with an AI interviewer" />
            <QuickAction to="/mentor" icon={MessageCircle} label="AI Mentor" desc="Ask your career mentor anything" />
            <QuickAction to="/skill-assessment" icon={ClipboardList} label="Skill Practice" desc="Test yourself on key topics" />
            <QuickAction to="/projects" icon={FolderOpen} label="Projects" desc="Get project ideas for your portfolio" />
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
