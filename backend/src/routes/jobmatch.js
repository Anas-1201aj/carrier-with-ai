import { Router } from 'express'
import { JobMatch } from '../models/JobMatch.js'
import { StudentProfile } from '../models/StudentProfile.js'
import { matchJobsForProfile } from '../services/jobMatcher.js'

const router = Router()

// GET /api/jobmatch — get matches for current user
router.get('/', async (req, res, next) => {
  try {
    const existing = await JobMatch.find({ userId: req.userId }).sort({ matchScore: -1 }).limit(20)
    res.json({ jobs: existing })
  } catch (e) { next(e) }
})

// POST /api/jobmatch/refresh — regenerate matches based on current profile
router.post('/refresh', async (req, res, next) => {
  try {
    const profile = await StudentProfile.findOne({ userId: req.userId })
    if (!profile) return res.status(400).json({ message: 'Please complete your profile before generating job matches' })

    const matches = matchJobsForProfile(profile)

    // Replace old matches
    await JobMatch.deleteMany({ userId: req.userId })
    const saved = await JobMatch.insertMany(matches.map((m) => ({ ...m, userId: req.userId })))

    res.json({ jobs: saved })
  } catch (e) { next(e) }
})

// PATCH /api/jobmatch/:id/save — toggle saved status
router.patch('/:id/save', async (req, res, next) => {
  try {
    const job = await JobMatch.findOne({ _id: req.params.id, userId: req.userId })
    if (!job) return res.status(404).json({ message: 'Job not found' })
    job.saved = !job.saved
    await job.save()
    res.json({ job })
  } catch (e) { next(e) }
})

export default router
