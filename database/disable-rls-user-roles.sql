-- Nuclear option: Disable RLS on user_roles table
-- Run this in Supabase SQL Editor if nothing else works

-- First, drop all policies
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Allow role management" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Allow role access" ON public.user_roles;
DROP POLICY IF EXISTS "Allow role management" ON public.user_roles;
DROP POLICY IF EXISTS "Allow all operations" ON public.user_roles;

-- Then disable RLS completely
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

-- This will:
-- - Remove all RLS restrictions
-- - Allow any authenticated user to access the table
-- - Fix the 406 errors
-- 
-- WARNING: This removes ALL security from the user_roles table!
-- Only use this temporarily to get the app working.
