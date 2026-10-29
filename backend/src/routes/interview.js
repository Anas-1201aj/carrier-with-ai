import { Router } from 'express'
import { body, param, validationResult } from 'express-validator'
import { MockInterview } from '../models/MockInterview.js'
import { geminiChat } from '../services/aiProvider.js'

const router = Router()

const SYSTEM_PROMPT = (role, type) => `You are an experienced technical recruiter and career coach conducting a ${type} mock interview for a "${role}" position.

Guidelines:
- Ask one thoughtful, relevant question at a time
- After the candidate answers, provide brief feedback (1-2 sentences) then ask the next question
- Keep responses concise and professional
- After 5-6 questions, offer to wrap up and provide overall feedback
- Focus on ${type === 'behavioral' ? 'STAR method (Situation, Task, Action, Result) questions' : type === 'technical' ? 'technical concepts, coding patterns, and problem-solving' : 'a mix of behavioral and technical questions'}
- Be encouraging but honest

Start by briefly introducing yourself and asking your first question.`

const RULE_BASED_QUESTIONS = {
  behavioral: [
    "Tell me about yourself and why you're interested in this role.",
    "Describe a challenging project you've worked on. What was your approach and what did you learn?",
    "How do you handle tight deadlines and competing priorities?",
    "Tell me about a time you had a conflict with a team member. How did you resolve it?",
    "Where do you see yourself in 3 years?",
  ],
  technical: [
    "What are your strongest technical skills and how have you applied them in projects?",
    "Explain the concept of version control. How do you use Git in your workflow?",
    "How would you debug a production issue that only affects some users?",
    "Walk me through how you would design a simple REST API.",
    "What's the difference between synchronous and asynchronous programming?",
  ],
  mixed: [
    "Tell me about yourself and your technical background.",
    "What is your experience with web development? What frameworks have you used?",
    "Describe a project you're proud of. What technical decisions did you make?",
    "How do you approach learning new technologies?",
    "What are your biggest technical strengths and areas for improvement?",
  ],
}

function ruleBasedResponse(interview) {
  const qIdx = interview.messages.filter((m) => m.role === 'assistant').length
  const questions = RULE_BASED_QUESTIONS[interview.interviewType] || RULE_BASED_QUESTIONS.mixed
  const question = questions[qIdx % questions.length]

  if (qIdx === 0) {
    return `Hi! I'm your AI interview coach today. I'll be conducting a ${interview.interviewType} interview for the "${interview.role}" position. This is a safe space to practice — I'll give you feedback after each answer.\n\nLet's get started:\n\n${question}`
  }
  return `Thank you for sharing that. Good answer!\n\nNext question:\n\n${question}`
}

// GET /api/interview — list interviews
router.get('/', async (req, res, next) => {
  try {
    const interviews = await MockInterview.find({ userId: req.userId }).sort({ createdAt: -1 }).select('-messages')
    res.json({ interviews })
  } catch (e) { next(e) }
})

// POST /api/interview/start — start a new mock interview
router.post('/start', [
  body('role').isString().isLength({ min: 2 }),
  body('difficulty').optional().isIn(['easy', 'medium', 'hard']),
  body('interviewType').optional().isIn(['behavioral', 'technical', 'mixed']),
], async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ message: 'Please specify a role for the interview' })

    const role = req.body.role
    const interviewType = req.body.interviewType || 'mixed'
    const difficulty = req.body.difficulty || 'medium'

    const interview = await MockInterview.create({ userId: req.userId, role, difficulty, interviewType, messages: [] })

    // Get initial greeting from AI
    const systemPrompt = SYSTEM_PROMPT(role, interviewType)
    const aiResponse = await geminiChat(systemPrompt, [{ role: 'user', content: 'Please start the interview.' }])
    const greeting = aiResponse || ruleBasedResponse(interview)

    interview.messages.push({ role: 'assistant', content: greeting })
    await interview.save()

    res.status(201).json({ interview })
  } catch (e) { next(e) }
})

// GET /api/interview/:id — get interview with messages
router.get('/:id', [param('id').isMongoId()], async (req, res, next) => {
  try {
    const interview = await MockInterview.findOne({ _id: req.params.id, userId: req.userId })
    if (!interview) return res.status(404).json({ message: 'Interview not found' })
    res.json({ interview })
  } catch (e) { next(e) }
})

// POST /api/interview/:id/message — send a message
router.post('/:id/message', [param('id').isMongoId(), body('content').isString().isLength({ min: 1, max: 2000 })], async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ message: 'Invalid message' })

    const interview = await MockInterview.findOne({ _id: req.params.id, userId: req.userId })
    if (!interview || interview.completed) return res.status(404).json({ message: 'Interview not found or completed' })

    // Add user message
    interview.messages.push({ role: 'user', content: req.body.content })
    interview.questionsAsked++

    // Get AI response
    const systemPrompt = SYSTEM_PROMPT(interview.role, interview.interviewType)
    const aiResponse = await geminiChat(systemPrompt, interview.messages.map((m) => ({ role: m.role, content: m.content })))
    const reply = aiResponse || ruleBasedResponse(interview)

    interview.messages.push({ role: 'assistant', content: reply })
    await interview.save()

    res.json({ reply, interview })
  } catch (e) { next(e) }
})

// POST /api/interview/:id/complete — finish and get feedback
router.post('/:id/complete', [param('id').isMongoId()], async (req, res, next) => {
  try {
    const interview = await MockInterview.findOne({ _id: req.params.id, userId: req.userId })
    if (!interview) return res.status(404).json({ message: 'Interview not found' })

    const feedbackPrompt = `Based on this interview conversation, provide structured feedback as JSON:
{
  "overall": "<2-3 sentence overall assessment>",
  "strengths": ["strength1", "strength2", "strength3"],
  "improvements": ["area1", "area2", "area3"],
  "score": <0-100>
}

Interview transcript:
${interview.messages.map((m) => `${m.role}: ${m.content}`).join('\n\n').slice(0, 3000)}`

    const aiText = await geminiChat('You are an expert interview coach. Respond only with valid JSON.', [{ role: 'user', content: feedbackPrompt }])

    let feedback = { overall: 'Great effort on your mock interview! Keep practicing.', strengths: ['You participated fully'], improvements: ['Continue practicing and refining your answers'], score: 70 }

    if (aiText) {
      try { feedback = JSON.parse(aiText.replace(/```json|```/g, '').trim()) } catch {}
    }

    interview.feedback = feedback
    interview.completed = true
    interview.completedAt = new Date()
    await interview.save()

    res.json({ feedback, interview })
  } catch (e) { next(e) }
})

export default router
