import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { EvaluationForm } from '@/components/dashboard/evaluations/EvaluationForm';

export default async function EvaluationDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: evaluation } = await supabase
        .from('evaluations')
        .select(`
            *,
            evaluation_templates(title, description, evaluation_type, questions),
            board_members(id, full_name, position, avatar_url)
        `)
        .eq('id', id)
        .single();

    if (!evaluation) notFound();

    return (
        <div className="py-6">
            <EvaluationForm evaluation={evaluation} />
        </div>
    );
}
