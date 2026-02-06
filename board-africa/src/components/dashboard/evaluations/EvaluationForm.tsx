'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, User, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import type { EvaluationQuestion } from '@/lib/types/database.types';

interface EvaluationFormProps {
    evaluation: {
        id: string;
        status: 'draft' | 'submitted';
        responses: Record<string, string | number>;
        submitted_at: string | null;
        evaluation_templates: {
            title: string;
            description: string | null;
            evaluation_type: string;
            questions: EvaluationQuestion[];
        };
        board_members: { full_name: string; position: string } | null;
    };
}

const TYPE_LABELS: Record<string, string> = {
    self_assessment: 'Self Assessment',
    peer_review: 'Peer Review',
    board_evaluation: 'Board Evaluation',
};

export function EvaluationForm({ evaluation }: EvaluationFormProps) {
    const template = evaluation.evaluation_templates;
    const subject = evaluation.board_members;
    const isSubmitted = evaluation.status === 'submitted';

    const [responses, setResponses] = useState<Record<string, string | number>>(evaluation.responses || {});
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(isSubmitted);

    const updateResponse = (questionId: string, value: string | number) => {
        setResponses(prev => ({ ...prev, [questionId]: value }));
    };

    const handleSubmit = async () => {
        // Check required fields
        const missing = template.questions.find(q => q.required && !responses[q.id]);
        if (missing) {
            toast.error('Please answer all required questions');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`/api/evaluations/${evaluation.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'submit', responses }),
            });
            if (!res.ok) throw new Error(await res.text());
            toast.success('Evaluation submitted successfully');
            setSubmitted(true);
        } catch (err: any) {
            toast.error(err.message || 'Failed to submit');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveDraft = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/evaluations/${evaluation.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ responses }),
            });
            if (!res.ok) throw new Error(await res.text());
            toast.success('Draft saved');
        } catch (err: any) {
            toast.error(err.message || 'Failed to save');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Back link */}
            <Link href="/evaluations" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-4 w-4" /> Back to Evaluations
            </Link>

            {/* Header */}
            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div>
                            <CardTitle>{template.title}</CardTitle>
                            <CardDescription className="mt-1 flex items-center gap-2">
                                <span className="text-xs px-2 py-0.5 rounded-full bg-muted">{TYPE_LABELS[template.evaluation_type]}</span>
                                {submitted && (
                                    <Badge className="text-xs bg-green-100 text-green-800 hover:bg-green-100">
                                        <CheckCircle2 className="h-3 w-3 mr-1" /> Submitted
                                    </Badge>
                                )}
                            </CardDescription>
                        </div>
                    </div>
                    {subject && (
                        <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                            <User className="h-4 w-4" />
                            <span>Evaluating: <strong className="text-foreground">{subject.full_name}</strong> — {subject.position}</span>
                        </div>
                    )}
                    {template.description && (
                        <p className="text-sm text-muted-foreground mt-2">{template.description}</p>
                    )}
                </CardHeader>
            </Card>

            {/* Questions */}
            <div className="space-y-4">
                {template.questions.map((q, index) => (
                    <Card key={q.id}>
                        <CardContent className="p-5">
                            <div className="flex gap-2 mb-3">
                                <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded">
                                    Q{index + 1}
                                </span>
                                {q.required && <span className="text-xs text-red-500">*Required</span>}
                            </div>
                            <p className="font-medium mb-4">{q.question}</p>

                            {/* Rating 1-5 */}
                            {q.type === 'rating' && (
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map(n => (
                                        <button
                                            key={n}
                                            disabled={submitted}
                                            onClick={() => updateResponse(q.id, n)}
                                            className={`w-10 h-10 rounded-full border-2 text-sm font-bold transition-colors ${
                                                responses[q.id] === n
                                                    ? 'border-primary bg-primary text-primary-foreground'
                                                    : 'border-muted hover:border-primary/50'
                                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                                        >
                                            {n}
                                        </button>
                                    ))}
                                    <div className="flex items-center ml-2">
                                        <span className="text-xs text-muted-foreground">Poor</span>
                                        <span className="mx-2 text-muted-foreground">—</span>
                                        <span className="text-xs text-muted-foreground">Excellent</span>
                                    </div>
                                </div>
                            )}

                            {/* Scale 1-10 */}
                            {q.type === 'scale' && (
                                <div className="flex flex-wrap gap-1.5">
                                    {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                                        <button
                                            key={n}
                                            disabled={submitted}
                                            onClick={() => updateResponse(q.id, n)}
                                            className={`w-8 h-8 rounded border text-xs font-semibold transition-colors ${
                                                responses[q.id] === n
                                                    ? 'border-primary bg-primary text-primary-foreground'
                                                    : 'border-muted hover:border-primary/50'
                                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                                        >
                                            {n}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Text */}
                            {q.type === 'text' && (
                                <textarea
                                    disabled={submitted}
                                    value={(responses[q.id] as string) || ''}
                                    onChange={e => updateResponse(q.id, e.target.value)}
                                    placeholder="Type your response..."
                                    rows={3}
                                    className="w-full border rounded-md p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 bg-background"
                                />
                            )}

                            {/* Multi-choice */}
                            {q.type === 'multi_choice' && q.options && (
                                <RadioGroup
                                    value={(responses[q.id] as string) || ''}
                                    onValueChange={v => !submitted && updateResponse(q.id, v)}
                                >
                                    <div className="space-y-2">
                                        {q.options.map((opt, i) => (
                                            <div key={i} className="flex items-center gap-2">
                                                <RadioGroupItem value={opt} id={`${q.id}-${i}`} disabled={submitted} />
                                                <Label htmlFor={`${q.id}-${i}`} className="text-sm font-normal cursor-pointer">{opt}</Label>
                                            </div>
                                        ))}
                                    </div>
                                </RadioGroup>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Actions */}
            {!submitted && (
                <div className="flex justify-between pt-2">
                    <Button variant="outline" onClick={handleSaveDraft} disabled={loading}>
                        Save Draft
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Submitting...' : 'Submit Evaluation'}
                    </Button>
                </div>
            )}
        </div>
    );
}
