import { useState, useEffect, useRef } from 'react'
import { FileText, Upload, X, CheckCircle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { resumeApi } from '../api/index.js'
import AppLayout from '../layouts/AppLayout.jsx'
import { Button, Card, Badge, Alert, PageLoader, EmptyState, ProgressBar } from '../components/ui.jsx'

function AnalysisReport({ analysis }) {
  const [exp, setExp] = useState({})
  const toggle = (k) => setExp((s) => ({ ...s, [k]: !s[k] }))

  const score = analysis.overallScore ?? 0
  const scoreColor = score >= 70 ? 'green' : score >= 50 ? 'indigo' : 'amber'

  return (
    <div className="space-y-5">
      {/* Score */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-900">Overall Resume Score</h3>
          <Badge color={scoreColor}>{score}/100</Badge>
        </div>
        <ProgressBar value={score} color={scoreColor} />
        {analysis.summary && <p className="mt-4 text-sm text-slate-600">{analysis.summary}</p>}
        {analysis.aiPowered === false && (
          <p className="mt-2 text-xs text-amber-600">⚠️ Rule-based analysis (AI provider not configured)</p>
        )}
      </Card>

      {/* Sections */}
      {[
        { key: 'sections', label: 'Section Analysis', color: 'indigo' },
        { key: 'strengths', label: 'Strengths', color: 'green' },
        { key: 'improvements', label: 'Areas for Improvement', color: 'amber' },
        { key: 'missingKeywords', label: 'Missing Keywords', color: 'red' },
        { key: 'suggestions', label: 'Specific Suggestions', color: 'indigo' },
      ].map(({ key, label, color }) => {
        const data = analysis[key]
        if (!data || (Array.isArray(data) && !data.length) && (typeof data !== 'object')) return null
        const items = Array.isArray(data) ? data : Object.entries(data).map(([k, v]) => `${k}: ${v}`)
        if (!items.length) return null

        return (
          <Card key={key}>
            <button
              onClick={() => toggle(key)}
              className="flex w-full items-center justify-between text-left"
            >
              <h3 className="font-semibold text-slate-900">{label}</h3>
              {exp[key] ? <ChevronUp className="size-4 text-slate-400" /> : <ChevronDown className="size-4 text-slate-400" />}
            </button>
            {exp[key] && (
              <ul className="mt-4 space-y-2">
                {items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                    <span className={`mt-1 size-1.5 flex-shrink-0 rounded-full bg-${color}-400`} />
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        )
      })}

      {/* Keyword coverage */}
      {analysis.keywordCoverage !== undefined && (
        <Card>
          <h3 className="mb-3 font-semibold text-slate-900">Keyword Coverage</h3>
          <ProgressBar value={analysis.keywordCoverage} label={`${analysis.keywordCoverage}% of common keywords found`} />
        </Card>
      )}
    </div>
  )
}

function ResumeCard({ resume, onAnalyze, analyzing, currentAnalysis }) {
  const [expanded, setExpanded] = useState(false)
  const ext = resume.originalName?.split('.').pop().toLowerCase()

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="grid size-10 flex-shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
            <FileText className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">{resume.originalName}</p>
            <p className="text-xs text-slate-400">
              {(resume.size / 1024).toFixed(0)} KB · {new Date(resume.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => onAnalyze(resume)} loading={analyzing} variant="indigo">
            {analyzing ? 'Analyzing…' : 'Analyze'}
          </Button>
          {currentAnalysis && (
            <Button size="sm" variant="secondary" onClick={() => setExpanded(!expanded)}>
              {expanded ? 'Hide' : 'View report'}
            </Button>
          )}
        </div>
      </div>
      {expanded && currentAnalysis && <AnalysisReport analysis={currentAnalysis} />}
    </Card>
  )
}

export default function Resume() {
  const fileRef = useRef()
  const [resumes, setResumes] = useState([])
  const [analyses, setAnalyses] = useState({})
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [analyzingId, setAnalyzingId] = useState(null)
  const [targetRole, setTargetRole] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [dragOver, setDragOver] = useState(false)

  useEffect(() => {
    resumeApi.list().then(({ data }) => {
      setResumes(data.resumes || [])
      // Pre-fetch analyses
      data.resumes?.forEach((r) => {
        resumeApi.getAnalysis(r._id).then(({ data: d }) => {
          setAnalyses((a) => ({ ...a, [r._id]: d.analysis }))
        }).catch(() => {})
      })
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  async function uploadFile(file) {
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setError('File must be under 5MB.'); return }
    const ext = file.name.split('.').pop().toLowerCase()
    if (!['pdf', 'doc', 'docx', 'txt'].includes(ext)) { setError('Only PDF, DOC, DOCX, and TXT files are accepted.'); return }

    setUploading(true)
    setError('')
    const fd = new FormData()
    fd.append('resume', file)
    try {
      const { data } = await resumeApi.upload(fd)
      setResumes((r) => [data.resume, ...r])
      setSuccess('Resume uploaded successfully.')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed.')
    } finally {
      setUploading(false)
    }
  }

  async function analyzeResume(resume) {
    setAnalyzingId(resume._id)
    setError('')
    try {
      const { data } = await resumeApi.analyze(resume._id, targetRole)
      setAnalyses((a) => ({ ...a, [resume._id]: data.analysis }))
    } catch (err) {
      setError(err.response?.data?.message || 'Analysis failed.')
    } finally {
      setAnalyzingId(null)
    }
  }

  if (loading) return <AppLayout><PageLoader /></AppLayout>

  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">Resume</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Resume Analyzer</h1>
          <p className="mt-2 text-sm text-slate-500">Upload your resume to get detailed AI-powered feedback and improvement suggestions.</p>
        </div>

        {error && <Alert type="error">{error}</Alert>}
        {success && <Alert type="success">{success}</Alert>}

        {/* Upload area */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); uploadFile(e.dataTransfer.files[0]) }}
          onClick={() => fileRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center gap-4 rounded-2xl border-2 border-dashed p-10 text-center transition ${
            dragOver ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50'
          }`}
        >
          <div className="grid size-14 place-items-center rounded-2xl bg-indigo-50 text-indigo-400">
            <Upload className="size-6" />
          </div>
          <div>
            <p className="font-semibold text-slate-700">Drag & drop your resume here</p>
            <p className="mt-1 text-sm text-slate-400">or click to browse — PDF, DOC, DOCX, TXT · Max 5MB</p>
          </div>
          {uploading && <div className="mt-2 size-6 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-500" />}
        </div>
        <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt" className="sr-only" onChange={(e) => uploadFile(e.target.files[0])} />

        {/* Target role hint */}
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="text-sm font-semibold text-slate-700 block mb-1.5">Target role (optional)</label>
            <input
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Frontend Developer"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
            />
          </div>
          <p className="text-xs text-slate-400 pb-3">Used to tailor keyword matching</p>
        </div>

        {/* Resume list */}
        {resumes.length === 0 ? (
          <Card>
            <EmptyState
              icon={FileText}
              title="No resumes uploaded"
              description="Upload your resume above to get started."
            />
          </Card>
        ) : (
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-slate-900">Your Resumes</h2>
            {resumes.map((r) => (
              <ResumeCard
                key={r._id}
                resume={r}
                onAnalyze={analyzeResume}
                analyzing={analyzingId === r._id}
                currentAnalysis={analyses[r._id]}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
