-- Script to set up the first admin user
-- Run this after creating the schema and creating an auth user

-- First, create an auth user manually in Supabase Auth dashboard
-- Then run this script with the auth user's ID

-- Replace 'YOUR_AUTH_USER_ID' with the actual UUID from the auth user you created
-- You can find this in the Supabase Auth dashboard

-- Step 1: Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Anyone can view users (for public pages)" ON public.users;
DROP POLICY IF EXISTS "Only admins can manage users" ON public.users;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;

DROP POLICY IF EXISTS "Anyone can view trainings" ON public.trainings;
DROP POLICY IF EXISTS "Only admins can manage trainings" ON public.trainings;
DROP POLICY IF EXISTS "Allow training management" ON public.trainings;

DROP POLICY IF EXISTS "Anyone can view subscriptions (for public pages)" ON public.subscriptions;
DROP POLICY IF EXISTS "Anyone can manage subscriptions (for public pages)" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can manage their own subscriptions" ON public.subscriptions;

DROP POLICY IF EXISTS "Anyone can view attendance (for public pages)" ON public.attendance;
DROP POLICY IF EXISTS "Only admins can manage attendance" ON public.attendance;
DROP POLICY IF EXISTS "Users can view their own attendance" ON public.attendance;
DROP POLICY IF EXISTS "Users can manage their own attendance" ON public.attendance;

-- Step 2: Insert the admin user record
INSERT INTO public.admin_users (id, name, email, role) 
VALUES (
    '039b542f-570a-48a2-bc22-ec09f8990ace', -- Replace with actual UUID
    'Per Karlsson',         -- Replace with actual name
    'per.karlsson@title.se',  -- Replace with actual email
    'admin'
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    role = EXCLUDED.role;

-- Verify the admin user was created
SELECT * FROM public.admin_users WHERE id = 'YOUR_AUTH_USER_ID';
