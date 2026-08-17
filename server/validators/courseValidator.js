import { z } from 'zod';

export const courseIdParamsSchema = z.object({
    id: z.string().min(1, 'Course ID is required')
});

export const courseQuerySchema = z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional()
});