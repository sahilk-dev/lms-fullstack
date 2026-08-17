import AppError from "../utils/AppError.js"
import Course from "../models/Course.js"
import { CourseProgress } from "../models/CourseProgress.js"
import { Purchase } from "../models/Purchase.js"
import User from "../models/User.js"
import stripe from "stripe"



// Get User Data
export const getUserData = async (req, res, next) => {
    try {

        const userId = req.auth.userId

        const user = await User.findById(userId)

        if (!user) {
           throw new AppError(
                "User not found",
                404,
                "USER_NOT_FOUND"
           );
        }

        res.json({ success: true, user })

    } catch (error) {
        next(error);
    }
}

// Purchase Course 
export const purchaseCourse = async (req, res, next) => {

    try {

        const { courseId } = req.body
        const { origin } = req.headers


        const userId = req.auth.userId

        const courseData = await Course.findById(courseId)
        const userData = await User.findById(userId)

        if (!userData || !courseData) {
            throw new AppError(
                "Data not found",
                404,
                "DATA_NOT_FOUND"
            );
        }

        const purchaseData = {
            courseId: courseData._id,
            userId,
            amount: (courseData.coursePrice - courseData.discount * courseData.coursePrice / 100).toFixed(2),
        }

        const newPurchase = await Purchase.create(purchaseData)

        // Stripe Gateway Initialize
        const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY)

        const currency = process.env.CURRENCY.toLocaleLowerCase()

        // Creating line items to for Stripe
        const line_items = [{
            price_data: {
                currency,
                product_data: {
                    name: courseData.courseTitle
                },
                unit_amount: Math.floor(newPurchase.amount) * 100
            },
            quantity: 1
        }]

        const session = await stripeInstance.checkout.sessions.create({
            success_url: `${origin}/loading/my-enrollments`,
            cancel_url: `${origin}/`,
            line_items: line_items,
            mode: 'payment',
            metadata: {
                purchaseId: newPurchase._id.toString()
            }
        })

        res.json({ success: true, session_url: session.url });


    } catch (error) {
        next(error);
    }
}

// Users Enrolled Courses With Lecture Links
export const userEnrolledCourses = async (req, res, next) => {

    try {

        const userId = req.auth.userId

        const userData = await User.findById(userId)
            .populate('enrolledCourses')

        if (!userData) {
            throw new AppError(
                "User not found",
                404,
                "USER_NOT_FOUND"
            );
        }

        res.json({ success: true, enrolledCourses: userData.enrolledCourses })

    } catch (error) {
        next(error);
    }

}

// Update User Course Progress
export const updateUserCourseProgress = async (req, res, next) => {

    try {

        const userId = req.auth.userId

        const { courseId, lectureId } = req.body

        const progressData = await CourseProgress.findOne({ userId, courseId })

        if (progressData) {

            if (progressData.lectureCompleted.includes(lectureId)) {
                return res.json({ success: true, message: 'Lecture Already Completed' })
            }

            progressData.lectureCompleted.push(lectureId)
            await progressData.save()

        } else {

            await CourseProgress.create({
                userId,
                courseId,
                lectureCompleted: [lectureId]
            })

        }

        res.json({ success: true, message: 'Progress Updated' })

    } catch (error) {
        next(error);
    }

}

// get User Course Progress
export const getUserCourseProgress = async (req, res, next) => {

    try {

        const userId = req.auth.userId

        const { courseId } = req.body

        const progressData = await CourseProgress.findOne({ userId, courseId })

        res.json({ success: true, progressData })

    } catch (error) {
        next(error);
    }

}

// Add User Ratings to Course
export const addUserRating = async (req, res, next) => {

    const userId = req.auth.userId;
    const { courseId, rating } = req.body;

    try { 
        // Validate inputs
        if (!courseId || !userId || !rating || rating < 1 || rating > 5) {
            throw new AppError(
                "Invalid details",
                400,
                "INVALID_DETAILS"
            );
        }

        // Find the course by ID
        const course = await Course.findById(courseId);

        if (!course) {
            throw new AppError(
                "Course not found",
                404,
                "COURSE_NOT_FOUND"
            );
        }

        const user = await User.findById(userId);

        if (!user || !user.enrolledCourses.includes(courseId)) {
            throw new AppError(
                "User has not purchased this course",
                403,
                "COURSE_NOT_PURCHASED"
            );
        }

        // Check is user already rated
        const existingRatingIndex = course.courseRatings.findIndex(r => r.userId === userId);

        if (existingRatingIndex > -1) {
            // Update the existing rating
            course.courseRatings[existingRatingIndex].rating = rating;
        } else {
            // Add a new rating
            course.courseRatings.push({ userId, rating });
        }

        await course.save();

        return res.json({ success: true, message: 'Rating added' });
    } catch (error) {
        next(error);
    }
};