-- Migration: Create LMS tables (Courses, Modules, Lessons, Progress)
-- Created: 2026-01-30

-- 1. Courses Table
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    instructor_name TEXT,
    duration_minutes INTEGER, -- Total estimated duration
    level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced')),
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Modules (Sections within a course)
CREATE TABLE IF NOT EXISTS public.course_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Lessons (Individual content items)
CREATE TABLE IF NOT EXISTS public.course_lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID REFERENCES public.course_modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content_type TEXT CHECK (content_type IN ('video', 'text', 'quiz', 'pdf')),
    video_url TEXT, -- For video lessons
    content_markdown TEXT, -- For text lessons
    document_url TEXT, -- For PDF resources
    duration_minutes INTEGER,
    order_index INTEGER NOT NULL,
    is_preview BOOLEAN DEFAULT false, -- Allow previewing before purchase/signup
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. User Enrollment & Progress
CREATE TABLE IF NOT EXISTS public.user_course_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('in_progress', 'completed')) DEFAULT 'in_progress',
    completed_lessons UUID[] DEFAULT '{}', -- Array of completed lesson IDs
    current_lesson_id UUID REFERENCES public.course_lessons(id),
    last_accessed_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ,
    certificate_url TEXT,
    UNIQUE(user_id, course_id)
);

-- RLS Policies

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_course_progress ENABLE ROW LEVEL SECURITY;

-- Everyone can view published courses
CREATE POLICY "Public published courses" ON public.courses FOR SELECT USING (is_published = true);

-- Authenticated users can view modules/lessons of published courses
-- (In a real paid app, we would join with Enrollment table, but for now open availability for subscribed orgs)
CREATE POLICY "View modules" ON public.course_modules FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND is_published = true)
);

CREATE POLICY "View lessons" ON public.course_lessons FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.course_modules m 
        JOIN public.courses c ON m.course_id = c.id 
        WHERE m.id = module_id AND c.is_published = true
    )
);

-- Users can manage their own progress
CREATE POLICY "Manage own progress" ON public.user_course_progress
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_modules_course ON public.course_modules(course_id);
CREATE INDEX idx_lessons_module ON public.course_lessons(module_id);
CREATE INDEX idx_progress_user ON public.user_course_progress(user_id);
