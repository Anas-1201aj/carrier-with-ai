import type { NextFunction, Response } from 'express'
import { User } from '../models/User.js'
import type { AuthRequest } from './auth.js'

export async function requireSuperAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.userId) return res.status(401).json({ message: 'Authentication required' })
  const user = await User.findById(req.userId).select('role status name email')
  if (!user || user.status !== 'active') return res.status(401).json({ message: 'Active account required' })
  if (user.role !== 'super_admin') return res.status(403).json({ message: 'Super admin access required' })
  req.user = user
  next()
}
