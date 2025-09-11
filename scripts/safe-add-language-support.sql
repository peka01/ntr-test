-- Safe Language Support Addition
-- This script adds language support without deleting existing data

-- Add language column to help_tours table if it doesn't exist
ALTER TABLE help_tours ADD COLUMN IF NOT EXISTS language VARCHAR(10) NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'sv'));

-- Add language column to help_tour_steps table if it doesn't exist
ALTER TABLE help_tour_steps ADD COLUMN IF NOT EXISTS language VARCHAR(10) NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'sv'));

-- Update existing tours to have English language (if they don't have it)
UPDATE help_tours SET language = 'en' WHERE language IS NULL OR language = '';

-- Update existing tour steps to have English language (if they don't have it)
UPDATE help_tour_steps SET language = 'en' WHERE language IS NULL OR language = '';

-- Now add Swedish versions of existing tours
-- First, check if Swedish versions already exist and only add if they don't
INSERT INTO help_tours (id, name, description, category, required_role, target_group, estimated_duration, created_by, language)
SELECT 
    id || '-sv' as id,  -- Create unique IDs for Swedish versions
    CASE 
        WHEN name = 'Welcome Tour' THEN 'Välkomstrundtur'
        WHEN name = 'Admin Features Tour' THEN 'Adminfunktioner Rundtur'
        WHEN name = 'User Features Tour' THEN 'Användarfunktioner Rundtur'
        WHEN name = 'Help System Tour' THEN 'Hjälpsystem Rundtur'
        ELSE name
    END as name,
    CASE 
        WHEN description = 'Introduction to the system and main features' THEN 'Introduktion till systemet och huvudfunktioner'
        WHEN description = 'Learn about administrative functions and user management' THEN 'Lär dig om administrativa funktioner och användarhantering'
        WHEN description = 'Learn about user features and how to use the system' THEN 'Lär dig om användarfunktioner och hur du använder systemet'
        WHEN description = 'Learn how to use the help system and AI assistant' THEN 'Lär dig hur du använder hjälpsystemet och AI-assistenten'
        ELSE description
    END as description,
    category,
    required_role,
    target_group,
    estimated_duration,
    created_by,
    'sv' as language
FROM help_tours 
WHERE language = 'en'
AND NOT EXISTS (
    SELECT 1 FROM help_tours h2 
    WHERE h2.id = help_tours.id || '-sv'
    AND h2.language = 'sv'
);

-- Add Swedish versions of tour steps
INSERT INTO help_tour_steps (tour_id, step_order, target, title, content, position, action, action_target, action_data, wait_time, required_view, skip_if_not_found, language)
SELECT 
    tour_id || '-sv' as tour_id,  -- Use Swedish tour IDs
    step_order,
    target,
    CASE 
        WHEN title = 'Welcome!' THEN 'Välkommen!'
        WHEN title = 'User Management' THEN 'Användarhantering'
        WHEN title = 'Attendance Tracking' THEN 'Närvarospårning'
        WHEN title = 'Help Button' THEN 'Hjälpknapp'
        WHEN title = 'Welcome to Help' THEN 'Välkommen till Hjälp'
        WHEN title = 'Table of Contents' THEN 'Innehållsförteckning'
        WHEN title = 'Search Documentation' THEN 'Sök Dokumentation'
        WHEN title = 'AI Assistant' THEN 'AI-assistent'
        WHEN title = 'AI Actions' THEN 'AI-åtgärder'
        WHEN title = 'Context-Aware Help' THEN 'Kontextmedveten Hjälp'
        ELSE title
    END as title,
    CASE 
        WHEN content LIKE '%This is the Trainings section%' THEN 'Detta är utbildningssektionen där du kan visa och hantera utbildningskurser.'
        WHEN content LIKE '%Here you can manage users%' THEN 'Här kan du hantera användare och deras kupongbalanser.'
        WHEN content LIKE '%Track attendance for training%' THEN 'Spåra närvaro för utbildningssessioner.'
        WHEN content LIKE '%Click this help button%' THEN 'Klicka på denna hjälpknapp för att öppna hjälpsystemet och komma åt dokumentation, AI-assistent och guidade rundturer.'
        WHEN content LIKE '%This is the help system%' THEN 'Detta är hjälpsystemet! Här kan du hitta dokumentation, ställa frågor och få hjälp med alla funktioner.'
        WHEN content LIKE '%Browse through organized help topics%' THEN 'Bläddra genom organiserade hjälpämnen med hjälp av innehållsförteckningen. Klicka på valfri sektion för att läsa detaljerad information.'
        WHEN content LIKE '%Use the search field%' THEN 'Använd sökfältet för att snabbt hitta specifika ämnen i hjälpdokumentationen.'
        WHEN content LIKE '%Ask the AI assistant%' THEN 'Ställ AI-assistenten vilken fråga som helst! Den förstår systemet och kan hjälpa dig med uppgifter, navigering och problemlösning.'
        WHEN content LIKE '%The AI can perform actions%' THEN 'AI:n kan utföra åtgärder åt dig! Leta efter blå åtgärdsknappar som visas i AI-svar för att navigera eller utföra uppgifter automatiskt.'
        WHEN content LIKE '%The help system knows%' THEN 'Hjälpsystemet vet vad du gör och ger relevant information baserat på din nuvarande skärm och åtgärder.'
        ELSE content
    END as content,
    position,
    action,
    action_target,
    action_data,
    wait_time,
    required_view,
    skip_if_not_found,
    'sv' as language
FROM help_tour_steps 
WHERE language = 'en'
AND NOT EXISTS (
    SELECT 1 FROM help_tour_steps h2 
    WHERE h2.tour_id = help_tour_steps.tour_id || '-sv'
    AND h2.step_order = help_tour_steps.step_order
    AND h2.language = 'sv'
);
