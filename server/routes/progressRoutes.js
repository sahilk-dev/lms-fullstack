import express from 'express';

import {
    getCourseProgress,
    markLectureCompleted,
    updateLastAccessedLecture
} from '../controllers/progressController.js';

import {
    protectAuth
} from '../middlewares/authMiddleware.js';

import validate from '../middlewares/validateMiddleware.js';

import {
    courseProgressParamsSchema,
    lectureProgressParamsSchema
} from '../validators/progressValidator.js'

const progressRouter = express.Router();

// All progress routes require authentication.
progressRouter.use(protectAuth);

// Get progress for a course.
progressRouter.get(
    '/:courseId',
    validate(courseProgressParamsSchema, 'params'),
    getCourseProgress
);

// Mark a lecture as completed.
progressRouter.patch(
    '/:courseId/lectures/:lectureId/complete',
    validate(lectureProgressParamsSchema, 'params'),
    markLectureCompleted
);

// Update last accessed lecture.
progressRouter.patch(
    '/:courseId/lectures/:lectureId/access',
    validate(lectureProgressParamsSchema, 'params'),
    updateLastAccessedLecture
);

export default progressRouter;