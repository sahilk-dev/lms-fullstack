import { describe, expect, it, vi } from 'vitest';
import errorMiddleware from '../../middlewares/errorMiddleware.js';
import AppError from '../../utils/AppError.js';

describe('errorMiddleware', () => {
    it('returns the error status and message for operational errors', () => {
        const error = new AppError(
            'Course not found',
            404,
            'COURSE_NOT_FOUND'
        );

        const req = {};
        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn()
        };
        const next = vi.fn();

        errorMiddleware(error, req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);

        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Course not found',
            code: 'COURSE_NOT_FOUND'
        });
    });

    it('hides internal error details for unexpected errors', () => {
        const error = new Error('Database connection details');

        const req = {};
        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn()
        };
        const next = vi.fn();

        errorMiddleware(error, req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);

        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Internal server error',
            code: 'INTERNAL_ERROR'
        });
    });
});