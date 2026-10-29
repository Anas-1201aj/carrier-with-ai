import { Router } from 'express'
import { body, param, validationResult } from 'express-validator'
import { CareerRoadmap } from '../models/CareerRoadmap.js'
import { StudentProfile } from '../models/StudentProfile.js'
import { generateRoadmap, calcReadinessScore, CAREER_PATHS } from '../services/careerEngine.js'

const router = Router()

// GET /api/roadmap — get active roadmap
router.get('/', async (req, res, next) => {
  try {
    const roadmap = await CareerRoadmap.findOne({ userId: req.userId, active: true })
    res.json({ roadmap })
  } catch (e) { next(e) }
})

// POST /api/roadmap — generate a new roadmap for a career path
router.post('/', [body('pathId').isString().isLength({ min: 2 })], async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ message: 'Please provide a valid career path' })

    const pathDef = CAREER_PATHS.find((p) => p.id === req.body.pathId)
    if (!pathDef) return res.status(400).json({ message: 'Unknown career path' })

    const profile = await StudentProfile.findOne({ userId: req.userId }) || {}
    const roadmapData = generateRoadmap(req.body.pathId, profile)

    // Deactivate old roadmaps
    await CareerRoadmap.updateMany({ userId: req.userId }, { active: false })

    const roadmap = await CareerRoadmap.create({ userId: req.userId, ...roadmapData, active: true })

    // Update readiness score
    const readiness = calcReadinessScore(profile, roadmap)
    await StudentProfile.findOneAndUpdate({ userId: req.userId }, { readinessScore: readiness }, { upsert: true })

    res.status(201).json({ roadmap })
  } catch (e) { next(e) }
})

// PATCH /api/roadmap/milestones/:index — toggle milestone complete
router.patch('/milestones/:index', [param('index').isInt({ min: 0 })], async (req, res, next) => {
  try {
    const roadmap = await CareerRoadmap.findOne({ userId: req.userId, active: true })
    if (!roadmap) return res.status(404).json({ message: 'No active roadmap found' })

    const idx = Number(req.params.index)
    if (idx >= roadmap.milestones.length) return res.status(400).json({ message: 'Milestone index out of range' })

    roadmap.milestones[idx].completed = !roadmap.milestones[idx].completed
    if (roadmap.milestones[idx].completed) {
      roadmap.milestones[idx].completedAt = new Date()
    } else {
      roadmap.milestones[idx].completedAt = undefined
    }

    const doneCount = roadmap.milestones.filter((m) => m.completed).length
    roadmap.progressPercent = Math.round((doneCount / roadmap.milestones.length) * 100)
    roadmap.currentMilestone = roadmap.milestones.findIndex((m) => !m.completed)

    await roadmap.save()

    // Update readiness
    const profile = await StudentProfile.findOne({ userId: req.userId })
    const readiness = calcReadinessScore(profile || {}, roadmap)
    await StudentProfile.findOneAndUpdate({ userId: req.userId }, { readinessScore: readiness }, { upsert: true })

    res.json({ roadmap })
  } catch (e) { next(e) }
})

// GET /api/roadmap/paths — list all available career paths
router.get('/paths', (_req, res) => {
  res.json({ paths: CAREER_PATHS })
})

export default router
