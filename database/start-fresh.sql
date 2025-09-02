-- Complete database cleanup - START FRESH
-- Run this in Supabase SQL Editor to remove everything and start over

-- Drop all policies first
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can insert users" ON public.users;
DROP POLICY IF EXISTS "Admins can update users" ON public.users;

DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Allow role access" ON public.user_roles;
DROP POLICY IF EXISTS "Allow role management" ON public.user_roles;

DROP POLICY IF EXISTS "Anyone can view trainings" ON public.trainings;
DROP POLICY IF EXISTS "Only admins can manage trainings" ON public.trainings;
DROP POLICY IF EXISTS "Allow training management" ON public.trainings;

DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can manage their own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Admins can manage all subscriptions" ON public.subscriptions;

DROP POLICY IF EXISTS "Users can view their own attendance" ON public.attendance;
DROP POLICY IF EXISTS "Admins can view all attendance" ON public.attendance;
DROP POLICY IF EXISTS "Users can manage their own attendance" ON public.attendance;

-- Drop all triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS update_trainings_updated_at ON public.trainings;

-- Drop all functions
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop all tables (this will also drop indexes and constraints)
DROP TABLE IF EXISTS public.attendance CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.trainings CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Drop extension
DROP EXTENSION IF EXISTS "uuid-ossp";

-- Now you can run the schema-simple.sql file step by step
