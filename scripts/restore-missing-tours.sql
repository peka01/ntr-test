-- Restore Missing Tours
-- This script restores tours if they were accidentally deleted

-- Insert English tours (only if they don't exist)
INSERT INTO help_tours (id, name, description, category, required_role, target_group, estimated_duration, created_by, language)
SELECT * FROM (VALUES
    ('welcome-tour', 'Welcome Tour', 'Introduction to the system and main features', 'onboarding', 'any', 'public', 5, 'system', 'en'),
    ('admin-tour', 'Admin Features Tour', 'Learn about administrative functions and user management', 'admin', 'admin', 'admin', 8, 'system', 'en'),
    ('user-tour', 'User Features Tour', 'Learn about user features and how to use the system', 'user', 'user', 'authenticated', 6, 'system', 'en'),
    ('help-tour', 'Help System Tour', 'Learn how to use the help system and AI assistant', 'feature', 'any', 'authenticated', 6, 'system', 'en')
) AS v(id, name, description, category, required_role, target_group, estimated_duration, created_by, language)
WHERE NOT EXISTS (SELECT 1 FROM help_tours WHERE help_tours.id = v.id AND help_tours.language = v.language);

-- Insert English tour steps (only if they don't exist)
INSERT INTO help_tour_steps (tour_id, step_order, target, title, content, position, action, action_target, action_data, wait_time, required_view, skip_if_not_found, language)
SELECT * FROM (VALUES
    -- Welcome Tour (English)
    ('welcome-tour', 1, 'nav-trainings', 'Welcome!', 'This is the Trainings section where you can view and manage training courses.', 'bottom', NULL, NULL, NULL, NULL, NULL, false, 'en'),
    ('welcome-tour', 2, 'nav-users', 'User Management', 'Here you can manage users and their voucher balances.', 'bottom', NULL, NULL, NULL, NULL, NULL, false, 'en'),
    ('welcome-tour', 3, 'nav-attendance', 'Attendance Tracking', 'Track attendance for training sessions.', 'bottom', NULL, NULL, NULL, NULL, NULL, false, 'en'),
    
    -- Admin Tour (English)
    ('admin-tour', 1, 'nav-users', 'User Management', 'As an admin, you can create, edit, and manage user accounts here.', 'bottom', NULL, NULL, NULL, NULL, NULL, false, 'en'),
    ('admin-tour', 2, 'nav-trainings', 'Training Management', 'Create and manage training courses, schedules, and registrations.', 'bottom', NULL, NULL, NULL, NULL, NULL, false, 'en'),
    ('admin-tour', 3, 'nav-attendance', 'Attendance System', 'Track and manage attendance for all training sessions.', 'bottom', NULL, NULL, NULL, NULL, NULL, false, 'en'),
    
    -- User Tour (English)
    ('user-tour', 1, 'nav-trainings', 'Browse Trainings', 'View available training courses and register for sessions.', 'bottom', NULL, NULL, NULL, NULL, NULL, false, 'en'),
    ('user-tour', 2, 'nav-attendance', 'My Attendance', 'Check your attendance history and upcoming sessions.', 'bottom', NULL, NULL, NULL, NULL, NULL, false, 'en'),
    
    -- Help Tour (English)
    ('help-tour', 1, 'help-button', 'Help Button', 'Click this help button to open the help system and access documentation, AI assistant, and guided tours.', 'bottom', NULL, NULL, NULL, NULL, NULL, false, 'en'),
    ('help-tour', 2, 'help-window', 'Welcome to Help', 'This is the help system! Here you can find documentation, ask questions, and get assistance with any feature.', 'center', NULL, NULL, NULL, NULL, NULL, true, 'en'),
    ('help-tour', 3, 'help-toc', 'Table of Contents', 'Browse through organized help topics using the table of contents. Click on any section to read detailed information.', 'right', NULL, NULL, NULL, NULL, NULL, true, 'en'),
    ('help-tour', 4, 'help-search', 'Search Documentation', 'Use the search field to quickly find specific topics in the help documentation.', 'bottom', NULL, NULL, NULL, NULL, NULL, true, 'en'),
    ('help-tour', 5, 'help-ai-input', 'AI Assistant', 'Ask the AI assistant any question! It understands the system and can help you with tasks, navigation, and problem-solving.', 'top', NULL, NULL, NULL, NULL, NULL, true, 'en'),
    ('help-tour', 6, 'help-ai-response', 'AI Actions', 'The AI can perform actions for you! Look for blue action buttons that appear in AI responses to navigate or perform tasks automatically.', 'top', NULL, NULL, NULL, NULL, NULL, true, 'en'),
    ('help-tour', 7, 'help-context-info', 'Context-Aware Help', 'The help system knows what you are doing and provides relevant information based on your current screen and actions.', 'bottom', NULL, NULL, NULL, NULL, NULL, true, 'en')
) AS v(tour_id, step_order, target, title, content, position, action, action_target, action_data, wait_time, required_view, skip_if_not_found, language)
WHERE NOT EXISTS (
    SELECT 1 FROM help_tour_steps 
    WHERE help_tour_steps.tour_id = v.tour_id 
    AND help_tour_steps.step_order = v.step_order 
    AND help_tour_steps.language = v.language
);
