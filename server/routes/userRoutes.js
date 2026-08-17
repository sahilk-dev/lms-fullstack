import express from 'express'
import { 
    addUserRating, 
    getUserCourseProgress, 
    getUserData, 
    purchaseCourse, 
    updateUserCourseProgress, 
    userEnrolledCourses 
} from '../controllers/userController.js';
import { protectAuth } from '../middlewares/authMiddleware.js';


const userRouter = express.Router()

// All user routes require authentication
userRouter.use(protectAuth)

// Get user Data
userRouter.get('/data', getUserData)

// Purchase course
userRouter.post('/purchase', purchaseCourse)

// Get enrolled courses
userRouter.get('/enrolled-courses', userEnrolledCourses)

// Update course progress
userRouter.post('/update-course-progress', updateUserCourseProgress)

// Get course progress
userRouter.post('/get-course-progress', getUserCourseProgress)

// Add course rating
userRouter.post('/add-rating', addUserRating)

export default userRouter;