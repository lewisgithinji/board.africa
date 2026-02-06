import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { updateMeetingSchema } from '@/lib/validations/meeting';

/**
 * GET /api/meetings/[id]
 * Get a single meeting with all related data
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
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

        // Fetch meeting with all related data
        const { data: meeting, error } = await supabase
            .from('meetings')
            .select(`
        *,
        meeting_attendees (
          id,
          attendance_status,
          notes,
          board_member:board_members (
            id,
            full_name,
            email,
            avatar_url,
            position
          )
        ),
        action_items (
          id,
          title,
          description,
          status,
          due_date,
          completed_at,
          assigned_to,
          board_member:board_members (
            id,
            full_name,
            avatar_url
          )
        ),
        documents (
          id,
          title,
          file_name,
          file_size,
          file_type,
          created_at
        )
      `)
            .eq('id', id)
            .eq('organization_id', user.id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
            }
            console.error('Error fetching meeting:', error);
            return NextResponse.json({ error: 'Failed to fetch meeting' }, { status: 500 });
        }

        return NextResponse.json({ meeting });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * PATCH /api/meetings/[id]
 * Update a meeting
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
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

        // Parse and validate request body
        const body = await request.json();
        const validationResult = updateMeetingSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                {
                    error: 'Validation failed',
                    details: validationResult.error.flatten().fieldErrors,
                },
                { status: 400 }
            );
        }

        const { attendees, ...updateData } = validationResult.data;

        // Update meeting
        const { data: meeting, error } = await supabase
            .from('meetings')
            .update(updateData)
            .eq('id', id)
            .eq('organization_id', user.id)
            .select()
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
            }
            console.error('Error updating meeting:', error);
            return NextResponse.json({ error: 'Failed to update meeting' }, { status: 500 });
        }

        // Sync attendees if provided
        if (attendees) {
            // 1. Get current attendees
            const { data: currentAttendees } = await supabase
                .from('meeting_attendees')
                .select('board_member_id')
                .eq('meeting_id', id);

            const currentIds = (currentAttendees || []).map((a: { board_member_id: string }) => a.board_member_id);

            // 2. Identify to add and to remove
            const toAdd = attendees.filter((id: string) => !currentIds.includes(id));
            const toRemove = currentIds.filter((id: string) => !attendees.includes(id));

            // 3. Remove no longer invited
            if (toRemove.length > 0) {
                await supabase
                    .from('meeting_attendees')
                    .delete()
                    .eq('meeting_id', id)
                    .in('board_member_id', toRemove);
            }

            // 4. Add new ones
            if (toAdd.length > 0) {
                await supabase
                    .from('meeting_attendees')
                    .insert(
                        toAdd.map((memberId: string) => ({
                            meeting_id: id,
                            board_member_id: memberId,
                            attendance_status: 'invited' as const
                        }))
                    );
            }
        }

        return NextResponse.json({ meeting });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * DELETE /api/meetings/[id]
 * Delete a meeting (cascades to attendees and action items)
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
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

        // Delete meeting (cascades to attendees and action items via DB)
        const { error } = await supabase
            .from('meetings')
            .delete()
            .eq('id', id)
            .eq('organization_id', user.id);

        if (error) {
            console.error('Error deleting meeting:', error);
            return NextResponse.json({ error: 'Failed to delete meeting' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
