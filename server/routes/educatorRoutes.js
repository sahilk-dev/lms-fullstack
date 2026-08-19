import express from 'express'
import { 
    addCourse,
    educatorDashboardData, 
    getEducatorCourses, 
    getEnrolledStudentsData, 
    updateRoleToEducator,
    updateCourse,
    publishCourse,
    unpublishCourse,
    archiveCourse
} from '../controllers/educatorController.js';

import validate from '../middlewares/validateMiddleware.js';
import { courseIdParamsSchema, courseUpdateSchema } from '../validators/courseValidator.js';
import { requireCourseOwnership } from '../middlewares/ownershipMiddleware.js';
import { protectAuth, protectEducator } from '../middlewares/authMiddleware.js';

import upload from '../configs/multer.js';


const educatorRouter = express.Router()

// Every educator route requires authentication
educatorRouter.use(protectAuth)

// Request Educator Role 
educatorRouter.get('/update-role', updateRoleToEducator)

// Educator-only routes
educatorRouter.use(protectEducator)

// Update course
educatorRouter.put(
    '/course/:id',
    validate(courseIdParamsSchema, 'params'),
    validate(courseUpdateSchema, 'body'),
    requireCourseOwnership,
    updateCourse
)

// Published course
educatorRouter.patch(
    '/courses/:id/publish',
    validate(courseIdParamsSchema, 'params'),
    requireCourseOwnership,
    publishCourse
)

// Unpublished course
educatorRouter.patch(
    '/courses/:id/unpublish',
    validate(courseIdParamsSchema, 'params'),
    requireCourseOwnership,
    unpublishCourse
)
// Archive course
educatorRouter.delete(
    '/courses/:id',
    validate(courseIdParamsSchema, 'params'),
    requireCourseOwnership,
    archiveCourse
)

// Add Courses 
educatorRouter.post(
    '/add-course', 
    upload.single('image'), 
    addCourse
)

// Get Educator Courses 
educatorRouter.get(
    '/courses', 
    getEducatorCourses
)

// Get Educator Dashboard Data
educatorRouter.get(
    '/dashboard', 
    educatorDashboardData
)

// Get Educator Students Data
educatorRouter.get(
    '/enrolled-students', 
    getEnrolledStudentsData
)


export default educatorRouter;