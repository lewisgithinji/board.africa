'use client';

import { use } from 'react';
import useSWR from 'swr';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MeetingDetails } from '@/components/dashboard/meetings/MeetingDetails';
import { MeetingDetailsSkeleton } from '@/components/dashboard/meetings/MeetingSkeletons';
import { toast } from 'sonner';

const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch: ${url}`);
    return res.json();
};

export default function MeetingDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();

    const { data: meetingData, error: meetingError, isLoading: meetingLoading, mutate } = useSWR(
        `/api/meetings/${id}`,
        fetcher,
        {
            revalidateOnFocus: false,
            onError: (error) => {
                console.error('Error fetching meeting:', error);
                toast.error('Failed to load meeting');
                router.push('/meetings');
            },
        }
    );

    const { data: membersData, isLoading: membersLoading } = useSWR(
        '/api/board-members',
        fetcher
    );

    const isLoading = meetingLoading || membersLoading;
    const meeting = meetingData?.meeting;
    const boardMembers = membersData?.members || [];

    if (isLoading) {
        return <MeetingDetailsSkeleton />;
    }

    if (meetingError || !meeting) {
        return null;
    }

    return (
        <div className="space-y-6">
            {/* Navigation */}
            <Button variant="ghost" size="sm" asChild>
                <Link href="/meetings">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Meetings
                </Link>
            </Button>

            {/* Meeting Details */}
            <MeetingDetails
                meeting={meeting}
                boardMembers={boardMembers}
                onUpdate={() => mutate()}
            />
        </div>
    );
}
