import mongoose, { Schema } from 'mongoose'

const JobApplicationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  company: { type: String, required: true, trim: true },
  role: { type: String, required: true, trim: true },
  location: String,
  remote: { type: Boolean, default: false },
  salaryMin: Number,
  salaryMax: Number,
  jobUrl: String,
  status: {
    type: String,
    enum: ['wishlist', 'applied', 'phone-screen', 'interview', 'offer', 'rejected', 'accepted', 'withdrawn'],
    default: 'wishlist',
    index: true,
  },
  appliedAt: Date,
  notes: String,
  resumeUsed: { type: Schema.Types.ObjectId, ref: 'Resume' },
  nextStep: String,
  nextStepDate: Date,
  contactName: String,
  contactEmail: String,
  offer: {
    salary: Number,
    deadline: Date,
    notes: String,
  },
}, { timestamps: true })

export const JobApplication = mongoose.model('JobApplication', JobApplicationSchema)
