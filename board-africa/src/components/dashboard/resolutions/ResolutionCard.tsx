'use client';

import { useState } from 'react';
import { CalendarDays, CheckCircle2, Play, Square, Trash2, Edit, ChevronDown, ChevronUp, PenTool } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';
import { VotingPanel } from './VotingPanel';
import { SignatureModal } from './SignatureModal';
import { SignatureList } from './SignatureList';
import type { ResolutionWithVotes } from '@/lib/types/database.types';
import { format } from 'date-fns';

interface ResolutionCardProps {
    resolution: ResolutionWithVotes;
    boardMembers?: any[];
    onEdit: (resolution: ResolutionWithVotes) => void;
    onDelete: () => void;
    onVote: () => void;
    onStatusChange: () => void;
}

const STATUS_COLORS = {
    draft: 'bg-gray-500/10 text-gray-700 border-gray-300',
    open: 'bg-blue-500/10 text-blue-700 border-blue-300',
    closed: 'bg-purple-500/10 text-purple-700 border-purple-300',
    passed: 'bg-green-500/10 text-green-700 border-green-300',
    failed: 'bg-red-500/10 text-red-700 border-red-300',
};

const VOTING_TYPE_LABELS = {
    simple_majority: 'Simple Majority (>50%)',
    two_thirds: 'Two-Thirds (≥67%)',
    unanimous: 'Unanimous (100%)',
};

