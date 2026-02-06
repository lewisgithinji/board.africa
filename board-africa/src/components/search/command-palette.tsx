'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { FileText, Calendar, CheckSquare, FileCheck } from 'lucide-react';

interface SearchResult {
    type: string;
    id: string;
    title: string;
    content: string;
    created_at: string;
}

interface GroupedResults {
    meetings: SearchResult[];
    documents: SearchResult[];
    action_items: SearchResult[];
    resolutions: SearchResult[];
}

export function CommandPalette() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<GroupedResults>({
        meetings: [],
        documents: [],
        action_items: [],
        resolutions: [],
    });
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // Open on Cmd+K / Ctrl+K
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    // Search on query change with debounce
    useEffect(() => {
        if (!query || query.length < 2) {
            setResults({
                meetings: [],
                documents: [],
                action_items: [],
                resolutions: [],
            });
            return;
        }

        const searchTimeout = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
                const data = await res.json();
                setResults(data.results || {
                    meetings: [],
                    documents: [],
                    action_items: [],
                    resolutions: [],
                });
            } catch (error) {
                console.error('Search failed:', error);
            } finally {
                setLoading(false);
            }
        }, 300); // 300ms debounce

        return () => clearTimeout(searchTimeout);
    }, [query]);

    const navigate = (type: string, id: string) => {
        setOpen(false);
        setQuery(''); // Reset query after navigation

        const routes: Record<string, string> = {
            meeting: `/meetings/${id}`,
            document: `/documents/${id}`,
            action_item: `/action-items/${id}`,
            resolution: `/meetings/${id}#resolutions`,
        };

        router.push(routes[type] || '/');
    };

    const icons: Record<string, any> = {
        meetings: Calendar,
        documents: FileText,
        action_items: CheckSquare,
        resolutions: FileCheck,
    };

    const labels: Record<string, string> = {
        meetings: 'Meetings',
        documents: 'Documents',
        action_items: 'Action Items',
        resolutions: 'Resolutions',
    };

    const totalResults = Object.values(results).reduce((sum, arr) => sum + arr.length, 0);

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput
                placeholder="Search meetings, documents, action items..."
                value={query}
                onValueChange={setQuery}
            />
            <CommandList>
                {loading && <CommandEmpty>Searching...</CommandEmpty>}
                {!loading && query.length >= 2 && totalResults === 0 && (
                    <CommandEmpty>No results found.</CommandEmpty>
                )}

                {Object.entries(results).map(([groupKey, items]) => {
                    if (items.length === 0) return null;
                    const Icon = icons[groupKey];

                    return (
                        <CommandGroup key={groupKey} heading={labels[groupKey]}>
                            {items.map((item) => (
                                <CommandItem
                                    key={item.id}
                                    onSelect={() => navigate(item.type, item.id)}
                                    className="cursor-pointer"
                                >
                                    <Icon className="mr-2 h-4 w-4 shrink-0" />
                                    <div className="flex-1 overflow-hidden">
                                        <div className="font-medium truncate">{item.title}</div>
                                        {item.content && (
                                            <div className="text-sm text-muted-foreground line-clamp-1">
                                                {item.content}
                                            </div>
                                        )}
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    );
                })}
            </CommandList>
        </CommandDialog>
    );
}
