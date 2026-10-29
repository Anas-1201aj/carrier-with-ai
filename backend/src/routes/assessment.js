import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import { CareerAssessment } from '../models/CareerAssessment.js'
import { StudentProfile } from '../models/StudentProfile.js'
import { recommendPaths } from '../services/careerEngine.js'

const router = Router()

// GET /api/assessment — get current assessment
router.get('/', async (req, res, next) => {
  try {
    const assessment = await CareerAssessment.findOne({ userId: req.userId }).sort({ createdAt: -1 })
    res.json({ assessment })
  } catch (e) { next(e) }
})

// POST /api/assessment — create/submit assessment
router.post('/', [
  body('educationLevel').optional().isString(),
  body('degree').optional().isString(),
  body('experienceLevel').optional().isIn(['no-experience', 'some-projects', 'internship', 'professional']),
  body('technicalSkills').optional().isArray(),
  body('interests').optional().isArray(),
  body('careerGoals').optional().isString(),
  body('targetRoles').optional().isArray(),
  body('preferredWorkStyle').optional().isIn(['remote', 'hybrid', 'onsite', 'flexible']),
  body('learningStyle').optional().isIn(['videos', 'reading', 'projects', 'mentorship']),
], async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ message: 'Invalid assessment data', errors: errors.array() })

    const profile = await StudentProfile.findOne({ userId: req.userId }) || {}
    const merged = { ...profile.toObject?.() || {}, ...req.body }
    const paths = recommendPaths(merged)

    const assessment = await CareerAssessment.create({
      userId: req.userId,
      ...req.body,
      recommendedPaths: paths.slice(0, 5).map((p) => ({ title: p.title, match: p.match, description: p.description, skills: p.skills })),
      primaryPath: paths[0]?.id,
      readinessScore: paths[0]?.match || 30,
      completed: true,
    })

    // Sync back to profile
    await StudentProfile.findOneAndUpdate(
      { userId: req.userId },
      {
        $set: {
          technicalSkills: req.body.technicalSkills || [],
          interests: req.body.interests || [],
          targetRoles: req.body.targetRoles || [],
          careerGoals: req.body.careerGoals || '',
          experienceLevel: req.body.experienceLevel,
        },
        $setOnInsert: { userId: req.userId },
      },
      { upsert: true }
    )

    res.status(201).json({ assessment })
  } catch (e) { next(e) }
})

export default router