export function ResolutionCard({
    resolution,
    boardMembers = [],
    onEdit,
    onDelete,
    onVote,
    onStatusChange,
}: ResolutionCardProps) {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showVoting, setShowVoting] = useState(false);
    const [showSignatures, setShowSignatures] = useState(false);
    const [showSignatureModal, setShowSignatureModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isStatusChanging, setIsStatusChanging] = useState(false);

    const summary = resolution.vote_summary || { approve: 0, reject: 0, abstain: 0, total: 0 };
    const approvePercent = summary.total > 0 ? (summary.approve / summary.total) * 100 : 0;
    const rejectPercent = summary.total > 0 ? (summary.reject / summary.total) * 100 : 0;

    const meetsQuorum = summary.total >= resolution.quorum_required;

    const handleOpenVoting = async () => {
        setIsStatusChanging(true);
        try {
            const res = await fetch(`/api/resolutions/${resolution.id}/open`, {
                method: 'POST',
            });
            if (!res.ok) throw new Error('Failed to open voting');
            onStatusChange();
        } catch (error) {
            console.error('Error opening voting:', error);
        } finally {
            setIsStatusChanging(false);
        }
    };

    const handleCloseVoting = async () => {
        setIsStatusChanging(true);
        try {
            const res = await fetch(`/api/resolutions/${resolution.id}/close`, {
                method: 'POST',
            });
            if (!res.ok) throw new Error('Failed to close voting');
            onStatusChange();
        } catch (error) {
            console.error('Error closing voting:', error);
        } finally {
            setIsStatusChanging(false);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/resolutions/${resolution.id}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error('Failed to delete resolution');
            onDelete();
        } catch (error) {
            console.error('Error deleting resolution:', error);
        } finally {
            setIsDeleting(false);
            setShowDeleteDialog(false);
        }
    };

    return (
        <>
            <Card className="p-4">
                <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-lg">{resolution.title}</h3>
                                <Badge
                                    variant="outline"
                                    className={STATUS_COLORS[resolution.status]}
                                >
                                    {resolution.status.charAt(0).toUpperCase() + resolution.status.slice(1)}
                                </Badge>
                            </div>
                            {resolution.description && (
                                <p className="text-sm text-muted-foreground">{resolution.description}</p>
                            )}
                        </div>
                        <div className="flex gap-1">
                            {resolution.status === 'draft' && (
                                <>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onEdit(resolution)}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setShowDeleteDialog(true)}
                                    >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Voting Info */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <CalendarDays className="h-4 w-4" />
                            <span>{VOTING_TYPE_LABELS[resolution.voting_type]}</span>
                        </div>
                        <div>Quorum: {resolution.quorum_required}</div>
                        {resolution.opened_at && (
                            <div>Opened: {format(new Date(resolution.opened_at), 'MMM d, yyyy')}</div>
                        )}
                        {resolution.closed_at && (
                            <div>Closed: {format(new Date(resolution.closed_at), 'MMM d, yyyy')}</div>
                        )}
                    </div>

                    {/* Vote Summary */}
                    {summary.total > 0 && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-green-600 font-medium">{summary.approve} Approve</span>
                                <span className="text-red-600 font-medium">{summary.reject} Reject</span>
                                <span className="text-gray-600">{summary.abstain} Abstain</span>
                            </div>
                            <div className="relative h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="absolute left-0 top-0 h-full bg-green-500"
                                    style={{ width: `${approvePercent}%` }}
                                />
                                <div
                                    className="absolute right-0 top-0 h-full bg-red-500"
                                    style={{ width: `${rejectPercent}%` }}
                                />
                            </div>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>Total Votes: {summary.total}</span>
                                {!meetsQuorum && (
                                    <span className="text-orange-600">Quorum not met</span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                        {resolution.status === 'draft' && (
                            <Button
                                variant="default"
                                size="sm"
                                onClick={handleOpenVoting}
                                disabled={isStatusChanging}
                            >
                                <Play className="h-4 w-4 mr-2" />
                                Open Voting
                            </Button>
                        )}

                        {resolution.status === 'open' && (
                            <>
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => setShowVoting(!showVoting)}
                                >
                                    {showVoting ? (
                                        <>
                                            <ChevronUp className="h-4 w-4 mr-2" />
                                            Hide Votes
                                        </>
                                    ) : (
                                        <>
                                            <ChevronDown className="h-4 w-4 mr-2" />
                                            Show Votes
                                        </>
                                    )}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleCloseVoting}
                                    disabled={isStatusChanging}
                                >
                                    <Square className="h-4 w-4 mr-2" />
                                    Close Voting
                                </Button>
                            </>
                        )}

                        {(resolution.status === 'closed' || resolution.status === 'passed' || resolution.status === 'failed') && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowVoting(!showVoting)}
                            >
                                {showVoting ? (
                                    <>
                                        <ChevronUp className="h-4 w-4 mr-2" />
                                        Hide Results
                                    </>
                                ) : (
                                    <>
                                        <ChevronDown className="h-4 w-4 mr-2" />
                                        View Results
                                    </>
                                )}
                            </Button>
                        )}

                        {/* Signature buttons for passed resolutions */}
                        {resolution.status === 'passed' && (
                            <>
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => setShowSignatureModal(true)}
                                >
                                    <PenTool className="h-4 w-4 mr-2" />
                                    Sign Resolution
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowSignatures(!showSignatures)}
                                >
                                    {showSignatures ? (
                                        <>
                                            <ChevronUp className="h-4 w-4 mr-2" />
                                            Hide Signatures
                                        </>
                                    ) : (
                                        <>
                                            <ChevronDown className="h-4 w-4 mr-2" />
                                            View Signatures
                                        </>
                                    )}
                                </Button>
                            </>
                        )}
                    </div>

                    {/* Voting Panel */}
                    {showVoting && (
                        <VotingPanel
                            resolution={resolution}
                            boardMembers={boardMembers}
                            onVote={onVote}
                        />
                    )}

                    {/* Signatures Section */}
                    {showSignatures && resolution.status === 'passed' && (
                        <>
                            <Separator />
                            <div className="space-y-3">
                                <h4 className="font-semibold text-sm flex items-center gap-2">
                                    <PenTool className="h-4 w-4" />
                                    Electronic Signatures
                                </h4>
                                <SignatureList resolutionId={resolution.id} />
                            </div>
                        </>
                    )}
                </div>
            </Card>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Resolution?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{resolution.title}"? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Signature Modal */}
            <SignatureModal
                resolution={resolution}
                boardMemberId={boardMembers[0]?.id || ''}
                organizationName="Board Africa"
                open={showSignatureModal}
                onClose={() => setShowSignatureModal(false)}
                onSuccess={() => {
                    setShowSignatureModal(false);
                    setShowSignatures(true);
                    onStatusChange();
                }}
            />
        </>
    );
}
