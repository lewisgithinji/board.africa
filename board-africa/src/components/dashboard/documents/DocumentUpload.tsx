'use client';

import { useState, useRef, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Upload, X, File, AlertCircle, CheckCircle2, Loader2, Book } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { fileUploadSchema } from '@/lib/validations/document';

interface DocumentUploadProps {
    meetingId?: string;
    onSuccess?: (document: any) => void;
    onCancel?: () => void;
}

const categories = [
    { value: 'financial', label: 'Financial' },
    { value: 'legal', label: 'Legal' },
    { value: 'strategic', label: 'Strategic' },
    { value: 'operational', label: 'Operational' },
    { value: 'governance', label: 'Governance' },
    { value: 'other', label: 'Other' },
];

export function DocumentUpload({ meetingId, onSuccess, onCancel }: DocumentUploadProps) {
    const [file, setFile] = useState<File | null>(null);
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('other');
    const [isLibraryItem, setIsLibraryItem] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [meetings, setMeetings] = useState<any[]>([]);
    const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(meetingId || null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const supabase = createClient();

    useEffect(() => {
        if (!meetingId) {
            async function fetchMeetings() {
                try {
                    const response = await fetch('/api/meetings/simple');
                    if (response.ok) {
                        const data = await response.json();
                        setMeetings(data.meetings || []);
                    }
                } catch (error) {
                    console.error('Error fetching meetings for upload:', error);
                }
            }
            fetchMeetings();
        }
    }, [meetingId]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];

            // Validate file
            const validation = fileUploadSchema.safeParse({
                file_name: selectedFile.name,
                file_size: selectedFile.size,
                file_type: selectedFile.type,
            });

            if (!validation.success) {
                toast.error(validation.error.errors[0].message);
                return;
            }

            setFile(selectedFile);
            if (!title) {
                // Set default title from filename (removing extension)
                let nameOnly = selectedFile.name.replace(/\.[^/.]+$/, "");
                // Ensure at least 3 chars for validation
                if (nameOnly.length < 3) {
                    nameOnly = `${nameOnly} - Document`;
                }
                setTitle(nameOnly);
            }
        }
    };

    const handleUpload = async () => {
        if (!file || !title) {
            toast.error('Please select a file and provide a title');
            return;
        }

        setIsUploading(true);
        setProgress(0);

        try {
            // 1. Get current user for organization_id
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Unauthorized');

            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `${user.id}/${fileName}`;

            // 2. Upload to Supabase Storage
            const { error: uploadError, data } = await supabase.storage
                .from('board-africa-documents')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false,
                });

            if (uploadError) throw uploadError;

            // 3. Save metadata to API
            const response = await fetch('/api/documents', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    category,
                    meeting_id: selectedMeetingId || meetingId || null,
                    file_url: filePath, // Store the relative path
                    file_name: file.name,
                    file_size: file.size,
                    file_type: file.type,
                    is_public: false,
                    is_library_item: isLibraryItem,
                    library_category: isLibraryItem ? category : null,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                if (errorData.details) {
                    console.error('Validation details:', errorData.details);
                    const error = new Error('Validation failed');
                    (error as any).details = errorData.details;
                    throw error;
                }
                throw new Error(errorData.error || 'Failed to save document metadata');
            }

            const { document } = await response.json();

            toast.success('Document uploaded successfully');
            if (onSuccess) onSuccess(document);

            // Reset form
            setFile(null);
            setTitle('');
            setCategory('other');
            setIsLibraryItem(false);
        } catch (error: any) {
            console.error('Upload error:', error);
            // Handle specific validation errors
            if (error.message === 'Validation failed' && error.details) {
                const firstError = Object.values(error.details as any)[0] as string[];
                toast.error(`Validation Error: ${firstError[0]}`);
            } else {
                toast.error(error.message || 'Error uploading document');
            }
        } finally {
            setIsUploading(false);
            setProgress(0);
        }
    };

    return (
        <div className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Upload Document</h3>
                {onCancel && (
                    <Button variant="ghost" size="icon" onClick={onCancel} disabled={isUploading}>
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>

            <div className="space-y-4">
                {/* Custom File Dropzone-ish Area */}
                {!file ? (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-10 text-center hover:border-primary cursor-pointer transition-colors"
                    >
                        <div className="flex flex-col items-center">
                            <div className="p-3 bg-primary/10 rounded-full mb-4">
                                <Upload className="h-6 w-6 text-primary" />
                            </div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Click to upload or drag and drop
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                PDF, DOC, XLS (Max 10MB)
                            </p>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleFileChange}
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,image/*"
                        />
                    </div>
                ) : (
                    <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                        <div className="p-2 bg-primary/10 rounded-lg mr-4">
                            <File className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {file.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setFile(null)}
                            disabled={isUploading}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="doc-title">Document Title</Label>
                        <Input
                            id="doc-title"
                            placeholder="e.g. Q4 Financial Audit"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            disabled={isUploading}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="doc-category">Category</Label>
                        <Select value={category} onValueChange={setCategory} disabled={isUploading}>
                            <SelectTrigger id="doc-category">
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((cat) => (
                                    <SelectItem key={cat.value} value={cat.value}>
                                        {cat.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex items-center space-x-2 pb-2">
                    <Checkbox
                        id="library-item"
                        checked={isLibraryItem}
                        onCheckedChange={(checked) => setIsLibraryItem(checked as boolean)}
                    />
                    <Label
                        htmlFor="library-item"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                    >
                        <Book className="h-4 w-4 text-blue-600" />
                        Add to Policy Library
                    </Label>
                    <span className="text-xs text-muted-foreground ml-2">(Policies, Charters, Bylaws)</span>
                </div>

                {!meetingId && meetings.length > 0 && (
                    <div className="space-y-2">
                        <Label htmlFor="doc-meeting">Link to Meeting (Optional)</Label>
                        <Select
                            value={selectedMeetingId || 'none'}
                            onValueChange={(value) => setSelectedMeetingId(value === 'none' ? null : value)}
                            disabled={isUploading}
                        >
                            <SelectTrigger id="doc-meeting">
                                <SelectValue placeholder="Select a meeting" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">General Document (No meeting)</SelectItem>
                                {meetings.map((m) => (
                                    <SelectItem key={m.id} value={m.id}>
                                        {m.title} ({new Date(m.meeting_date).toLocaleDateString()})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {isUploading && (
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>Uploading...</span>
                            <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-1" />
                    </div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                    {onCancel && (
                        <Button variant="outline" onClick={onCancel} disabled={isUploading}>
                            Cancel
                        </Button>
                    )}
                    <Button
                        onClick={handleUpload}
                        disabled={isUploading || !file || !title}
                        className="min-w-[120px]"
                    >
                        {isUploading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Uploading
                            </>
                        ) : (
                            'Upload'
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
