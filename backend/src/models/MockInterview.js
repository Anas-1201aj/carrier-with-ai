import mongoose, { Schema } from 'mongoose'

const MessageSchema = new Schema({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
}, { _id: false })

const MockInterviewSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  role: { type: String, required: true }, // target job role
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  interviewType: { type: String, enum: ['behavioral', 'technical', 'mixed'], default: 'mixed' },
  messages: [MessageSchema],
  questionsAsked: { type: Number, default: 0 },
  feedback: {
    overall: String,
    strengths: [String],
    improvements: [String],
    score: { type: Number, min: 0, max: 100 },
  },
  completed: { type: Boolean, default: false },
  completedAt: Date,
}, { timestamps: true })

export const MockInterview = mongoose.model('MockInterview', MockInterviewSchema)
