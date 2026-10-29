import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { User } from '../models/User.js'
import { PasswordResetToken } from '../models/PasswordResetToken.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()
const validate = [body('email').isEmail().normalizeEmail(), body('password').isLength({ min: 8 })]

function issue(res, user) {
  const token = jwt.sign({ userId: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '7d' })
  res.cookie('careerpilot_token', token, {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  })
  return res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } })
}

// POST /api/auth/register
router.post('/register', [body('name').trim().isLength({ min: 2 }), ...validate], async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ message: 'Please check your details', errors: errors.array() })
    const exists = await User.findOne({ email: req.body.email })
    if (exists) return res.status(409).json({ message: 'An account with that email already exists' })
    const passwordHash = await bcrypt.hash(req.body.password, 12)
    const user = await User.create({ name: req.body.name, email: req.body.email, passwordHash })
    issue(res, user)
  } catch (error) { next(error) }
})

// POST /api/auth/login
router.post('/login', validate, async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ message: 'Please enter a valid email and password' })
    const user = await User.findOne({ email: req.body.email }).select('+passwordHash')
    if (!user || user.status !== 'active' || !(await bcrypt.compare(req.body.password, user.passwordHash))) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }
    user.lastActivityAt = new Date()
    await user.save()
    issue(res, user)
  } catch (error) { next(error) }
})

// POST /api/auth/logout
router.post('/logout', (_req, res) => {
  res.clearCookie('careerpilot_token')
  res.json({ message: 'Logged out' })
})

// GET /api/auth/me — session check
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId)
    if (!user || user.status !== 'active') return res.status(401).json({ message: 'Account not found or deactivated' })
    user.lastActivityAt = new Date()
    await user.save()
    res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } })
  } catch (error) { next(error) }
})

// POST /api/auth/forgot-password
router.post('/forgot-password', [body('email').isEmail().normalizeEmail()], async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ message: 'Please enter a valid email address' })

    // Always respond the same way (prevent user enumeration)
    const user = await User.findOne({ email: req.body.email })
    if (user) {
      // Invalidate old tokens
      await PasswordResetToken.deleteMany({ userId: user._id })

      const rawToken = crypto.randomBytes(32).toString('hex')
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

      await PasswordResetToken.create({ userId: user._id, tokenHash, expiresAt })

      // In dev: log the token (no email provider configured)
      if (process.env.NODE_ENV !== 'production') {
        console.log(`\n[PASSWORD RESET] Token for ${user.email}: ${rawToken}\nReset URL: ${process.env.FRONTEND_URL}/reset-password?token=${rawToken}\n`)
      }
      // TODO: In production, send email via configured provider
    }

    res.json({
      message: 'If an account exists for that email, you will receive reset instructions.',
      emailConfigured: Boolean(process.env.EMAIL_FROM),
      devNote: process.env.NODE_ENV !== 'production' ? 'Token logged to server console (dev mode)' : undefined,
    })
  } catch (error) { next(error) }
})

// POST /api/auth/reset-password
router.post('/reset-password', [body('token').isString().isLength({ min: 64, max: 64 }), body('password').isLength({ min: 8 })], async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ message: 'Invalid reset request' })

    const tokenHash = crypto.createHash('sha256').update(req.body.token).digest('hex')
    const record = await PasswordResetToken.findOne({ tokenHash, used: false, expiresAt: { $gt: new Date() } })
    if (!record) return res.status(400).json({ message: 'Reset link is invalid or has expired. Please request a new one.' })

    const passwordHash = await bcrypt.hash(req.body.password, 12)
    await User.findByIdAndUpdate(record.userId, { passwordHash })
    record.used = true
    await record.save()

    res.json({ message: 'Password reset successful. You can now sign in with your new password.' })
  } catch (error) { next(error) }
})

export default router
