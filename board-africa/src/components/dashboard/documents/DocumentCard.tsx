'use client';

import { memo, useMemo, useState } from 'react';
import { format } from 'date-fns';
import {
    FileText,
    FileImage,
    FileSpreadsheet,
    File as FileIcon,
    Download,
    MoreVertical,
    Trash2,
    Eye,
    Calendar,
    HardDrive,
    ExternalLink,
    Highlighter,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import dynamic from 'next/dynamic';

const DocumentAnnotator = dynamic(() => import('./DocumentAnnotator').then(mod => mod.DocumentAnnotator), {
    ssr: false,
    loading: () => (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
            <div className="h-12 w-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-slate-500 font-medium animate-pulse">Initializing Annotator...</p>
        </div>
    )
});

interface DocumentCardProps {
    document: any;
    onDelete?: (id: string) => void;
}

const categoryColors = {
    financial: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    legal: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    strategic: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    operational: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    governance: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
    other: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
};

const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText className="h-8 w-8 text-rose-500" />;
    if (type.includes('image')) return <FileImage className="h-8 w-8 text-blue-500" />;
    if (type.includes('sheet') || type.includes('excel') || type.includes('csv'))
        return <FileSpreadsheet className="h-8 w-8 text-emerald-500" />;
    if (type.includes('word') || type.includes('officedocument'))
        return <FileText className="h-8 w-8 text-blue-600" />;
    return <FileIcon className="h-8 w-8 text-gray-500" />;
};

const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const DocumentCard = memo(function DocumentCard({ document, onDelete }: DocumentCardProps) {
    const [isDownloading, setIsDownloading] = useState(false);
    const [isAnnotatorOpen, setIsAnnotatorOpen] = useState(false);

    const isPdf = useMemo(() => document.file_type?.includes('pdf'), [document.file_type]);

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            const response = await fetch(`/api/documents/${document.id}/download`);
            if (!response.ok) throw new Error('Failed to get download link');

            const { download_url } = await response.json();

            // Open in new tab or trigger download
            window.open(download_url, '_blank');
        } catch (error) {
            console.error('Download error:', error);
            toast.error('Failed to download document');
        } finally {
            setIsDownloading(false);
        }
    };

    const formattedDate = useMemo(() =>
        format(new Date(document.created_at), 'MMM d, yyyy'),
        [document.created_at]);

    const fileSizeLabel = useMemo(() =>
        formatFileSize(document.file_size),
        [document.file_size]);

    return (
        <Card className="group transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 overflow-hidden">
            <CardContent className="p-0">
                <div className="p-5 flex items-start gap-4">
                    <div className="flex-shrink-0 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl group-hover:scale-110 transition-transform">
                        {getFileIcon(document.file_type || '')}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-primary transition-colors pr-6">
                                {document.title}
                            </h3>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={handleDownload} disabled={isDownloading}>
                                        <Download className="h-4 w-4 mr-2" />
                                        Download
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => window.open(`/api/documents/${document.id}/download`, '_blank')}>
                                        <Eye className="h-4 w-4 mr-2" />
                                        View
                                    </DropdownMenuItem>
                                    {isPdf && (
                                        <DropdownMenuItem onClick={() => setIsAnnotatorOpen(true)}>
                                            <Highlighter className="h-4 w-4 mr-2" />
                                            Annotate
                                        </DropdownMenuItem>
                                    )}
                                    {onDelete && (
                                        <DropdownMenuItem
                                            onClick={() => onDelete(document.id)}
                                            className="text-destructive focus:text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete
                                        </DropdownMenuItem>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="secondary" className={`${categoryColors[document.category as keyof typeof categoryColors] || categoryColors.other} text-[10px] px-1.5 py-0 uppercase tracking-wider`}>
                                {document.category || 'other'}
                            </Badge>
                            {document.is_library_item && (
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-indigo-200 text-indigo-600 dark:border-indigo-900/50 bg-indigo-50 dark:bg-indigo-900/20">
                                    Policy Library
                                </Badge>
                            )}
                            {document.is_public && (
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-blue-200 text-blue-600 dark:border-blue-900/50">
                                    Public
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>

                <div className="px-5 pb-5 grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{formattedDate}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 justify-end">
                        <HardDrive className="h-3.5 w-3.5" />
                        <span>{fileSizeLabel}</span>
                    </div>
                </div>

                <div className="px-5 py-3 bg-gray-50/50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase truncate max-w-[120px]">
                        {document.file_name}
                    </span>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-primary hover:text-primary-dark hover:bg-primary/5 px-2"
                        onClick={handleDownload}
                        disabled={isDownloading}
                    >
                        {isDownloading ? '...' : <Download className="h-3.5 w-3.5" />}
                    </Button>
                </div>
            </CardContent>

            <Dialog open={isAnnotatorOpen} onOpenChange={setIsAnnotatorOpen}>
                <DialogContent className="max-w-[95vw] w-[1400px] h-[95vh] p-0 border-none bg-transparent shadow-none">
                    <div className="h-full w-full bg-white rounded-2xl overflow-hidden flex flex-col">
                        <DialogHeader className="p-6 bg-white border-b border-slate-100 flex flex-row items-center justify-between shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                                    <FileText className="h-6 w-6" />
                                </div>
                                <div>
                                    <DialogTitle className="text-xl font-bold text-slate-900 tracking-tight">
                                        {document.title}
                                    </DialogTitle>
                                    <p className="text-sm text-slate-500 font-medium">Document Annotation System</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 pr-8">
                                <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 px-3 py-1 text-xs font-semibold rounded-lg uppercase tracking-wider">
                                    {document.category || 'Standard'}
                                </Badge>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleDownload}
                                    className="h-9 px-4 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 gap-2"
                                >
                                    <Download className="h-4 w-4" />
                                    Download PDF
                                </Button>
                            </div>
                        </DialogHeader>
                        <div className="flex-1 min-h-0 bg-slate-50 p-6 overflow-hidden">
                            <DocumentAnnotator document={document} />
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </Card>
    );
});
