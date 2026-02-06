import { z } from 'zod';

// --- Template ---

const questionSchema = z.object({
    id: z.string(),
    question: z.string().min(5, 'Question must be at least 5 characters'),
    type: z.enum(['rating', 'scale', 'text', 'multi_choice']),
    options: z.array(z.string().min(1)).optional(),
    required: z.boolean().default(true),
});

export const createTemplateSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(100),
    description: z.string().max(500).optional(),
    evaluation_type: z.enum(['self_assessment', 'peer_review', 'board_evaluation']),
    questions: z.array(questionSchema).min(1, 'At least one question is required'),
});

export const updateTemplateSchema = createTemplateSchema.partial();

// --- Evaluation ---

export const createEvaluationSchema = z.object({
    template_id: z.string().uuid('Invalid template ID'),
    subject_id: z.string().uuid('Invalid subject ID').optional(),
});

export const submitEvaluationSchema = z.object({
    responses: z.record(z.union([z.string(), z.number()])),
});
