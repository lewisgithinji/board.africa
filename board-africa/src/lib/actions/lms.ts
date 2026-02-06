'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateLessonProgress(courseId: string, lessonId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Unauthorized');

    // 1. Get current progress
    const { data: progress } = await supabase
        .from('user_course_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .single();

    if (!progress) {
        // Initialize if not exists
        await supabase.from('user_course_progress').insert({
            user_id: user.id,
            course_id: courseId,
            status: 'in_progress',
            completed_lessons: [lessonId],
            current_lesson_id: lessonId,
            last_accessed_at: new Date().toISOString(),
        });
    } else {
        // Update existing
        const completed = new Set(progress.completed_lessons || []);
        completed.add(lessonId);

        await supabase
            .from('user_course_progress')
            .update({
                completed_lessons: Array.from(completed),
                current_lesson_id: lessonId,
                last_accessed_at: new Date().toISOString(),
            })
            .eq('id', progress.id);
    }

    revalidatePath(`/courses/${courseId}/learn`);
}
