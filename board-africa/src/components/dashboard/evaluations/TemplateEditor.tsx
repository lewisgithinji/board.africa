'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Plus, GripVertical } from 'lucide-react';
import { toast } from 'sonner';
import type { EvaluationTemplate, EvaluationQuestion } from '@/lib/types/database.types';

interface TemplateEditorProps {
    template: EvaluationTemplate | null;
    onSave: (template: EvaluationTemplate) => void;
    onCancel: () => void;
}

const emptyQuestion = (): EvaluationQuestion => ({
    id: crypto.randomUUID(),
    question: '',
    type: 'rating',
    required: true,
});

export function TemplateEditor({ template, onSave, onCancel }: TemplateEditorProps) {
    const [title, setTitle] = useState(template?.title || '');
    const [description, setDescription] = useState(template?.description || '');
    const [evaluationType, setEvaluationType] = useState(template?.evaluation_type || 'self_assessment');
    const [questions, setQuestions] = useState<EvaluationQuestion[]>(
        template?.questions.length ? template.questions : [emptyQuestion()]
    );
    const [isActive, setIsActive] = useState(template?.is_active ?? true);
    const [loading, setLoading] = useState(false);

    const addQuestion = () => setQuestions(prev => [...prev, emptyQuestion()]);

    const removeQuestion = (index: number) => {
        if (questions.length === 1) return;
        setQuestions(prev => prev.filter((_, i) => i !== index));
    };

    const updateQuestion = (index: number, updates: Partial<EvaluationQuestion>) => {
        setQuestions(prev => prev.map((q, i) => i === index ? { ...q, ...updates } : q));
    };

    const updateOption = (qIndex: number, oIndex: number, value: string) => {
        setQuestions(prev => prev.map((q, i) => {
            if (i !== qIndex) return q;
            const opts = [...(q.options || [])];
            opts[oIndex] = value;
            return { ...q, options: opts };
        }));
    };

    const addOption = (qIndex: number) => {
        setQuestions(prev => prev.map((q, i) =>
            i === qIndex ? { ...q, options: [...(q.options || []), ''] } : q
        ));
    };

    const removeOption = (qIndex: number, oIndex: number) => {
        setQuestions(prev => prev.map((q, i) =>
            i === qIndex ? { ...q, options: (q.options || []).filter((_, oi) => oi !== oIndex) } : q
        ));
    };

    const handleSubmit = async () => {
        if (title.length < 3) { toast.error('Title must be at least 3 characters'); return; }
        if (questions.some(q => q.question.length < 5)) { toast.error('Each question must be at least 5 characters'); return; }
        if (questions.some(q => q.type === 'multi_choice' && (!q.options || q.options.length < 2))) {
            toast.error('Multi-choice questions need at least 2 options'); return;
        }

        setLoading(true);
        try {
            const payload = { title, description, evaluation_type: evaluationType, questions, is_active: isActive };
            const isNew = !template;
            const res = await fetch(
                isNew ? '/api/evaluations/templates' : `/api/evaluations/templates/${template!.id}`,
                {
                    method: isNew ? 'POST' : 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                }
            );
            if (!res.ok) throw new Error(await res.text());
            const saved = await res.json();
            toast.success(isNew ? 'Template created' : 'Template updated');
            onSave(saved);
        } catch (err: any) {
            toast.error(err.message || 'Failed to save template');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">{template ? 'Edit Template' : 'New Template'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
                {/* Title & Description */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label>Title</Label>
                        <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Annual Board Self-Assessment" />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Type</Label>
                        <Select value={evaluationType} onValueChange={v => setEvaluationType(v as 'self_assessment' | 'peer_review' | 'board_evaluation')}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="self_assessment">Self Assessment</SelectItem>
                                <SelectItem value="peer_review">Peer Review</SelectItem>
                                <SelectItem value="board_evaluation">Board Evaluation</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="space-y-1.5">
                    <Label>Description (optional)</Label>
                    <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description of this evaluation" />
                </div>
                <div className="flex items-center gap-2">
                    <Checkbox checked={isActive} onCheckedChange={c => setIsActive(!!c)} id="active" />
                    <Label htmlFor="active" className="text-sm font-normal">Active</Label>
                </div>

                {/* Questions */}
                <div className="space-y-4">
                    <Label className="text-sm font-semibold">Questions</Label>
                    {questions.map((q, i) => (
                        <div key={q.id} className="border rounded-lg p-4 space-y-3 bg-muted/30">
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <GripVertical className="h-4 w-4" />
                                    <span>Q{i + 1}</span>
                                </div>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => removeQuestion(i)}>
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                            <Input
                                value={q.question}
                                onChange={e => updateQuestion(i, { question: e.target.value })}
                                placeholder="Enter question text..."
                            />
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-xs">Answer Type</Label>
                                    <Select value={q.type} onValueChange={v => updateQuestion(i, { type: v as any })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="rating">Rating (1-5)</SelectItem>
                                            <SelectItem value="scale">Scale (1-10)</SelectItem>
                                            <SelectItem value="text">Text</SelectItem>
                                            <SelectItem value="multi_choice">Multiple Choice</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-end">
                                    <div className="flex items-center gap-2">
                                        <Checkbox checked={q.required} onCheckedChange={c => updateQuestion(i, { required: !!c })} />
                                        <Label className="text-xs font-normal">Required</Label>
                                    </div>
                                </div>
                            </div>
                            {/* Multi-choice options */}
                            {q.type === 'multi_choice' && (
                                <div className="space-y-2 ml-4">
                                    <Label className="text-xs">Options</Label>
                                    {(q.options || []).map((opt, oi) => (
                                        <div key={oi} className="flex gap-2">
                                            <Input
                                                value={opt}
                                                onChange={e => updateOption(i, oi, e.target.value)}
                                                placeholder={`Option ${oi + 1}`}
                                                className="h-8 text-sm"
                                            />
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeOption(i, oi)}>
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => addOption(i)}>
                                        <Plus className="h-3 w-3 mr-1" /> Add Option
                                    </Button>
                                </div>
                            )}
                        </div>
                    ))}
                    <Button variant="outline" className="w-full border-dashed" onClick={addQuestion}>
                        <Plus className="h-4 w-4 mr-2" /> Add Question
                    </Button>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-2 border-t">
                    <Button variant="outline" onClick={onCancel}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Saving...' : template ? 'Update Template' : 'Create Template'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
