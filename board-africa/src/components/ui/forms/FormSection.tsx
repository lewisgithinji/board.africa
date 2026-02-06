import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface FormSectionProps {
    title: string;
    description?: string;
    icon?: LucideIcon;
    children: ReactNode;
}

export function FormSection({ title, description, icon: Icon, children }: FormSectionProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    {Icon && <Icon className="h-5 w-5" />}
                    {title}
                </CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent className="space-y-4">
                {children}
            </CardContent>
        </Card>
    );
}
