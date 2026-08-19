import { z } from 'zod';

export const courseIdParamsSchema = z.object({
    id: z.string().min(1, 'Course ID is required')
});

export const courseUpdateSchema = z.object({
    courseTitle: z.string().trim().min(3).max(200).optional(),

    courseDescription: z.string().trim().min(10).optional(),

    coursePrice: z.number().nonnegative().optional(),

    discount: z.number().min(0).max(100).optional(),

    courseThumbnail: z.string().url().optional(),

    courseContent: z.array(z.object({
        chapterId: z.string(),
        chapterOrder: z.number().int().nonnegative(),
        chapterTitle: z.string().trim().min(1),
        chapterContent: z.array(z.object({
            lectureId: z.string(),
            lectureTitle: z.string().trim().min(1),
            lectureDuration: z.number().nonnegative(),
            lectureUrl: z.string().url(),
            isPreviewFree: z.boolean(),
            lectureOrder: z.number().int().nonnegative()
        }))
    })).optional()
});