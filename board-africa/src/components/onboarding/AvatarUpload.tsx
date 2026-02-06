'use client';

import { useState, useRef } from 'react';
import { Upload, X, Loader2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { validateAvatarFile } from '@/lib/utils/onboarding';
import { createClient } from '@/lib/supabase/client';
import { generateAvatarFilename } from '@/lib/utils/onboarding';

interface AvatarUploadProps {
    userId: string;
    currentAvatarUrl?: string | null;
    onUploadComplete: (url: string) => void;
    onSkip?: () => void;
}

export function AvatarUpload({
    userId,
    currentAvatarUrl,
    onUploadComplete,
    onSkip,
}: AvatarUploadProps) {
    const [preview, setPreview] = useState<string | null>(currentAvatarUrl || null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (selectedFile: File) => {
        setError(null);

        // Validate file
        const validation = validateAvatarFile(selectedFile);
        if (!validation.valid) {
            setError(validation.error || 'Invalid file');
            return;
        }

        setFile(selectedFile);

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            handleFileSelect(droppedFile);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            handleFileSelect(selectedFile);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a file first');
            return;
        }

        setUploading(true);
        setError(null);

        try {
            const supabase = createClient();

            // Generate unique filename
            const filename = generateAvatarFilename(userId, file);

            // Upload to Supabase Storage
            const { data, error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filename, file, {
                    cacheControl: '3600',
                    upsert: false,
                });

            if (uploadError) {
                throw uploadError;
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filename);

            // Update profile with avatar URL
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ avatar_url: publicUrl })
                .eq('id', userId);

            if (updateError) {
                throw updateError;
            }

            onUploadComplete(publicUrl);
        } catch (err: any) {
            console.error('Upload error:', err);
            setError(err.message || 'Failed to upload avatar');
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = () => {
        setPreview(null);
        setFile(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">Upload your profile photo</h2>
                <p className="text-muted-foreground">
                    Add a professional photo to help others recognize you
                </p>
            </div>

            <div className="flex flex-col items-center space-y-4">
                {/* Preview or Upload Area */}
                {preview ? (
                    <div className="relative">
                        <div className="h-40 w-40 rounded-full overflow-hidden border-4 border-primary">
                            <img
                                src={preview}
                                alt="Avatar preview"
                                className="h-full w-full object-cover"
                            />
                        </div>
                        <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 rounded-full"
                            onClick={handleRemove}
                            disabled={uploading}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ) : (
                    <Card
                        className="w-full max-w-md p-8 border-2 border-dashed cursor-pointer hover:border-primary transition-colors"
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className="flex flex-col items-center space-y-4 text-center">
                            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                                <User className="h-10 w-10 text-muted-foreground" />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-center space-x-2">
                                    <Upload className="h-5 w-5 text-muted-foreground" />
                                    <span className="text-sm font-medium">
                                        Drop your photo here or click to browse
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    PNG, JPG or WebP (max 5MB)
                                </p>
                            </div>
                        </div>
                    </Card>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/jpg"
                    onChange={handleFileInputChange}
                    className="hidden"
                />

                {error && (
                    <p className="text-sm text-destructive">{error}</p>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 w-full max-w-md">
                    {onSkip && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onSkip}
                            disabled={uploading}
                            className="flex-1"
                        >
                            Skip for now
                        </Button>
                    )}
                    <Button
                        type="button"
                        onClick={handleUpload}
                        disabled={!file || uploading}
                        className="flex-1"
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            'Upload Photo'
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
