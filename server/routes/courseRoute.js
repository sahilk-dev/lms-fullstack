import express from 'express'
import { getAllCourse, getCourseId } from '../controllers/courseController.js';
import validate from '../middlewares/validateMiddleware.js';
import { courseIdParamsSchema } from '../validators/courseValidator.js';

const courseRouter = express.Router()

// Get All Course
courseRouter.get('/all', getAllCourse)

// Get Course Data By Id
courseRouter.get(
    '/:id',
    validate(courseIdParamsSchema, 'params'),
    getCourseId
)

export default courseRouter;