import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Map, Check, RefreshCw, Lock, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react'
import { roadmapApi } from '../api/index.js'
import AppLayout from '../layouts/AppLayout.jsx'
import { Button, Card, Badge, Alert, ProgressBar, PageLoader, EmptyState } from '../components/ui.jsx'

function MilestoneCard({ milestone, index, onToggle, toggling }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className={`rounded-2xl border p-5 transition ${milestone.completed ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-white'}`}>
      <div className="flex items-start gap-4">
        <button
          onClick={() => onToggle(index)}
          disabled={toggling}
          className={`mt-0.5 grid size-7 flex-shrink-0 place-items-center rounded-lg border-2 transition ${
            milestone.completed
              ? 'border-emerald-500 bg-emerald-500 text-white'
              : 'border-slate-300 bg-white hover:border-indigo-400'
          }`}
        >
          {milestone.completed && <Check className="size-3.5" />}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={`font-semibold ${milestone.completed ? 'text-emerald-800 line-through' : 'text-slate-900'}`}>
              {milestone.title}
            </p>
            <div className="flex flex-shrink-0 items-center gap-2">
              {milestone.estimatedDays && (
                <Badge color={milestone.completed ? 'green' : 'slate'}>{milestone.estimatedDays}d</Badge>
              )}
              <button onClick={() => setExpanded(!expanded)} className="text-slate-400 hover:text-slate-600">
                {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
              </button>
            </div>
          </div>
          {milestone.description && (
            <p className="mt-1 text-sm text-slate-500">{milestone.description}</p>
          )}
          {expanded && milestone.skills?.length > 0 && (
            <div className="mt-3 space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Skills you'll gain</p>
              <div className="flex flex-wrap gap-1.5">
                {milestone.skills.map((s) => <Badge key={s} color="indigo">{s}</Badge>)}
              </div>
            </div>
          )}
          {expanded && milestone.resources?.length > 0 && (
            <div className="mt-3 space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Resources</p>
              {milestone.resources.map((r, i) => (
                <a
                  key={i}
                  href={r.url || `https://www.google.com/search?q=${encodeURIComponent(r.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-indigo-600 hover:underline"
                >
                  {r.title} <ArrowRight className="size-3" />
                </a>
              ))}
            </div>
          )}
          {milestone.completedAt && (
            <p className="mt-2 text-xs text-emerald-600">
              Completed {new Date(milestone.completedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Roadmap() {
  const [roadmap, setRoadmap] = useState(null)
  const [paths, setPaths] = useState([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [showPaths, setShowPaths] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      roadmapApi.get().then(({ data }) => setRoadmap(data.roadmap)),
      roadmapApi.getPaths().then(({ data }) => setPaths(data.paths || [])),
    ]).catch(() => {}).finally(() => setLoading(false))
  }, [])

  async function toggleMilestone(index) {
    setToggling(true)
    try {
      const { data } = await roadmapApi.toggleMilestone(index)
      setRoadmap(data.roadmap)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update milestone.')
    } finally {
      setToggling(false)
    }
  }

  async function generateRoadmap(pathId) {
    setGenerating(true)
    setError('')
    try {
      const { data } = await roadmapApi.generate(pathId)
      setRoadmap(data.roadmap)
      setShowPaths(false)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate roadmap.')
    } finally {
      setGenerating(false)
    }
  }

  if (loading) return <AppLayout><PageLoader /></AppLayout>

  const completed = roadmap?.milestones?.filter((m) => m.completed).length ?? 0
  const total = roadmap?.milestones?.length ?? 0

  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">Learning Roadmap</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              {roadmap ? roadmap.title : 'Your Roadmap'}
            </h1>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setShowPaths(!showPaths)}>
            <RefreshCw className="size-3.5" />
            {roadmap ? 'Change path' : 'Choose path'}
          </Button>
        </div>

        {error && <Alert type="error">{error}</Alert>}

        {showPaths && (
          <Card>
            <h2 className="text-base font-semibold text-slate-900 mb-4">Choose a career path</h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {paths.map((p) => (
                <button
                  key={p.id}
                  onClick={() => generateRoadmap(p.id)}
                  disabled={generating}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm hover:border-indigo-300 hover:bg-indigo-50 transition disabled:opacity-50"
                >
                  <p className="font-semibold text-slate-800">{p.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{p.description}</p>
                </button>
              ))}
            </div>
            {generating && <p className="mt-3 text-sm text-indigo-600 text-center">Generating your personalised roadmap…</p>}
          </Card>
        )}

        {roadmap ? (
          <div className="space-y-5">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-semibold text-slate-700">{completed} of {total} milestones complete</p>
                  {roadmap.estimatedWeeks && (
                    <p className="text-xs text-slate-400 mt-0.5">~{roadmap.estimatedWeeks} weeks to complete</p>
                  )}
                </div>
                <Badge color={roadmap.progressPercent >= 100 ? 'green' : 'indigo'}>
                  {roadmap.progressPercent}%
                </Badge>
              </div>
              <ProgressBar value={roadmap.progressPercent} />
            </Card>

            {roadmap.phases?.length > 0 ? (
              roadmap.phases.map((phase, pi) => (
                <div key={pi}>
                  <div className="mb-3 flex items-center gap-3">
                    <div className="grid size-7 place-items-center rounded-lg bg-indigo-600 text-xs font-bold text-white">{pi + 1}</div>
                    <div>
                      <p className="font-semibold text-slate-900">{phase.title}</p>
                      {phase.description && <p className="text-xs text-slate-500">{phase.description}</p>}
                    </div>
                  </div>
                  <div className="space-y-3 pl-10">
                    {roadmap.milestones
                      ?.filter((m) => m.phase === pi)
                      .map((m, mi) => {
                        const realIndex = roadmap.milestones.indexOf(m)
                        return <MilestoneCard key={mi} milestone={m} index={realIndex} onToggle={toggleMilestone} toggling={toggling} />
                      })}
                  </div>
                </div>
              ))
            ) : (
              <div className="space-y-3">
                {roadmap.milestones?.map((m, i) => (
                  <MilestoneCard key={i} milestone={m} index={i} onToggle={toggleMilestone} toggling={toggling} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <Card>
            <EmptyState
              icon={Map}
              title="No roadmap yet"
              description="Take the career assessment or choose a career path above to generate your personalised learning plan."
              action={
                <Link to="/career-assessment">
                  <Button>Go to Career Assessment</Button>
                </Link>
              }
            />
          </Card>
        )}
      </div>
    </AppLayout>
  )
}
