import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { Resume } from '../models/Resume.js'
import { ResumeAnalysis } from '../models/ResumeAnalysis.js'
import { analyzeResumeText } from '../services/resumeAnalyzer.js'

const router = Router()

// Setup local disk storage
const uploadDir = path.join(process.cwd(), 'uploads', 'resumes')
fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `${req.userId}-${Date.now()}${ext}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx', '.txt']
    const ext = path.extname(file.originalname).toLowerCase()
    cb(null, allowed.includes(ext))
  },
})

// GET /api/resume — list user's resumes
router.get('/', async (req, res, next) => {
  try {
    const resumes = await Resume.find({ userId: req.userId }).sort({ createdAt: -1 })
    res.json({ resumes })
  } catch (e) { next(e) }
})

// POST /api/resume/upload — upload resume file
router.post('/upload', upload.single('resume'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Please upload a resume file (PDF, DOC, DOCX, or TXT, max 5MB)' })

    // Mark previous as inactive
    await Resume.updateMany({ userId: req.userId }, { active: false })

    const resume = await Resume.create({
      userId: req.userId,
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      mimetype: req.file.mimetype,
      size: req.file.size,
    })

    res.status(201).json({ resume })
  } catch (e) { next(e) }
})

// POST /api/resume/:id/analyze — analyze an uploaded resume
router.post('/:id/analyze', async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.userId })
    if (!resume) return res.status(404).json({ message: 'Resume not found' })

    // Read file text
    let text = ''
    try {
      if (resume.mimetype === 'text/plain' || resume.originalName.endsWith('.txt')) {
        text = fs.readFileSync(resume.path, 'utf-8')
      } else {
        // For PDF/DOC: use filename and basic metadata as fallback
        text = `Resume: ${resume.originalName}\nFile type: ${resume.mimetype}\n[Binary file - text extraction not available without pdf-parse]\nSkills section placeholder.`
      }
    } catch {
      text = `Resume file: ${resume.originalName}`
    }

    const targetRole = req.body.targetRole || ''
    const result = await analyzeResumeText(text, targetRole)

    // Save/update analysis
    const analysis = await ResumeAnalysis.findOneAndUpdate(
      { resumeId: resume._id },
      { userId: req.userId, resumeId: resume._id, rawText: text.slice(0, 2000), ...result },
      { upsert: true, new: true }
    )

    res.json({ analysis })
  } catch (e) { next(e) }
})

// GET /api/resume/:id/analysis — get existing analysis
router.get('/:id/analysis', async (req, res, next) => {
  try {
    const analysis = await ResumeAnalysis.findOne({ resumeId: req.params.id, userId: req.userId })
    if (!analysis) return res.status(404).json({ message: 'No analysis found for this resume' })
    res.json({ analysis })
  } catch (e) { next(e) }
})

export default router
