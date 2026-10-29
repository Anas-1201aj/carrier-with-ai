import { Router } from 'express'
import { body, param, validationResult } from 'express-validator'
import { JobApplication } from '../models/JobApplication.js'

const router = Router()

const VALID_STATUSES = ['wishlist', 'applied', 'phone-screen', 'interview', 'offer', 'rejected', 'accepted', 'withdrawn']

// GET /api/jobs — list all applications with kanban grouping
router.get('/', async (req, res, next) => {
  try {
    const applications = await JobApplication.find({ userId: req.userId }).sort({ updatedAt: -1 })

    // Group by status for kanban view
    const kanban = {}
    for (const status of VALID_STATUSES) {
      kanban[status] = applications.filter((a) => a.status === status)
    }

    res.json({ applications, kanban, total: applications.length })
  } catch (e) { next(e) }
})

// POST /api/jobs — add a job application
router.post('/', [
  body('company').isString().isLength({ min: 1, max: 200 }),
  body('role').isString().isLength({ min: 1, max: 200 }),
  body('status').optional().isIn(VALID_STATUSES),
  body('jobUrl').optional().isURL(),
  body('location').optional().isString(),
  body('remote').optional().isBoolean(),
  body('salaryMin').optional().isInt({ min: 0 }),
  body('salaryMax').optional().isInt({ min: 0 }),
  body('notes').optional().isString().isLength({ max: 2000 }),
], async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ message: 'Invalid application data', errors: errors.array() })

    const application = await JobApplication.create({ userId: req.userId, ...req.body })
    res.status(201).json({ application })
  } catch (e) { next(e) }
})

// PATCH /api/jobs/:id — update application status or details
router.patch('/:id', [
  param('id').isMongoId(),
  body('status').optional().isIn(VALID_STATUSES),
  body('notes').optional().isString().isLength({ max: 2000 }),
  body('nextStep').optional().isString().isLength({ max: 500 }),
  body('nextStepDate').optional().isISO8601(),
], async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ message: 'Invalid update' })

    const application = await JobApplication.findOne({ _id: req.params.id, userId: req.userId })
    if (!application) return res.status(404).json({ message: 'Application not found' })

    const allowedFields = ['status', 'notes', 'nextStep', 'nextStepDate', 'contactName', 'contactEmail', 'offer', 'location', 'remote', 'salaryMin', 'salaryMax']
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) application[field] = req.body[field]
    }

    if (req.body.status === 'applied' && !application.appliedAt) {
      application.appliedAt = new Date()
    }

    await application.save()
    res.json({ application })
  } catch (e) { next(e) }
})

// DELETE /api/jobs/:id — remove application
router.delete('/:id', [param('id').isMongoId()], async (req, res, next) => {
  try {
    const result = await JobApplication.findOneAndDelete({ _id: req.params.id, userId: req.userId })
    if (!result) return res.status(404).json({ message: 'Application not found' })
    res.json({ message: 'Application removed' })
  } catch (e) { next(e) }
})

export default router
