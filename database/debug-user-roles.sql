-- Debug script for user_roles table
-- Run this in Supabase SQL Editor to see what's happening

-- 1. Check if the table exists and its structure
SELECT 
    table_name,
    table_schema,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'user_roles';

-- 2. Check if RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'user_roles';

-- 3. Check all existing policies on user_roles
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
WHERE schemaname = 'public' AND tablename = 'user_roles'
ORDER BY policyname;

-- 4. Check if there are any data in the table
SELECT COUNT(*) as total_rows FROM public.user_roles;

-- 5. Check if the specific user exists in auth.users
SELECT 
    id,
    email,
    created_at
FROM auth.users 
WHERE id = '039b542f-570a-48a2-bc22-ec09f8990ace';

-- 6. Check if the user exists in public.users
SELECT 
    id,
    name,
    email,
    voucher_balance
FROM public.users 
WHERE id = '039b542f-570a-48a2-bc22-ec09f8990ace';

-- 7. Check if the user has any roles
SELECT 
    id,
    user_id,
    role,
    created_at
FROM public.user_roles 
WHERE user_id = '039b542f-570a-48a2-bc22-ec09f8990ace';

-- 8. Test a simple query to see if RLS is blocking it
-- This should work if RLS is working properly
SELECT * FROM public.user_roles LIMIT 5;

-- 9. Check for any triggers or functions that might interfere
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'user_roles' AND event_object_schema = 'public';
