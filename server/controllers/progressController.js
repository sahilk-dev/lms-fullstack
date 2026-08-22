import Course from '../models/Course.js';
import { CourseProgress } from '../models/CourseProgress.js';
import AppError from '../utils/AppError.js';

// Get course progress for the authenticated student.
export const getCourseProgress = async (req, res, next) => {
    try {
        const userId = req.auth?.userId;
        const { courseId } = req.params;

        const course = await Course.findById(courseId).select(
            'courseContent courseTitle'
        );

        if (!course) {
            throw new AppError(
                'Course not found',
                404,
                'COURSE_NOT_FOUND'
            );
        }

        let progress = await CourseProgress.findOne({
            userId,
            courseId
        });

        // Create progress document when the student accesses
        // the course for the first time.
        if (!progress) {
            progress = await CourseProgress.create({
                userId,
                courseId,
                lectureCompleted: [],
                completed: false,
                completedAt: null,
                lastAccessedLecture: null
            });
        }

        const totalLectures = course.courseContent.reduce(
            (total, chapter) => total + chapter.chapterContent.length,
            0
        );

        const completedLectures = progress.lectureCompleted.length;

        const progressPercentage =
            totalLectures === 0
                ? 0
                : Math.round(
                    (completedLectures / totalLectures) * 100
                );

        res.json({
            success: true,
            progress: {
                courseId,
                courseTitle: course.courseTitle,
                completed: progress.completed,
                completedAt: progress.completedAt,
                lastAccessedLecture: progress.lastAccessedLecture,
                lectureCompleted: progress.lectureCompleted,
                totalLectures,
                completedLectures,
                progressPercentage
            }
        });
    } catch (error) {
        next(error);
    }
};

// Mark a lecture as completed.
export const markLectureCompleted = async (req, res, next) => {
    try {
        const userId = req.auth?.userId;
        const { courseId, lectureId } = req.params;

        const course = await Course.findById(courseId).select(
            'courseContent'
        );

        if (!course) {
            throw new AppError(
                'Course not found',
                404,
                'COURSE_NOT_FOUND'
            );
        }

        const lectureExists = course.courseContent.some(chapter =>
            chapter.chapterContent.some(
                lecture => lecture.lectureId === lectureId
            )
        );

        if (!lectureExists) {
            throw new AppError(
                'Lecture not found in this course',
                404,
                'LECTURE_NOT_FOUND'
            );
        }

        let progress = await CourseProgress.findOne({
            userId,
            courseId
        });

        if (!progress) {
            progress = await CourseProgress.create({
                userId,
                courseId,
                lectureCompleted: []
            });
        }

        // Prevent duplicate lecture IDs.
        if (!progress.lectureCompleted.includes(lectureId)) {
            progress.lectureCompleted.push(lectureId);
        }

        progress.lastAccessedLecture = lectureId;

        const totalLectures = course.courseContent.reduce(
            (total, chapter) => total + chapter.chapterContent.length,
            0
        );

        const completedLectures =
            progress.lectureCompleted.length;

        if (
            totalLectures > 0 &&
            completedLectures >= totalLectures
        ) {
            progress.completed = true;

            if (!progress.completedAt) {
                progress.completedAt = new Date();
            }
        }

        await progress.save();

        const progressPercentage =
            totalLectures === 0
                ? 0
                : Math.round(
                    (completedLectures / totalLectures) * 100
                );

        res.json({
            success: true,
            message: 'Lecture marked as completed',
            progress: {
                lectureCompleted: progress.lectureCompleted,
                completed: progress.completed,
                completedAt: progress.completedAt,
                lastAccessedLecture: progress.lastAccessedLecture,
                totalLectures,
                completedLectures,
                progressPercentage
            }
        });
    } catch (error) {
        next(error);
    }
};

// Update the student's last accessed lecture.
export const updateLastAccessedLecture = async (
    req,
    res,
    next
) => {
    try {
        const userId = req.auth?.userId;
        const { courseId, lectureId } = req.params;

        const course = await Course.findById(courseId).select(
            'courseContent'
        );

        if (!course) {
            throw new AppError(
                'Course not found',
                404,
                'COURSE_NOT_FOUND'
            );
        }

        const lectureExists = course.courseContent.some(chapter =>
            chapter.chapterContent.some(
                lecture => lecture.lectureId === lectureId
            )
        );

        if (!lectureExists) {
            throw new AppError(
                'Lecture not found in this course',
                404,
                'LECTURE_NOT_FOUND'
            );
        }

        const progress = await CourseProgress.findOneAndUpdate(
            {
                userId,
                courseId
            },
            {
                $set: {
                    lastAccessedLecture: lectureId
                }
            },
            {
                new: true,
                upsert: true,
                setDefaultsOnInsert: true
            }
        );

        res.json({
            success: true,
            message: 'Last accessed lecture updated',
            lastAccessedLecture:
                progress.lastAccessedLecture
        });
    } catch (error) {
        next(error);
    }
};