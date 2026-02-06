import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { createTemplateSchema } from '@/lib/validations/evaluation';
import { randomUUID } from 'crypto';

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return new NextResponse('Unauthorized', { status: 401 });

        const { data: templates } = await supabase
            .from('evaluation_templates')
            .select('*')
            .eq('organization_id', user.id)
            .order('created_at', { ascending: false });

        return NextResponse.json(templates || []);
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
        const parsed = createTemplateSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
        }

        // Assign stable IDs to questions if missing
        const questions = parsed.data.questions.map(q => ({
            ...q,
            id: q.id || randomUUID(),
        }));

        const { data: template, error } = await supabase
            .from('evaluation_templates')
            .insert({
                organization_id: user.id,
                title: parsed.data.title,
                description: parsed.data.description || null,
                evaluation_type: parsed.data.evaluation_type,
                questions,
            })
            .select('*')
            .single();

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json(template, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
