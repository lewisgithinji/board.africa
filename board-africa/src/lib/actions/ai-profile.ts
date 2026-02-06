'use server';

import { AIService } from '@/lib/ai/openai';
import { createClient } from '@/lib/supabase/server';

export async function optimizeProfile() {
    try {
        const supabase = await createClient();

        // 1. Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Unauthorized');

        // 2. Fetch current profile data to use as context
        const [{ data: profile }, { data: experiences }, { data: skills }, { data: certifications }] = await Promise.all([
            supabase.from('professional_profiles').select('*').eq('profile_id', user.id).single(),
            supabase.from('experiences').select('*').eq('profile_id', user.id),
            supabase.from('skills').select('*').eq('profile_id', user.id),
            supabase.from('certifications').select('*').eq('profile_id', user.id)
        ]);

        // 3. Call AI Service
        const optimized = await AIService.optimizeProfessionalProfile({
            experiences: experiences || [],
            skills: skills || [],
            certifications: certifications || [],
            currentHeadline: profile?.headline,
            currentSummary: profile?.summary
        });

        if (!optimized) throw new Error('Optimization failed');

        return optimized;
    } catch (error: any) {
        console.error('[Optimize Profile Error]:', error);
        throw new Error(error.message || 'Failed to optimize profile');
    }
}
