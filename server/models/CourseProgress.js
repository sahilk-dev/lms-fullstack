import mongoose from 'mongoose';

const courseProgressSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
            index: true
        },

        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',
            required: true,
            index: true
        },

        lectureCompleted: [
            {
                type: String,
                required: true
            }
        ],

        completed: {
            type: Boolean,
            default: false
        },

        completedAt: {
            type: Date,
            default: null
        },

        lastAccessedLecture: {
            type: String,
            default: null
        }
    },
    {
        timestamps: true,
        minimize: false
    }
);

courseProgressSchema.index(
    { userId: 1, courseId: 1 },
    { unique: true }
);

export const CourseProgress = mongoose.model(
    'CourseProgress',
    courseProgressSchema
);