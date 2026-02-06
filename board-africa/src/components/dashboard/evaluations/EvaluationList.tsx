'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ClipboardCheck, Clock, CheckCircle2, User } from 'lucide-react';
import Link from 'next/link';
import type { EvaluationWithDetails } from '@/lib/types/database.types';

interface EvaluationListProps {
    evaluations: EvaluationWithDetails[];
}

const TYPE_LABELS: Record<string, string> = {
    self_assessment: 'Self Assessment',
    peer_review: 'Peer Review',
    board_evaluation: 'Board Evaluation',
};

export function EvaluationList({ evaluations }: EvaluationListProps) {
    const [filter, setFilter] = useState<'all' | 'draft' | 'submitted'>('all');

    const filtered = filter === 'all' ? evaluations : evaluations.filter(e => e.status === filter);
    const draftCount = evaluations.filter(e => e.status === 'draft').length;
    const submittedCount = evaluations.filter(e => e.status === 'submitted').length;

    if (evaluations.length === 0) {
        return (
            <Card>
                <CardContent className="py-12 text-center">
                    <ClipboardCheck className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="font-semibold">No evaluations yet</p>
                    <p className="text-sm text-muted-foreground">
                        Start one from the templates section or when a review is requested.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {/* Filter pills */}
            <div className="flex gap-2">
                {([
                    { key: 'all', label: 'All', count: evaluations.length },
                    { key: 'draft', label: 'In Progress', count: draftCount },
                    { key: 'submitted', label: 'Completed', count: submittedCount },
                ] as const).map(({ key, label, count }) => (
                    <button
                        key={key}
                        onClick={() => setFilter(key)}
                        className={`text-sm px-3 py-1 rounded-full border transition-colors ${
                            filter === key
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-muted hover:bg-muted/80 text-muted-foreground border-muted'
                        }`}
                    >
                        {label} <span className="text-xs opacity-70">({count})</span>
                    </button>
                ))}
            </div>

            {/* Evaluation cards */}
            <div className="space-y-3">
                {filtered.map(evaluation => {
                    const raw = evaluation as any;
                    const template = raw.evaluation_templates;
                    const subject = raw.board_members;
                    return (
                        <Card key={evaluation.id} className="hover:shadow-sm transition-shadow">
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                            <span className="text-sm font-semibold">{template?.title || 'Untitled'}</span>
                                            <Badge variant={evaluation.status === 'submitted' ? 'default' : 'secondary'} className="text-xs">
                                                {evaluation.status === 'submitted' ? 'Completed' : 'In Progress'}
                                            </Badge>
                                            {template?.evaluation_type && (
                                                <span className="text-xs text-muted-foreground">
                                                    {TYPE_LABELS[template.evaluation_type]}
                                                </span>
                                            )}
                                        </div>

                                        {subject && (
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <User className="h-3.5 w-3.5" />
                                                <span>{subject.full_name} — {subject.position}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-3 shrink-0">
                                        {evaluation.submitted_at ? (
                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                                                {new Date(evaluation.submitted_at).toLocaleDateString()}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Clock className="h-3.5 w-3.5" />
                                                Draft
                                            </span>
                                        )}

                                        {evaluation.status === 'draft' && (
                                            <Link href={`/evaluations/${evaluation.id}`}>
                                                <Button size="sm" variant="outline">Continue</Button>
                                            </Link>
                                        )}
                                        {evaluation.status === 'submitted' && (
                                            <Link href={`/evaluations/${evaluation.id}`}>
                                                <Button size="sm" variant="ghost">View</Button>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
