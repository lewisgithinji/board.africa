import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { voteSchema } from '@/lib/validations/resolution';

/**
 * POST /api/resolutions/[id]/vote
 * Cast or update vote
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const supabase = await createClient();
        const { id: resolutionId } = await params;

        // Get current user
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const validationResult = voteSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                {
                    error: 'Validation failed',
                    details: validationResult.error.flatten().fieldErrors,
                },
                { status: 400 }
            );
        }

        const { vote, comment } = validationResult.data;
        const { board_member_id } = body;

        if (!board_member_id) {
            return NextResponse.json({ error: 'board_member_id is required' }, { status: 400 });
        }

        // Check if resolution is open for voting
        const { data: resolution } = await supabase
            .from('resolutions')
            .select('status, organization_id')
            .eq('id', resolutionId)
            .single();

        if (!resolution) {
            return NextResponse.json({ error: 'Resolution not found' }, { status: 404 });
        }

        if (resolution.status !== 'open') {
            return NextResponse.json(
                { error: 'Resolution is not open for voting' },
                { status: 400 }
            );
        }

        // Verify board member belongs to organization
        const { data: boardMember } = await supabase
            .from('board_members')
            .select('id')
            .eq('id', board_member_id)
            .eq('organization_id', resolution.organization_id)
            .single();

        if (!boardMember) {
            return NextResponse.json({ error: 'Board member not found' }, { status: 404 });
        }

        // Upsert vote (insert or update)
        const { data: voteData, error } = await supabase
            .from('votes')
            .upsert(
                {
                    resolution_id: resolutionId,
                    board_member_id,
                    vote,
                    comment,
                    voted_at: new Date().toISOString(),
                },
                {
                    onConflict: 'resolution_id,board_member_id',
                }
            )
            .select(`
                *,
                board_member:board_members (
                    id,
                    full_name,
                    avatar_url,
                    position
                )
            `)
            .single();

        if (error) {
            console.error('Error casting vote:', error);
            return NextResponse.json({ error: 'Failed to cast vote' }, { status: 500 });
        }

        return NextResponse.json({ vote: voteData });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * DELETE /api/resolutions/[id]/vote?board_member_id=xxx
 * Retract vote
 */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const supabase = await createClient();
        const { id: resolutionId } = await params;

        // Get current user
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const boardMemberId = searchParams.get('board_member_id');

        if (!boardMemberId) {
            return NextResponse.json({ error: 'board_member_id is required' }, { status: 400 });
        }

        // Check if resolution is still open
        const { data: resolution } = await supabase
            .from('resolutions')
            .select('status')
            .eq('id', resolutionId)
            .single();

        if (!resolution) {
            return NextResponse.json({ error: 'Resolution not found' }, { status: 404 });
        }

        if (resolution.status !== 'open') {
            return NextResponse.json(
                { error: 'Can only retract votes while resolution is open' },
                { status: 400 }
            );
        }

        // Delete vote
        const { error } = await supabase
            .from('votes')
            .delete()
            .eq('resolution_id', resolutionId)
            .eq('board_member_id', boardMemberId);

        if (error) {
            console.error('Error deleting vote:', error);
            return NextResponse.json({ error: 'Failed to retract vote' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
