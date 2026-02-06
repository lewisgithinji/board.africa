'use client';

import { Building2, Briefcase } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface RoleSelectionProps {
    value: 'organization' | 'professional' | '';
    onChange: (value: 'organization' | 'professional') => void;
}

export function RoleSelection({ value, onChange }: RoleSelectionProps) {
    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold">Welcome to Board.Africa!</h2>
                <p className="text-muted-foreground">
                    Let's get started by selecting your account type
                </p>
            </div>

            <RadioGroup
                value={value}
                onValueChange={(val) => onChange(val as 'organization' | 'professional')}
                className="grid gap-4 md:grid-cols-2"
            >
                {/* Organization Card */}
                <div>
                    <RadioGroupItem
                        value="organization"
                        id="organization"
                        className="peer sr-only"
                    />
                    <Label
                        htmlFor="organization"
                        className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-6 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                    >
                        <Card className="w-full border-0 shadow-none">
                            <CardHeader className="text-center pb-4">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                    <Building2 className="h-8 w-8 text-primary" />
                                </div>
                                <CardTitle className="text-xl">Organization</CardTitle>
                                <CardDescription className="text-sm">
                                    For companies and institutions
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="text-center space-y-2">
                                <ul className="text-sm text-muted-foreground space-y-1">
                                    <li>• Manage board members</li>
                                    <li>• Schedule meetings</li>
                                    <li>• Track compliance</li>
                                    <li>• Document management</li>
                                </ul>
                            </CardContent>
                        </Card>
                    </Label>
                </div>

                {/* Professional Card */}
                <div>
                    <RadioGroupItem
                        value="professional"
                        id="professional"
                        className="peer sr-only"
                    />
                    <Label
                        htmlFor="professional"
                        className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-6 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                    >
                        <Card className="w-full border-0 shadow-none">
                            <CardHeader className="text-center pb-4">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                    <Briefcase className="h-8 w-8 text-primary" />
                                </div>
                                <CardTitle className="text-xl">Professional</CardTitle>
                                <CardDescription className="text-sm">
                                    For board members and advisors
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="text-center space-y-2">
                                <ul className="text-sm text-muted-foreground space-y-1">
                                    <li>• Build your profile</li>
                                    <li>• Find board opportunities</li>
                                    <li>• Network with peers</li>
                                    <li>• Track your boards</li>
                                </ul>
                            </CardContent>
                        </Card>
                    </Label>
                </div>
            </RadioGroup>
        </div>
    );
}
