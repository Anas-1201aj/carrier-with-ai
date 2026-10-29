import mongoose, { Schema } from 'mongoose'

const ResumeSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  path: { type: String, required: true }, // local disk path
  mimetype: { type: String, required: true },
  size: { type: Number, required: true },
  active: { type: Boolean, default: true },
}, { timestamps: true })

export const Resume = mongoose.model('Resume', ResumeSchema)
