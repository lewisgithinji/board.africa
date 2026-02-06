'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, MapPin, Calendar, DollarSign, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface BoardPositionCardProps {
    position: any;
    organization: any;
}

export function BoardPositionCard({ position, organization }: BoardPositionCardProps) {
    const closingDate = position.closing_date ? new Date(position.closing_date).toLocaleDateString() : 'No deadline';

    return (
        <Card className="flex flex-col h-full hover:shadow-xl transition-all duration-300 border-primary/5 group">
            <CardHeader>
                <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10">
                        {position.position_type}
                    </Badge>
                    <Badge variant={position.is_remunerated ? "default" : "outline"} className="text-[10px]">
                        {position.is_remunerated ? 'Remunerated' : 'Pro-bono'}
                    </Badge>
                </div>
                <CardTitle className="group-hover:text-primary transition-colors line-clamp-2">
                    {position.title}
                </CardTitle>
                <CardDescription className="flex items-center gap-1.5 mt-1">
                    <Building2 className="h-3.5 w-3.5" />
                    {organization?.name || 'Private Organization'}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {position.location || 'Remote / Multiple'}
                    </div>
                    <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Closes: {closingDate}
                    </div>
                </div>
                <p className="text-sm line-clamp-3 text-muted-foreground/90 leading-relaxed">
                    {position.description}
                </p>
            </CardContent>
            <CardFooter className="pt-0">
                <Button asChild className="w-full group/btn font-semibold" variant="outline">
                    <Link href={`/marketplace/positions/${position.id}`}>
                        View Details
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
