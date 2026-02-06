import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { createChecklistItemSchema } from '@/lib/validations/compliance';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: checklistId } = await params;
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return new NextResponse('Unauthorized', { status: 401 });

        // Verify checklist belongs to this org
        const { data: checklist } = await supabase
            .from('compliance_checklists')
            .select('id')
            .eq('id', checklistId)
            .eq('organization_id', user.id)
            .single();

        if (!checklist) return new NextResponse('Checklist not found', { status: 404 });

        const body = await req.json();
        const parsed = createChecklistItemSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('compliance_checklist_items')
            .insert({
                checklist_id: checklistId,
                title: parsed.data.title,
                description: parsed.data.description || null,
                order_index: parsed.data.order_index ?? 0,
            })
            .select('*')
            .single();

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json(data, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
