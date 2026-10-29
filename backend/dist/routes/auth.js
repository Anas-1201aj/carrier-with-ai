import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
const router = Router();
const validate = [body('email').isEmail().normalizeEmail(), body('password').isLength({ min: 8 })];
function issue(res, user) { const token = jwt.sign({ userId: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '7d' }); res.cookie('careerpilot_token', token, { httpOnly: true, sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 7 * 24 * 60 * 60 * 1000 }); return res.json({ user: { id: user._id, name: user.name, email: user.email } }); }
router.post('/register', [body('name').trim().isLength({ min: 2 }), ...validate], async (req, res, next) => { try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
        return res.status(400).json({ message: 'Please check your details', errors: errors.array() });
    const exists = await User.findOne({ email: req.body.email });
    if (exists)
        return res.status(409).json({ message: 'An account with that email already exists' });
    const passwordHash = await bcrypt.hash(req.body.password, 12);
    const user = await User.create({ name: req.body.name, email: req.body.email, passwordHash });
    issue(res, user);
}
catch (error) {
    next(error);
} });
router.post('/login', validate, async (req, res, next) => { try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
        return res.status(400).json({ message: 'Please enter a valid email and password' });
    const user = await User.findOne({ email: req.body.email });
    if (!user || !(await bcrypt.compare(req.body.password, user.passwordHash)))
        return res.status(401).json({ message: 'Invalid email or password' });
    issue(res, user);
}
catch (error) {
    next(error);
} });
router.post('/logout', (_req, res) => { res.clearCookie('careerpilot_token'); res.json({ message: 'Logged out' }); });
export default router;
