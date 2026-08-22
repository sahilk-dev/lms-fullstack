import mongoose from 'mongoose';

const courseProgressSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    courseId: { type: String, required: true },
    completed: { type: Boolean, default: false },
    lectureCompleted: [
        {
            type: String
        }
    ]
}, { timestamps: true, minimize: false });

courseProgressSchema.index(
    { userId: 1, courseId: 1 },
    { unique: true }
);

export const CourseProgress = mongoose.model('CourseProgress', courseProgressSchema);