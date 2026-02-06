'use client';

import { useState, useMemo, useEffect } from 'react';
import useSWR from 'swr';
import {
    Search,
    Filter,
    Plus,
    FileText,
    Grid,
    List as ListIcon,
    ArrowUpDown,
    SlidersHorizontal
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { DocumentCard } from './DocumentCard';
import { DocumentUpload } from './DocumentUpload';
import { EmptyState } from '@/components/ui/EmptyState';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { toast } from 'sonner';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface DocumentListProps {
    meetingId?: string;
}

export function DocumentList({ meetingId }: DocumentListProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [showLibraryOnly, setShowLibraryOnly] = useState(false);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [mounted, setMounted] = useState(false);

    // Hydration guard
    useEffect(() => {
        setMounted(true);
    }, []);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const { data, error, mutate, isLoading: isSWRLoading } = useSWR(
        `/api/documents?${meetingId ? `meeting_id=${meetingId}` : ''}`,
        fetcher
    );

    const isLoading = isSWRLoading || !mounted;

    const documents = data?.documents || [];

    const filteredDocuments = useMemo(() => {
        return documents.filter((doc: any) => {
            const matchesSearch = !debouncedSearch ||
                doc.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                doc.file_name.toLowerCase().includes(debouncedSearch.toLowerCase());

            const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;

            // Switch ON -> Only Library Items.
            // Switch OFF -> Only Regular Items.
            const matchesLibrary = showLibraryOnly ? doc.is_library_item === true : !doc.is_library_item;

            return matchesSearch && matchesCategory && matchesLibrary;
        });
    }, [documents, debouncedSearch, categoryFilter, showLibraryOnly]);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this document? This will also remove the file from storage.')) {
            return;
        }

        try {
            const response = await fetch(`/api/documents/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete document');

            toast.success('Document deleted successfully');
            mutate();
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Failed to delete document');
        }
    };

    if (error) return <div className="p-10 text-center text-red-500">Failed to load documents</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1 max-w-md relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search documents..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center space-x-2 mr-2">
                        <Label htmlFor="library-mode" className="text-sm font-medium cursor-pointer">
                            Policy Library
                        </Label>
                        <Switch
                            id="library-mode"
                            checked={showLibraryOnly}
                            onCheckedChange={setShowLibraryOnly}
                        />
                    </div>

                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            <SelectItem value="financial">Financial</SelectItem>
                            <SelectItem value="legal">Legal</SelectItem>
                            <SelectItem value="strategic">Strategic</SelectItem>
                            <SelectItem value="operational">Operational</SelectItem>
                            <SelectItem value="governance">Governance</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                    </Select>

                    <Sheet open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                        <SheetTrigger asChild>
                            <Button className="gap-2">
                                <Plus className="h-4 w-4" />
                                <span className="hidden sm:inline">Upload</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="sm:max-w-md p-0 overflow-y-auto">
                            <div className="p-6">
                                <SheetHeader className="mb-6">
                                    <SheetTitle>Upload Document</SheetTitle>
                                    <SheetDescription>
                                        Add new board materials or documents.
                                    </SheetDescription>
                                </SheetHeader>
                                <DocumentUpload
                                    meetingId={meetingId}
                                    onSuccess={() => {
                                        mutate();
                                        setIsUploadOpen(false);
                                    }}
                                    onCancel={() => setIsUploadOpen(false)}
                                />
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-48 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
                    ))}
                </div>
            ) : filteredDocuments.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDocuments.map((doc: any) => (
                        <DocumentCard
                            key={doc.id}
                            document={doc}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            ) : (
                <EmptyState
                    title={searchQuery || categoryFilter !== 'all' ? "No documents found" : "No documents yet"}
                    description={searchQuery || categoryFilter !== 'all' ? "Try adjusting your filters" : "Upload your first board document to get started."}
                    icon={FileText}
                    action={!searchQuery && categoryFilter === 'all' ? {
                        label: "Upload Document",
                        onClick: () => setIsUploadOpen(true)
                    } : undefined}
                />
            )}
        </div>
    );
}
