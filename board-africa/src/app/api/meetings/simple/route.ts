import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
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

        // Fetch simple meetings list
        const { data: meetings, error } = await supabase
            .from('meetings')
            .select('id, title, meeting_date')
            .eq('organization_id', user.id)
            .order('meeting_date', { ascending: false });

        if (error) {
            console.error('Error fetching simple meetings:', error);
            return NextResponse.json({ error: 'Failed to fetch meetings' }, { status: 500 });
        }

        return NextResponse.json({ meetings });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
