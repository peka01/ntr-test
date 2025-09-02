-- Diagnostic script to check database status
-- Run this in Supabase SQL Editor to see what's working and what's not

-- Check if tables exist
SELECT 
    table_name,
    table_schema,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check if RLS is enabled on tables
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public';

-- Check existing policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Check if sample data exists
SELECT 'users' as table_name, COUNT(*) as count FROM public.users
UNION ALL
SELECT 'trainings', COUNT(*) FROM public.trainings
UNION ALL
SELECT 'subscriptions', COUNT(*) FROM public.subscriptions
UNION ALL
SELECT 'attendance', COUNT(*) FROM public.attendance
UNION ALL
SELECT 'user_roles', COUNT(*) FROM public.user_roles;

-- Check for any errors in recent logs (if accessible)
SELECT 
    log_time,
    log_level,
    message
FROM pg_stat_activity 
WHERE state = 'active' 
ORDER BY log_time DESC 
LIMIT 10;
