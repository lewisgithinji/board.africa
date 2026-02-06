'use client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { RegulationBrowser } from './RegulationBrowser';
import { ComplianceCalendar } from './ComplianceCalendar';
import { ChecklistManager } from './ChecklistManager';
import type { ComplianceRegulation, ComplianceCalendarEvent, ComplianceChecklist } from '@/lib/types/database.types';

interface ComplianceDashboardProps {
    regulations: ComplianceRegulation[];
    calendarEvents: ComplianceCalendarEvent[];
    checklists: ComplianceChecklist[];
}

export function ComplianceDashboard({ regulations, calendarEvents, checklists }: ComplianceDashboardProps) {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Compliance</h1>
                <p className="text-muted-foreground mt-1">
                    Africa-specific regulatory library, compliance calendar, and checklists.
                </p>
            </div>

            <Tabs defaultValue="library">
                <TabsList className="w-full sm:w-auto">
                    <TabsTrigger value="library">Regulation Library</TabsTrigger>
                    <TabsTrigger value="calendar">Calendar</TabsTrigger>
                    <TabsTrigger value="checklists">Checklists</TabsTrigger>
                </TabsList>

                <TabsContent value="library" className="mt-4">
                    <RegulationBrowser regulations={regulations} />
                </TabsContent>

                <TabsContent value="calendar" className="mt-4">
                    <ComplianceCalendar events={calendarEvents} regulations={regulations} />
                </TabsContent>

                <TabsContent value="checklists" className="mt-4">
                    <ChecklistManager checklists={checklists} regulations={regulations} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
