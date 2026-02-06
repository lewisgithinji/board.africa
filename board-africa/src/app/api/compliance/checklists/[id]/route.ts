import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { updateChecklistSchema } from '@/lib/validations/compliance';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return new NextResponse('Unauthorized', { status: 401 });

        const { data } = await supabase
            .from('compliance_checklists')
            .select('*, compliance_checklist_items(*), compliance_regulations(title, country, category)')
            .eq('id', id)
            .eq('organization_id', user.id)
            .single();

        if (!data) return new NextResponse('Not found', { status: 404 });
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return new NextResponse('Unauthorized', { status: 401 });

        const body = await req.json();
        const parsed = updateChecklistSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('compliance_checklists')
            .update(parsed.data)
            .eq('id', id)
            .eq('organization_id', user.id)
            .select('*, compliance_checklist_items(*)')
            .single();

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        if (!data) return new NextResponse('Not found', { status: 404 });
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
