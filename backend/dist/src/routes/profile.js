import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { StudentProfile } from '../models/StudentProfile.js';
const router = Router();
const fields = ['educationLevel', 'degree', 'graduationYear', 'technicalSkills', 'interests', 'targetRoles', 'careerGoals'];
router.get('/', async (req, res, next) => { try {
    const profile = await StudentProfile.findOne({ userId: req.userId }).lean();
    res.json({ profile });
}
catch (e) {
    next(e);
} });
router.put('/', [body('educationLevel').optional().isString(), body('degree').optional().isString(), body('graduationYear').optional().isString(), body('careerGoals').optional().isString()], async (req, res, next) => { try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
        return res.status(400).json({ message: 'Invalid profile data' });
    const update = Object.fromEntries(fields.filter((key) => req.body[key] !== undefined).map((key) => [key, req.body[key]]));
    const profile = await StudentProfile.findOneAndUpdate({ userId: req.userId }, { $set: update, $setOnInsert: { userId: req.userId } }, { upsert: true, new: true });
    res.json({ profile });
}
catch (e) {
    next(e);
} });
export default router;
