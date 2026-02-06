

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatsPulseProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: {
        value: number;
        label: string;
        direction: 'up' | 'down' | 'neutral';
    };
    colorClass?: string; // e.g. "text-indigo-600 bg-indigo-50"
    delay?: number;
}

export function StatsPulse({ title, value, icon: Icon, trend, colorClass = "text-primary bg-primary/10", delay = 0 }: StatsPulseProps) {
    return (
        <Card className={cn(
            "relative overflow-hidden border-none shadow-xl shadow-indigo-500/5 hover:shadow-indigo-500/10 transition-all duration-300 transform hover:-translate-y-1",
            "animate-in fade-in slide-in-from-bottom-4"
        )} style={{ animationDelay: `${delay}ms` }}>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
                        <h3 className="text-2xl font-bold tracking-tight text-foreground">{value}</h3>

                        {trend && (
                            <div className="flex items-center gap-1.5 mt-2.5">
                                <span className={cn(
                                    "flex items-center text-xs font-semibold px-2 py-0.5 rounded-full",
                                    trend.direction === 'up' ? "text-emerald-700 bg-emerald-50" :
                                        trend.direction === 'down' ? "text-rose-700 bg-rose-50" :
                                            "text-slate-600 bg-slate-100"
                                )}>
                                    {trend.direction === 'up' && <TrendingUp className="h-3 w-3 mr-1" />}
                                    {trend.direction === 'down' && <TrendingDown className="h-3 w-3 mr-1" />}
                                    {trend.direction === 'neutral' && <Minus className="h-3 w-3 mr-1" />}
                                    {trend.value}%
                                </span>
                                <span className="text-[11px] text-muted-foreground/80">{trend.label}</span>
                            </div>
                        )}
                    </div>

                    <div className={cn(
                        "h-12 w-12 rounded-2xl flex items-center justify-center ring-4 ring-white dark:ring-slate-900",
                        colorClass
                    )}>
                        <Icon className="h-6 w-6" />
                    </div>
                </div>

                {/* Decorative background blob */}
                <div className={cn(
                    "absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-10 blur-2xl",
                    colorClass.split(" ")[1] // Grab the bg class
                )} />
            </CardContent>
        </Card>
    );
}
