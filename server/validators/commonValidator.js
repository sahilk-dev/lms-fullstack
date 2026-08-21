import { z } from 'zod';

export const objectIdParamSchema = z.object({
    id: z.string().min(1, 'ID is required')
});