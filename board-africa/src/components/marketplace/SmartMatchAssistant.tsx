'use client';

import { useState } from 'react';
import { Sparkles, Brain, User, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { matchProfessionalsForPosition } from '@/lib/actions/matching';
import { toast } from 'sonner';
import Link from 'next/link';

interface SmartMatchProps {
    positionId: string;
    positionTitle: string;
}

export function SmartMatchAssistant({ positionId, positionTitle }: SmartMatchProps) {
    const [matches, setMatches] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasRun, setHasRun] = useState(false);

    async function handleMatch() {
        setIsLoading(true);
        try {
            const results = await matchProfessionalsForPosition(positionId);
            setMatches(results || []);
            setHasRun(true);
            if (results?.length > 0) {
                toast.success(`Found ${results.length} highly matched candidates!`);
            } else {
                toast.info("No highly matched candidates found yet. Try broadening the position description.");
            }
        } catch (error: any) {
            console.error('Matching Error:', error);
            toast.error(error.message || 'Failed to find matches');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Card className="overflow-hidden border-indigo-100 dark:border-indigo-900/50 shadow-xl shadow-indigo-500/5">
            <CardHeader className="bg-gradient-to-r from-indigo-600 to-violet-700 text-white p-6">
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="text-xl flex items-center gap-2">
                            <Sparkles className="h-6 w-6 text-yellow-300 fill-yellow-300" />
                            AI Smart Match Assistant
                        </CardTitle>
                        <CardDescription className="text-indigo-100 mt-1">
                            Semantic discovery for {positionTitle}
                        </CardDescription>
                    </div>
                    <Button
                        onClick={handleMatch}
                        disabled={isLoading}
                        className="bg-white text-indigo-700 hover:bg-indigo-50 font-bold shadow-lg"
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Brain className="h-4 w-4 mr-2" />
                        )}
                        {hasRun ? 'Refresh Matches' : 'Find Best Fits'}
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-6">
                {!hasRun ? (
                    <div className="text-center py-10 space-y-4">
                        <div className="bg-indigo-50 dark:bg-indigo-900/20 h-16 w-16 rounded-full flex items-center justify-center mx-auto">
                            <Brain className="h-8 w-8 text-indigo-500" />
                        </div>
                        <div className="max-w-xs mx-auto space-y-2">
                            <h4 className="font-bold">Ready to discover talent?</h4>
                            <p className="text-sm text-muted-foreground">
                                Our AI analyzes your position description and requirements to find the most relevant professionals in the database.
                            </p>
                        </div>
                    </div>
                ) : matches.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-muted-foreground">No matches found for this criteria.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-widest text-indigo-500 mb-2">Top Predicted Matches</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {matches.map((match: any) => (
                                <div
                                    key={match.id}
                                    className="flex items-start gap-4 p-4 rounded-2xl border border-indigo-50 dark:border-indigo-900/30 bg-indigo-50/30 dark:bg-indigo-900/10 hover:border-indigo-200 transition-all border-l-4 border-l-indigo-500"
                                >
                                    <Avatar className="h-10 w-10 border border-white">
                                        <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs font-bold">
                                            {match.full_name?.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <h5 className="font-bold text-sm truncate">{match.full_name}</h5>
                                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-[10px] py-0 h-5">
                                                {Math.round(match.similarity * 100)}% Match
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground truncate mb-2">{match.job_title}</p>
                                        <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-tight italic">
                                            "{match.bio}"
                                        </p>
                                        <div className="mt-3 flex gap-2">
                                            <Button variant="link" size="sm" className="h-auto p-0 text-indigo-600 text-[11px] font-bold" asChild>
                                                <Link href={`/marketplace/talents/${match.profile_id}`}>
                                                    View Profile
                                                    <ArrowRight className="h-3 w-3 ml-1" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
