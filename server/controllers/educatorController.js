import fs from 'fs/promises';
import { v2 as cloudinary } from 'cloudinary'
import Course from '../models/Course.js';
import { Purchase } from '../models/Purchase.js';
import User from '../models/User.js';
import { clerkClient } from '@clerk/express'
import AppError from '../utils/AppError.js';
import { success } from 'zod';

// Update role to educator
export const updateRoleToEducator = async (req, res, next) => {
    try {
        const userId = req.auth.userId

        await clerkClient.users.updateUserMetadata(userId, {
            publicMetadata: {
                role: 'educator',
            },
        })

        res.json({
            success: true,
            message: 'You can publish a course now'
        })

    } catch (error) {
        next(error)
    }
}

// Add New Course
export const addCourse = async (req, res, next) => {
    try {
        const { courseData } = req.body
        const imageFile = req.file
        const educatorId = req.auth.userId

        if (!imageFile) {
            throw new AppError(
                'Thumbnail not attached',
                400,
                'THUMBNAIL_REQUIRED'
            )
        }

        let parsedCourseData

        try {
            parsedCourseData = JSON.parse(courseData)
        } catch {
            await fs.unlink(imageFile.path).catch(() => {})
            throw new AppError(
                'Invalid course data',
                400,
                'INVALID_COURSE_DATA'
            )
        }

        let imageUpload

        try {
            imageUpload = await cloudinary.uploader.upload(imageFile.path)
        } finally {
            // temp file must go whether Cloudinary succeeded or not
            await fs.unlink(imageFile.path).catch(() => {})
        }

        parsedCourseData.educator = educatorId
        parsedCourseData.status = 'DRAFT'
        parsedCourseData.isPublished = false
        parsedCourseData.publishedAt = null
        parsedCourseData.archivedAt = null
        parsedCourseData.courseThumbnail = imageUpload.secure_url

        let newCourse

        try {
            newCourse = await Course.create(parsedCourseData)
        } catch (error) {
            // roll back the orphaned Cloudinary asset
            await cloudinary.uploader.destroy(imageUpload.public_id).catch(() => {})
            throw error
        }

        res.json({
            success: true,
            message: 'Course Added'
        })

    } catch (error) {
        next(error)
    }
}

// Get Educator Courses
export const getEducatorCourses = async (req, res, next) => {
    try {
        const educator = req.auth.userId

        const courses = await Course.find({ educator })

        res.json({
            success: true,
            courses
        })

    } catch (error) {
        next(error)
    }
}

// Get Educator Dashboard Data
export const educatorDashboardData = async (req, res, next) => {
    try {
        const educator = req.auth.userId

        const courses = await Course.find({ educator })

        const totalCourses = courses.length

        const courseIds = courses.map(course => course._id)

        const purchases = await Purchase.find({
            courseId: { $in: courseIds },
            status: 'completed'
        })

        const totalEarnings = purchases.reduce(
            (sum, purchase) => sum + purchase.amount,
            0
        )

        const enrolledStudentsData = []

        for (const course of courses) {
            const students = await User.find(
                {
                    _id: { $in: course.enrolledStudents }
                },
                'name imageUrl'
            )

            students.forEach(student => {
                enrolledStudentsData.push({
                    courseTitle: course.courseTitle,
                    student
                })
            })
        }

        res.json({
            success: true,
            dashboardData: {
                totalEarnings,
                enrolledStudentsData,
                totalCourses
            }
        })

    } catch (error) {
        next(error)
    }
}

// Get Enrolled Students Data with Purchase Data
export const getEnrolledStudentsData = async (req, res, next) => {
    try {
        const educator = req.auth.userId

        const courses = await Course.find({ educator })

        const courseIds = courses.map(course => course._id)

        const purchases = await Purchase.find({
            courseId: { $in: courseIds },
            status: 'completed'
        })
            .populate('userId', 'name imageUrl')
            .populate('courseId', 'courseTitle')

        const enrolledStudents = purchases.map(purchase => ({
            student: purchase.userId,
            courseTitle: purchase.courseId.courseTitle,
            purchaseDate: purchase.createdAt
        }))

        res.json({
            success: true,
            enrolledStudents
        })

    } catch (error) {
        next(error)
    }
};

