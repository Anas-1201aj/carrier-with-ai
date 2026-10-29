import 'dotenv/config'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { User } from '../models/User.js'

const email = process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase()
const password = process.env.SUPER_ADMIN_PASSWORD
const name = process.env.SUPER_ADMIN_NAME?.trim() || 'Platform Administrator'

if (!email || !password || password.length < 8) {
  throw new Error('SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD (minimum 8 characters) are required')
}

await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/careerpilot')
const existing = await User.findOne({ email }).select('+passwordHash')
if (existing) {
  if (existing.role !== 'super_admin') {
    existing.role = 'super_admin'
    existing.status = 'active'
    await existing.save()
    console.log('User promoted to super admin.')
  } else {
    console.log('Super admin already exists; password was not changed.')
  }
} else {
  await User.create({ name, email, passwordHash: await bcrypt.hash(password, 12), role: 'super_admin', status: 'active' })
  console.log(`Super admin created: ${email}`)
}
await mongoose.disconnect()
