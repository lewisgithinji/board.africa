import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { CoursePlayer } from '@/components/lms/CoursePlayer';

export default async function LearnPage({ params, searchParams }: { params: { id: string }, searchParams: { lesson?: string } }) {
    const { id: courseId } = await params;
    const { lesson: lessonId } = await searchParams;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/auth/signin');

    // Fetch Course Data
    const { data: course, error } = await supabase
        .from('courses')
        .select(`
            *,
            modules:course_modules(
                *,
                lessons:course_lessons(*)
            )
        `)
        .eq('id', courseId)
        .single();

    if (error || !course) notFound();

    // Fetch User Progress
    const { data: progress } = await supabase
        .from('user_course_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .single();

    // Determine current lesson
    let activeLessonId = lessonId;

    // Default to first lesson if not specified
    if (!activeLessonId) {
        // If we have progress, maybe go to current_lesson_id? 
        // For now, let's just find the very first available lesson.
        if (course.modules?.length > 0 && course.modules[0].lessons?.length > 0) {
            // Sort to be safe
            const firstMod = course.modules.sort((a: any, b: any) => a.order_index - b.order_index)[0];
            const firstLesson = firstMod.lessons.sort((a: any, b: any) => a.order_index - b.order_index)[0];
            activeLessonId = firstLesson.id;
        }
    }

    if (!activeLessonId) {
        return <div>No lessons available in this course yet.</div>;
    }

    return (
        <CoursePlayer
            course={course}
            progress={progress}
            initialLessonId={activeLessonId}
        />
    );
}
