'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { SignatureWithMember } from '@/lib/types/database.types';
import { CheckCircle2 } from 'lucide-react';

interface SignatureListProps {
    resolutionId: string;
}

export function SignatureList({ resolutionId }: SignatureListProps) {
    const [signatures, setSignatures] = useState<SignatureWithMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchSignatures();
    }, [resolutionId]);

    const fetchSignatures = async () => {
        try {
            setIsLoading(true);
            const res = await fetch(`/api/resolutions/${resolutionId}/signatures`);

            if (!res.ok) {
                throw new Error('Failed to fetch signatures');
            }

            const data = await res.json();
            setSignatures(data.signatures || []);
        } catch (err) {
            console.error('Error fetching signatures:', err);
            setError(err instanceof Error ? err.message : 'Failed to load signatures');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="grid gap-4 sm:grid-cols-2">
                {[1, 2].map((i) => (
                    <Card key={i}>
                        <CardContent className="p-4">
                            <Skeleton className="h-24 w-full" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <p className="text-sm text-destructive">{error}</p>
            </div>
        );
    }

    if (signatures.length === 0) {
        return (
            <div className="text-center py-8 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">No signatures yet</p>
            </div>
        );
    }

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {signatures.map((signature) => (
                <Card key={signature.id} className="overflow-hidden">
                    <CardContent className="p-4 space-y-3">
                        {/* Board Member Info */}
                        <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                                <AvatarImage
                                    src={signature.board_member?.avatar_url || undefined}
                                    alt={signature.board_member?.full_name || 'Member'}
                                />
                                <AvatarFallback>
                                    {signature.board_member?.full_name
                                        ?.split(' ')
                                        .map((n) => n[0])
                                        .join('')
                                        .toUpperCase() || '?'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                    {signature.board_member?.full_name || 'Unknown'}
                                </p>
                                {signature.board_member?.position && (
                                    <p className="text-xs text-muted-foreground truncate">
                                        {signature.board_member.position}
                                    </p>
                                )}
                            </div>
                            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                        </div>

                        {/* Signature Image */}
                        <div className="bg-white border rounded p-2 flex items-center justify-center min-h-[80px]">
                            <img
                                src={signature.signature_data}
                                alt={`Signature of ${signature.board_member?.full_name || 'member'}`}
                                className="max-w-full max-h-[80px] object-contain"
                            />
                        </div>

                        {/* Metadata */}
                        <div className="text-xs text-muted-foreground space-y-1">
                            <p>
                                Signed: {format(new Date(signature.signed_at), 'MMM d, yyyy h:mm a')}
                            </p>
                            <p className="capitalize">Type: {signature.signature_type}</p>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
