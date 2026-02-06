import { z } from 'zod';

export const createResolutionSchema = z.object({
    meeting_id: z.string().uuid('Invalid meeting ID'),
    title: z.string().min(3, 'Title must be at least 3 characters').max(255, 'Title must be less than 255 characters'),
    description: z.string().optional(),
    voting_type: z.enum(['simple_majority', 'two_thirds', 'unanimous']).default('simple_majority'),
    quorum_required: z.number().int().min(0, 'Quorum must be at least 0').default(0),
});

export const updateResolutionSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(255, 'Title must be less than 255 characters').optional(),
    description: z.string().optional(),
    status: z.enum(['draft', 'open', 'closed', 'passed', 'failed']).optional(),
    voting_type: z.enum(['simple_majority', 'two_thirds', 'unanimous']).optional(),
    quorum_required: z.number().int().min(0, 'Quorum must be at least 0').optional(),
});

export const voteSchema = z.object({
    vote: z.enum(['approve', 'reject', 'abstain'], {
        required_error: 'Vote choice isrequired',
        invalid_type_error: 'Vote must be approve, reject, or abstain',
    }),
    comment: z.string().max(500, 'Comment must be less than 500 characters').optional(),
});

export type CreateResolutionInput = z.infer<typeof createResolutionSchema>;
export type UpdateResolutionInput = z.infer<typeof updateResolutionSchema>;
export type VoteInput = z.infer<typeof voteSchema>;
