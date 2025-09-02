-- Diagnostic script to check database setup and identify issues
-- Run this in Supabase SQL Editor to see what's working and what's not

-- 1. Check if tables exist
SELECT 
    table_name,
    table_schema,
    CASE 
        WHEN table_name IS NOT NULL THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('users', 'user_roles', 'trainings', 'subscriptions', 'attendance')
ORDER BY table_name;

-- 2. Check if RLS is enabled on tables
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    CASE 
        WHEN rowsecurity THEN '✅ ENABLED'
        ELSE '❌ DISABLED'
    END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('users', 'user_roles', 'trainings', 'subscriptions', 'attendance')
ORDER BY tablename;

-- 3. Check if policies exist
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
    AND tablename IN ('users', 'user_roles', 'trainings', 'subscriptions', 'attendance')
ORDER BY tablename, policyname;

-- 4. Check if triggers exist
SELECT 
    trigger_name,
    event_object_table,
    action_statement,
    CASE 
        WHEN trigger_name IS NOT NULL THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
    AND event_object_table IN ('users', 'trainings')
ORDER BY event_object_table, trigger_name;

-- 5. Check if function exists
SELECT 
    routine_name,
    routine_type,
    CASE 
        WHEN routine_name IS NOT NULL THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM information_schema.routines 
WHERE routine_schema = 'public' 
    AND routine_name = 'update_updated_at_column';

-- 6. Check if indexes exist
SELECT 
    indexname,
    tablename,
    CASE 
        WHEN indexname IS NOT NULL THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM pg_indexes 
WHERE schemaname = 'public' 
    AND tablename IN ('users', 'user_roles', 'trainings', 'subscriptions', 'attendance')
ORDER BY tablename, indexname;

-- 7. Check current user and permissions
SELECT 
    current_user as current_user,
    session_user as session_user,
    current_database() as current_database;

-- 8. Check if auth.users table exists (Supabase requirement)
SELECT 
    table_name,
    table_schema,
    CASE 
        WHEN table_name IS NOT NULL THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'auth' 
    AND table_name = 'users';

-- 9. Check sample data in tables (if they exist)
-- Users table
SELECT 'users' as table_name, COUNT(*) as record_count FROM public.users;

-- User roles table  
SELECT 'user_roles' as table_name, COUNT(*) as record_count FROM public.user_roles;

-- Trainings table
SELECT 'trainings' as table_name, COUNT(*) as record_count FROM public.trainings;

-- Subscriptions table
SELECT 'subscriptions' as table_name, COUNT(*) as record_count FROM public.subscriptions;

-- Attendance table
SELECT 'attendance' as table_name, COUNT(*) as record_count FROM public.attendance;
