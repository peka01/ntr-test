-- Update Help Tour Steps Script
-- This script updates the existing help-tour steps to target the correct elements

-- First, delete existing help-tour steps
DELETE FROM help_tour_steps WHERE tour_id = 'help-tour';

-- Insert updated tour steps with correct targets
INSERT INTO help_tour_steps (tour_id, step_order, target, title, content, position, action, action_target, action_data, wait_time, required_view, skip_if_not_found) VALUES
('help-tour', 1, 'help-button', 'Help Button', 'Click this help button to open the help system and access documentation, AI assistant, and guided tours.', 'bottom', NULL, NULL, NULL, NULL, NULL, false),
('help-tour', 2, 'help-window', 'Welcome to Help', 'This is the help system! Here you can find documentation, ask questions, and get assistance with any feature.', 'center', NULL, NULL, NULL, NULL, NULL, true),
('help-tour', 3, 'help-toc', 'Table of Contents', 'Browse through organized help topics using the table of contents. Click on any section to read detailed information.', 'right', NULL, NULL, NULL, NULL, NULL, true),
('help-tour', 4, 'help-search', 'Search Documentation', 'Use the search field to quickly find specific topics in the help documentation.', 'bottom', NULL, NULL, NULL, NULL, NULL, true),
('help-tour', 5, 'help-ai-input', 'AI Assistant', 'Ask the AI assistant any question! It understands the system and can help you with tasks, navigation, and problem-solving.', 'top', NULL, NULL, NULL, NULL, NULL, true),
('help-tour', 6, 'help-ai-response', 'AI Actions', 'The AI can perform actions for you! Look for blue action buttons that appear in AI responses to navigate or perform tasks automatically.', 'top', NULL, NULL, NULL, NULL, NULL, true),
('help-tour', 7, 'help-context-info', 'Context-Aware Help', 'The help system knows what you are doing and provides relevant information based on your current screen and actions.', 'bottom', NULL, NULL, NULL, NULL, NULL, true);
