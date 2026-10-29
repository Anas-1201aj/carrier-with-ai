import mongoose, { Schema } from 'mongoose'

const StudentProjectSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 200 },
  description: String,
  techStack: [String],
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'intermediate' },
  estimatedHours: Number,
  learningGoals: [String],
  steps: [{ title: String, description: String, completed: { type: Boolean, default: false } }],
  status: { type: String, enum: ['recommended', 'in-progress', 'completed', 'paused'], default: 'recommended' },
  githubUrl: String,
  demoUrl: String,
  startedAt: Date,
  completedAt: Date,
  aiGenerated: { type: Boolean, default: false },
}, { timestamps: true })

export const StudentProject = mongoose.model('StudentProject', StudentProjectSchema)
