-- Help System Database Setup Script
-- Run this script in your Supabase SQL editor to create the Help system tables

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Add target_group column to existing tables if it doesn't exist
ALTER TABLE help_shoutouts ADD COLUMN IF NOT EXISTS target_group VARCHAR(20) NOT NULL DEFAULT 'public' CHECK (target_group IN ('public', 'authenticated', 'admin'));
ALTER TABLE help_tours ADD COLUMN IF NOT EXISTS target_group VARCHAR(20) NOT NULL DEFAULT 'public' CHECK (target_group IN ('public', 'authenticated', 'admin'));

-- Shoutouts table for feature announcements and news
CREATE TABLE IF NOT EXISTS help_shoutouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    image TEXT,
    icon VARCHAR(10),
    tour_id VARCHAR(255),
    category VARCHAR(50) NOT NULL CHECK (category IN ('feature', 'improvement', 'announcement', 'bugfix')),
    priority VARCHAR(20) NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
    language VARCHAR(10) NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'sv')),
    target_group VARCHAR(20) NOT NULL DEFAULT 'public' CHECK (target_group IN ('public', 'authenticated', 'admin')),
    release_date DATE NOT NULL,
    expire_date DATE,
    is_new BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- Tours table for guided tours
CREATE TABLE IF NOT EXISTS help_tours (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL CHECK (category IN ('onboarding', 'feature', 'admin', 'user')),
    required_role VARCHAR(20) NOT NULL CHECK (required_role IN ('admin', 'user', 'any')),
    target_group VARCHAR(20) NOT NULL DEFAULT 'public' CHECK (target_group IN ('public', 'authenticated', 'admin')),
    estimated_duration INTEGER DEFAULT 5,
    is_active BOOLEAN DEFAULT true,
    language VARCHAR(10) NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'sv')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- Tour steps table
CREATE TABLE IF NOT EXISTS help_tour_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tour_id VARCHAR(255) NOT NULL REFERENCES help_tours(id) ON DELETE CASCADE,
    step_order INTEGER NOT NULL,
    target VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    position VARCHAR(20) NOT NULL CHECK (position IN ('top', 'bottom', 'left', 'right', 'center')),
    action VARCHAR(20) CHECK (action IN ('click', 'wait', 'navigate', 'scroll', 'open-help')),
    action_target VARCHAR(255),
    action_data JSONB,
    wait_time INTEGER,
    required_view VARCHAR(255),
    skip_if_not_found BOOLEAN DEFAULT false,
    language VARCHAR(10) NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'sv')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Help content table for documentation
CREATE TABLE IF NOT EXISTS help_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100),
    language VARCHAR(10) NOT NULL DEFAULT 'en',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- User interactions table for tracking help usage
CREATE TABLE IF NOT EXISTS help_user_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255),
    interaction_type VARCHAR(50) NOT NULL, -- 'shoutout_viewed', 'tour_completed', 'help_accessed'
    target_id VARCHAR(255), -- ID of the shoutout, tour, or help content
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_help_shoutouts_category ON help_shoutouts(category);
CREATE INDEX IF NOT EXISTS idx_help_shoutouts_priority ON help_shoutouts(priority);
CREATE INDEX IF NOT EXISTS idx_help_shoutouts_release_date ON help_shoutouts(release_date);
CREATE INDEX IF NOT EXISTS idx_help_shoutouts_expire_date ON help_shoutouts(expire_date);
CREATE INDEX IF NOT EXISTS idx_help_shoutouts_active ON help_shoutouts(is_active);

CREATE INDEX IF NOT EXISTS idx_help_tours_category ON help_tours(category);
CREATE INDEX IF NOT EXISTS idx_help_tours_role ON help_tours(required_role);
CREATE INDEX IF NOT EXISTS idx_help_tours_active ON help_tours(is_active);

CREATE INDEX IF NOT EXISTS idx_help_tour_steps_tour_id ON help_tour_steps(tour_id);
CREATE INDEX IF NOT EXISTS idx_help_tour_steps_order ON help_tour_steps(tour_id, step_order);

CREATE INDEX IF NOT EXISTS idx_help_content_category ON help_content(category);
CREATE INDEX IF NOT EXISTS idx_help_content_language ON help_content(language);
CREATE INDEX IF NOT EXISTS idx_help_content_active ON help_content(is_active);

CREATE INDEX IF NOT EXISTS idx_help_user_interactions_user_id ON help_user_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_help_user_interactions_type ON help_user_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_help_user_interactions_created_at ON help_user_interactions(created_at);

-- For now, disable RLS to allow easy setup
-- You can enable RLS later and set up proper policies based on your auth system
-- ALTER TABLE help_shoutouts ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE help_tours ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE help_tour_steps ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE help_content ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE help_user_interactions ENABLE ROW LEVEL SECURITY;

