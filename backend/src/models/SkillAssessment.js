import mongoose, { Schema } from 'mongoose'

const QuestionSchema = new Schema({
  question: { type: String, required: true },
  options: [String], // for MCQ; empty for open-ended
  correctAnswer: String,
  explanation: String,
  points: { type: Number, default: 10 },
  userAnswer: String,
  correct: Boolean,
}, { _id: true })

const SkillAssessmentSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  skill: { type: String, required: true },
  level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
  questions: [QuestionSchema],
  score: { type: Number, min: 0, max: 100 },
  passed: Boolean,
  totalQuestions: Number,
  correctAnswers: Number,
  timeSpentSeconds: Number,
  completed: { type: Boolean, default: false },
  completedAt: Date,
}, { timestamps: true })

export const SkillAssessment = mongoose.model('SkillAssessment', SkillAssessmentSchema)
