import mongoose, { Schema } from 'mongoose'

const ResumeAnalysisSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  resumeId: { type: Schema.Types.ObjectId, ref: 'Resume', required: true },
  overallScore: { type: Number, min: 0, max: 100 },
  sections: {
    contactInfo: { score: Number, feedback: String },
    summary: { score: Number, feedback: String },
    experience: { score: Number, feedback: String },
    education: { score: Number, feedback: String },
    skills: { score: Number, feedback: String },
    formatting: { score: Number, feedback: String },
  },
  extractedSkills: [String],
  missingSkills: [String],
  improvements: [String],
  strengths: [String],
  atsScore: { type: Number, min: 0, max: 100 },
  rawText: String,
  provider: { type: String, default: 'rule-based' }, // 'gemini' | 'rule-based'
}, { timestamps: true })

export const ResumeAnalysis = mongoose.model('ResumeAnalysis', ResumeAnalysisSchema)
