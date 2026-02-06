'use client';

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { EvaluationList } from './EvaluationList';
import { TemplateList } from './TemplateList';
import { PerformanceReport } from './PerformanceReport';
import type { EvaluationTemplate, EvaluationWithDetails } from '@/lib/types/database.types';

interface EvaluationDashboardProps {
    evaluations: EvaluationWithDetails[];
    templates: EvaluationTemplate[];
    boardMembers: { id: string; full_name: string; position: string }[];
}

export function EvaluationDashboard({ evaluations, templates, boardMembers }: EvaluationDashboardProps) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [creating, setCreating] = useState(false);
    const [evals, setEvals] = useState(evaluations);

    const activeTemplates = templates.filter(t => t.is_active);
    const selectedTemplateObj = activeTemplates.find(t => t.id === selectedTemplate);
    const needsSubject = selectedTemplateObj?.evaluation_type === 'peer_review';

    const handleCreate = async () => {
        if (!selectedTemplate) { toast.error('Please select a template'); return; }
        if (needsSubject && !selectedSubject) { toast.error('Please select a board member to review'); return; }

        setCreating(true);
        try {
            const res = await fetch('/api/evaluations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    template_id: selectedTemplate,
                    subject_id: needsSubject ? selectedSubject : undefined,
                }),
            });
            if (!res.ok) throw new Error(await res.text());
            const created = await res.json();
            // Redirect to the new evaluation form
            window.location.href = `/evaluations/${created.id}`;
        } catch (err: any) {
            toast.error(err.message || 'Failed to create evaluation');
            setCreating(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header with Start button */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Evaluations</h1>
                    <p className="text-muted-foreground mt-1">
                        Self-assessments, peer reviews, and board performance tracking.
                    </p>
                </div>
                <Button onClick={() => setDialogOpen(true)} disabled={activeTemplates.length === 0}>
                    <Plus className="h-4 w-4 mr-2" /> Start Evaluation
                </Button>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="my-evaluations">
                <TabsList className="w-full sm:w-auto">
                    <TabsTrigger value="my-evaluations">My Evaluations</TabsTrigger>
                    <TabsTrigger value="templates">Templates</TabsTrigger>
                    <TabsTrigger value="reports">Performance Report</TabsTrigger>
                </TabsList>

                <TabsContent value="my-evaluations" className="mt-4">
                    <EvaluationList evaluations={evals} />
                </TabsContent>

                <TabsContent value="templates" className="mt-4">
                    <TemplateList initialTemplates={templates} />
                </TabsContent>

                <TabsContent value="reports" className="mt-4">
                    <PerformanceReport evaluations={evals} boardMembers={boardMembers} />
                </TabsContent>
            </Tabs>

            {/* Start Evaluation Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Start New Evaluation</DialogTitle>
                        <DialogDescription>Choose a template and configure the evaluation.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label>Evaluation Template</Label>
                            <Select value={selectedTemplate} onValueChange={v => { setSelectedTemplate(v); setSelectedSubject(''); }}>
                                <SelectTrigger><SelectValue placeholder="Select a template..." /></SelectTrigger>
                                <SelectContent>
                                    {activeTemplates.map(t => (
                                        <SelectItem key={t.id} value={t.id}>
                                            {t.title} <span className="text-muted-foreground text-xs ml-1">({t.evaluation_type.replace('_', ' ')})</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {needsSubject && (
                            <div className="space-y-1.5">
                                <Label>Board Member to Review</Label>
                                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                                    <SelectTrigger><SelectValue placeholder="Select a member..." /></SelectTrigger>
                                    <SelectContent>
                                        {boardMembers.map(m => (
                                            <SelectItem key={m.id} value={m.id}>
                                                {m.full_name} — {m.position}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {selectedTemplateObj && (
                            <p className="text-xs text-muted-foreground bg-muted p-3 rounded-md">
                                This evaluation has <strong>{selectedTemplateObj.questions.length}</strong> question{selectedTemplateObj.questions.length !== 1 ? 's' : ''}.
                                {selectedTemplateObj.description && <span> {selectedTemplateObj.description}</span>}
                            </p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreate} disabled={creating || !selectedTemplate}>
                            {creating ? 'Creating...' : 'Start'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
