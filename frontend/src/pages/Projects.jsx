import { useState, useEffect } from 'react'
import { FolderOpen, Sparkles, ExternalLink, Github, Clock, Star, ChevronDown, ChevronUp } from 'lucide-react'
import { projectApi } from '../api/index.js'
import AppLayout from '../layouts/AppLayout.jsx'
import { Button, Card, Badge, Alert, PageLoader, EmptyState } from '../components/ui.jsx'

const STATUS_OPTIONS = ['recommended', 'in-progress', 'completed', 'paused']
const STATUS_COLOR = { recommended: 'slate', 'in-progress': 'indigo', completed: 'green', paused: 'amber' }
const DIFF_COLOR = { beginner: 'green', intermediate: 'indigo', advanced: 'red' }

function ProjectCard({ project, onUpdate }) {
  const [expanded, setExpanded] = useState(false)
  const [githubUrl, setGithubUrl] = useState(project.githubUrl || '')
  const [demoUrl, setDemoUrl] = useState(project.demoUrl || '')
  const [saving, setSaving] = useState(false)

  async function setStatus(status) {
    setSaving(true)
    try { await onUpdate(project._id, { status }) } finally { setSaving(false) }
  }

  async function saveUrls() {
    setSaving(true)
    try { await onUpdate(project._id, { githubUrl, demoUrl }) } finally { setSaving(false) }
  }

  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-slate-900">{project.title}</h3>
            <Badge color={STATUS_COLOR[project.status]}>{project.status}</Badge>
            <Badge color={DIFF_COLOR[project.difficulty] || 'slate'}>{project.difficulty}</Badge>
          </div>
          <p className="mt-1.5 text-sm text-slate-500">{project.description}</p>
          {project.techStack?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {project.techStack.map((t) => <Badge key={t} color="slate">{t}</Badge>)}
            </div>
          )}
          {project.estimatedHours && (
            <p className="mt-2 flex items-center gap-1 text-xs text-slate-400">
              <Clock className="size-3.5" /> ~{project.estimatedHours} hours
            </p>
          )}
        </div>
        <button onClick={() => setExpanded(!expanded)} className="text-slate-400 hover:text-slate-600 flex-shrink-0">
          {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </button>
      </div>

      {expanded && (
        <div className="mt-4 space-y-4 border-t border-slate-100 pt-4">
          {project.learningGoals?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Learning goals</p>
              <ul className="space-y-1">
                {project.learningGoals.map((g) => (
                  <li key={g} className="flex items-center gap-2 text-sm text-slate-600">
                    <Star className="size-3.5 flex-shrink-0 text-amber-400" />{g}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1">GitHub URL</label>
              <input value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} placeholder="https://github.com/..."
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1">Live demo URL</label>
              <input value={demoUrl} onChange={(e) => setDemoUrl(e.target.value)} placeholder="https://..."
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold text-slate-500 mr-1">Status:</p>
            {STATUS_OPTIONS.map((s) => (
              <button key={s} disabled={saving} onClick={() => setStatus(s)}
                className={`rounded-lg border px-3 py-1 text-xs font-semibold transition ${project.status === s ? 'border-indigo-400 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-500 hover:border-indigo-200'}`}>
                {s}
              </button>
            ))}
            <Button size="sm" variant="secondary" onClick={saveUrls} loading={saving}>Save URLs</Button>
          </div>
        </div>
      )}
    </Card>
  )
}

export default function Projects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    projectApi.list().then(({ data }) => setProjects(data.projects || [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  async function generateRecommendations() {
    setGenerating(true)
    setError('')
    try {
      const { data } = await projectApi.generate({})
      setProjects((p) => [...data.projects, ...p])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate recommendations.')
    } finally {
      setGenerating(false)
    }
  }

  async function updateProject(id, update) {
    try {
      const { data } = await projectApi.update(id, update)
      setProjects((pp) => pp.map((p) => p._id === id ? data.project : p))
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed.')
    }
  }

  if (loading) return <AppLayout><PageLoader /></AppLayout>

  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">Portfolio Projects</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Project Recommendations</h1>
            <p className="mt-2 text-sm text-slate-500">Personalised project ideas to build your portfolio and showcase your skills.</p>
          </div>
          <Button onClick={generateRecommendations} loading={generating} variant="secondary" size="sm">
            <Sparkles className="size-3.5" /> Get recommendations
          </Button>
        </div>

        {error && <Alert type="error">{error}</Alert>}

        {projects.length === 0 ? (
          <Card>
            <EmptyState
              icon={FolderOpen}
              title="No project recommendations yet"
              description="Click 'Get recommendations' to receive personalised project ideas based on your career goals."
              action={<Button onClick={generateRecommendations} loading={generating}>Generate projects</Button>}
            />
          </Card>
        ) : (
          <div className="space-y-4">
            {projects.map((p) => (
              <ProjectCard key={p._id} project={p} onUpdate={updateProject} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
