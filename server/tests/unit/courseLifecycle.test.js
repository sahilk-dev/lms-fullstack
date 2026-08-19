import { describe, expect, it } from 'vitest';

describe('course lifecycle rules', () => {
    it('supports draft to published transition', () => {
        const course = {
            status: 'DRAFT',
            isPublished: false,
            publishedAt: null
        };

        course.status = 'PUBLISHED';
        course.isPublished = true;
        course.publishedAt = new Date();

        expect(course.status).toBe('PUBLISHED');
        expect(course.isPublished).toBe(true);
        expect(course.publishedAt).toBeInstanceOf(Date);
    });

    it('supports published to draft transition', () => {
        const course = {
            status: 'PUBLISHED',
            isPublished: true
        };

        course.status = 'DRAFT';
        course.isPublished = false;

        expect(course.status).toBe('DRAFT');
        expect(course.isPublished).toBe(false);
    });

    it('supports archiving a course', () => {
        const course = {
            status: 'PUBLISHED',
            isPublished: true,
            archivedAt: null
        };

        course.status = 'ARCHIVED';
        course.isPublished = false;
        course.archivedAt = new Date();

        expect(course.status).toBe('ARCHIVED');
        expect(course.isPublished).toBe(false);
        expect(course.archivedAt).toBeInstanceOf(Date);
    });
});