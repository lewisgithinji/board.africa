import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { createActionItemSchema, updateActionItemSchema } from '@/lib/validations/meeting';

/**
 * POST /api/action-items
 * Create a new action item
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
        const validationResult = createActionItemSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                {
                    error: 'Validation failed',
                    details: validationResult.error.flatten().fieldErrors,
                },
                { status: 400 }
            );
        }

        const actionItemData = validationResult.data;

        // Verify meeting belongs to user's organization
        const { data: meeting } = await supabase
            .from('meetings')
            .select('id')
            .eq('id', actionItemData.meeting_id)
            .eq('organization_id', user.id)
            .single();

        if (!meeting) {
            return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
        }

        // Create action item
        const { data: actionItem, error } = await supabase
            .from('action_items')
            .insert(actionItemData)
            .select(`
        *,
        board_member:board_members (
          id,
          full_name,
          avatar_url
        )
      `)
            .single();

        if (error) {
            console.error('Error creating action item:', error);
            return NextResponse.json({ error: 'Failed to create action item' }, { status: 500 });
        }

        return NextResponse.json({ actionItem }, { status: 201 });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * PATCH /api/action-items
 * Update an action item
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
        const { id, ...updateData } = body;

        if (!id) {
            return NextResponse.json({ error: 'Action item ID is required' }, { status: 400 });
        }

        const validationResult = updateActionItemSchema.safeParse(updateData);

        if (!validationResult.success) {
            return NextResponse.json(
                {
                    error: 'Validation failed',
                    details: validationResult.error.flatten().fieldErrors,
                },
                { status: 400 }
            );
        }

        // Update action item
        const { data: actionItem, error } = await supabase
            .from('action_items')
            .update(validationResult.data)
            .eq('id', id)
            .select(`
        *,
        meeting:meetings!inner (
          organization_id
        ),
        board_member:board_members (
          id,
          full_name,
          avatar_url
        )
      `)
            .single();

        if (error || actionItem.meeting.organization_id !== user.id) {
            console.error('Error updating action item:', error);
            return NextResponse.json({ error: 'Failed to update action item' }, { status: 500 });
        }

        return NextResponse.json({ actionItem });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * DELETE /api/action-items
 * Delete an action item
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
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Action item ID is required' }, { status: 400 });
        }

        // Delete action item
        const { error } = await supabase.from('action_items').delete().eq('id', id);

        if (error) {
            console.error('Error deleting action item:', error);
            return NextResponse.json({ error: 'Failed to delete action item' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
