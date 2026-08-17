import { ZodError } from 'zod';
import AppError from '../utils/AppError.js';

const validate = (schema, source = 'body') => {
    return (req, res, next) => {
        try {
            const result = schema.parse(req[source]);

            req[source] = result;

            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const details = error.issues.map(issue => ({
                    path: issue.path.join('.'),
                    message: issue.message
                }));

                const validationError = new AppError(
                    'Request validation failed',
                    400,
                    'VALIDATION_ERROR'
                );

                validationError.details = details;

                return next(validationError);
            }

            next(error);
        }
    };
};

export default validate;