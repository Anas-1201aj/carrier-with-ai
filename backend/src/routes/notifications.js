import { Router } from 'express'
import { param } from 'express-validator'
import { Notification } from '../models/Notification.js'

const router = Router()

// GET /api/notifications — list notifications
router.get('/', async (req, res, next) => {
  try {
    const page = Number(req.query.page || 1)
    const limit = 20
    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ userId: req.userId }).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      Notification.countDocuments({ userId: req.userId, read: false }),
    ])
    res.json({ notifications, unreadCount, page })
  } catch (e) { next(e) }
})

// POST /api/notifications/read-all — mark all as read
router.post('/read-all', async (req, res, next) => {
  try {
    await Notification.updateMany({ userId: req.userId, read: false }, { read: true })
    res.json({ message: 'All notifications marked as read' })
  } catch (e) { next(e) }
})

// PATCH /api/notifications/:id/read — mark single as read
router.patch('/:id/read', [param('id').isMongoId()], async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { read: true },
      { new: true }
    )
    if (!notification) return res.status(404).json({ message: 'Notification not found' })
    res.json({ notification })
  } catch (e) { next(e) }
})

// DELETE /api/notifications/:id — delete notification
router.delete('/:id', [param('id').isMongoId()], async (req, res, next) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, userId: req.userId })
    res.json({ message: 'Notification deleted' })
  } catch (e) { next(e) }
})

export default router
