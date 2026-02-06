import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { updateTemplateSchema } from '@/lib/validations/evaluation';
import { randomUUID } from 'crypto';

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return new NextResponse('Unauthorized', { status: 401 });

        const { data: template } = await supabase
            .from('evaluation_templates')
            .select('*')
            .eq('id', id)
            .eq('organization_id', user.id)
            .single();

        if (!template) return new NextResponse('Not found', { status: 404 });
        return NextResponse.json(template);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return new NextResponse('Unauthorized', { status: 401 });

        const body = await req.json();
        const parsed = updateTemplateSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
        }

        const updates: Record<string, any> = {};
        if (parsed.data.title !== undefined) updates.title = parsed.data.title;
        if (parsed.data.description !== undefined) updates.description = parsed.data.description;
        if (parsed.data.evaluation_type !== undefined) updates.evaluation_type = parsed.data.evaluation_type;
        if (parsed.data.questions !== undefined) {
            updates.questions = parsed.data.questions.map(q => ({
                ...q,
                id: q.id || randomUUID(),
            }));
        }
        if (body.is_active !== undefined) updates.is_active = body.is_active;

        const { data: template, error } = await supabase
            .from('evaluation_templates')
            .update(updates)
            .eq('id', id)
            .eq('organization_id', user.id)
            .select('*')
            .single();

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        if (!template) return new NextResponse('Not found', { status: 404 });
        return NextResponse.json(template);
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
            .from('evaluation_templates')
            .delete()
            .eq('id', id)
            .eq('organization_id', user.id);

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return new NextResponse(null, { status: 204 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
