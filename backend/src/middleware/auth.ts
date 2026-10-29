import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

export type AuthRequest = Request & { userId?: string; user?: { _id: unknown; role: string; status: string; name: string; email: string } }
export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) { const token = req.cookies?.careerpilot_token; if (!token) return res.status(401).json({ message: 'Authentication required' }); try { const payload = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }; req.userId = payload.userId; next() } catch { return res.status(401).json({ message: 'Session expired' }) } }
