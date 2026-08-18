import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('../../models/Course.js', () => ({
    default: {
        findById: vi.fn()
    }
}));

import Course from '../../models/Course.js';
import { requireCourseOwnership } from '../../middlewares/ownershipMiddleware.js';

describe('requireCourseOwnership', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('allows the educator who owns the course', async () => {
        Course.findById.mockReturnValue({
            select: vi.fn().mockResolvedValue({
                _id: 'course_123',
                educator: 'educator_123'
            })
        });

        const req = {
            auth: {
                userId: 'educator_123'
            },
            params: {
                id: 'course_123'
            }
        };

        const res = {};
        const next = vi.fn();

        await requireCourseOwnership(req, res, next);

        expect(next).toHaveBeenCalledOnce();
        expect(next).toHaveBeenCalledWith();

        expect(req.course).toEqual({
            _id: 'course_123',
            educator: 'educator_123'
        });
    });

    it('rejects a different educator', async () => {
        Course.findById.mockReturnValue({
            select: vi.fn().mockResolvedValue({
                _id: 'course_123',
                educator: 'educator_456'
            })
        });

        const req = {
            auth: {
                userId: 'educator_123'
            },
            params: {
                id: 'course_123'
            }
        };

        const res = {};
        const next = vi.fn();

        await requireCourseOwnership(req, res, next);

        expect(next).toHaveBeenCalledOnce();

        const error = next.mock.calls[0][0];

        expect(error.statusCode).toBe(403);
        expect(error.code).toBe('COURSE_ACCESS_FORBIDDEN');
    });

    it('rejects a missing course', async () => {
        Course.findById.mockReturnValue({
            select: vi.fn().mockResolvedValue(null)
        });

        const req = {
            auth: {
                userId: 'educator_123'
            },
            params: {
                id: 'course_123'
            }
        };

        const res = {};
        const next = vi.fn();

        await requireCourseOwnership(req, res, next);

        const error = next.mock.calls[0][0];

        expect(error.statusCode).toBe(404);
        expect(error.code).toBe('COURSE_NOT_FOUND');
    });

    it('rejects an unauthenticated request', async () => {
        const req = {
            auth: {},
            params: {
                id: 'course_123'
            }
        };

        const res = {};
        const next = vi.fn();

        await requireCourseOwnership(req, res, next);

        const error = next.mock.calls[0][0];

        expect(error.statusCode).toBe(401);
        expect(error.code).toBe('AUTHENTICATION_REQUIRED');

        expect(Course.findById).not.toHaveBeenCalled();
    });
});