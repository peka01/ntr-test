-- Migration script to transition from old schema to participants-only system
-- Run this after backing up your data

-- Step 1: Backup existing data (run these queries and save the results)
-- SELECT * FROM public.users;
-- SELECT * FROM public.user_roles;
-- SELECT * FROM public.trainings;
-- SELECT * FROM public.subscriptions;
-- SELECT * FROM public.attendance;

-- Step 2: Drop existing tables (WARNING: This will delete all data!)
-- DROP TABLE IF EXISTS public.attendance CASCADE;
-- DROP TABLE IF EXISTS public.subscriptions CASCADE;
-- DROP TABLE IF EXISTS public.user_roles CASCADE;
-- DROP TABLE IF EXISTS public.users CASCADE;
-- DROP TABLE IF EXISTS public.trainings CASCADE;

-- Step 3: Run the new schema (schema-participants-only.sql)

-- Step 4: Re-insert your trainings data
-- INSERT INTO public.trainings (name, description) VALUES
--     ('Your Training Name', 'Your Training Description');

-- Step 5: Create your admin user manually in Supabase Auth dashboard
-- Then run setup-admin-user.sql with the correct UUID

-- Step 6: Re-insert your users as participants (they will get new UUIDs)
-- Note: You'll need to update any references to these users in other systems
-- INSERT INTO public.users (name, email, voucher_balance) VALUES
--     ('User Name', 'user@example.com', 0);

-- Step 7: Re-insert subscriptions and attendance with new user IDs
-- You'll need to map old user IDs to new ones

-- IMPORTANT: This migration will change all user IDs, so any external references
-- to user IDs will need to be updated accordingly.
