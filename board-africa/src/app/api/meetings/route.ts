import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { createMeetingSchema, updateMeetingSchema } from '@/lib/validations/meeting';

/**
 * GET /api/meetings
 * List all meetings for the current user's organization
 */
export async function GET(request: NextRequest) {
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

        // Get query parameters for filtering
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const type = searchParams.get('type');
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');

        // Build query
        let query = supabase
            .from('meetings')
            .select(`
        *,
        meeting_attendees (
          id,
          attendance_status,
          board_member:board_members (
            id,
            full_name,
            avatar_url
          )
        ),
        action_items (
          id,
          title,
          status,
          due_date
        )
      `)
            .eq('organization_id', user.id)
            .order('meeting_date', { ascending: false })
            .range(offset, offset + limit - 1);

        // Apply filters
        if (status) {
            query = query.eq('status', status);
        }
        if (type) {
            query = query.eq('meeting_type', type);
        }

        const { data: meetings, error, count } = await query;

        if (error) {
            console.error('Error fetching meetings:', error);
            return NextResponse.json({ error: 'Failed to fetch meetings' }, { status: 500 });
        }

        return NextResponse.json({
            meetings,
            total: count,
            limit,
            offset,
        });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * POST /api/meetings
 * Create a new meeting
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

        // Parse and validate request body
        const body = await request.json();
        const validationResult = createMeetingSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                {
                    error: 'Validation failed',
                    details: validationResult.error.flatten().fieldErrors,
                },
                { status: 400 }
            );
        }

        const meetingData = validationResult.data;

        // Create meeting
        const { data: meeting, error } = await supabase
            .from('meetings')
            .insert({
                ...meetingData,
                organization_id: user.id,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating meeting:', error);
            return NextResponse.json({ error: 'Failed to create meeting' }, { status: 500 });
        }

        // If attendees were provided, create them
        if (body.attendees && Array.isArray(body.attendees) && body.attendees.length > 0) {
            const attendeeRecords = body.attendees.map((memberId: string) => ({
                meeting_id: meeting.id,
                board_member_id: memberId,
                attendance_status: 'invited',
            }));

            const { error: attendeesError } = await supabase
                .from('meeting_attendees')
                .insert(attendeeRecords);

            if (attendeesError) {
                console.error('Error adding attendees:', attendeesError);
                // Don't fail the whole request, just log
            }
        }

        return NextResponse.json({ meeting }, { status: 201 });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
