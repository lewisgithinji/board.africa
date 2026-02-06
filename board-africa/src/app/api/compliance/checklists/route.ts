import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { createChecklistSchema } from '@/lib/validations/compliance';

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return new NextResponse('Unauthorized', { status: 401 });

        const { data } = await supabase
            .from('compliance_checklists')
            .select('*, compliance_checklist_items(*), compliance_regulations(title, country, category)')
            .eq('organization_id', user.id)
            .order('created_at', { ascending: false });

        return NextResponse.json(data || []);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return new NextResponse('Unauthorized', { status: 401 });

        const body = await req.json();
        const parsed = createChecklistSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
        }

        const { data: checklist, error } = await supabase
            .from('compliance_checklists')
            .insert({
                organization_id: user.id,
                regulation_id: parsed.data.regulation_id || null,
                title: parsed.data.title,
                description: parsed.data.description || null,
                category: parsed.data.category || null,
                due_date: parsed.data.due_date || null,
            })
            .select('*')
            .single();

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });

        // If created from a regulation, auto-populate items from key_requirements
        if (parsed.data.regulation_id && checklist) {
            const { data: regulation } = await supabase
                .from('compliance_regulations')
                .select('key_requirements')
                .eq('id', parsed.data.regulation_id)
                .single();

            if (regulation?.key_requirements && Array.isArray(regulation.key_requirements)) {
                const items = (regulation.key_requirements as string[]).map((req, idx) => ({
                    checklist_id: checklist.id,
                    title: req,
                    order_index: idx,
                }));
                await supabase.from('compliance_checklist_items').insert(items);
            }
        }

        // Return checklist with items
        const { data: result } = await supabase
            .from('compliance_checklists')
            .select('*, compliance_checklist_items(*), compliance_regulations(title, country, category)')
            .eq('id', checklist.id)
            .single();

        return NextResponse.json(result, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
