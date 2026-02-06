import { ProfessionalProfile, Experience, Skill, Certification } from '@/lib/types/database.types';

export function calculateBoardReadinessScore(
    profile: Partial<ProfessionalProfile>,
    experiences: Experience[],
    skills: Skill[],
    certifications: Certification[]
): number {
    let score = 0;

    // 1. Basic Profile (20%)
    if (profile.headline) score += 5;
    if (profile.summary && profile.summary.length > 200) score += 15;
    else if (profile.summary) score += 10;

    // 2. Experience (50%)
    const boardExp = experiences.filter(e => e.experience_type === 'board').length;
    const executiveExp = experiences.filter(e => e.experience_type === 'executive').length;

    if (boardExp > 0) score += 30; // 30 points for any board experience
    else if (executiveExp > 2) score += 15; // 15 points for significant executive experience

    if (boardExp > 2) score += 20; // Extra 20 for multiple board roles
    else if (boardExp === 2) score += 10;

    // 3. Skills (15%)
    const skillCount = skills.length;
    if (skillCount >= 10) score += 15;
    else if (skillCount >= 5) score += 10;
    else if (skillCount > 0) score += 5;

    // 4. Certifications (15%)
    const certCount = certifications.length;
    if (certCount >= 2) score += 15;
    else if (certCount === 1) score += 10;

    return Math.min(score, 100);
}
