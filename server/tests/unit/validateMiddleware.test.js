import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import validate from '../../middlewares/validateMiddleware.js';

describe('validate middleware', () => {
    const schema = z.object({
        id: z.string().min(1)
    });

    it('passes valid request data to the next middleware', () => {
        const req = {
            params: {
                id: 'course123'
            }
        };

        const res = {};
        const next = vi.fn();

        validate(schema, 'params')(req, res, next);

        expect(next).toHaveBeenCalledOnce();
        expect(next).toHaveBeenCalledWith();
        expect(req.params.id).toBe('course123');
    });

    it('passes validation errors to the error middleware', () => {
        const req = {
            params: {
                id: ''
            }
        };

        const res = {};
        const next = vi.fn();

        validate(schema, 'params')(req, res, next);

        expect(next).toHaveBeenCalledOnce();

        const error = next.mock.calls[0][0];

        expect(error.code).toBe('VALIDATION_ERROR');
        expect(error.statusCode).toBe(400);
        expect(error.details).toEqual([
            {
                path: 'id',
                message: 'Too small: expected string to have >=1 characters'
            }
        ]);
    });
});