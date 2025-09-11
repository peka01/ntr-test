-- Complete Language Support for Tours and Tour Steps
-- This script adds full language support to both tours and tour steps

-- Add language column to help_tours table
ALTER TABLE help_tours ADD COLUMN IF NOT EXISTS language VARCHAR(10) NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'sv'));

-- Add language column to help_tour_steps table (if not already added)
ALTER TABLE help_tour_steps ADD COLUMN IF NOT EXISTS language VARCHAR(10) NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'sv'));

-- Delete existing tours and steps to recreate with language support
DELETE FROM help_tour_steps WHERE tour_id IN ('welcome-tour', 'admin-tour', 'user-tour', 'help-tour');
DELETE FROM help_tours WHERE id IN ('welcome-tour', 'admin-tour', 'user-tour', 'help-tour');

-- Insert English tours
INSERT INTO help_tours (id, name, description, category, required_role, target_group, estimated_duration, created_by, language) VALUES
('welcome-tour', 'Welcome Tour', 'Introduction to the system and main features', 'onboarding', 'any', 'public', 5, 'system', 'en'),
('admin-tour', 'Admin Features Tour', 'Learn about administrative functions and user management', 'admin', 'admin', 'admin', 8, 'system', 'en'),
('user-tour', 'User Features Tour', 'Learn about user features and how to use the system', 'user', 'user', 'authenticated', 6, 'system', 'en'),
('help-tour', 'Help System Tour', 'Learn how to use the help system and AI assistant', 'feature', 'any', 'authenticated', 6, 'system', 'en');

-- Insert Swedish tours
INSERT INTO help_tours (id, name, description, category, required_role, target_group, estimated_duration, created_by, language) VALUES
('welcome-tour', 'Välkomstrundtur', 'Introduktion till systemet och huvudfunktioner', 'onboarding', 'any', 'public', 5, 'system', 'sv'),
('admin-tour', 'Adminfunktioner Rundtur', 'Lär dig om administrativa funktioner och användarhantering', 'admin', 'admin', 'admin', 8, 'system', 'sv'),
('user-tour', 'Användarfunktioner Rundtur', 'Lär dig om användarfunktioner och hur du använder systemet', 'user', 'user', 'authenticated', 6, 'system', 'sv'),
('help-tour', 'Hjälpsystem Rundtur', 'Lär dig hur du använder hjälpsystemet och AI-assistenten', 'feature', 'any', 'authenticated', 6, 'system', 'sv');

-- Insert English tour steps
INSERT INTO help_tour_steps (tour_id, step_order, target, title, content, position, action, action_target, action_data, wait_time, required_view, skip_if_not_found, language) VALUES
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
('help-tour', 7, 'help-context-info', 'Context-Aware Help', 'The help system knows what you are doing and provides relevant information based on your current screen and actions.', 'bottom', NULL, NULL, NULL, NULL, NULL, true, 'en');

-- Insert Swedish tour steps
INSERT INTO help_tour_steps (tour_id, step_order, target, title, content, position, action, action_target, action_data, wait_time, required_view, skip_if_not_found, language) VALUES
-- Welcome Tour (Swedish)
('welcome-tour', 1, 'nav-trainings', 'Välkommen!', 'Detta är utbildningssektionen där du kan visa och hantera utbildningskurser.', 'bottom', NULL, NULL, NULL, NULL, NULL, false, 'sv'),
('welcome-tour', 2, 'nav-users', 'Användarhantering', 'Här kan du hantera användare och deras kupongbalanser.', 'bottom', NULL, NULL, NULL, NULL, NULL, false, 'sv'),
('welcome-tour', 3, 'nav-attendance', 'Närvarospårning', 'Spåra närvaro för utbildningssessioner.', 'bottom', NULL, NULL, NULL, NULL, NULL, false, 'sv'),

-- Admin Tour (Swedish)
('admin-tour', 1, 'nav-users', 'Användarhantering', 'Som admin kan du skapa, redigera och hantera användarkonton här.', 'bottom', NULL, NULL, NULL, NULL, NULL, false, 'sv'),
('admin-tour', 2, 'nav-trainings', 'Utbildningshantering', 'Skapa och hantera utbildningskurser, scheman och registreringar.', 'bottom', NULL, NULL, NULL, NULL, NULL, false, 'sv'),
('admin-tour', 3, 'nav-attendance', 'Närvarosystem', 'Spåra och hantera närvaro för alla utbildningssessioner.', 'bottom', NULL, NULL, NULL, NULL, NULL, false, 'sv'),

-- User Tour (Swedish)
('user-tour', 1, 'nav-trainings', 'Bläddra Utbildningar', 'Visa tillgängliga utbildningskurser och registrera dig för sessioner.', 'bottom', NULL, NULL, NULL, NULL, NULL, false, 'sv'),
('user-tour', 2, 'nav-attendance', 'Min Närvaro', 'Kontrollera din närvarohistorik och kommande sessioner.', 'bottom', NULL, NULL, NULL, NULL, NULL, false, 'sv'),

-- Help Tour (Swedish)
('help-tour', 1, 'help-button', 'Hjälpknapp', 'Klicka på denna hjälpknapp för att öppna hjälpsystemet och komma åt dokumentation, AI-assistent och guidade rundturer.', 'bottom', NULL, NULL, NULL, NULL, NULL, false, 'sv'),
('help-tour', 2, 'help-window', 'Välkommen till Hjälp', 'Detta är hjälpsystemet! Här kan du hitta dokumentation, ställa frågor och få hjälp med alla funktioner.', 'center', NULL, NULL, NULL, NULL, NULL, true, 'sv'),
('help-tour', 3, 'help-toc', 'Innehållsförteckning', 'Bläddra genom organiserade hjälpämnen med hjälp av innehållsförteckningen. Klicka på valfri sektion för att läsa detaljerad information.', 'right', NULL, NULL, NULL, NULL, NULL, true, 'sv'),
('help-tour', 4, 'help-search', 'Sök Dokumentation', 'Använd sökfältet för att snabbt hitta specifika ämnen i hjälpdokumentationen.', 'bottom', NULL, NULL, NULL, NULL, NULL, true, 'sv'),
('help-tour', 5, 'help-ai-input', 'AI-assistent', 'Ställ AI-assistenten vilken fråga som helst! Den förstår systemet och kan hjälpa dig med uppgifter, navigering och problemlösning.', 'top', NULL, NULL, NULL, NULL, NULL, true, 'sv'),
('help-tour', 6, 'help-ai-response', 'AI-åtgärder', 'AI:n kan utföra åtgärder åt dig! Leta efter blå åtgärdsknappar som visas i AI-svar för att navigera eller utföra uppgifter automatiskt.', 'top', NULL, NULL, NULL, NULL, NULL, true, 'sv'),
('help-tour', 7, 'help-context-info', 'Kontextmedveten Hjälp', 'Hjälpsystemet vet vad du gör och ger relevant information baserat på din nuvarande skärm och åtgärder.', 'bottom', NULL, NULL, NULL, NULL, NULL, true, 'sv');
