'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { TemplateEditor } from './TemplateEditor';
import type { EvaluationTemplate } from '@/lib/types/database.types';

interface TemplateListProps {
    initialTemplates: EvaluationTemplate[];
}

const TYPE_LABELS: Record<string, string> = {
    self_assessment: 'Self Assessment',
    peer_review: 'Peer Review',
    board_evaluation: 'Board Evaluation',
};

const TYPE_COLORS: Record<string, string> = {
    self_assessment: 'bg-blue-100 text-blue-800',
    peer_review: 'bg-purple-100 text-purple-800',
    board_evaluation: 'bg-amber-100 text-amber-800',
};

export function TemplateList({ initialTemplates }: TemplateListProps) {
    const [templates, setTemplates] = useState<EvaluationTemplate[]>(initialTemplates);
    const [showEditor, setShowEditor] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<EvaluationTemplate | null>(null);

    const handleSave = (template: EvaluationTemplate) => {
        if (editingTemplate) {
            setTemplates(prev => prev.map(t => t.id === template.id ? template : t));
        } else {
            setTemplates(prev => [template, ...prev]);
        }
        setShowEditor(false);
        setEditingTemplate(null);
    };

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/evaluations/templates/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete');
            setTemplates(prev => prev.filter(t => t.id !== id));
            toast.success('Template deleted');
        } catch {
            toast.error('Failed to delete template');
        }
    };

    if (showEditor || editingTemplate) {
        return (
            <TemplateEditor
                template={editingTemplate}
                onSave={handleSave}
                onCancel={() => { setShowEditor(false); setEditingTemplate(null); }}
            />
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    Manage evaluation templates for your organization
                </p>
                <Button size="sm" onClick={() => setShowEditor(true)}>
                    <Plus className="h-4 w-4 mr-2" /> New Template
                </Button>
            </div>

            {templates.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                        <p className="font-semibold">No templates yet</p>
                        <p className="text-sm text-muted-foreground">
                            Create your first evaluation template to get started.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-3">
                    {templates.map(template => (
                        <Card key={template.id} className="hover:shadow-sm transition-shadow">
                            <CardHeader className="pb-2">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${TYPE_COLORS[template.evaluation_type]}`}>
                                            {TYPE_LABELS[template.evaluation_type]}
                                        </span>
                                        {!template.is_active && (
                                            <Badge variant="outline" className="text-xs">Inactive</Badge>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="sm" onClick={() => setEditingTemplate(template)}>
                                            Edit
                                        </Button>
                                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(template.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <CardTitle className="text-base mt-2">{template.title}</CardTitle>
                                {template.description && (
                                    <CardDescription>{template.description}</CardDescription>
                                )}
                            </CardHeader>
                            <CardContent>
                                <p className="text-xs text-muted-foreground">
                                    {template.questions.length} question{template.questions.length !== 1 ? 's' : ''}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
