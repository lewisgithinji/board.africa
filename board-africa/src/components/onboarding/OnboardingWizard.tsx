'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RoleSelection } from './RoleSelection';
import { OrganizationForm } from './OrganizationForm';
import { ProfessionalForm } from './ProfessionalForm';
import { AvatarUpload } from './AvatarUpload';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatProfileData } from '@/lib/utils/onboarding';
import type { OrganizationProfile, ProfessionalProfile } from '@/lib/validations/onboarding';

interface OnboardingWizardProps {
    userId: string;
    userEmail: string;
}

export function OnboardingWizard({ userId, userEmail }: OnboardingWizardProps) {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [role, setRole] = useState<'organization' | 'professional' | ''>('');
    const [profileData, setProfileData] = useState<OrganizationProfile | ProfessionalProfile | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const totalSteps = 3;
    const progress = (currentStep / totalSteps) * 100;

    const handleRoleSelect = (selectedRole: 'organization' | 'professional') => {
        setRole(selectedRole);
    };

    const handleNext = () => {
        if (currentStep === 1 && !role) {
            setError('Please select a role to continue');
            return;
        }
        setError(null);
        setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    };

    const handleBack = () => {
        setError(null);
        setCurrentStep((prev) => Math.max(prev - 1, 1));
    };

    const handleProfileSubmit = async (data: OrganizationProfile | ProfessionalProfile) => {
        setProfileData(data);
        setLoading(true);
        setError(null);

        try {
            const supabase = createClient();

            // Update profile with role and profile data
            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    role,
                    ...data,
                })
                .eq('id', userId);

            if (updateError) {
                throw updateError;
            }

            // Move to avatar upload step
            setCurrentStep(3);
        } catch (err: any) {
            console.error('Profile update error:', err);
            setError(err.message || 'Failed to save profile');
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarUploadComplete = async (avatarUrl: string) => {
        await completeOnboarding();
    };

    const handleSkipAvatar = async () => {
        await completeOnboarding();
    };

    const completeOnboarding = async () => {
        setLoading(true);
        setError(null);

        try {
            const supabase = createClient();

            // Mark onboarding as complete
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ onboarding_completed: true })
                .eq('id', userId);

            if (updateError) {
                throw updateError;
            }

            // Redirect to appropriate dashboard
            if (role === 'organization') {
                router.push('/dashboard');
            } else {
                router.push('/dashboard');
            }

            router.refresh();
        } catch (err: any) {
            console.error('Onboarding completion error:', err);
            setError(err.message || 'Failed to complete onboarding');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
            <div className="w-full max-w-2xl">
                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">
                            Step {currentStep} of {totalSteps}
                        </span>
                        <span className="text-sm text-muted-foreground">
                            {currentStep === 1 && 'Select Role'}
                            {currentStep === 2 && 'Profile Information'}
                            {currentStep === 3 && 'Profile Photo'}
                        </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                </div>

                {/* Main Card */}
                <div className="bg-card rounded-lg shadow-lg p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-destructive/10 border border-destructive rounded-md">
                            <p className="text-sm text-destructive">{error}</p>
                        </div>
                    )}

                    {/* Step 1: Role Selection */}
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <RoleSelection value={role} onChange={handleRoleSelect} />

                            <div className="flex justify-end">
                                <Button
                                    onClick={handleNext}
                                    disabled={!role}
                                    size="lg"
                                >
                                    Continue
                                    <ChevronRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Profile Form */}
                    {currentStep === 2 && (
                        <div className="space-y-6">
                            {role === 'organization' ? (
                                <OrganizationForm
                                    defaultValues={profileData as OrganizationProfile}
                                    onSubmit={handleProfileSubmit}
                                >
                                    <div className="flex justify-between pt-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleBack}
                                            disabled={loading}
                                        >
                                            <ChevronLeft className="mr-2 h-4 w-4" />
                                            Back
                                        </Button>
                                        <Button type="submit" disabled={loading} size="lg">
                                            {loading ? 'Saving...' : 'Continue'}
                                            <ChevronRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </div>
                                </OrganizationForm>
                            ) : (
                                <ProfessionalForm
                                    defaultValues={profileData as ProfessionalProfile}
                                    onSubmit={handleProfileSubmit}
                                >
                                    <div className="flex justify-between pt-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleBack}
                                            disabled={loading}
                                        >
                                            <ChevronLeft className="mr-2 h-4 w-4" />
                                            Back
                                        </Button>
                                        <Button type="submit" disabled={loading} size="lg">
                                            {loading ? 'Saving...' : 'Continue'}
                                            <ChevronRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </div>
                                </ProfessionalForm>
                            )}
                        </div>
                    )}

                    {/* Step 3: Avatar Upload */}
                    {currentStep === 3 && (
                        <AvatarUpload
                            userId={userId}
                            onUploadComplete={handleAvatarUploadComplete}
                            onSkip={handleSkipAvatar}
                        />
                    )}
                </div>

                {/* Footer */}
                <div className="mt-6 text-center text-sm text-muted-foreground">
                    <p>
                        Need help? Contact us at{' '}
                        <a href="mailto:support@board.africa" className="text-primary hover:underline">
                            support@board.africa
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
