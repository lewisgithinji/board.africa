import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FormRowProps {
    children: ReactNode;
    columns?: 2 | 3;
    className?: string;
}

export function FormRow({ children, columns = 2, className }: FormRowProps) {
    return (
        <div
            className={cn(
                'grid grid-cols-1 gap-4',
                columns === 2 && 'md:grid-cols-2',
                columns === 3 && 'md:grid-cols-3',
                className
            )}
        >
            {children}
        </div>
    );
}
