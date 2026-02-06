'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp, ClipboardCheck } from 'lucide-react';
import type { EvaluationWithDetails } from '@/lib/types/database.types';

interface BoardMemberSummary {
    id: string;
    full_name: string;
    position: string;
    avg_peer_rating: number;
    self_rating: number | null;
    peer_count: number;
}

interface PerformanceReportProps {
    evaluations: EvaluationWithDetails[];
    boardMembers: { id: string; full_name: string; position: string }[];
}

function computeSummaries(evaluations: EvaluationWithDetails[], boardMembers: PerformanceReportProps['boardMembers']): BoardMemberSummary[] {
    return boardMembers.map(member => {
        // Peer reviews targeting this member (submitted only)
        const peerReviews = evaluations.filter(e =>
            e.subject_id === member.id &&
            e.status === 'submitted' &&
            (e as any).evaluation_templates?.evaluation_type === 'peer_review'
        );

        // Self assessments by this member (submitted)
        const selfAssessments = evaluations.filter(e =>
            e.evaluator_id === member.id &&
            e.status === 'submitted' &&
            (e as any).evaluation_templates?.evaluation_type === 'self_assessment'
        );

        // Compute average rating from peer reviews (take first rating-type response)
        let peerRatingSum = 0;
        let peerRatingCount = 0;
        peerReviews.forEach(ev => {
            const vals = Object.values(ev.responses);
            vals.forEach(v => {
                if (typeof v === 'number' && v >= 1 && v <= 5) {
                    peerRatingSum += v;
                    peerRatingCount++;
                }
            });
        });

        // Self rating
        let selfRating: number | null = null;
        if (selfAssessments.length > 0) {
            const vals = Object.values(selfAssessments[0].responses);
            const ratings = vals.filter((v): v is number => typeof v === 'number' && v >= 1 && v <= 5);
            if (ratings.length > 0) selfRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
        }

        return {
            id: member.id,
            full_name: member.full_name,
            position: member.position,
            avg_peer_rating: peerRatingCount > 0 ? Math.round((peerRatingSum / peerRatingCount) * 10) / 10 : 0,
            self_rating: selfRating !== null ? Math.round(selfRating * 10) / 10 : null,
            peer_count: peerReviews.length,
        };
    });
}

function RatingBar({ value, max = 5, color = 'bg-primary' }: { value: number; max?: number; color?: string }) {
    const pct = (value / max) * 100;
    return (
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
        </div>
    );
}

export function PerformanceReport({ evaluations, boardMembers }: PerformanceReportProps) {
    const summaries = computeSummaries(evaluations, boardMembers);
    const totalSubmitted = evaluations.filter(e => e.status === 'submitted').length;
    const peerReviewCount = evaluations.filter(e => e.status === 'submitted' && (e as any).evaluation_templates?.evaluation_type === 'peer_review').length;
    const selfCount = evaluations.filter(e => e.status === 'submitted' && (e as any).evaluation_templates?.evaluation_type === 'self_assessment').length;

    // Board-wide average
    const allRatings = summaries.filter(s => s.avg_peer_rating > 0).map(s => s.avg_peer_rating);
    const boardAvg = allRatings.length > 0 ? (allRatings.reduce((a, b) => a + b, 0) / allRatings.length) : 0;

    return (
        <div className="space-y-6">
            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <ClipboardCheck className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Total Submitted</p>
                            <p className="text-xl font-bold">{totalSubmitted}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Users className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Peer Reviews</p>
                            <p className="text-xl font-bold">{peerReviewCount}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-2 bg-amber-100 rounded-lg">
                            <TrendingUp className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Board Avg Rating</p>
                            <p className="text-xl font-bold">{boardAvg > 0 ? boardAvg.toFixed(1) : '—'}<span className="text-xs text-muted-foreground font-normal">/5</span></p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Member performance table */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Member Performance</CardTitle>
                    <CardDescription>Peer review averages and self-assessment comparison</CardDescription>
                </CardHeader>
                <CardContent>
                    {summaries.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">
                            No board members to report on.
                        </p>
                    ) : (
                        <div className="space-y-5">
                            {summaries.map(s => (
                                <div key={s.id} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-semibold">{s.full_name}</p>
                                            <p className="text-xs text-muted-foreground">{s.position}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {s.peer_count > 0 && (
                                                <Badge variant="outline" className="text-xs">{s.peer_count} review{s.peer_count !== 1 ? 's' : ''}</Badge>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-muted-foreground w-20 shrink-0">Peer</span>
                                            <div className="flex-1">
                                                <RatingBar value={s.avg_peer_rating} color="bg-primary" />
                                            </div>
                                            <span className="text-xs font-semibold w-8 text-right">{s.avg_peer_rating > 0 ? s.avg_peer_rating : '—'}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-muted-foreground w-20 shrink-0">Self</span>
                                            <div className="flex-1">
                                                <RatingBar value={s.self_rating || 0} color="bg-amber-500" />
                                            </div>
                                            <span className="text-xs font-semibold w-8 text-right">{s.self_rating !== null ? s.self_rating : '—'}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {totalSubmitted === 0 && (
                <Card className="border-dashed">
                    <CardContent className="py-10 text-center">
                        <TrendingUp className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                        <p className="font-semibold">No data yet</p>
                        <p className="text-sm text-muted-foreground">
                            Reports will populate as evaluations are submitted.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
