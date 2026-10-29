import { Router } from 'express'
import { query, param, body, validationResult } from 'express-validator'
import { User } from '../models/User.js'
import { StudentProfile } from '../models/StudentProfile.js'
import { AuditLog } from '../models/AuditLog.js'
import { PlatformSettings } from '../models/PlatformSettings.js'

const router = Router()

const validate = (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) { res.status(400).json({ message: 'Invalid request', errors: errors.array() }); return false }
  return true
}
const safeUser = (user) => ({ id: user._id, name: user.name, email: user.email, role: user.role, status: user.status, createdAt: user.createdAt, lastActivityAt: user.lastActivityAt })
const audit = (req, action, targetId, metadata = {}) => AuditLog.create({ actorId: req.userId, action, targetId, metadata })

// GET /api/admin/dashboard
router.get('/dashboard', async (req, res, next) => {
  try {
    const now = new Date()
    const week = new Date(now); week.setDate(now.getDate() - 7)
    const month = new Date(now); month.setDate(now.getDate() - 30)
    const [total, new7, new30, active, completed, recent, trends] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'student', createdAt: { $gte: week } }),
      User.countDocuments({ role: 'student', createdAt: { $gte: month } }),
      User.countDocuments({ role: 'student', lastActivityAt: { $gte: month } }),
      StudentProfile.countDocuments({ onboardingComplete: true }),
      User.find({ role: 'student' }).sort({ createdAt: -1 }).limit(8).select('name email status createdAt lastActivityAt'),
      User.aggregate([{ $match: { role: 'student', createdAt: { $gte: month } } }, { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
    ])
    res.json({ metrics: { total, new7, new30, active, completedOnboarding: completed }, recentStudents: recent.map(safeUser), registrationTrend: trends })
  } catch (e) { next(e) }
})

// GET /api/admin/analytics
router.get('/analytics', [query('from').optional().isISO8601(), query('to').optional().isISO8601()], async (req, res, next) => {
  try {
    if (!validate(req, res)) return
    const from = req.query.from ? new Date(String(req.query.from)) : new Date(Date.now() - 30 * 86400000)
    const to = req.query.to ? new Date(String(req.query.to)) : new Date()
    const [registrations, onboarding] = await Promise.all([
      User.aggregate([{ $match: { role: 'student', createdAt: { $gte: from, $lte: to } } }, { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
      StudentProfile.countDocuments({ onboardingComplete: true }),
    ])
    res.json({ from, to, registrations, onboardingCompleted: onboarding })
  } catch (e) { next(e) }
})

// GET /api/admin/students
router.get('/students', [
  query('search').optional().trim().isLength({ max: 120 }),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['active', 'deactivated']),
], async (req, res, next) => {
  try {
    if (!validate(req, res)) return
    const page = Number(req.query.page || 1)
    const limit = Number(req.query.limit || 20)
    const search = String(req.query.search || '').trim()
    const filter = { role: 'student' }
    if (req.query.status) filter.status = req.query.status
    if (search) filter.$or = [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }]
    const [students, total] = await Promise.all([User.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit), User.countDocuments(filter)])
    res.json({ students: students.map(safeUser), page, limit, total, pages: Math.ceil(total / limit) })
  } catch (e) { next(e) }
})

// GET /api/admin/students/:id
router.get('/students/:id', [param('id').isMongoId()], async (req, res, next) => {
  try {
    if (!validate(req, res)) return
    const student = await User.findOne({ _id: req.params.id, role: 'student' })
    if (!student) return res.status(404).json({ message: 'Student not found' })
    const profile = await StudentProfile.findOne({ userId: student._id })
    res.json({ student: safeUser(student), profile })
  } catch (e) { next(e) }
})

// PATCH /api/admin/students/:id/status
router.patch('/students/:id/status', [param('id').isMongoId(), body('status').isIn(['active', 'deactivated'])], async (req, res, next) => {
  try {
    if (!validate(req, res)) return
    const student = await User.findOne({ _id: req.params.id, role: 'student' })
    if (!student) return res.status(404).json({ message: 'Student not found' })
    student.status = req.body.status
    await student.save()
    await audit(req, `student.${req.body.status}`, String(student._id))
    res.json({ student: safeUser(student) })
  } catch (e) { next(e) }
})

// GET /api/admin/audit-logs
router.get('/audit-logs', [query('page').optional().isInt({ min: 1 })], async (req, res, next) => {
  try {
    if (!validate(req, res)) return
    const page = Number(req.query.page || 1)
    const limit = 30
    const [logs, total] = await Promise.all([
      AuditLog.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).populate('actorId', 'name email'),
      AuditLog.countDocuments(),
    ])
    res.json({ logs, page, total, pages: Math.ceil(total / limit) })
  } catch (e) { next(e) }
})

// GET /api/admin/settings
router.get('/settings', async (_req, res, next) => {
  try {
    const settings = await PlatformSettings.findOneAndUpdate({ singleton: 'platform' }, {}, { upsert: true, new: true, setDefaultsOnInsert: true })
    res.json({ settings })
  } catch (e) { next(e) }
})

// PATCH /api/admin/settings
router.patch('/settings', [body('platformName').optional().trim().isLength({ min: 2, max: 120 }), body('features').optional().isObject()], async (req, res, next) => {
  try {
    if (!validate(req, res)) return
    const settings = await PlatformSettings.findOneAndUpdate(
      { singleton: 'platform' },
      { $set: { ...(req.body.platformName !== undefined ? { platformName: req.body.platformName } : {}), ...(req.body.features !== undefined ? { features: req.body.features } : {}) } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )
    await audit(req, 'settings.updated')
    res.json({ settings })
  } catch (e) { next(e) }
})

export default router
