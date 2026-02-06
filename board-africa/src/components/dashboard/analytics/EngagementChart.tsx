'use client';

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';

// Mock data to simulate rich analytics
// In production, this would be passed as a prop from the server
const DATA = [
    { name: 'Jan', meetings: 4, documents: 12, activity: 65 },
    { name: 'Feb', meetings: 3, documents: 8, activity: 59 },
    { name: 'Mar', meetings: 6, documents: 15, activity: 80 },
    { name: 'Apr', meetings: 4, documents: 10, activity: 81 },
    { name: 'May', meetings: 8, documents: 20, activity: 96 },
    { name: 'Jun', meetings: 5, documents: 14, activity: 75 },
];

export function EngagementChart() {
    const [period, setPeriod] = useState('6m');

    return (
        <Card className="border-none shadow-xl shadow-indigo-500/5 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-lg font-bold">Governance Activity</CardTitle>
                    <CardDescription>Overview of board engagement</CardDescription>
                </div>
                <Select value={period} onValueChange={setPeriod}>
                    <SelectTrigger className="w-[120px] h-8 bg-slate-50 border-none">
                        <SelectValue placeholder="Period" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="7d">Last 7 days</SelectItem>
                        <SelectItem value="30d">Last 30 days</SelectItem>
                        <SelectItem value="6m">Last 6 months</SelectItem>
                    </SelectContent>
                </Select>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748B', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748B', fontSize: 12 }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    borderRadius: '12px',
                                    border: 'none',
                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                                }}
                                cursor={{ stroke: '#6366f1', strokeWidth: 1 }}
                            />
                            <Area
                                type="monotone"
                                dataKey="activity"
                                stroke="#6366f1"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorActivity)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}

// Default export for lazy loading
export default EngagementChart;
