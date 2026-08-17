import Course from "../models/Course.js"
import AppError from "../utils/AppError.js"

// Get All Courses
export const getAllCourse = async (req, res, next) => {
    try {

        const courses = await Course.find({ isPublished: true })
            .select(['-courseContent', '-enrolledStudents'])
            .populate({ path: 'educator', select: '-password' })

        res.json({ success: true, courses })

    } catch (error) {
        next(error)
    }
}

// Get Course by Id
export const getCourseId = async (req, res, next) => {

    const { id } = req.params

    try {

        const courseData = await Course.findById(id)
            .populate({ path: 'educator' })

        if (!courseData) {
            throw new AppError(
                'Course not found',
                404,
                'COURSE_NOT_FOUND'
            )
        }

        // Remove lectureUrl if isPreviewFree is false
        courseData.courseContent.forEach(chapter => {
            chapter.chapterContent.forEach(lecture => {
                if (!lecture.isPreviewFree) {
                    lecture.lectureUrl = "";
                }
            });
        });

        res.json({ success: true, courseData })

    } catch (error) {
        next(error)
    }
}