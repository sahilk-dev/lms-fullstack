import express from 'express'
import { 
    addCourse,
    educatorDashboardData, 
    getEducatorCourses, 
    getEnrolledStudentsData, 
    updateRoleToEducator 
} from '../controllers/educatorController.js';
import upload from '../configs/multer.js';
import { protectAuth, protectEducator } from '../middlewares/authMiddleware.js';


const educatorRouter = express.Router()

// Every educator route requires authentication
educatorRouter.use(protectAuth)

// Request Educator Role 
educatorRouter.get('/update-role', updateRoleToEducator)

// Educator-only routes
educatorRouter.use(protectEducator)

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