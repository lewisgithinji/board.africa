import { z } from 'zod';

export const agendaItemTypeSchema = z.enum(['regular', 'consent', 'presentation', 'vote', 'break']);
export const agendaItemStatusSchema = z.enum(['pending', 'in_progress', 'completed', 'skipped']);

export const createAgendaItemSchema = z.object({
    meeting_id: z.string().uuid('Invalid meeting ID'),
    parent_id: z.string().uuid('Invalid parent item ID').nullable().optional(),
    title: z.string().min(1, 'Title is required').max(255),
    description: z.string().optional().nullable(),
    duration_minutes: z.number().int().min(0).default(5),
    order_index: z.number().int().min(0).default(0),
    item_type: agendaItemTypeSchema.default('regular'),
    document_id: z.string().uuid('Invalid document ID').nullable().optional(),
    resolution_id: z.string().uuid('Invalid resolution ID').nullable().optional(),
    presenter_id: z.string().uuid('Invalid board member ID').nullable().optional(),
    status: agendaItemStatusSchema.default('pending'),
});

export const updateAgendaItemSchema = createAgendaItemSchema.partial().omit({ meeting_id: true });

export const bulkUpdateAgendaItemsSchema = z.array(
    z.object({
        id: z.string().uuid(),
        order_index: z.number().int().min(0),
        parent_id: z.string().uuid().nullable().optional(),
    })
);
