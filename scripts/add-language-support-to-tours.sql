-- Add Language Support to Tour Steps
-- This script adds language support to tour steps and creates localized versions

-- Add language column to help_tour_steps table
ALTER TABLE help_tour_steps ADD COLUMN IF NOT EXISTS language VARCHAR(10) NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'sv'));

-- Delete existing help-tour steps
DELETE FROM help_tour_steps WHERE tour_id = 'help-tour';

-- Insert English tour steps
INSERT INTO help_tour_steps (tour_id, step_order, target, title, content, position, action, action_target, action_data, wait_time, required_view, skip_if_not_found, language) VALUES
('help-tour', 1, 'help-button', 'Help Button', 'Click this help button to open the help system and access documentation, AI assistant, and guided tours.', 'bottom', NULL, NULL, NULL, NULL, NULL, false, 'en'),
('help-tour', 2, 'help-window', 'Welcome to Help', 'This is the help system! Here you can find documentation, ask questions, and get assistance with any feature.', 'center', NULL, NULL, NULL, NULL, NULL, true, 'en'),
('help-tour', 3, 'help-toc', 'Table of Contents', 'Browse through organized help topics using the table of contents. Click on any section to read detailed information.', 'right', NULL, NULL, NULL, NULL, NULL, true, 'en'),
('help-tour', 4, 'help-search', 'Search Documentation', 'Use the search field to quickly find specific topics in the help documentation.', 'bottom', NULL, NULL, NULL, NULL, NULL, true, 'en'),
('help-tour', 5, 'help-ai-input', 'AI Assistant', 'Ask the AI assistant any question! It understands the system and can help you with tasks, navigation, and problem-solving.', 'top', NULL, NULL, NULL, NULL, NULL, true, 'en'),
('help-tour', 6, 'help-ai-response', 'AI Actions', 'The AI can perform actions for you! Look for blue action buttons that appear in AI responses to navigate or perform tasks automatically.', 'top', NULL, NULL, NULL, NULL, NULL, true, 'en'),
('help-tour', 7, 'help-context-info', 'Context-Aware Help', 'The help system knows what you are doing and provides relevant information based on your current screen and actions.', 'bottom', NULL, NULL, NULL, NULL, NULL, true, 'en');

-- Insert Swedish tour steps
INSERT INTO help_tour_steps (tour_id, step_order, target, title, content, position, action, action_target, action_data, wait_time, required_view, skip_if_not_found, language) VALUES
('help-tour', 1, 'help-button', 'Hjälpknapp', 'Klicka på denna hjälpknapp för att öppna hjälpsystemet och komma åt dokumentation, AI-assistent och guidade rundturer.', 'bottom', NULL, NULL, NULL, NULL, NULL, false, 'sv'),
('help-tour', 2, 'help-window', 'Välkommen till Hjälp', 'Detta är hjälpsystemet! Här kan du hitta dokumentation, ställa frågor och få hjälp med alla funktioner.', 'center', NULL, NULL, NULL, NULL, NULL, true, 'sv'),
('help-tour', 3, 'help-toc', 'Innehållsförteckning', 'Bläddra genom organiserade hjälpämnen med hjälp av innehållsförteckningen. Klicka på valfri sektion för att läsa detaljerad information.', 'right', NULL, NULL, NULL, NULL, NULL, true, 'sv'),
('help-tour', 4, 'help-search', 'Sök Dokumentation', 'Använd sökfältet för att snabbt hitta specifika ämnen i hjälpdokumentationen.', 'bottom', NULL, NULL, NULL, NULL, NULL, true, 'sv'),
('help-tour', 5, 'help-ai-input', 'AI-assistent', 'Ställ AI-assistenten vilken fråga som helst! Den förstår systemet och kan hjälpa dig med uppgifter, navigering och problemlösning.', 'top', NULL, NULL, NULL, NULL, NULL, true, 'sv'),
('help-tour', 6, 'help-ai-response', 'AI-åtgärder', 'AI:n kan utföra åtgärder åt dig! Leta efter blå åtgärdsknappar som visas i AI-svar för att navigera eller utföra uppgifter automatiskt.', 'top', NULL, NULL, NULL, NULL, NULL, true, 'sv'),
('help-tour', 7, 'help-context-info', 'Kontextmedveten Hjälp', 'Hjälpsystemet vet vad du gör och ger relevant information baserat på din nuvarande skärm och åtgärder.', 'bottom', NULL, NULL, NULL, NULL, NULL, true, 'sv');
