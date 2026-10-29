import mongoose, { Schema } from 'mongoose'

const ConvMessageSchema = new Schema({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
}, { _id: false })

const MentorConversationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, default: 'Career Mentorship Chat' },
  topic: String, // e.g. 'resume', 'interview', 'career-change'
  messages: [ConvMessageSchema],
  active: { type: Boolean, default: true },
}, { timestamps: true })

export const MentorConversation = mongoose.model('MentorConversation', MentorConversationSchema)
