/**
 * Validation schemas for meetings feature
 */

import { z } from 'zod';

// Meeting schema
export const meetingSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(255, 'Title must be less than 255 characters'),
    description: z.string().optional().nullable(),
    meeting_type: z.enum(['regular', 'special', 'emergency', 'annual'], {
        required_error: 'Meeting type is required',
    }),
    meeting_date: z.string().refine((val) => {
        const date = new Date(val);
        return !isNaN(date.getTime()) && date.getTime() > Date.now() - 86400000; // Allow meetings from 24h ago
    }, 'Meeting date must be a valid date'),
    duration_minutes: z.coerce.number().min(15, 'Duration must be at least 15 minutes').max(480, 'Duration cannot exceed 8 hours').optional().nullable(),
    location: z.string().max(255).optional().nullable(),
    status: z.enum(['upcoming', 'in_progress', 'completed', 'cancelled']).default('upcoming'),
    agenda: z.string().optional().nullable(),
    minutes: z.string().optional().nullable(),
    is_public: z.boolean().default(false),
    attendees: z.array(z.string().uuid()).optional(),
});

export const createMeetingSchema = meetingSchema;
export const updateMeetingSchema = meetingSchema.partial();

// Meeting attendee schema
export const meetingAttendeeSchema = z.object({
    meeting_id: z.string().uuid('Invalid meeting ID'),
    board_member_id: z.string().uuid('Invalid board member ID'),
    attendance_status: z.enum(['invited', 'attending', 'absent', 'excused']).default('invited'),
    notes: z.string().optional().nullable(),
});

export const createMeetingAttendeeSchema = meetingAttendeeSchema;
export const updateMeetingAttendeeSchema = meetingAttendeeSchema.partial().required({ meeting_id: true, board_member_id: true });

// Bulk attendee creation
export const bulkCreateAttendeesSchema = z.object({
    meeting_id: z.string().uuid('Invalid meeting ID'),
    board_member_ids: z.array(z.string().uuid('Invalid board member ID')).min(1, 'At least one board member is required'),
});

// Action item schema
export const actionItemSchema = z.object({
    meeting_id: z.string().uuid('Invalid meeting ID'),
    assigned_to: z.string().uuid('Invalid board member ID').optional().nullable(),
    title: z.string().min(3, 'Title must be at least 3 characters').max(255, 'Title must be less than 255 characters'),
    description: z.string().optional().nullable(),
    due_date: z.string().refine((val) => {
        if (!val) return true; // Optional
        const date = new Date(val);
        return !isNaN(date.getTime());
    }, 'Due date must be a valid date').optional().nullable(),
    status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).default('pending'),
});

export const createActionItemSchema = actionItemSchema;
export const updateActionItemSchema = actionItemSchema.partial();

// Type exports
export type MeetingFormData = z.infer<typeof meetingSchema>;
export type CreateMeetingRequest = z.infer<typeof createMeetingSchema>;
export type UpdateMeetingRequest = z.infer<typeof updateMeetingSchema>;

export type MeetingAttendeeFormData = z.infer<typeof meetingAttendeeSchema>;
export type CreateMeetingAttendeeRequest = z.infer<typeof createMeetingAttendeeSchema>;
export type UpdateMeetingAttendeeRequest = z.infer<typeof updateMeetingAttendeeSchema>;
export type BulkCreateAttendeesRequest = z.infer<typeof bulkCreateAttendeesSchema>;

export type ActionItemFormData = z.infer<typeof actionItemSchema>;
export type CreateActionItemRequest = z.infer<typeof createActionItemSchema>;
export type UpdateActionItemRequest = z.infer<typeof updateActionItemSchema>;
