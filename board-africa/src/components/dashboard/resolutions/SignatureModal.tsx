'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { SignaturePad } from './SignaturePad';
import type { Resolution } from '@/lib/types/database.types';
import { AlertCircle } from 'lucide-react';

interface SignatureModalProps {
    resolution: Resolution;
    boardMemberId: string;
    organizationName?: string;
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function SignatureModal({
    resolution,
    boardMemberId,
    organizationName = 'your organization',
    open,
    onClose,
    onSuccess,
}: SignatureModalProps) {
    const [agreed, setAgreed] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSave = async (data: string, type: 'drawn' | 'typed', typedName?: string) => {
        if (!agreed) {
            setError('You must agree to the electronic signature terms');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const res = await fetch(`/api/resolutions/${resolution.id}/signatures`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    board_member_id: boardMemberId,
                    signature_data: data,
                    signature_type: type,
                    typed_name: typedName,
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to save signature');
            }

            onSuccess();
            handleClose();
        } catch (err) {
            console.error('Error saving signature:', err);
            setError(err instanceof Error ? err.message : 'Failed to save signature');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setAgreed(false);
        setError(null);
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Sign Resolution</DialogTitle>
                    <DialogDescription>
                        Sign "{resolution.title}" electronically
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Legal Disclaimer */}
                    <div className="bg-muted p-4 rounded-lg space-y-2">
                        <p className="text-sm font-medium">Electronic Signature Agreement</p>
                        <p className="text-sm text-muted-foreground">
                            By signing below, I acknowledge that this electronic signature has the same legal
                            effect as a handwritten signature. I understand that I am signing this resolution
                            as a board member of {organizationName}.
                        </p>
                    </div>

                    {/* Signature Pad */}
                    {!isSubmitting && (
                        <SignaturePad onSave={handleSave} onCancel={handleClose} />
                    )}

                    {/* Agreement Checkbox */}
                    <div className="flex items-start space-x-2">
                        <Checkbox
                            id="agree"
                            checked={agreed}
                            onCheckedChange={(checked) => setAgreed(checked as boolean)}
                        />
                        <Label
                            htmlFor="agree"
                            className="text-sm font-normal leading-relaxed cursor-pointer"
                        >
                            I agree to sign this resolution electronically
                        </Label>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                            <AlertCircle className="h-4 w-4" />
                            <p>{error}</p>
                        </div>
                    )}

                    {/* Submitting State */}
                    {isSubmitting && (
                        <div className="text-center py-4">
                            <p className="text-sm text-muted-foreground">Saving signature...</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
