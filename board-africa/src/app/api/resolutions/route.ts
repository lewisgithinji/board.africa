import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { createResolutionSchema } from '@/lib/validations/resolution';

/**
 * GET /api/resolutions?meeting_id=xxx
 * List resolutions for a meeting
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

        const { searchParams } = new URL(request.url);
        const meetingId = searchParams.get('meeting_id');

        if (!meetingId) {
            return NextResponse.json({ error: 'meeting_id is required' }, { status: 400 });
        }

        // Get resolutions with votes
        const { data: resolutions, error } = await supabase
            .from('resolutions')
            .select(`
                *,
                votes (
                    id,
                    board_member_id,
                    vote,
                    comment,
                    voted_at,
                    board_member:board_members (
                        id,
                        full_name,
                        avatar_url,
                        position
                    )
                )
            `)
            .eq('meeting_id', meetingId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching resolutions:', error);
            return NextResponse.json({ error: 'Failed to fetch resolutions' }, { status: 500 });
        }

        // Calculate vote summaries
        const resolutionsWithSummaries = resolutions.map((resolution) => {
            const votes = resolution.votes || [];
            const vote_summary = {
                approve: votes.filter((v: any) => v.vote === 'approve').length,
                reject: votes.filter((v: any) => v.vote === 'reject').length,
                abstain: votes.filter((v: any) => v.vote === 'abstain').length,
                total: votes.length,
            };
            return { ...resolution, vote_summary };
        });

        return NextResponse.json({ resolutions: resolutionsWithSummaries });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * POST /api/resolutions
 * Create a new resolution
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
        const validationResult = createResolutionSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                {
                    error: 'Validation failed',
                    details: validationResult.error.flatten().fieldErrors,
                },
                { status: 400 }
            );
        }

        const resolutionData = validationResult.data;

        // Verify meeting belongs to user's organization
        const { data: meeting } = await supabase
            .from('meetings')
            .select('id, organization_id')
            .eq('id', resolutionData.meeting_id)
            .eq('organization_id', user.id)
            .single();

        if (!meeting) {
            return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
        }

        // Create resolution
        const { data: resolution, error } = await supabase
            .from('resolutions')
            .insert({
                ...resolutionData,
                organization_id: user.id,
                created_by: user.id,
                status: 'draft',
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating resolution:', error);
            return NextResponse.json({ error: 'Failed to create resolution' }, { status: 500 });
        }

        return NextResponse.json({ resolution }, { status: 201 });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
