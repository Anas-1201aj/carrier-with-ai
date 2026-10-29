import mongoose, { Schema } from 'mongoose'

const CareerAssessmentSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  // Assessment inputs
  educationLevel: String,
  degree: String,
  experienceLevel: { type: String, enum: ['no-experience', 'some-projects', 'internship', 'professional'] },
  technicalSkills: [String],
  interests: [String],
  preferredWorkStyle: { type: String, enum: ['remote', 'hybrid', 'onsite', 'flexible'] },
  learningStyle: { type: String, enum: ['videos', 'reading', 'projects', 'mentorship'] },
  careerGoals: String,
  targetRoles: [String],
  salaryExpectation: String,
  // Results
  recommendedPaths: [{ title: String, match: Number, description: String, skills: [String] }],
  primaryPath: String,
  readinessScore: { type: Number, min: 0, max: 100 },
  completed: { type: Boolean, default: false },
}, { timestamps: true })

export const CareerAssessment = mongoose.model('CareerAssessment', CareerAssessmentSchema)
