import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { generateICS } from '@/lib/calendar/ics-generator';

/**
 * GET /api/meetings/[id]/calendar
 * Download .ics file for a meeting
 */
export async function GET(
    _request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createClient();
        const { id } = params;

        // Get current user to check access
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch meeting details
        const { data: meeting, error } = await supabase
            .from('meetings')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !meeting) {
            return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
        }

        // Check if user belongs to the meeting's organization
        if (meeting.organization_id !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const icsContent = generateICS(meeting);

        return new NextResponse(icsContent, {
            headers: {
                'Content-Type': 'text/calendar',
                'Content-Disposition': `attachment; filename="meeting_${id}.ics"`,
            },
        });
    } catch (error) {
        console.error('Calendar export error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
