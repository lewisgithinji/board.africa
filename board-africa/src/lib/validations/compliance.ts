import { z } from 'zod';

// ── Calendar Events ──────────────────────────────────────────────────────────

export const createCalendarEventSchema = z.object({
    regulation_id: z.string().uuid('Invalid regulation ID').optional(),
    title: z.string().min(3, 'Title must be at least 3 characters').max(200),
    description: z.string().max(1000).optional(),
    event_type: z.enum(['deadline', 'review', 'filing', 'training', 'audit']).default('deadline'),
    due_date: z.string().min(8, 'Due date is required'),
});

export const updateCalendarEventSchema = z.object({
    title: z.string().min(3).max(200).optional(),
    description: z.string().max(1000).optional(),
    event_type: z.enum(['deadline', 'review', 'filing', 'training', 'audit']).optional(),
    due_date: z.string().min(8).optional(),
    status: z.enum(['upcoming', 'overdue', 'completed', 'cancelled']).optional(),
});

// ── Checklists ────────────────────────────────────────────────────────────────

export const createChecklistSchema = z.object({
    regulation_id: z.string().uuid('Invalid regulation ID').optional(),
    title: z.string().min(3, 'Title must be at least 3 characters').max(200),
    description: z.string().max(1000).optional(),
    category: z.string().max(40).optional(),
    due_date: z.string().min(8).optional(),
});

export const updateChecklistSchema = z.object({
    title: z.string().min(3).max(200).optional(),
    description: z.string().max(1000).optional(),
    status: z.enum(['draft', 'in_progress', 'completed', 'archived']).optional(),
    due_date: z.string().min(8).optional(),
});

// ── Checklist Items ───────────────────────────────────────────────────────────

export const createChecklistItemSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(200),
    description: z.string().max(500).optional(),
    order_index: z.number().int().min(0).optional(),
});

export const updateChecklistItemSchema = z.object({
    title: z.string().min(3).max(200).optional(),
    description: z.string().max(500).optional(),
    status: z.enum(['pending', 'in_progress', 'completed', 'skipped']).optional(),
});
