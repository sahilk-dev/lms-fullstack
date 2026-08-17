import { v2 as cloudinary } from 'cloudinary'
import Course from '../models/Course.js';
import { Purchase } from '../models/Purchase.js';
import User from '../models/User.js';
import { clerkClient } from '@clerk/express'
import AppError from '../utils/AppError.js';

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
            throw new AppError(
                'Invalid course data',
                400,
                'INVALID_COURSE_DATA'
            )
        }

        parsedCourseData.educator = educatorId

        const newCourse = await Course.create(parsedCourseData)

        const imageUpload = await cloudinary.uploader.upload(imageFile.path)

        newCourse.courseThumbnail = imageUpload.secure_url

        await newCourse.save()

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