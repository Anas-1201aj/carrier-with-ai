import { Router } from 'express'
import { body, param, validationResult } from 'express-validator'
import { SkillAssessment } from '../models/SkillAssessment.js'

const router = Router()

// Question bank — basic skill assessments
const QUESTION_BANK = {
  javascript: [
    { question: 'What does `typeof null` return in JavaScript?', options: ['null', 'object', 'undefined', 'boolean'], correctAnswer: 'object', explanation: 'A longstanding bug in JavaScript — typeof null returns "object"', points: 10 },
    { question: 'Which method removes the last element from an array?', options: ['shift()', 'pop()', 'splice()', 'slice()'], correctAnswer: 'pop()', explanation: 'pop() removes and returns the last element', points: 10 },
    { question: 'What is a closure in JavaScript?', options: ['A function that has access to its outer scope variables', 'A method that closes a connection', 'A loop that terminates early', 'A CSS class'], correctAnswer: 'A function that has access to its outer scope variables', explanation: 'Closures allow functions to remember the scope they were created in', points: 15 },
    { question: 'What does the spread operator (...) do?', options: ['Spreads array/object elements into another array/object', 'Creates a new scope', 'Applies CSS styles', 'Splits a string'], correctAnswer: 'Spreads array/object elements into another array/object', explanation: 'The spread operator expands iterables', points: 10 },
    { question: 'Which of these is NOT a JavaScript data type?', options: ['string', 'boolean', 'integer', 'symbol'], correctAnswer: 'integer', explanation: 'JavaScript has "number" not "integer" as a primitive type', points: 10 },
  ],
  python: [
    { question: 'What is the output of `print(type([]))` in Python?', options: ["<class 'list'>", "<class 'array'>", "<class 'tuple'>", "<class 'dict'>"], correctAnswer: "<class 'list'>", explanation: 'Square brackets create a list in Python', points: 10 },
    { question: 'Which keyword is used to define a function in Python?', options: ['function', 'def', 'func', 'define'], correctAnswer: 'def', explanation: 'Python uses the def keyword for function definitions', points: 10 },
    { question: 'What does `len()` return for an empty list?', options: ['0', '1', 'null', 'None'], correctAnswer: '0', explanation: 'An empty list has 0 elements', points: 10 },
    { question: 'What is a list comprehension?', options: ['A compact way to create lists from iterables', 'A method to understand lists', 'A type of sorted list', 'A list with only numbers'], correctAnswer: 'A compact way to create lists from iterables', explanation: '[x for x in range(10)] is a list comprehension', points: 15 },
    { question: 'What does the `self` parameter represent in Python class methods?', options: ['The class itself', 'The current instance of the class', 'A static reference', 'A local variable'], correctAnswer: 'The current instance of the class', explanation: 'self refers to the instance calling the method', points: 15 },
  ],
  react: [
    { question: 'What is JSX?', options: ['A JavaScript extension that looks like HTML', 'A CSS framework', 'A state management tool', 'A build tool'], correctAnswer: 'A JavaScript extension that looks like HTML', explanation: 'JSX is a syntax extension that allows you to write HTML-like code in JavaScript', points: 10 },
    { question: 'What hook do you use to manage state in a functional component?', options: ['useEffect', 'useState', 'useRef', 'useContext'], correctAnswer: 'useState', explanation: 'useState is the primary hook for component state', points: 10 },
    { question: 'When does useEffect run?', options: ['Before the component renders', 'After the component renders', 'During rendering', 'Only once at mount'], correctAnswer: 'After the component renders', explanation: 'useEffect runs after the DOM is updated', points: 15 },
    { question: 'What is the purpose of a key prop in lists?', options: ['Helps React identify which items changed', 'Sets the element style', 'Defines the list order', 'Encrypts list data'], correctAnswer: 'Helps React identify which items changed', explanation: 'Keys help React efficiently update the UI', points: 10 },
    { question: 'How do you prevent unnecessary re-renders?', options: ['React.memo or useMemo', 'Using class components', 'Avoiding useState', 'Using inline styles'], correctAnswer: 'React.memo or useMemo', explanation: 'Memoization techniques prevent re-rendering when props/values have not changed', points: 15 },
  ],
  sql: [
    { question: 'What does SQL stand for?', options: ['Structured Query Language', 'Simple Question Language', 'Standard Query Logic', 'Sequential Query List'], correctAnswer: 'Structured Query Language', explanation: 'SQL is the standard language for relational databases', points: 10 },
    { question: 'Which clause filters rows AFTER grouping?', options: ['WHERE', 'HAVING', 'FILTER', 'GROUP'], correctAnswer: 'HAVING', explanation: 'HAVING filters on aggregated data, WHERE filters before aggregation', points: 15 },
    { question: 'What does JOIN do?', options: ['Combines rows from two or more tables', 'Deletes duplicate rows', 'Creates a new table', 'Sorts data'], correctAnswer: 'Combines rows from two or more tables', explanation: 'JOIN links related tables by a common column', points: 10 },
    { question: 'What is a PRIMARY KEY?', options: ['A unique identifier for each row', 'The first column of a table', 'A password for the database', 'The most important index'], correctAnswer: 'A unique identifier for each row', explanation: 'Primary key uniquely identifies each record', points: 10 },
    { question: 'Which SQL command retrieves data?', options: ['INSERT', 'SELECT', 'UPDATE', 'FETCH'], correctAnswer: 'SELECT', explanation: 'SELECT is used to query data from tables', points: 10 },
  ],
}

