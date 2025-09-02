-- Simplified schema - run this step by step in Supabase SQL Editor
-- Step 1: Create tables (run this first)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    voucher_balance INTEGER DEFAULT 0 CHECK (voucher_balance >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, role)
);

-- Trainings table
CREATE TABLE IF NOT EXISTS public.trainings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    training_id UUID NOT NULL REFERENCES public.trainings(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, training_id)
);

-- Attendance table
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    training_id UUID NOT NULL REFERENCES public.trainings(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, training_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_training_id ON public.subscriptions(training_id);
CREATE INDEX IF NOT EXISTS idx_attendance_user_id ON public.attendance(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_training_id ON public.attendance(training_id);

-- Step 2: Enable RLS (run this after tables are created)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- Step 3: Create basic policies (run this after RLS is enabled)
-- Users table policies
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- User roles policies (simple and working)
CREATE POLICY "Users can view their own roles" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow role management" ON public.user_roles
    FOR ALL USING (true); -- Temporary: allow all operations

-- Trainings policies
CREATE POLICY "Anyone can view trainings" ON public.trainings
    FOR SELECT USING (true);

CREATE POLICY "Allow training management" ON public.trainings
    FOR ALL USING (true); -- Temporary: allow all operations

-- Subscriptions policies
CREATE POLICY "Users can view their own subscriptions" ON public.subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own subscriptions" ON public.subscriptions
    FOR ALL USING (auth.uid() = user_id);

-- Attendance policies
CREATE POLICY "Users can view their own attendance" ON public.attendance
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own attendance" ON public.attendance
    FOR ALL USING (auth.uid() = user_id);

-- Step 4: Insert sample data (run this last)
INSERT INTO public.users (id, name, email, voucher_balance) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'Alice Johnson', 'alice@example.com', 5),
    ('550e8400-e29b-41d4-a716-446655440002', 'Bob Williams', 'bob@example.com', 3)
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.trainings (id, name, description) VALUES
    ('550e8400-e29b-41d4-a716-446655440003', 'React Fundamentals', 'Learn the basics of React.'),
    ('550e8400-e29b-41d4-a716-446655440004', 'Advanced TailwindCSS', 'Master utility-first CSS.')
ON CONFLICT DO NOTHING;

INSERT INTO public.subscriptions (user_id, training_id) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003'),
    ('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003')
ON CONFLICT DO NOTHING;
