import mongoose, { Schema } from 'mongoose'

const AuditLogSchema = new Schema({
  actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  action: { type: String, required: true, maxlength: 120 },
  targetId: { type: Schema.Types.ObjectId, ref: 'User' },
  metadata: { type: Schema.Types.Mixed, default: {} },
}, { timestamps: true })

export const AuditLog = mongoose.model('AuditLog', AuditLogSchema)
