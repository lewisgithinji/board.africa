import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { createMeetingAttendeeSchema, bulkCreateAttendeesSchema } from '@/lib/validations/meeting';

/**
 * POST /api/meeting-attendees
 * Add attendees to a meeting (bulk operation)
 */
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Get current user
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const validationResult = bulkCreateAttendeesSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                {
                    error: 'Validation failed',
                    details: validationResult.error.flatten().fieldErrors,
                },
                { status: 400 }
            );
        }

        const { meeting_id, board_member_ids } = validationResult.data;

        // Verify meeting belongs to user's organization
        const { data: meeting } = await supabase
            .from('meetings')
            .select('id')
            .eq('id', meeting_id)
            .eq('organization_id', user.id)
            .single();

        if (!meeting) {
            return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
        }

        // Create attendee records
        const attendeeRecords = board_member_ids.map((memberId) => ({
            meeting_id,
            board_member_id: memberId,
            attendance_status: 'invited' as const,
        }));

        const { data: attendees, error } = await supabase
            .from('meeting_attendees')
            .upsert(attendeeRecords, {
                onConflict: 'meeting_id,board_member_id',
                ignoreDuplicates: false,
            })
            .select(`
        *,
        board_member:board_members (
          id,
          full_name,
          avatar_url,
          position
        )
      `);

        if (error) {
            console.error('Error adding attendees:', error);
            return NextResponse.json({ error: 'Failed to add attendees' }, { status: 500 });
        }

        return NextResponse.json({ attendees }, { status: 201 });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * PATCH /api/meeting-attendees
 * Update attendee attendance status
 */
export async function PATCH(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Get current user
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { attendee_id, attendance_status, notes } = body;

        if (!attendee_id || !attendance_status) {
            return NextResponse.json(
                { error: 'attendee_id and attendance_status are required' },
                { status: 400 }
            );
        }

        // Update attendee
        const { data: attendee, error } = await supabase
            .from('meeting_attendees')
            .update({
                attendance_status,
                ...(notes !== undefined && { notes }),
            })
            .eq('id', attendee_id)
            .select(`
        *,
        meeting:meetings!inner (
          organization_id
        )
      `)
            .single();

        if (error || attendee.meeting.organization_id !== user.id) {
            return NextResponse.json({ error: 'Failed to update attendee' }, { status: 500 });
        }

        return NextResponse.json({ attendee });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * DELETE /api/meeting-attendees
 * Remove an attendee from a meeting
 */
export async function DELETE(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Get current user
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const attendeeId = searchParams.get('id');

        if (!attendeeId) {
            return NextResponse.json({ error: 'Attendee ID is required' }, { status: 400 });
        }

        // Verify and delete
        const { error } = await supabase
            .from('meeting_attendees')
            .delete()
            .eq('id', attendeeId)
            .eq('meeting_id', supabase.from('meetings').select('id').eq('organization_id', user.id));

        if (error) {
            console.error('Error removing attendee:', error);
            return NextResponse.json({ error: 'Failed to remove attendee' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
