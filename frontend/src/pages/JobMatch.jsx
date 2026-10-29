import { useState, useEffect } from 'react'
import { Briefcase, RefreshCw, ExternalLink, Bookmark, BookmarkCheck } from 'lucide-react'
import { jobMatchApi } from '../api/index.js'
import AppLayout from '../layouts/AppLayout.jsx'
import { Button, Card, Badge, Alert, PageLoader, EmptyState, ProgressBar } from '../components/ui.jsx'

const MATCH_COLOR = (pct) => pct >= 70 ? 'green' : pct >= 50 ? 'indigo' : 'amber'

export default function JobMatch() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [togglingId, setTogglingId] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    jobMatchApi.history().then(({ data }) => {
      setJobs(data.jobs || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  async function refresh() {
    setRefreshing(true)
    setError('')
    try {
      const { data } = await jobMatchApi.match({})
      setJobs(data.jobs || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate matches. Complete your profile first.')
    } finally {
      setRefreshing(false)
    }
  }

  async function toggleSave(job) {
    setTogglingId(job._id)
    try {
      const { data } = await jobMatchApi.match({ id: job._id, action: 'save' })
      // Update local state optimistically
      setJobs((jj) => jj.map((j) => j._id === job._id ? { ...j, saved: !j.saved } : j))
    } catch {}
    setTogglingId(null)
  }

  if (loading) return <AppLayout><PageLoader /></AppLayout>

  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">Job Matching</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Job Matches</h1>
            <p className="mt-2 text-sm text-slate-500">
              Jobs matched to your profile using keyword-based skill analysis.
            </p>
          </div>
          <Button onClick={refresh} loading={refreshing} variant="secondary" size="sm">
            <RefreshCw className="size-3.5" /> Refresh matches
          </Button>
        </div>

        {error && <Alert type="error">{error}</Alert>}

        {jobs.length === 0 ? (
          <Card>
            <EmptyState
              icon={Briefcase}
              title="No job matches yet"
              description="Complete your profile and click Refresh to generate personalised job matches."
              action={<Button onClick={refresh} loading={refreshing}>Generate matches</Button>}
            />
          </Card>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <Card key={job._id} className="relative">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900">{job.title}</h3>
                      <Badge color={MATCH_COLOR(job.matchScore)}>{job.matchScore}% match</Badge>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">{job.company}{job.location ? ` · ${job.location}` : ''}</p>
                    {job.description && (
                      <p className="mt-2 text-sm text-slate-600 line-clamp-2">{job.description}</p>
                    )}
                    <div className="mt-3">
                      <ProgressBar value={job.matchScore} color={MATCH_COLOR(job.matchScore)} />
                    </div>
                    {job.matchedSkills?.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-semibold text-slate-500 mb-1.5">Matched skills</p>
                        <div className="flex flex-wrap gap-1.5">
                          {job.matchedSkills.map((s) => <Badge key={s} color="green">{s}</Badge>)}
                        </div>
                      </div>
                    )}
                    {job.missingSkills?.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-semibold text-slate-500 mb-1.5">Skills to develop</p>
                        <div className="flex flex-wrap gap-1.5">
                          {job.missingSkills.map((s) => <Badge key={s} color="amber">{s}</Badge>)}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button
                      onClick={() => toggleSave(job)}
                      disabled={togglingId === job._id}
                      className="grid size-9 place-items-center rounded-xl border border-slate-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-500 transition"
                    >
                      {job.saved ? <BookmarkCheck className="size-4 text-indigo-500" /> : <Bookmark className="size-4" />}
                    </button>
                    {job.url && (
                      <a href={job.url} target="_blank" rel="noopener noreferrer"
                        className="grid size-9 place-items-center rounded-xl border border-slate-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-500 transition">
                        <ExternalLink className="size-4" />
                      </a>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
