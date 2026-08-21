import Course from "../models/Course.js";
import AppError from "../utils/AppError.js";

export const requireCourseOwnership = async (req, res, next) => {
    try {
        const userId = req.auth?.userId;
        const { id } = req.params;

        if (!userId) {
            throw new AppError(
                "Authentication required",
                401,
                "AUTHENTICATION_REQUIRED"
            );
        }

        if (!id) {
            throw new AppError(
                "Course ID is required",
                400,
                "COURSE_ID_REQUIRED"
            );
        }

        const course = await Course.findById(id).select("_id educator");

        if (!course) {
            throw new AppError(
                "Course not found",
                404,
                "COURSE_NOT_FOUND"
            );
        }

        if (course.educator !== userId) {
            throw new AppError(
                "You do not have access to this course",
                403,
                "COURSE_ACCESS_FORBIDDEN"
            );
        }

        req.course = course;

        next();

    } catch (error) {
        next(error);
    }
};