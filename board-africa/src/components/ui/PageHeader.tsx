
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface PageHeaderProps {
    title: string;
    description?: string;
    children?: React.ReactNode;
    badge?: string;
    className?: string;
}

export function PageHeader({ title, description, children, badge, className }: PageHeaderProps) {
    return (
        <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-500", className)}>
            <div className="space-y-1">
                <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                        {title}
                    </h1>
                    {badge && (
                        <Badge variant="outline" className="text-xs bg-white/50 backdrop-blur-sm">
                            {badge}
                        </Badge>
                    )}
                </div>

                {description && (
                    <p className="text-muted-foreground text-lg max-w-2xl text-slate-500 dark:text-slate-400">
                        {description}
                    </p>
                )}
            </div>
            {children && (
                <div className="flex items-center gap-2">
                    {children}
                </div>
            )}
        </div>
    );
}
