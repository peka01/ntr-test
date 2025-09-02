-- Fix the user_roles 406 error
-- Run this in Supabase SQL Editor

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

-- Create a more permissive policy that allows users to read their own roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
    FOR SELECT USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Also ensure the role management policy is working
DROP POLICY IF EXISTS "Allow role management" ON public.user_roles;

CREATE POLICY "Allow role management" ON public.user_roles
    FOR ALL USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );
