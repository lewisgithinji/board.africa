-- Run this in Supabase SQL Editor to check if migrations are applied

-- 1. Check if tables exist
SELECT 
    table_name,
    CASE 
        WHEN table_name IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') 
        THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM (
    VALUES ('organizations'), ('board_members')
) AS t(table_name);

-- 2. If organizations table exists, show its structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'organizations'
ORDER BY ordinal_position;

-- 3. If board_members table exists, show its structure  
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'board_members'
ORDER BY ordinal_position;

-- 4. Check if the slug generation function exists
SELECT 
    routine_name,
    '✅ EXISTS' as status
FROM information_schema.routines
WHERE routine_schema = 'public' 
  AND routine_name = 'generate_org_slug';
