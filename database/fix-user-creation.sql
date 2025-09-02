-- Fix for user creation issue
-- Run this in Supabase SQL Editor to allow user creation

-- Drop the restrictive admin-only insert policy
DROP POLICY IF EXISTS "Admins can insert users" ON public.users;

-- Create a more permissive policy that allows any authenticated user to create users
-- This is for development purposes - you can restrict this later
CREATE POLICY "Allow authenticated users to create users" ON public.users
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Alternative: If you want to keep it admin-only but need to create the first admin user
-- you can temporarily disable RLS on the users table:
-- ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Then after creating your admin user, re-enable it:
-- ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
