-- SIMPLEST FIX: Temporarily disable RLS on users table
-- Run this in Supabase SQL Editor

-- Disable RLS completely on the users table
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename = 'users';

-- Now you should be able to create users through the admin interface
-- After you're done creating your admin user, you can re-enable RLS with:
-- ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
