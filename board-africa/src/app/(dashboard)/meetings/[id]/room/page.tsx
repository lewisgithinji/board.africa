'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import VideoConference from '@/components/video/VideoConference';

export default function MeetingRoomPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();

    const handleLeave = () => {
        router.push(`/meetings/${id}`);
    };

    return (
        <div className="fixed inset-0 bg-black z-50 p-4">
            <VideoConference meetingId={id} onLeave={handleLeave} />
        </div>
    );
}
