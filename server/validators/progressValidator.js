import { z } from 'zod';

export const courseProgressParamsSchema = z.object({
    courseId: z
        .string()
        .min(1, 'Course ID is required')
});

export const lectureProgressParamsSchema = z.object({
    courseId: z
        .string()
        .min(1, 'Course ID is required'),

    lectureId: z
        .string()
        .min(1, 'Lecture ID is required')
});