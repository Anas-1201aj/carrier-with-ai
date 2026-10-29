import mongoose, { Schema } from 'mongoose'

const MilestoneSchema = new Schema({
  title: { type: String, required: true },
  description: String,
  skills: [String],
  resources: [{ title: String, url: String, type: { type: String, enum: ['video', 'article', 'course', 'project'] } }],
  estimatedWeeks: { type: Number, default: 2 },
  order: { type: Number, required: true },
  completed: { type: Boolean, default: false },
  completedAt: Date,
}, { _id: true })

const CareerRoadmapSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  assessmentId: { type: Schema.Types.ObjectId, ref: 'CareerAssessment' },
  title: { type: String, required: true },
  targetRole: { type: String, required: true },
  description: String,
  estimatedMonths: { type: Number, default: 6 },
  milestones: [MilestoneSchema],
  currentMilestone: { type: Number, default: 0 },
  progressPercent: { type: Number, default: 0, min: 0, max: 100 },
  active: { type: Boolean, default: true },
}, { timestamps: true })

export const CareerRoadmap = mongoose.model('CareerRoadmap', CareerRoadmapSchema)
