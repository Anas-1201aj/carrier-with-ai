import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import mongoose from 'mongoose'
import rateLimit from 'express-rate-limit'

// Routes
import authRoutes from './routes/auth.js'
import profileRoutes from './routes/profile.js'
import adminRoutes from './routes/admin.js'
import assessmentRoutes from './routes/assessment.js'
import roadmapRoutes from './routes/roadmap.js'
import resumeRoutes from './routes/resume.js'
import jobmatchRoutes from './routes/jobmatch.js'
import skillAssessmentRoutes from './routes/skillassessment.js'
import interviewRoutes from './routes/interview.js'
import mentorRoutes from './routes/mentor.js'
import projectRoutes from './routes/project.js'
import jobsRoutes from './routes/jobs.js'
import notificationsRoutes from './routes/notifications.js'

// Middleware
import { requireAuth } from './middleware/auth.js'
import { requireSuperAdmin } from './middleware/admin.js'

const app = express()
const port = Number(process.env.PORT || 4000)

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, standardHeaders: true, legacyHeaders: false })
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false })

// Core middleware
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }))
app.use(express.json({ limit: '32kb' }))
app.use(cookieParser())
app.use(limiter)

// Health check
app.get('/api/health', (_req, res) => res.json({ ok: true, env: process.env.NODE_ENV, aiAvailable: Boolean(process.env.GOOGLE_AI_API_KEY) }))

// Auth routes (with stricter rate limiting)
app.use('/api/auth', authLimiter, authRoutes)

// Student routes (authenticated)
app.use('/api/profile', requireAuth, profileRoutes)
app.use('/api/assessment', requireAuth, assessmentRoutes)
app.use('/api/roadmap', requireAuth, roadmapRoutes)
app.use('/api/resume', requireAuth, resumeRoutes)
app.use('/api/jobmatch', requireAuth, jobmatchRoutes)
app.use('/api/skillassessment', requireAuth, skillAssessmentRoutes)
app.use('/api/interview', requireAuth, interviewRoutes)
app.use('/api/mentor', requireAuth, mentorRoutes)
app.use('/api/project', requireAuth, projectRoutes)
app.use('/api/jobs', requireAuth, jobsRoutes)
app.use('/api/notifications', requireAuth, notificationsRoutes)

// Admin routes (authenticated + super admin)
app.use('/api/admin', requireAuth, requireSuperAdmin, adminRoutes)

// Serve uploaded files (dev only)
import { fileURLToPath } from 'url'
import path from 'path'
const __dirname = path.dirname(fileURLToPath(import.meta.url))
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))

// Global error handler
app.use((error, _req, res, _next) => {
  console.error('[server error]', error)
  res.status(500).json({ message: 'Unexpected server error' })
})

// Connect to MongoDB and start
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/careerpilot')
  .then(() => app.listen(port, () => {
    console.log(`CareerPilot API ▶  http://localhost:${port}`)
    console.log(`AI provider: ${process.env.GOOGLE_AI_API_KEY ? 'Google Gemini ✓' : 'Rule-based (no API key)'}`)
  }))
  .catch((error) => { console.error('MongoDB connection failed', error); process.exit(1) })
