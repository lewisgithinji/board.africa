import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { updateAgendaItemSchema } from '@/lib/validations/agenda';

/**
 * PATCH /api/meetings/[id]/agenda/[itemId]
 * Update a specific agenda item
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; itemId: string }> }
) {
    const { id: meetingId, itemId } = await params;
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
        const validationResult = updateAgendaItemSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                {
                    error: 'Validation failed',
                    details: validationResult.error.flatten().fieldErrors,
                },
                { status: 400 }
            );
        }

        // Update agenda item
        const { data: agendaItem, error } = await supabase
            .from('agenda_items')
            .update(validationResult.data)
            .eq('id', itemId)
            .eq('meeting_id', meetingId)
            .select()
            .single();

        if (error) {
            console.error('Error updating agenda item:', error);
            return NextResponse.json({ error: 'Failed to update agenda item' }, { status: 500 });
        }

        return NextResponse.json({ agendaItem });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * DELETE /api/meetings/[id]/agenda/[itemId]
 * Delete a specific agenda item
 */
export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string; itemId: string }> }
) {
    const { id: meetingId, itemId } = await params;
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

        // Delete agenda item
        const { error } = await supabase
            .from('agenda_items')
            .delete()
            .eq('id', itemId)
            .eq('meeting_id', meetingId);

        if (error) {
            console.error('Error deleting agenda item:', error);
            return NextResponse.json({ error: 'Failed to delete agenda item' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
