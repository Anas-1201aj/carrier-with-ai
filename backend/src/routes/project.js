import { Router } from 'express'
import { body, param, validationResult } from 'express-validator'
import { StudentProject } from '../models/StudentProject.js'
import { StudentProfile } from '../models/StudentProfile.js'
import { geminiComplete } from '../services/aiProvider.js'

const router = Router()

const PROJECT_TEMPLATES = {
  fullstack: [
    { title: 'Personal Portfolio Website', description: 'Build a responsive portfolio showcasing your skills and projects', techStack: ['HTML', 'CSS', 'JavaScript', 'React'], difficulty: 'beginner', estimatedHours: 20, learningGoals: ['Responsive design', 'React basics', 'Deployment'] },
    { title: 'Task Management App', description: 'Full-stack CRUD app with authentication, tasks, and categories', techStack: ['React', 'Node.js', 'MongoDB', 'JWT'], difficulty: 'intermediate', estimatedHours: 40, learningGoals: ['REST API design', 'Authentication', 'State management'] },
    { title: 'E-Commerce Store', description: 'Complete online store with product catalog, cart, and payment integration', techStack: ['React', 'Node.js', 'MongoDB', 'Stripe'], difficulty: 'advanced', estimatedHours: 80, learningGoals: ['Complex state', 'Payment processing', 'Real-world architecture'] },
  ],
  'data-analyst': [
    { title: 'COVID-19 Data Analysis', description: 'Analyze real COVID-19 datasets to find trends and create visualizations', techStack: ['Python', 'Pandas', 'Matplotlib', 'Jupyter'], difficulty: 'beginner', estimatedHours: 15, learningGoals: ['Data cleaning', 'EDA', 'Visualization'] },
    { title: 'Sales Dashboard', description: 'Build an interactive business dashboard with real-time KPIs', techStack: ['Python', 'SQL', 'Tableau', 'Excel'], difficulty: 'intermediate', estimatedHours: 30, learningGoals: ['SQL joins', 'Business metrics', 'Dashboard design'] },
  ],
  'product-design': [
    { title: 'Mobile App Redesign', description: 'Redesign an existing app with improved UX based on research', techStack: ['Figma', 'User Research', 'Prototyping'], difficulty: 'beginner', estimatedHours: 25, learningGoals: ['User research', 'Wireframing', 'Prototyping'] },
    { title: 'Design System', description: 'Create a comprehensive design system with components and documentation', techStack: ['Figma', 'Design Tokens', 'Component Library'], difficulty: 'intermediate', estimatedHours: 40, learningGoals: ['Design consistency', 'Documentation', 'Scalable systems'] },
  ],
}

// GET /api/project — list projects
router.get('/', async (req, res, next) => {
  try {
    const projects = await StudentProject.find({ userId: req.userId }).sort({ createdAt: -1 })
    res.json({ projects })
  } catch (e) { next(e) }
})

// POST /api/project/recommend — get AI/rule-based recommendations
router.post('/recommend', async (req, res, next) => {
  try {
    const profile = await StudentProfile.findOne({ userId: req.userId })
    const targetRole = (profile?.targetRoles || [])[0] || 'fullstack'

    // Try Gemini for personalized suggestions
    const prompt = `Suggest 3 portfolio projects for a student targeting "${targetRole}" roles.
Skills they have: ${(profile?.technicalSkills || []).join(', ') || 'learning'}
Experience: ${profile?.experienceLevel || 'no-experience'}

Respond with JSON array (no markdown):
[{"title":"...","description":"...","techStack":["..."],"difficulty":"beginner|intermediate|advanced","estimatedHours":20,"learningGoals":["..."]}]`

    const aiText = await geminiComplete(prompt)
    let projects = []

    if (aiText) {
      try {
        projects = JSON.parse(aiText.replace(/```json|```/g, '').trim())
      } catch {}
    }

    // Fallback to templates
    if (!projects.length) {
      const pathKey = Object.keys(PROJECT_TEMPLATES).find((k) => targetRole.toLowerCase().includes(k) || k.includes(targetRole.toLowerCase())) || 'fullstack'
      projects = PROJECT_TEMPLATES[pathKey] || PROJECT_TEMPLATES.fullstack
    }

    // Save recommendations to DB
    const saved = await StudentProject.insertMany(
      projects.slice(0, 3).map((p) => ({
        userId: req.userId,
        ...p,
        status: 'recommended',
        aiGenerated: true,
      }))
    )

    res.json({ projects: saved })
  } catch (e) { next(e) }
})

// PATCH /api/project/:id — update project status / progress
router.patch('/:id', [param('id').isMongoId(), body('status').optional().isIn(['recommended', 'in-progress', 'completed', 'paused']), body('githubUrl').optional().isURL(), body('demoUrl').optional().isURL()], async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ message: 'Invalid update' })

    const project = await StudentProject.findOne({ _id: req.params.id, userId: req.userId })
    if (!project) return res.status(404).json({ message: 'Project not found' })

    if (req.body.status) project.status = req.body.status
    if (req.body.status === 'in-progress' && !project.startedAt) project.startedAt = new Date()
    if (req.body.status === 'completed') project.completedAt = new Date()
    if (req.body.githubUrl) project.githubUrl = req.body.githubUrl
    if (req.body.demoUrl) project.demoUrl = req.body.demoUrl
    if (req.body.steps) project.steps = req.body.steps

    await project.save()
    res.json({ project })
  } catch (e) { next(e) }
})

export default router
