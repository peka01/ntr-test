-- Cleanup script - removes all existing objects to start fresh
-- WARNING: This will delete all data and objects!
-- Only run this if you want to completely reset your database

-- Drop all policies first
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can insert users" ON public.users;
DROP POLICY IF EXISTS "Admins can update users" ON public.users;

DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can manage roles" ON public.user_roles;

DROP POLICY IF EXISTS "Anyone can view trainings" ON public.trainings;
DROP POLICY IF EXISTS "Only admins can manage trainings" ON public.trainings;

DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can manage their own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Admins can manage all subscriptions" ON public.subscriptions;

DROP POLICY IF EXISTS "Users can view their own attendance" ON public.attendance;
DROP POLICY IF EXISTS "Admins can view all attendance" ON public.attendance;
DROP POLICY IF EXISTS "Users can manage their own attendance" ON public.attendance;
DROP POLICY IF EXISTS "Admins can manage all attendance" ON public.attendance;

-- Drop triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS update_trainings_updated_at ON public.trainings;

-- Drop function
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop tables (in reverse order due to foreign key constraints)
DROP TABLE IF EXISTS public.attendance CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.trainings CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Drop indexes (they'll be dropped with tables, but just in case)
DROP INDEX IF EXISTS idx_users_email;
DROP INDEX IF EXISTS idx_user_roles_user_id;
DROP INDEX IF EXISTS idx_subscriptions_user_id;
DROP INDEX IF EXISTS idx_subscriptions_training_id;
DROP INDEX IF EXISTS idx_attendance_user_id;
DROP INDEX IF EXISTS idx_attendance_training_id;

-- Note: Don't drop the uuid-ossp extension as it might be used by other parts of Supabase
