import { createClient } from '@/lib/supabase/server';
import { AIService } from '@/lib/ai/openai';
import { NextResponse } from 'next/server';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id: meetingId } = await params;
    console.log(`[AI Minutes] Processing meeting: ${meetingId}`);

    try {
        const { transcript } = await req.json();
        const supabase = await createClient();

        // Check authorization
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return new NextResponse('Unauthorized', { status: 401 });

        // Update status to processing
        await supabase
            .from('meetings')
            .update({ ai_minutes_status: 'processing', transcript })
            .eq('id', meetingId);

        // Call AI Service
        const aiResult = await AIService.generateMinutes(transcript);

        if (!aiResult) throw new Error('AI could not generate result');

        // Update meeting with result
        await supabase
            .from('meetings')
            .update({
                ai_summary: aiResult.summary,
                minutes: aiResult.minutes,
                ai_minutes_status: 'completed'
            })
            .eq('id', meetingId);

        // Optional: Create action items in DB
        if (aiResult.actionItems && Array.isArray(aiResult.actionItems)) {
            for (const itemTitle of aiResult.actionItems) {
                await supabase
                    .from('action_items')
                    .insert({
                        meeting_id: meetingId,
                        title: itemTitle,
                        status: 'pending'
                    });
            }
        }

        return NextResponse.json(aiResult);

    } catch (error: any) {
        console.error('AI API Error:', error);

        // Re-init supabase for error update
        const supabase = await createClient();
        await supabase
            .from('meetings')
            .update({ ai_minutes_status: 'failed' })
            .eq('id', meetingId);

        return new NextResponse(error.message, { status: 500 });
    }
}
