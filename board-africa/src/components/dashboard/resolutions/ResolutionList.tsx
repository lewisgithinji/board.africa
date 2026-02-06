'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResolutionCard } from './ResolutionCard';
import { ResolutionForm } from './ResolutionForm';
import type { ResolutionWithVotes } from '@/lib/types/database.types';

const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch');
    return res.json();
};

interface ResolutionListProps {
    meetingId: string;
    boardMembers?: any[];
    onUpdate?: () => void;
}

export function ResolutionList({ meetingId, boardMembers = [], onUpdate }: ResolutionListProps) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingResolution, setEditingResolution] = useState<ResolutionWithVotes | null>(null);

    const { data, error, isLoading, mutate } = useSWR<{ resolutions: ResolutionWithVotes[] }>(
        `/api/resolutions?meeting_id=${meetingId}`,
        fetcher,
        {
            revalidateOnFocus: false,
        }
    );

    const resolutions = data?.resolutions || [];

    const handleCreateOrUpdate = () => {
        setIsFormOpen(false);
        setEditingResolution(null);
        mutate();
        onUpdate?.();
    };

    const handleEdit = (resolution: ResolutionWithVotes) => {
        setEditingResolution(resolution);
        setIsFormOpen(true);
    };

    const handleDelete = () => {
        mutate();
        onUpdate?.();
    };

    const handleVote = async () => {
        // Force revalidation to fetch fresh data
        await mutate();
        onUpdate?.();
    };

    const handleStatusChange = () => {
        mutate();
        onUpdate?.();
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Resolutions</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Loading resolutions...</p>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Resolutions</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-destructive">Failed to load resolutions</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Resolutions</CardTitle>
                    <Button onClick={() => setIsFormOpen(true)} size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        New Resolution
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {resolutions.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-muted-foreground mb-4">No resolutions yet.</p>
                        <Button onClick={() => setIsFormOpen(true)} variant="outline" size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Create First Resolution
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {resolutions.map((resolution) => (
                            <ResolutionCard
                                key={resolution.id}
                                resolution={resolution}
                                boardMembers={boardMembers}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onVote={handleVote}
                                onStatusChange={handleStatusChange}
                            />
                        ))}
                    </div>
                )}

                {isFormOpen && (
                    <ResolutionForm
                        meetingId={meetingId}
                        resolution={editingResolution}
                        onClose={() => {
                            setIsFormOpen(false);
                            setEditingResolution(null);
                        }}
                        onSuccess={handleCreateOrUpdate}
                    />
                )}
            </CardContent>
        </Card>
    );
}
