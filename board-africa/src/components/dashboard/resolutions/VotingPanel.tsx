'use client';

import { useState } from 'react';
import { Check, X, Minus, MessageSquare } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { ResolutionWithVotes, BoardMember } from '@/lib/types/database.types';

interface VotingPanelProps {
    resolution: ResolutionWithVotes;
    boardMembers?: BoardMember[];
    onVote: () => void;
}

export function VotingPanel({ resolution, boardMembers = [], onVote }: VotingPanelProps) {
    const [selectedVote, setSelectedVote] = useState<'approve' | 'reject' | 'abstain' | null>(null);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

    const votes = resolution.votes || [];
    const votesByMemberId = new Map(votes.map((v: any) => [v.board_member_id, v]));

    const isOpen = resolution.status === 'open';

    const handleVoteSubmit = async (boardMemberId: string) => {
        if (!selectedVote || !isOpen) return;

        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/resolutions/${resolution.id}/vote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    board_member_id: boardMemberId,
                    vote: selectedVote,
                    comment: comment || undefined,
                }),
            });

            if (!res.ok) throw new Error('Failed to cast vote');

            setSelectedVote(null);
            setComment('');
            setSelectedMemberId(null);
            onVote();
        } catch (error) {
            console.error('Error casting vote:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRetractVote = async (boardMemberId: string) => {
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/resolutions/${resolution.id}/vote?board_member_id=${boardMemberId}`, {
                method: 'DELETE',
            });

            if (!res.ok) throw new Error('Failed to retract vote');

            onVote();
        } catch (error) {
            console.error('Error retracting vote:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getVoteIcon = (voteType: string) => {
        switch (voteType) {
            case 'approve':
                return <Check className="h-4 w-4 text-green-600" />;
            case 'reject':
                return <X className="h-4 w-4 text-red-600" />;
            case 'abstain':
                return <Minus className="h-4 w-4 text-gray-600" />;
            default:
                return null;
        }
    };

    return (
        <div className="border-t pt-4 space-y-4">
            <h4 className="font-semibold text-sm">Voting Details</h4>

            <div className="space-y-3">
                {boardMembers.map((member) => {
                    const vote = votesByMemberId.get(member.id);
                    const isExpanded = selectedMemberId === member.id;

                    return (
                        <div key={member.id} className="border rounded-lg p-3 space-y-3">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={member.avatar_url || undefined} alt={member.full_name} />
                                    <AvatarFallback>
                                        {member.full_name
                                            ?.split(' ')
                                            .map((n) => n[0])
                                            .join('')
                                            .toUpperCase() || '?'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">{member.full_name}</p>
                                    {member.position && (
                                        <p className="text-xs text-muted-foreground">{member.position}</p>
                                    )}
                                </div>
                                {vote ? (
                                    <div className="flex items-center gap-2">
                                        {getVoteIcon(vote.vote)}
                                        <span className="text-sm capitalize">{vote.vote}</span>
                                        {isOpen && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRetractVote(member.id)}
                                                disabled={isSubmitting}
                                            >
                                                Retract
                                            </Button>
                                        )}
                                    </div>
                                ) : isOpen ? (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setSelectedMemberId(isExpanded ? null : member.id)}
                                    >
                                        {isExpanded ? 'Cancel' : 'Cast Vote'}
                                    </Button>
                                ) : (
                                    <span className="text-sm text-muted-foreground">No vote</span>
                                )}
                            </div>

                            {vote?.comment && (
                                <div className="flex items-start gap-2 pl-11 text-sm">
                                    <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                                    <p className="text-muted-foreground italic">{vote.comment}</p>
                                </div>
                            )}

                            {isOpen && isExpanded && !vote && (
                                <div className="space-y-3 pl-11">
                                    <Separator />
                                    <div className="space-y-2">
                                        <Label className="text-sm">Select your vote:</Label>
                                        <div className="flex gap-2">
                                            <Button
                                                variant={selectedVote === 'approve' ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => setSelectedVote('approve')}
                                                className={selectedVote === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''}
                                            >
                                                <Check className="h-4 w-4 mr-1" />
                                                Approve
                                            </Button>
                                            <Button
                                                variant={selectedVote === 'reject' ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => setSelectedVote('reject')}
                                                className={selectedVote === 'reject' ? 'bg-red-600 hover:bg-red-700' : ''}
                                            >
                                                <X className="h-4 w-4 mr-1" />
                                                Reject
                                            </Button>
                                            <Button
                                                variant={selectedVote === 'abstain' ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => setSelectedVote('abstain')}
                                                className={selectedVote === 'abstain' ? 'bg-gray-600 hover:bg-gray-700' : ''}
                                            >
                                                <Minus className="h-4 w-4 mr-1" />
                                                Abstain
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor={`comment-${member.id}`} className="text-sm">
                                            Comment (optional):
                                        </Label>
                                        <Textarea
                                            id={`comment-${member.id}`}
                                            placeholder="Add a comment about your vote..."
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            rows={2}
                                        />
                                    </div>

                                    <Button
                                        onClick={() => handleVoteSubmit(member.id)}
                                        disabled={!selectedVote || isSubmitting}
                                        size="sm"
                                    >
                                        {isSubmitting ? 'Submitting...' : 'Submit Vote'}
                                    </Button>
                                </div>
                            )}
                        </div>
                    );
                })}

                {boardMembers.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                        No board members to display votes for.
                    </p>
                )}
            </div>
        </div>
    );
}
