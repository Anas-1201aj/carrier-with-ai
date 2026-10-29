import mongoose, { Schema } from 'mongoose'

const JobMatchSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  // Job data
  title: { type: String, required: true },
  company: String,
  location: String,
  remote: { type: Boolean, default: false },
  salaryMin: Number,
  salaryMax: Number,
  description: String,
  requiredSkills: [String],
  niceToHaveSkills: [String],
  experienceRequired: String,
  // Match data
  matchScore: { type: Number, min: 0, max: 100 },
  matchedSkills: [String],
  missingSkills: [String],
  matchReason: String,
  source: { type: String, default: 'system' },
  externalUrl: String,
  saved: { type: Boolean, default: false },
}, { timestamps: true })

export const JobMatch = mongoose.model('JobMatch', JobMatchSchema)
