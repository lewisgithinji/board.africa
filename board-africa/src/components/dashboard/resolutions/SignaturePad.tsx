'use client';

import { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eraser } from 'lucide-react';

interface SignaturePadProps {
    onSave: (data: string, type: 'drawn' | 'typed', typedName?: string) => void;
    onCancel: () => void;
}

export function SignaturePad({ onSave, onCancel }: SignaturePadProps) {
    const canvasRef = useRef<SignatureCanvas>(null);
    const [signatureMode, setSignatureMode] = useState<'draw' | 'type'>('draw');
    const [typedName, setTypedName] = useState('');
    const [canvasKey, setCanvasKey] = useState(0);

    const handleClear = () => {
        canvasRef.current?.clear();
    };

    const handleSave = () => {
        if (signatureMode === 'draw') {
            if (canvasRef.current && !canvasRef.current.isEmpty()) {
                const dataUrl = canvasRef.current.toDataURL('image/png');
                onSave(dataUrl, 'drawn');
            }
        } else {
            if (typedName.trim()) {
                // Generate a canvas with typed text
                const canvas = document.createElement('canvas');
                canvas.width = 400;
                canvas.height = 200;
                const ctx = canvas.getContext('2d');

                if (ctx) {
                    // Clear canvas with white background
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);

                    // Draw signature text
                    ctx.fillStyle = '#000000';
                    ctx.font = '32px "Brush Script MT", cursive';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(typedName, canvas.width / 2, canvas.height / 2);
                }

                const dataUrl = canvas.toDataURL('image/png');
                onSave(dataUrl, 'typed', typedName);
            }
        }
    };

    const isValid = signatureMode === 'draw'
        ? canvasRef.current && !canvasRef.current.isEmpty()
        : typedName.trim().length > 0;

    return (
        <div className="space-y-4">
            <Tabs value={signatureMode} onValueChange={(v) => setSignatureMode(v as 'draw' | 'type')}>
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="draw">Draw Signature</TabsTrigger>
                    <TabsTrigger value="type">Type Signature</TabsTrigger>
                </TabsList>

                <TabsContent value="draw" className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-2 bg-white">
                        <SignatureCanvas
                            ref={canvasRef}
                            key={canvasKey}
                            canvasProps={{
                                width: 400,
                                height: 200,
                                className: 'signature-canvas rounded',
                            }}
                            backgroundColor="#ffffff"
                        />
                    </div>
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-muted-foreground">Sign above</p>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleClear}
                        >
                            <Eraser className="h-4 w-4 mr-2" />
                            Clear
                        </Button>
                    </div>
                </TabsContent>

                <TabsContent value="type" className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="typed-name">Enter your full name</Label>
                        <Input
                            id="typed-name"
                            type="text"
                            placeholder="John Doe"
                            value={typedName}
                            onChange={(e) => setTypedName(e.target.value)}
                            className="text-lg"
                        />
                    </div>
                    {typedName && (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-white flex items-center justify-center h-[200px]">
                            <p style={{ fontFamily: '"Brush Script MT", cursive', fontSize: '32px' }}>
                                {typedName}
                            </p>
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="button" onClick={handleSave} disabled={!isValid}>
                    Save Signature
                </Button>
            </div>
        </div>
    );
}
