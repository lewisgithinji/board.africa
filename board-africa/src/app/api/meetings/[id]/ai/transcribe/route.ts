import { createClient } from '@/lib/supabase/server';
import { AIService } from '@/lib/ai/openai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: meetingId } = await params;

    try {
        const supabase = await createClient();

        // 1. Check authorization
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // 2. Get the uploaded file
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        console.log(`[AI Transcribe] Processing file: ${file.name} for meeting ${meetingId}`);

        // 3. Mark meeting as processing
        await supabase
            .from('meetings')
            .update({ ai_minutes_status: 'processing' })
            .eq('id', meetingId);

        // 4. Transcribe using AIService (Whisper)
        const transcript = await AIService.transcribeAudio(file);

        if (!transcript) {
            throw new Error('Transcription failed');
        }

        // 5. Save transcript to meeting
        await supabase
            .from('meetings')
            .update({
                transcript,
                ai_minutes_status: 'none' // Done with transcription, ready for minutes
            })
            .eq('id', meetingId);

        return NextResponse.json({ transcript });

    } catch (error: any) {
        console.error('[AI Transcribe Error]:', error);

        // Update status to failed
        const supabase = await createClient();
        await supabase
            .from('meetings')
            .update({ ai_minutes_status: 'failed' })
            .eq('id', meetingId);

        return NextResponse.json({ error: error.message || 'Transcription failed' }, { status: 500 });
    }
}
