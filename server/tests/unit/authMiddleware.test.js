import { describe, expect, it, vi } from 'vitest';

vi.mock('@clerk/express', () => ({
    clerkClient: {
        users: {
            getUser: vi.fn()
        }
    }
}));

import { clerkClient } from '@clerk/express';
import {
    protectAuth,
    protectEducator
} from '../../middlewares/authMiddleware.js';


describe('protectAuth', () => {
    it('allows authenticated users', async () => {
        const req = {
            auth: {
                userId: 'user_123'
            }
        };

        const res = {};
        const next = vi.fn();

        await protectAuth(req, res, next);

        expect(next).toHaveBeenCalledOnce();
        expect(next).toHaveBeenCalledWith();
    });


    it('rejects unauthenticated users', async () => {
        const req = {
            auth: {}
        };

        const res = {};
        const next = vi.fn();

        await protectAuth(req, res, next);

        expect(next).toHaveBeenCalledOnce();

        const error = next.mock.calls[0][0];

        expect(error.statusCode).toBe(401);
        expect(error.code).toBe('AUTHENTICATION_REQUIRED');
    });
});


describe('protectEducator', () => {
    it('allows users with the educator role', async () => {
        clerkClient.users.getUser.mockResolvedValue({
            publicMetadata: {
                role: 'educator'
            }
        });

        const req = {
            auth: {
                userId: 'educator_123'
            }
        };

        const res = {};
        const next = vi.fn();

        await protectEducator(req, res, next);

        expect(next).toHaveBeenCalledOnce();
        expect(next).toHaveBeenCalledWith();
    });


    it('rejects authenticated users without educator role', async () => {
        clerkClient.users.getUser.mockResolvedValue({
            publicMetadata: {
                role: 'student'
            }
        });

        const req = {
            auth: {
                userId: 'student_123'
            }
        };

        const res = {};
        const next = vi.fn();

        await protectEducator(req, res, next);

        expect(next).toHaveBeenCalledOnce();

        const error = next.mock.calls[0][0];

        expect(error.statusCode).toBe(403);
        expect(error.code).toBe('EDUCATOR_ACCESS_REQUIRED');
    });
});