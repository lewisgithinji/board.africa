export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';
export type LessonContentType = 'video' | 'text' | 'quiz' | 'pdf';

export interface Course {
    id: string;
    title: string;
    description: string | null;
    thumbnail_url: string | null;
    instructor_name: string | null;
    duration_minutes: number | null;
    level: CourseLevel | null;
    is_published: boolean;
    created_at: string;
    updated_at: string;

    // Virtual fields (from joins)
    modules?: CourseModule[];
    progress?: number; // Calculated percentage
}

export interface CourseModule {
    id: string;
    course_id: string;
    title: string;
    order_index: number;
    lessons?: CourseLesson[];
}

export interface CourseLesson {
    id: string;
    module_id: string;
    title: string;
    content_type: LessonContentType;
    video_url?: string | null;
    content_markdown?: string | null;
    document_url?: string | null;
    duration_minutes: number | null;
    order_index: number;
    is_preview: boolean;
    is_completed?: boolean; // For UI state
}

export interface UserCourseProgress {
    id: string;
    user_id: string;
    course_id: string;
    status: 'in_progress' | 'completed';
    completed_lessons: string[];
    current_lesson_id: string | null;
    last_accessed_at: string;
    completed_at: string | null;
    certificate_url: string | null;
}
