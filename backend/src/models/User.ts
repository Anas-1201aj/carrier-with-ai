import mongoose, { Schema } from 'mongoose'

export const USER_ROLES = ['student', 'super_admin'] as const
export type UserRole = (typeof USER_ROLES)[number]

const UserSchema = new Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: USER_ROLES, default: 'student', required: true, index: true },
  status: { type: String, enum: ['active', 'deactivated'], default: 'active', required: true, index: true },
  lastActivityAt: { type: Date, default: Date.now, index: true },
}, { timestamps: true })

export const User = mongoose.model('User', UserSchema)
