import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/resolutions/[id]/close
 * Close voting and calculate result
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

        // Get resolution with votes
        const { data: resolution, error: fetchError } = await supabase
            .from('resolutions')
            .select(`
                *,
                votes (
                    id,
                    vote
                )
            `)
            .eq('id', resolutionId)
            .single();

        if (fetchError || !resolution) {
            return NextResponse.json({ error: 'Resolution not found' }, { status: 404 });
        }

        if (resolution.status !== 'open') {
            return NextResponse.json(
                { error: 'Only open resolutions can be closed' },
                { status: 400 }
            );
        }

        // Calculate votes
        const votes = resolution.votes || [];
        const approveCount = votes.filter((v: any) => v.vote === 'approve').length;
        const rejectCount = votes.filter((v: any) => v.vote === 'reject').length;
        const abstainCount = votes.filter((v: any) => v.vote === 'abstain').length;
        const totalVotes = votes.length;

        // Determine result based on voting type
        let finalStatus: 'passed' | 'failed' = 'failed';

        switch (resolution.voting_type) {
            case 'simple_majority':
                // More than 50% approve
                finalStatus = approveCount > rejectCount ? 'passed' : 'failed';
                break;
            case 'two_thirds':
                // At least 67% approve
                finalStatus = totalVotes > 0 && approveCount / totalVotes >= 0.67 ? 'passed' : 'failed';
                break;
            case 'unanimous':
                // 100% approve (no rejects)
                finalStatus = totalVotes > 0 && rejectCount === 0 && approveCount > 0 ? 'passed' : 'failed';
                break;
        }

        // Close voting with final status
        const { data: updatedResolution, error: updateError } = await supabase
            .from('resolutions')
            .update({
                status: finalStatus,
                closed_at: new Date().toISOString(),
            })
            .eq('id', resolutionId)
            .select()
            .single();

        if (updateError) {
            console.error('Error closing resolution:', updateError);
            return NextResponse.json({ error: 'Failed to close resolution' }, { status: 500 });
        }

        return NextResponse.json({
            resolution: updatedResolution,
            vote_summary: {
                approve: approveCount,
                reject: rejectCount,
                abstain: abstainCount,
                total: totalVotes,
                result: finalStatus,
            },
        });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
