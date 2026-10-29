import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import { StudentProfile } from '../models/StudentProfile.js'
import { CareerRoadmap } from '../models/CareerRoadmap.js'
import { Notification } from '../models/Notification.js'
import { calcReadinessScore } from '../services/careerEngine.js'

const router = Router()

const PROFILE_FIELDS = [
  'educationLevel', 'degree', 'graduationYear', 'technicalSkills', 'interests',
  'targetRoles', 'careerGoals', 'college', 'university', 'skillsToLearn',
  'experienceLevel', 'weeklyLearningTime', 'onboardingStep', 'onboardingComplete',
]

// GET /api/profile
router.get('/', async (req, res, next) => {
  try {
    const profile = await StudentProfile.findOne({ userId: req.userId }).lean()
    const roadmap = await CareerRoadmap.findOne({ userId: req.userId, active: true }).lean()
    const unreadNotifications = await Notification.countDocuments({ userId: req.userId, read: false })
    res.json({ profile, roadmap, unreadNotifications })
  } catch (e) { next(e) }
})

// PUT /api/profile
router.put('/', [
  body('educationLevel').optional().isString(),
  body('degree').optional().isString(),
  body('graduationYear').optional().isString(),
  body('careerGoals').optional().isString(),
  body('experienceLevel').optional().isIn(['no-experience', 'some-projects', 'internship', 'professional']),
  body('weeklyLearningTime').optional().isInt({ min: 1, max: 80 }),
  body('onboardingStep').optional().isInt({ min: 0, max: 5 }),
  body('onboardingComplete').optional().isBoolean(),
], async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ message: 'Invalid profile data' })

    const update = Object.fromEntries(
      PROFILE_FIELDS.filter((key) => req.body[key] !== undefined).map((key) => [key, req.body[key]])
    )

    const profile = await StudentProfile.findOneAndUpdate(
      { userId: req.userId },
      { $set: update, $setOnInsert: { userId: req.userId } },
      { upsert: true, new: true }
    )

    // Recalculate readiness score
    const roadmap = await CareerRoadmap.findOne({ userId: req.userId, active: true })
    const readinessScore = calcReadinessScore(profile, roadmap)
    await StudentProfile.findByIdAndUpdate(profile._id, { readinessScore })

    // Notify on onboarding complete
    if (req.body.onboardingComplete === true) {
      const alreadyNotified = await Notification.findOne({ userId: req.userId, type: 'achievement', title: 'Profile Complete!' })
      if (!alreadyNotified) {
        await Notification.create({
          userId: req.userId,
          type: 'achievement',
          title: 'Profile Complete!',
          message: 'Great work! Your career profile is set up. Check out your personalized roadmap.',
          actionUrl: '/roadmap',
          actionLabel: 'View Roadmap',
        })
      }
    }

    res.json({ profile: { ...profile.toObject(), readinessScore } })
  } catch (e) { next(e) }
})

export default router