const DEFAULT_QUESTIONS = QUESTION_BANK.javascript

// GET /api/skillassessment — list user's assessments
router.get('/', async (req, res, next) => {
  try {
    const assessments = await SkillAssessment.find({ userId: req.userId }).sort({ createdAt: -1 }).select('-questions.correctAnswer -questions.explanation')
    res.json({ assessments })
  } catch (e) { next(e) }
})

// GET /api/skillassessment/skills — list available skills
router.get('/skills', (_req, res) => {
  res.json({ skills: Object.keys(QUESTION_BANK) })
})

// POST /api/skillassessment/start — start a new assessment
router.post('/start', [body('skill').isString().isLength({ min: 2 }), body('level').optional().isIn(['beginner', 'intermediate', 'advanced'])], async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ message: 'Invalid assessment request' })

    const skill = req.body.skill.toLowerCase()
    const questions = (QUESTION_BANK[skill] || DEFAULT_QUESTIONS).map((q) => ({
      question: q.question,
      options: q.options,
      points: q.points,
      // Do NOT send correctAnswer or explanation yet
    }))

    const assessment = await SkillAssessment.create({
      userId: req.userId,
      skill: req.body.skill,
      level: req.body.level || 'beginner',
      questions: (QUESTION_BANK[skill] || DEFAULT_QUESTIONS).map((q) => ({ ...q })),
      totalQuestions: questions.length,
    })

    res.status(201).json({
      assessmentId: assessment._id,
      skill: assessment.skill,
      level: assessment.level,
      questions, // questions without answers
    })
  } catch (e) { next(e) }
})

// POST /api/skillassessment/:id/submit — submit answers
router.post('/:id/submit', [param('id').isMongoId(), body('answers').isArray()], async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ message: 'Invalid submission' })

    const assessment = await SkillAssessment.findOne({ _id: req.params.id, userId: req.userId })
    if (!assessment || assessment.completed) return res.status(404).json({ message: 'Assessment not found or already completed' })

    const answers = req.body.answers // array of strings, indexed by question
    let correctCount = 0
    let totalPoints = 0

    assessment.questions.forEach((q, i) => {
      const userAnswer = answers[i] || ''
      q.userAnswer = userAnswer
      q.correct = userAnswer === q.correctAnswer
      if (q.correct) correctCount++
      totalPoints += q.points
    })

    const earnedPoints = assessment.questions.filter((q) => q.correct).reduce((sum, q) => sum + q.points, 0)
    assessment.score = Math.round((earnedPoints / totalPoints) * 100)
    assessment.correctAnswers = correctCount
    assessment.passed = assessment.score >= 60
    assessment.completed = true
    assessment.completedAt = new Date()

    await assessment.save()

    res.json({
      score: assessment.score,
      passed: assessment.passed,
      correctAnswers: correctCount,
      totalQuestions: assessment.totalQuestions,
      questions: assessment.questions, // now includes correctAnswer and explanation
    })
  } catch (e) { next(e) }
})

export default router
