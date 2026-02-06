import { createClient } from '@/lib/supabase/server';
import { LiveKitService } from '@/lib/video/livekit';
import { NextResponse } from 'next/server';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id: meetingId } = await params;

    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // Fetch meeting details
        const { data: meeting } = await supabase
            .from('meetings')
            .select('*')
            .eq('id', meetingId)
            .single();

        if (!meeting) {
            return new NextResponse('Meeting not found', { status: 404 });
        }

        // Ensure room ID exists in DB
        let roomName = meeting.video_room_id;
        if (!roomName) {
            roomName = `meeting-${meetingId}`;
            await supabase
                .from('meetings')
                .update({
                    video_room_id: roomName,
                    video_provider: 'livekit'
                })
                .eq('id', meetingId);
        }

        // Get user profile for display name
        const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', user.id)
            .single();

        const participantName = profile?.full_name || user.email || 'Guest';

        // Generate Token
        const token = await LiveKitService.createToken(roomName, participantName, user.id);

        return NextResponse.json({
            url: process.env.NEXT_PUBLIC_LIVEKIT_URL || 'wss://demo.livekit.cloud',
            token: token
        });

    } catch (error: any) {
        console.error('LiveKit Error:', error);
        return new NextResponse(error.message, { status: 500 });
    }
}