// Update course
export const updateCourse = async(req, res, next) => {
    try {
        const { id } = req.params;

        const allowedUpdates = req.body;

        const course = await Course.findByIdAndUpdate(
            id,
            {
                $set: allowedUpdates
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!course) {
            throw new AppError(
                'Course not found',
                404,
                'COURSE_NOT-FOUND'
            );
        }

        res.json({
            success: true,
            message: 'Course updated successfully',
            course
        });

    } catch (error) {
        next(error);
    }
};

// Publish course
export const publishCourse = async(req, res, next) => {
    try {
        const { id } = req.params;

        const course = await Course.findById(id);

        if (!course) {
            throw new AppError(
                'Course not found',
                404,
                'COURSE_NOT_FOUND'
            );
        }

        if (course.status === 'ARCHIEVED') {
            throw new AppError(
                'Archieved courses cannot be published',
                409,
                'COURSE_ARCHIEVED'
            );
        }

        if (course.status === 'PUBLISHED') {
            throw new AppError(
                'Course is already published',
                409,
                'COURSE_ALREADY_PUBLISHED'
            );
        }

        course.status = 'PUBLISHED';
        course.isPublished = true;
        course.publishedAt = new Date();
        course.archivedAt = null;

        await course.save();

        res.json({
            success: true,
            message: 'Course published successfully',
            course
        });

    } catch (error) {
        next(error);
    }
};

// Unpublish course
export const unpublishCourse = async(req, res, next) => {
    try {
        const { id } = req.params;

        const course = await Course.findById(id);

        if (!course) {
            throw new AppError(
                'Course not found',
                404,
                'COURSE_NOT_FOUND'
            );
        }

        if(course.status !== 'PUBLISHED') {
            throw new AppError(
                'Only published courses can be unpublished',
                409,
                'COURSE_NOT_PUBLISHED'
            );
        }

        course.status = 'DRAFT';
        course.isPublished = false;

        await course.save();

        res.json({
            success: true,
            message: 'Course unpublished successfully',
            course
        });

    } catch (error) {
        next(error)
    }
};

// Archive course
export const archiveCourse = async (req, res, next) => {
    try {
        const { id } = req.params;

        const course = await Course.findById(id);

        if (!course) {
            throw new AppError(
                'Course not found',
                404,
                'COURSE_NOT_FOUND'
            );
        }

        if (course.status === 'ARCHIVED') {
            throw new AppError(
                'Course is already archived',
                409,
                'COURSE_ALREADY_ARCHIVED'
            );
        }

        course.status = 'ARCHIVED';
        course.isPublished = false;
        course.archivedAt = new Date();

        await course.save();

        res.json({
            success: true,
            message: 'Course archived successfully',
            course
        });

    } catch (error) {
        next(error);
    }
};

// Replace course thumbnail
export const replaceCourseThumbnail = async (req, res, next) => {
    try {
        const imageFile = req.file

        if (!imageFile) {
            throw new AppError(
                'Thumbnail not attached',
                400,
                'THUMBNAIL_REQUIRED'
            )
        }

        let imageUpload

        try {
            imageUpload = await cloudinary.uploader.upload(imageFile.path)
        } finally {
            await fs.unlink(imageFile.path).catch(() => {})
        }

        const course = await Course.findByIdAndUpdate(
            req.course._id,
            { courseThumbnail: imageUpload.secure_url },
            { new: true, runValidators: true }
        )

        res.json({
            success: true,
            message: 'Thumbnail updated',
            courseThumbnail: course.courseThumbnail
        })

    } catch (error) {
        next(error)
    }
}