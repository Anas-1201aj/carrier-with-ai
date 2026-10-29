import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import mongoose from 'mongoose'
import authRoutes from './routes/auth.js'
import profileRoutes from './routes/profile.js'
import adminRoutes from './routes/admin.js'
import { requireAuth } from './middleware/auth.js'
import { requireSuperAdmin } from './middleware/admin.js'

const app = express()
const port = Number(process.env.PORT || 4000)
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }))
app.use(express.json({ limit: '32kb' }))
app.use(cookieParser())
app.get('/api/health', (_req, res) => res.json({ ok: true }))
app.use('/api/auth', authRoutes)
app.use('/api/profile', requireAuth, profileRoutes)
app.use('/api/admin', requireAuth, requireSuperAdmin, adminRoutes)
app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => { console.error(error); res.status(500).json({ message: 'Unexpected server error' }) })

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/careerpilot').then(() => app.listen(port, () => console.log(`CareerPilot API listening on ${port}`))).catch((error) => { console.error('MongoDB connection failed', error); process.exit(1) })