-- Insert some default data
INSERT INTO help_shoutouts (title, description, icon, category, priority, language, target_group, release_date, expire_date, is_new, created_by) VALUES
-- English shoutouts
('Welcome to the Help System', 'Discover our comprehensive help system with guided tours and feature announcements.', '🎯', 'feature', 'high', 'en', 'public', CURRENT_DATE, CURRENT_DATE + INTERVAL '1 year', true, 'system'),
('Interactive Tours Available', 'Take guided tours to learn about new features and system functionality.', '🎬', 'feature', 'medium', 'en', 'public', CURRENT_DATE, CURRENT_DATE + INTERVAL '1 year', true, 'system'),
('Help Documentation', 'Access detailed help documentation for all system features.', '📚', 'improvement', 'medium', 'en', 'public', CURRENT_DATE, CURRENT_DATE + INTERVAL '1 year', true, 'system'),
('New Help System Tour', 'Learn how to use the help system and AI assistant with our new guided tour!', '🤖', 'feature', 'high', 'en', 'authenticated', CURRENT_DATE, CURRENT_DATE + INTERVAL '1 year', true, 'system'),
-- Swedish shoutouts
('Välkommen till Hjälpsystemet', 'Upptäck vårt omfattande hjälpsystem med guidade rundturer och funktionsmeddelanden.', '🎯', 'feature', 'high', 'sv', 'public', CURRENT_DATE, CURRENT_DATE + INTERVAL '1 year', true, 'system'),
('Interaktiva Rundturer Tillgängliga', 'Ta guidade rundturer för att lära dig om nya funktioner och systemfunktionalitet.', '🎬', 'feature', 'medium', 'sv', 'public', CURRENT_DATE, CURRENT_DATE + INTERVAL '1 year', true, 'system'),
('Hjälpdokumentation', 'Få tillgång till detaljerad hjälpdokumentation för alla systemfunktioner.', '📚', 'improvement', 'medium', 'sv', 'public', CURRENT_DATE, CURRENT_DATE + INTERVAL '1 year', true, 'system'),
('Ny Hjälpsystem Rundtur', 'Lär dig hur du använder hjälpsystemet och AI-assistenten med vår nya guidade rundtur!', '🤖', 'feature', 'high', 'sv', 'authenticated', CURRENT_DATE, CURRENT_DATE + INTERVAL '1 year', true, 'system');

INSERT INTO help_tours (id, name, description, category, required_role, target_group, estimated_duration, created_by) VALUES
('welcome-tour', 'Welcome Tour', 'Introduction to the system and main features', 'onboarding', 'any', 'public', 5, 'system'),
('admin-tour', 'Admin Features Tour', 'Learn about administrative functions and user management', 'admin', 'admin', 'admin', 8, 'system'),
('user-tour', 'User Features Tour', 'Learn about user features and how to use the system', 'user', 'user', 'authenticated', 6, 'system'),
('help-tour', 'Help System Tour', 'Learn how to use the help system and AI assistant', 'feature', 'any', 'authenticated', 6, 'system')
ON CONFLICT (id) DO NOTHING;

-- Add some tour steps for the welcome tour
-- First, delete existing help-tour steps to avoid conflicts
DELETE FROM help_tour_steps WHERE tour_id = 'help-tour';

-- Insert tour steps
INSERT INTO help_tour_steps (tour_id, step_order, target, title, content, position, action, action_target, action_data, wait_time, required_view, skip_if_not_found) VALUES
('welcome-tour', 1, 'nav-trainings', 'Welcome!', 'This is the Trainings section where you can view and manage training courses.', 'bottom', NULL, NULL, NULL, NULL, NULL, false),
('welcome-tour', 2, 'nav-users', 'User Management', 'Here you can manage users and their voucher balances.', 'bottom', NULL, NULL, NULL, NULL, NULL, false),
('welcome-tour', 3, 'nav-attendance', 'Attendance Tracking', 'Track attendance for training sessions.', 'bottom', NULL, NULL, NULL, NULL, NULL, false),
('help-tour', 1, 'help-button', 'Help Button', 'Click this help button to open the help system and access documentation, AI assistant, and guided tours.', 'bottom', NULL, NULL, NULL, NULL, NULL, false),
('help-tour', 2, 'help-window', 'Welcome to Help', 'This is the help system! Here you can find documentation, ask questions, and get assistance with any feature.', 'center', NULL, NULL, NULL, NULL, NULL, true),
('help-tour', 3, 'help-toc', 'Table of Contents', 'Browse through organized help topics using the table of contents. Click on any section to read detailed information.', 'right', NULL, NULL, NULL, NULL, NULL, true),
('help-tour', 4, 'help-search', 'Search Documentation', 'Use the search field to quickly find specific topics in the help documentation.', 'bottom', NULL, NULL, NULL, NULL, NULL, true),
('help-tour', 5, 'help-ai-input', 'AI Assistant', 'Ask the AI assistant any question! It understands the system and can help you with tasks, navigation, and problem-solving.', 'top', NULL, NULL, NULL, NULL, NULL, true),
('help-tour', 6, 'help-ai-response', 'AI Actions', 'The AI can perform actions for you! Look for blue action buttons that appear in AI responses to navigate or perform tasks automatically.', 'top', NULL, NULL, NULL, NULL, NULL, true),
('help-tour', 7, 'help-context-info', 'Context-Aware Help', 'The help system knows what you are doing and provides relevant information based on your current screen and actions.', 'bottom', NULL, NULL, NULL, NULL, NULL, true)
ON CONFLICT (tour_id, step_order) DO UPDATE SET
  target = EXCLUDED.target,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  position = EXCLUDED.position,
  action = EXCLUDED.action,
  action_target = EXCLUDED.action_target,
  action_data = EXCLUDED.action_data,
  wait_time = EXCLUDED.wait_time,
  required_view = EXCLUDED.required_view,
  skip_if_not_found = EXCLUDED.skip_if_not_found;

-- Add some help content
INSERT INTO help_content (title, content, category, language, created_by) VALUES
('Getting Started', 'Welcome to the Training Management System. This guide will help you get started with the basic features.', 'general', 'en', 'system'),
('User Management', 'Learn how to create and manage users, update voucher balances, and track user activity.', 'admin', 'en', 'system'),
('Training Management', 'Create and manage training courses, set schedules, and track registrations.', 'admin', 'en', 'system'),
('Attendance System', 'Mark attendance, track participation, and manage training sessions.', 'admin', 'en', 'system')
ON CONFLICT DO NOTHING;
