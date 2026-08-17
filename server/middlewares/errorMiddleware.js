import mongoose from 'mongoose';

const errorMiddleware = (err, req, res, next) => {
    console.log(err);

    if(err instanceof mongoose.Error.ValidationError) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            code: 'VALIDATION_ERROR'
        });
    }

    if (err instanceof mongoose.Error.CastError) {
        return res.status(400).json({
            success: false,
            message: 'Invalid resource identifier',
            code: 'INVALID_ID'
        });
    }

    if (err.code === 11000) {
        return res.status(409).json({
            success: false,
            message: 'Resource already exists',
            code: 'DUPLICATE_RESOURCE'
        });
    }

    const statusCode = err.statusCode || 500;

    return res.status(statusCode).json({
        success: false,
        message:
            statusCode === 500
                ? 'Internal server error'
                : err.message,
            code: err.code || 'INTERNAL_ERROR',
            ...(err.details && { details: err.details })
    });
};

export default errorMiddleware;