'use client';

import { toast } from 'sonner';

export async function generateMeetingMinutes(meetingId: string, transcript: string) {
    try {
        const response = await fetch(`/api/meetings/${meetingId}/ai/minutes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ transcript }),
        });

        if (!response.ok) throw new Error('Failed to generate minutes');

        const data = await response.json();
        toast.success('AI Minutes generated successfully');
        return data;
    } catch (error) {
        console.error('AI Minutes Error:', error);
        toast.error('Failed to generate AI minutes');
        throw error;
    }
}
