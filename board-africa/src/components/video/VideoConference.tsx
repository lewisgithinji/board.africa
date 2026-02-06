'use client';

import { useEffect, useState } from 'react';
import {
    LiveKitRoom,
    VideoConference as LKVideoConference,
    GridLayout,
    ParticipantTile,
    RoomAudioRenderer,
    ControlBar,
    useTracks,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { Track } from 'livekit-client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, Video } from 'lucide-react';
import { toast } from 'sonner';

interface VideoConferenceProps {
    meetingId: string;
    onLeave: () => void;
}

export default function VideoConference({ meetingId, onLeave }: VideoConferenceProps) {
    const [token, setToken] = useState<string>('');
    const [serverUrl, setServerUrl] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const initCall = async () => {
            try {
                const response = await fetch(`/api/meetings/${meetingId}/join`, { method: 'POST' });
                if (!response.ok) throw new Error('Failed to join meeting');
                const data = await response.json();
                setToken(data.token);
                setServerUrl(data.url);
            } catch (err: any) {
                setError(err.message);
                toast.error('Could not start video call');
            }
        };

        initCall();
    }, [meetingId]);

    if (error) {
        return (
            <div className="flex h-full items-center justify-center bg-muted/20">
                <Card className="p-6 text-center text-destructive">
                    <h3 className="font-bold">Connection Error</h3>
                    <p>{error}</p>
                    <Button onClick={onLeave} className="mt-4" variant="outline">Back to Meeting</Button>
                </Card>
            </div>
        );
    }

    // Simulator Mode check
    if (token === 'mock-token' || serverUrl.includes('demo.livekit.cloud')) {
        return (
            <div className="fixed inset-0 z-50 bg-zinc-950 text-white flex flex-col">
                <div className="flex-1 flex flex-col items-center justify-center p-8">
                    <div className="max-w-md w-full text-center space-y-8">
                        <div className="w-24 h-24 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto animate-pulse">
                            <Video className="h-10 w-10 text-cyan-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">LiveKit Simulator</h2>
                            <p className="text-zinc-400 mt-2 text-sm">
                                LiveKit Keys missing. This is a simulation.
                            </p>
                        </div>
                        <Button onClick={onLeave} variant="destructive" className="w-full">
                            End Simulation
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    if (!token) {
        return (
            <div className="flex h-full w-full items-center justify-center bg-black/95 text-white">
                <div className="text-center">
                    <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
                    <p className="mt-4 text-sm text-muted-foreground">Connecting to LiveKit room...</p>
                </div>
            </div>
        );
    }

    return (
        <LiveKitRoom
            video={true}
            audio={true}
            token={token}
            serverUrl={serverUrl}
            data-lk-theme="default"
            style={{ height: '100%', backgroundColor: '#111' }}
            onDisconnected={onLeave}
        >
            {/* The standard LiveKit VideoConference UI */}
            <LKVideoConference />
            {/* 
                Alternatively, we can build custom UI using:
                - <GridLayout />
                - <ParticipantTile />
                - <ControlBar />
            */}
        </LiveKitRoom>
    );
}
