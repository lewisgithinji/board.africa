import { z } from 'zod';

export const positionStatusSchema = z.enum(['draft', 'open', 'closed', 'filled']);
export const applicationStatusSchema = z.enum([
    'submitted',
    'reviewing',
    'shortlisted',
    'interviewing',
    'accepted',
    'rejected',
    'withdrawn',
]);

export const boardPositionSchema = z.object({
    id: z.string().uuid().optional(),
    organization_id: z.string().uuid(),
    title: z.string().min(5, 'Title must be at least 5 characters'),
    description: z.string().min(20, 'Description must be at least 20 characters'),
    requirements: z.array(z.string()).optional().nullable(),
    is_remunerated: z.boolean().default(false),
    compensation_details: z.string().optional().nullable(),
    location: z.string().optional().nullable(),
    position_type: z.string().default('Non-Executive Director'),
    status: positionStatusSchema.default('open'),
    closing_date: z.string().optional().nullable(),
});

export const applicationSchema = z.object({
    id: z.string().uuid().optional(),
    position_id: z.string().uuid(),
    profile_id: z.string().uuid(),
    status: applicationStatusSchema.default('submitted'),
    cover_letter: z.string().min(50, 'Cover letter should be at least 50 characters').optional().nullable(),
    notes: z.string().optional().nullable(),
});

export type BoardPositionInput = z.infer<typeof boardPositionSchema>;
export type ApplicationInput = z.infer<typeof applicationSchema>;
