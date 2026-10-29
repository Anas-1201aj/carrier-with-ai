import jwt from 'jsonwebtoken';
export function requireAuth(req, res, next) { const token = req.cookies?.careerpilot_token; if (!token)
    return res.status(401).json({ message: 'Authentication required' }); try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.userId;
    next();
}
catch {
    return res.status(401).json({ message: 'Session expired' });
} }
