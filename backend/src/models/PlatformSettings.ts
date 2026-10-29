import mongoose, { Schema } from 'mongoose'

const PlatformSettingsSchema = new Schema({
  singleton: { type: String, unique: true, default: 'platform', immutable: true },
  platformName: { type: String, default: 'CareerPilot AI', trim: true, maxlength: 120 },
  features: { type: Map, of: Boolean, default: {} },
}, { timestamps: true })

export const PlatformSettings = mongoose.model('PlatformSettings', PlatformSettingsSchema)
