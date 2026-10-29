import mongoose, { Schema } from 'mongoose';
const StudentProfileSchema = new Schema({ userId: { type: Schema.Types.ObjectId, ref: 'User', unique: true, required: true }, educationLevel: String, degree: String, graduationYear: String, technicalSkills: [String], interests: [String], targetRoles: [String], careerGoals: String }, { timestamps: true });
export const StudentProfile = mongoose.model('StudentProfile', StudentProfileSchema);
