import { Router } from 'express'
import { body, param, validationResult } from 'express-validator'
import { MentorConversation } from '../models/MentorConversation.js'
import { StudentProfile } from '../models/StudentProfile.js'
import { geminiChat } from '../services/aiProvider.js'

const router = Router()

const MENTOR_SYSTEM_PROMPT = (profile) => `You are an experienced career mentor and professional coach helping a student navigate their career journey.

Student Profile:
- Education: ${profile?.educationLevel || 'Not specified'} ${profile?.degree || ''}
- Experience Level: ${profile?.experienceLevel || 'Entry level'}
- Target Role: ${(profile?.targetRoles || []).join(', ') || 'Exploring'}
- Skills: ${(profile?.technicalSkills || []).join(', ') || 'Building skills'}
- Career Goals: ${profile?.careerGoals || 'Exploring career options'}

Your approach:
- Be warm, encouraging, and actionable
- Give specific, practical advice
- Ask follow-up questions to understand their situation better
- Focus on career planning, job search strategies, skill development, resume tips, interview prep
- Keep responses clear and concise (3-4 paragraphs max)
- Always end with an actionable suggestion or question`

const RULE_BASED_RESPONSES = [
  "Great to connect with you! I'm your AI career mentor. I'm here to help you with career planning, job search strategies, interview prep, and professional development.\n\nWhat would you like to focus on today? Are you looking for help with your career direction, job applications, interview preparation, or something else?",
  "That's a great question! Let me share some thoughts on that. Focus on building a strong foundation with practical projects that demonstrate your skills. Consider contributing to open-source projects or building a portfolio website.\n\nWhat specific area would you like to dive deeper into?",
  "I completely understand that challenge. Many students face the same situation. Here's what I'd recommend: break your goal down into smaller milestones, and track your progress weekly.\n\nHave you tried any of these approaches before? What's worked for you so far?",
]

// GET /api/mentor — list conversations
router.get('/', async (req, res, next) => {
  try {
    const conversations = await MentorConversation.find({ userId: req.userId, active: true }).sort({ updatedAt: -1 }).select('-messages')
    res.json({ conversations })
  } catch (e) { next(e) }
})

// POST /api/mentor — start a new conversation
router.post('/', [body('topic').optional().isString().isLength({ max: 100 })], async (req, res, next) => {
  try {
    const profile = await StudentProfile.findOne({ userId: req.userId })
    const systemPrompt = MENTOR_SYSTEM_PROMPT(profile)

    const conversation = await MentorConversation.create({
      userId: req.userId,
      topic: req.body.topic || 'general',
      title: req.body.topic ? `Career Chat: ${req.body.topic}` : 'Career Mentorship Chat',
      messages: [],
    })

    // Initial greeting
    const aiGreeting = await geminiChat(systemPrompt, [{ role: 'user', content: 'Hello! I would like some career guidance.' }])
    const greeting = aiGreeting || RULE_BASED_RESPONSES[0]

    conversation.messages.push({ role: 'assistant', content: greeting })
    await conversation.save()

    res.status(201).json({ conversation })
  } catch (e) { next(e) }
})

// GET /api/mentor/:id — get conversation with messages
router.get('/:id', [param('id').isMongoId()], async (req, res, next) => {
  try {
    const conversation = await MentorConversation.findOne({ _id: req.params.id, userId: req.userId })
    if (!conversation) return res.status(404).json({ message: 'Conversation not found' })
    res.json({ conversation })
  } catch (e) { next(e) }
})

// POST /api/mentor/:id/message — send a message
router.post('/:id/message', [param('id').isMongoId(), body('content').isString().isLength({ min: 1, max: 2000 })], async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ message: 'Message cannot be empty' })

    const conversation = await MentorConversation.findOne({ _id: req.params.id, userId: req.userId })
    if (!conversation) return res.status(404).json({ message: 'Conversation not found' })

    conversation.messages.push({ role: 'user', content: req.body.content })

    const profile = await StudentProfile.findOne({ userId: req.userId })
    const systemPrompt = MENTOR_SYSTEM_PROMPT(profile)
    const msgHistory = conversation.messages.slice(-20).map((m) => ({ role: m.role, content: m.content }))
    const aiResponse = await geminiChat(systemPrompt, msgHistory)

    const ruleIdx = Math.floor(Math.random() * RULE_BASED_RESPONSES.length)
    const reply = aiResponse || RULE_BASED_RESPONSES[ruleIdx]

    conversation.messages.push({ role: 'assistant', content: reply })
    await conversation.save()

    res.json({ reply, conversation })
  } catch (e) { next(e) }
})

export default router
