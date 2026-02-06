import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { submitEvaluationSchema } from '@/lib/validations/evaluation';

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return new NextResponse('Unauthorized', { status: 401 });

        const { data: evaluation } = await supabase
            .from('evaluations')
            .select(`
                *,
                evaluation_templates(title, description, evaluation_type, questions),
                board_members(id, full_name, position, avatar_url)
            `)
            .eq('id', id)
            .single();

        if (!evaluation) return new NextResponse('Not found', { status: 404 });
        return NextResponse.json(evaluation);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return new NextResponse('Unauthorized', { status: 401 });

        const body = await req.json();

        // If action is "submit", validate responses and finalize
        if (body.action === 'submit') {
            const parsed = submitEvaluationSchema.safeParse(body);
            if (!parsed.success) {
                return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
            }

            const { data: evaluation, error } = await supabase
                .from('evaluations')
                .update({
                    responses: parsed.data.responses,
                    status: 'submitted',
                    submitted_at: new Date().toISOString(),
                })
                .eq('id', id)
                .eq('evaluator_id', user.id)
                .eq('status', 'draft')
                .select('*')
                .single();

            if (error) return NextResponse.json({ error: error.message }, { status: 500 });
            if (!evaluation) return new NextResponse('Not found or already submitted', { status: 404 });
            return NextResponse.json(evaluation);
        }

        // Otherwise, save draft responses
        if (body.responses) {
            const { data: evaluation, error } = await supabase
                .from('evaluations')
                .update({ responses: body.responses })
                .eq('id', id)
                .eq('evaluator_id', user.id)
                .eq('status', 'draft')
                .select('*')
                .single();

            if (error) return NextResponse.json({ error: error.message }, { status: 500 });
            if (!evaluation) return new NextResponse('Not found or already submitted', { status: 404 });
            return NextResponse.json(evaluation);
        }

        return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return new NextResponse('Unauthorized', { status: 401 });

        const { error } = await supabase
            .from('evaluations')
            .delete()
            .eq('id', id)
            .eq('organization_id', user.id);

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return new NextResponse(null, { status: 204 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
