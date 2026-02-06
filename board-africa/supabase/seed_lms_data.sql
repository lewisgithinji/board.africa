-- Seed Data for LMS (Courses, Modules, Lessons)
-- Directions: Run this in your Supabase SQL Editor to populate the database.

-- Course 1: Corporate Governance Fundamentals
DO $$
DECLARE
    course1_id UUID;
    mod1_id UUID;
    mod2_id UUID;
BEGIN
    INSERT INTO public.courses (title, description, thumbnail_url, instructor_name, duration_minutes, level, is_published)
    VALUES (
        'Corporate Governance Fundamentals',
        'A comprehensive introduction to the principles and practices of effective corporate governance. Learn about board roles, responsibilities, and legal obligations.',
        'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=2071&auto=format&fit=crop',
        'Dr. Amina Abdi',
        120,
        'beginner',
        true
    ) RETURNING id INTO course1_id;

    -- Module 1
    INSERT INTO public.course_modules (course_id, title, order_index)
    VALUES (course1_id, 'Introduction to the Boardroom', 1) RETURNING id INTO mod1_id;

    INSERT INTO public.course_lessons (module_id, title, content_type, duration_minutes, order_index, is_preview)
    VALUES 
        (mod1_id, 'Welcome & Overview', 'video', 5, 1, true),
        (mod1_id, 'The King IV Code Explained', 'video', 15, 2, false),
        (mod1_id, 'Key Board Committees', 'text', 10, 3, false);

    -- Module 2
    INSERT INTO public.course_modules (course_id, title, order_index)
    VALUES (course1_id, 'Legal Duties of Directors', 2) RETURNING id INTO mod2_id;

    INSERT INTO public.course_lessons (module_id, title, content_type, duration_minutes, order_index)
    VALUES 
        (mod2_id, 'Fiduciary Duties', 'video', 20, 1),
        (mod2_id, 'Conflict of Interest vs. Duty', 'quiz', 15, 2);
END $$;

-- Course 2: Financial Literacy for Board Members
DO $$
DECLARE
    course2_id UUID;
    mod_fin_1 UUID;
BEGIN
    INSERT INTO public.courses (title, description, thumbnail_url, instructor_name, duration_minutes, level, is_published)
    VALUES (
        'Financial Literacy for Directors',
        'Master the art of reading financial statements. Understand balance sheets, income statements, and cash flow to make informed board decisions.',
        'https://images.unsplash.com/photo-1554224155-98406852d009?q=80&w=2072&auto=format&fit=crop',
        'John Kamau, CPA',
        180,
        'intermediate',
        true
    ) RETURNING id INTO course2_id;

    -- Module 1
    INSERT INTO public.course_modules (course_id, title, order_index)
    VALUES (course2_id, 'Reading the Numbers', 1) RETURNING id INTO mod_fin_1;

    INSERT INTO public.course_lessons (module_id, title, content_type, duration_minutes, order_index, is_preview)
    VALUES 
        (mod_fin_1, 'The Balance Sheet Equation', 'video', 15, 1, true),
        (mod_fin_1, 'Income Statements Deep Dive', 'video', 25, 2, false),
        (mod_fin_1, 'Cash Flow vs Profit', 'text', 20, 3, false);
END $$;

-- Course 3: ESG Strategy (Advanced)
INSERT INTO public.courses (title, description, thumbnail_url, instructor_name, duration_minutes, level, is_published)
VALUES (
    'ESG Strategy & Implementation',
    'How to integrate Environmental, Social, and Governance factors into your corporate strategy for long-term sustainability.',
    'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=2070&auto=format&fit=crop',
    'Sarah Ochieng',
    240,
    'advanced',
    true
);
