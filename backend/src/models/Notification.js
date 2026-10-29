import mongoose, { Schema } from 'mongoose'

const NotificationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: {
    type: String,
    enum: ['info', 'success', 'warning', 'achievement', 'reminder', 'system'],
    default: 'info',
  },
  title: { type: String, required: true, maxlength: 120 },
  message: { type: String, required: true, maxlength: 500 },
  read: { type: Boolean, default: false, index: true },
  actionUrl: String,
  actionLabel: String,
  icon: String,
}, { timestamps: true })

export const Notification = mongoose.model('Notification', NotificationSchema)
