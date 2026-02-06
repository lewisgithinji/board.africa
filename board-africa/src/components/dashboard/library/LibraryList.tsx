'use client';

import { useState, useMemo } from 'react';
import useSWR from 'swr';
import {
    Search,
    Filter,
    FileText,
    Book,
    Plus
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DocumentCard } from '../documents/DocumentCard';
import { DocumentUpload } from '../documents/DocumentUpload';
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

export function LibraryList() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [isUploadOpen, setIsUploadOpen] = useState(false);

    // Fetch only library items
    const { data, error, mutate, isLoading } = useSWR(
        `/api/documents?is_library_item=true`,
        fetcher
    );

    const documents = data?.documents || [];

    const filteredDocuments = useMemo(() => {
        return documents.filter((doc: any) => {
            const matchesSearch = !searchQuery ||
                doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                doc.file_name.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesCategory = selectedCategory === 'all' ||
                (doc.library_category || doc.category) === selectedCategory;

            return matchesSearch && matchesCategory;
        });
    }, [documents, searchQuery, selectedCategory]);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this policy document?')) {
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

    if (error) return <div className="p-10 text-center text-red-500">Failed to load library</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1 max-w-md relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search policies..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <Sheet open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                    <SheetTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            <span className="hidden sm:inline">Upload Policy</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="sm:max-w-md p-0 overflow-y-auto">
                        <div className="p-6">
                            <SheetHeader className="mb-6">
                                <SheetTitle>Upload Policy Document</SheetTitle>
                                <SheetDescription>
                                    Add permanent documents like charters, bylaws, or policies.
                                </SheetDescription>
                            </SheetHeader>
                            <DocumentUpload
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

            <Tabs defaultValue="all" value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
                <TabsList className="w-full justify-start overflow-x-auto h-auto p-1 bg-transparent border-b border-gray-200 dark:border-gray-700 rounded-none mb-6 gap-2">
                    <TabsTrigger value="all" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary border border-transparent data-[state=active]:border-primary/20 rounded-full px-4">All</TabsTrigger>
                    <TabsTrigger value="governance" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary border border-transparent data-[state=active]:border-primary/20 rounded-full px-4">Governance</TabsTrigger>
                    <TabsTrigger value="legal" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary border border-transparent data-[state=active]:border-primary/20 rounded-full px-4">Legal</TabsTrigger>
                    <TabsTrigger value="financial" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary border border-transparent data-[state=active]:border-primary/20 rounded-full px-4">Financial</TabsTrigger>
                    <TabsTrigger value="strategic" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary border border-transparent data-[state=active]:border-primary/20 rounded-full px-4">Strategic</TabsTrigger>
                    <TabsTrigger value="operational" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary border border-transparent data-[state=active]:border-primary/20 rounded-full px-4">Operational</TabsTrigger>
                </TabsList>

                <TabsContent value={selectedCategory} className="mt-0">
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
                            title={searchQuery || selectedCategory !== 'all' ? "No policies found" : "Library is empty"}
                            description={searchQuery || selectedCategory !== 'all' ? "Try adjusting your search or category" : "Upload documents and mark them as 'Library Item' to see them here."}
                            icon={Book}
                            action={!searchQuery && selectedCategory === 'all' ? {
                                label: "Upload Policy",
                                onClick: () => setIsUploadOpen(true)
                            } : undefined}
                        />
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
