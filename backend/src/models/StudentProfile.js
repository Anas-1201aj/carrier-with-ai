import mongoose, { Schema } from 'mongoose'

const StudentProfileSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', unique: true, required: true, index: true },
  // Basic info (original)
  educationLevel: String,
  degree: String,
  graduationYear: String,
  technicalSkills: [String],
  interests: [String],
  targetRoles: [String],
  careerGoals: String,
  // Extended onboarding fields
  college: { type: String, trim: true, maxlength: 200 },
  university: { type: String, trim: true, maxlength: 200 },
  skillsToLearn: [String],
  experienceLevel: { type: String, enum: ['no-experience', 'some-projects', 'internship', 'professional'], default: 'no-experience' },
  weeklyLearningTime: { type: Number, min: 1, max: 80, default: 10 }, // hours per week
  onboardingStep: { type: Number, default: 0, min: 0, max: 5 },
  onboardingComplete: { type: Boolean, default: false },
  // Readiness
  readinessScore: { type: Number, default: 0, min: 0, max: 100 },
  learningStreak: { type: Number, default: 0 },
  lastStudiedAt: Date,
  resumeUrl: String,
}, { timestamps: true })

export const StudentProfile = mongoose.model('StudentProfile', StudentProfileSchema)
