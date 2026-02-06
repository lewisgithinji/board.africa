// Utility functions for onboarding flow

export const INDUSTRIES = [
    'Technology',
    'Finance & Banking',
    'Healthcare',
    'Manufacturing',
    'Retail & E-commerce',
    'Education',
    'Real Estate',
    'Energy & Utilities',
    'Telecommunications',
    'Transportation & Logistics',
    'Agriculture',
    'Mining & Natural Resources',
    'Hospitality & Tourism',
    'Media & Entertainment',
    'Professional Services',
    'Non-Profit',
    'Government',
    'Other',
] as const;

export const AFRICAN_COUNTRIES = [
    'Algeria',
    'Angola',
    'Benin',
    'Botswana',
    'Burkina Faso',
    'Burundi',
    'Cameroon',
    'Cape Verde',
    'Central African Republic',
    'Chad',
    'Comoros',
    'Congo',
    'Democratic Republic of the Congo',
    'Djibouti',
    'Egypt',
    'Equatorial Guinea',
    'Eritrea',
    'Eswatini',
    'Ethiopia',
    'Gabon',
    'Gambia',
    'Ghana',
    'Guinea',
    'Guinea-Bissau',
    'Ivory Coast',
    'Kenya',
    'Lesotho',
    'Liberia',
    'Libya',
    'Madagascar',
    'Malawi',
    'Mali',
    'Mauritania',
    'Mauritius',
    'Morocco',
    'Mozambique',
    'Namibia',
    'Niger',
    'Nigeria',
    'Rwanda',
    'Sao Tome and Principe',
    'Senegal',
    'Seychelles',
    'Sierra Leone',
    'Somalia',
    'South Africa',
    'South Sudan',
    'Sudan',
    'Tanzania',
    'Togo',
    'Tunisia',
    'Uganda',
    'Zambia',
    'Zimbabwe',
] as const;

export const COMPANY_SIZES = [
    { value: '1-10', label: '1-10 employees' },
    { value: '11-50', label: '11-50 employees' },
    { value: '51-200', label: '51-200 employees' },
    { value: '201-500', label: '201-500 employees' },
    { value: '501-1000', label: '501-1000 employees' },
    { value: '1000+', label: '1000+ employees' },
] as const;

/**
 * Check if user has completed onboarding
 */
export function hasCompletedOnboarding(profile: { onboarding_completed?: boolean | null }): boolean {
    return profile.onboarding_completed === true;
}

/**
 * Get the appropriate dashboard path based on user role
 */
export function getDashboardPath(role: string | null): string {
    switch (role) {
        case 'organization':
            return '/dashboard/organization';
        case 'professional':
            return '/dashboard/professional';
        case 'admin':
            return '/dashboard/admin';
        default:
            return '/dashboard';
    }
}

/**
 * Format profile data for database update
 */
export function formatProfileData(data: any) {
    return {
        ...data,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
    };
}

/**
 * Get onboarding step titles
 */
export function getOnboardingSteps(role: 'organization' | 'professional') {
    if (role === 'organization') {
        return [
            { id: 1, title: 'Select Role', description: 'Choose your account type' },
            { id: 2, title: 'Company Info', description: 'Tell us about your organization' },
            { id: 3, title: 'Profile Photo', description: 'Upload your company logo' },
        ];
    } else {
        return [
            { id: 1, title: 'Select Role', description: 'Choose your account type' },
            { id: 2, title: 'Professional Info', description: 'Tell us about yourself' },
            { id: 3, title: 'Profile Photo', description: 'Upload your photo' },
        ];
    }
}

/**
 * Validate file for avatar upload
 */
export function validateAvatarFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

    if (file.size > maxSize) {
        return { valid: false, error: 'File size must be less than 5MB' };
    }

    if (!allowedTypes.includes(file.type)) {
        return { valid: false, error: 'File must be a JPEG, PNG, or WebP image' };
    }

    return { valid: true };
}

/**
 * Generate a unique filename for avatar upload
 */
export function generateAvatarFilename(userId: string, file: File): string {
    const extension = file.name.split('.').pop();
    const timestamp = Date.now();
    return `avatars/${userId}/${timestamp}.${extension}`;
}
