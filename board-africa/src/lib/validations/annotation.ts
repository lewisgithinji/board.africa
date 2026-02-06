import { z } from 'zod';

export const annotationTypeSchema = z.enum(['highlight', 'note', 'underline', 'strikethrough']);

export const positionSchema = z.object({
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number(),
});

export const createAnnotationSchema = z.object({
    document_id: z.string().uuid('Invalid document ID'),
    page_number: z.number().int().min(1, 'Page number must be at least 1'),
    annotation_type: annotationTypeSchema,
    position: positionSchema,
    content: z.string().optional(),
    color: z.string().optional(),
    is_public: z.boolean().default(false),
});

export const updateAnnotationSchema = createAnnotationSchema.partial().omit({ document_id: true });
