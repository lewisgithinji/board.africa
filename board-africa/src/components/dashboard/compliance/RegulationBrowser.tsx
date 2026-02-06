'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Search, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import type { ComplianceRegulation } from '@/lib/types/database.types';

const CATEGORY_LABELS: Record<string, string> = {
    corporate_governance: 'Corporate Governance',
    financial_reporting: 'Financial Reporting',
    anti_money_laundering: 'AML / CFT',
    data_protection: 'Data Protection',
    tax_compliance: 'Tax Compliance',
    securities: 'Securities',
    environmental: 'Environmental',
    labor: 'Labor',
};

const CATEGORY_COLORS: Record<string, string> = {
    corporate_governance: 'bg-blue-100 text-blue-800',
    financial_reporting: 'bg-green-100 text-green-800',
    anti_money_laundering: 'bg-red-100 text-red-800',
    data_protection: 'bg-purple-100 text-purple-800',
    tax_compliance: 'bg-amber-100 text-amber-800',
    securities: 'bg-indigo-100 text-indigo-800',
    environmental: 'bg-emerald-100 text-emerald-800',
    labor: 'bg-orange-100 text-orange-800',
};

interface RegulationBrowserProps {
    regulations: ComplianceRegulation[];
}

export function RegulationBrowser({ regulations }: RegulationBrowserProps) {
    const [search, setSearch] = useState('');
    const [country, setCountry] = useState('all');
    const [category, setCategory] = useState('all');
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const countries = useMemo(() => {
        return [...new Set(regulations.map(r => r.country))].sort();
    }, [regulations]);

    const filtered = useMemo(() => {
        return regulations.filter(r => {
            if (country !== 'all' && r.country !== country) return false;
            if (category !== 'all' && r.category !== category) return false;
            if (search) {
                const q = search.toLowerCase();
                if (!r.title.toLowerCase().includes(q) && !r.description.toLowerCase().includes(q)) return false;
            }
            return true;
        });
    }, [regulations, country, category, search]);

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                    <Label className="text-xs">Search</Label>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search regulations..."
                            className="pl-9"
                        />
                    </div>
                </div>
                <div className="space-y-1">
                    <Label className="text-xs">Country</Label>
                    <Select value={country} onValueChange={setCountry}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Countries</SelectItem>
                            {countries.map(c => (
                                <SelectItem key={c} value={c}>{c}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1">
                    <Label className="text-xs">Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                                <SelectItem key={key} value={key}>{label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <p className="text-xs text-muted-foreground">{filtered.length} regulation{filtered.length !== 1 ? 's' : ''} found</p>

            {filtered.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                        <p className="font-semibold">No regulations found</p>
                        <p className="text-sm text-muted-foreground">Try adjusting your filters.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-2">
                    {filtered.map(reg => {
                        const isExpanded = expandedId === reg.id;
                        return (
                            <Card
                                key={reg.id}
                                className="cursor-pointer hover:shadow-sm transition-shadow"
                                onClick={() => setExpandedId(isExpanded ? null : reg.id)}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                                <span className="text-sm font-semibold">{reg.title}</span>
                                                {reg.reference_code && (
                                                    <span className="text-xs text-muted-foreground font-mono">({reg.reference_code})</span>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                                <Badge variant="outline" className="text-xs">{reg.country}</Badge>
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${CATEGORY_COLORS[reg.category] || 'bg-gray-100 text-gray-800'}`}>
                                                    {CATEGORY_LABELS[reg.category] || reg.category}
                                                </span>
                                                {reg.effective_date && (
                                                    <span className="text-xs text-muted-foreground">
                                                        Effective: {new Date(reg.effective_date + 'T00:00:00').toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {isExpanded ? reg.description : reg.description.slice(0, 120) + (reg.description.length > 120 ? '...' : '')}
                                            </p>
                                        </div>
                                        {isExpanded
                                            ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                                            : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                                        }
                                    </div>

                                    {isExpanded && reg.key_requirements.length > 0 && (
                                        <div className="mt-3 pt-3 border-t space-y-1.5">
                                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Key Requirements</p>
                                            <ul className="space-y-1">
                                                {reg.key_requirements.map((req, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-sm">
                                                        <span className="text-primary mt-0.5">&#8226;</span>
                                                        <span>{req}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
