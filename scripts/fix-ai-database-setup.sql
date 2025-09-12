-- Fix AI Database Setup
-- This script ensures all required tables exist and are properly configured

-- First, let's check if the tables exist and create them if they don't
-- AI Prompts Table
CREATE TABLE IF NOT EXISTS ai_prompts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL CHECK (category IN ('system', 'context', 'action', 'custom')),
    content TEXT NOT NULL,
    variables TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(255) NOT NULL
);

-- AI Knowledge Sources Table
CREATE TABLE IF NOT EXISTS ai_knowledge_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT NOT NULL,
    keywords TEXT[] DEFAULT '{}',
    category VARCHAR(100) NOT NULL,
    priority INTEGER DEFAULT 0,
    language VARCHAR(10) NOT NULL CHECK (language IN ('sv', 'en', 'both')),
    is_active BOOLEAN DEFAULT true,
    last_trained TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(255) NOT NULL
);

-- AI Configuration Table
CREATE TABLE IF NOT EXISTS ai_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model VARCHAR(100) NOT NULL DEFAULT 'gemini-2.0-flash-exp',
    temperature DECIMAL(3,2) DEFAULT 0.7,
    max_tokens INTEGER DEFAULT 1000,
    system_prompt_id UUID REFERENCES ai_prompts(id),
    context_prompt_id UUID REFERENCES ai_prompts(id),
    action_prompt_id UUID REFERENCES ai_prompts(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ai_prompts_category ON ai_prompts(category);
CREATE INDEX IF NOT EXISTS idx_ai_prompts_active ON ai_prompts(is_active);
CREATE INDEX IF NOT EXISTS idx_ai_prompts_priority ON ai_prompts(priority);

CREATE INDEX IF NOT EXISTS idx_ai_knowledge_sources_category ON ai_knowledge_sources(category);
CREATE INDEX IF NOT EXISTS idx_ai_knowledge_sources_language ON ai_knowledge_sources(language);
CREATE INDEX IF NOT EXISTS idx_ai_knowledge_sources_active ON ai_knowledge_sources(is_active);
CREATE INDEX IF NOT EXISTS idx_ai_knowledge_sources_priority ON ai_knowledge_sources(priority);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_ai_prompts_updated_at ON ai_prompts;
CREATE TRIGGER update_ai_prompts_updated_at BEFORE UPDATE ON ai_prompts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ai_knowledge_sources_updated_at ON ai_knowledge_sources;
CREATE TRIGGER update_ai_knowledge_sources_updated_at BEFORE UPDATE ON ai_knowledge_sources FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ai_config_updated_at ON ai_config;
CREATE TRIGGER update_ai_config_updated_at BEFORE UPDATE ON ai_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Clear any existing data to start fresh
DELETE FROM ai_config;
DELETE FROM ai_knowledge_sources;
DELETE FROM ai_prompts;

-- Insert default AI prompts
INSERT INTO ai_prompts (name, description, category, content, variables, priority, created_by) VALUES
(
    'System Prompt - Main',
    'Main system prompt for AI assistant behavior',
    'system',
    'Du är en hjälpsam AI-assistent för ett träningshanteringssystem. Använd följande information för att svara på användarens frågor:

{{context}}

VIKTIGA INSTRUKTIONER:
- Svara på svenska om användaren skriver på svenska, annars på engelska
- Var hjälpsam, vänlig och professionell
- ANVÄND ALLTID KONTEXTINFORMATIONEN för att förstå vad användaren menar
- BÖRJA ALLTID med att förklara din tolkning av kontexten innan du ger svaret
- Ge praktiska exempel när det är lämpligt
- Citera relevanta delar av dokumentationen när det hjälper
- Om du verkligen inte vet svaret, säg det tydligt',
    '{"context"}',
    1,
    'system'
),
(
    'Context Awareness Prompt',
    'Prompt for context-aware responses',
    'context',
    'KONTEXTBASERADE SVAR:
- Om användaren är på "Användarhantering" och frågar "hur skapar jag" → börja med "Eftersom du är på användarhanteringssidan antar jag att du vill veta hur man skapar en användare. Låt mig hjälpa dig:"
- Om användaren är på "Träningshantering" och frågar "hur skapar jag" → börja med "Eftersom du är på träningshanteringssidan antar jag att du vill veta hur man skapar ett träningspass. Låt mig hjälpa dig:"
- Om användaren är på "Incheckning" och frågar "hur skapar jag" → börja med "Eftersom du är på incheckningssidan antar jag att du vill veta hur man skapar en incheckning. Låt mig hjälpa dig:"
- Om användaren är på "Anmälan" och frågar "hur skapar jag" → börja med "Eftersom du är på anmälningssidan antar jag att du vill veta hur man skapar en anmälan. Låt mig hjälpa dig:"

FÖR ENGELSKA FRÅGOR:
- Om användaren är på "User Management" och frågar "how to create" → börja med "Since you''re on the User Management page, I assume you want to know how to create a user. Let me help you:"
- Om användaren är på "Training Management" och frågar "how to create" → börja med "Since you''re on the Training Management page, I assume you want to know how to create a training session. Let me help you:"
- Om användaren är på "Attendance" och frågar "how to create" → börja med "Since you''re on the Attendance page, I assume you want to know how to create an attendance record. Let me help you:"
- Om användaren är på "Public Subscription Page" och frågar "how to create" → börja med "Since you''re on the Subscription page, I assume you want to know how to create a subscription. Let me help you:"
- Fråga INTE om förtydligande om kontexten redan ger tydlig information om vad användaren vill göra',
    '{}',
    2,
    'system'
),
(
    'Action Prompt',
    'Prompt for AI actions and follow-up questions',
    'action',
    'VIKTIGT - Interaktiva åtgärder (AI actions):
- Efter ditt svar, om det är relevant, lägg till en eller flera åtgärdshints på separata rader i formatet [action:NAMN nyckel=värde ...]
- Stödda åtgärder:
  - navigate view=public|admin|attendance|users|trainings|tour-management|shoutout-management
  - open_help id=overview|vouchers|user-management|training-management|subscriptions|attendance|troubleshooting
  - start_tour tourId="tour-id" (starta en guidad rundtur)
  - add_user (öppna formuläret för att lägga till användare)
  - add_training (öppna formuläret för att lägga till träning)
  - create_tour (öppna formuläret för att skapa rundtur)
  - create_shoutout (öppna formuläret för att skapa shoutout)
- När du förklarar hur man skapar något, lägg alltid till en följdfråga som "Vill du att jag gör det åt dig?" (svenska) eller "Do you want me to do this for you?" (engelska)
- Exempel: [action:add_user] eller [action:add_training]

Viktigt: Skriv alltid din naturliga text först. Lägg därefter (om relevant) till åtgärdshints på egna rader.',
    '{}',
    3,
    'system'
);

-- Insert default knowledge sources
INSERT INTO ai_knowledge_sources (name, description, content, keywords, category, priority, language, created_by) VALUES
(
    'System Overview',
    'Basic system functionality overview',
    'Träningshanteringssystemet är ett komplett system för att hantera träningssessioner, användare och klippkort.

Huvudfunktioner:
- Användarhantering med admin- och vanliga användare
- Träningssessioner som användare kan prenumerera på
- Klippkortssystem för att hantera krediter
- Incheckningshantering för träningssessioner
- Rundtursystem för användarutbildning
- Shoutout-system för nyheter och meddelanden',
    '{"system", "overview", "funktioner", "användare", "träning", "klippkort"}',
    'system',
    1,
    'both',
    'system'
),
(
    'User Management',
    'User management functionality',
    'Användarhantering:

Admin-användare kan:
- Skapa nya användare
- Redigera användarinformation
- Hantera klippkort
- Se alla användare

Vanliga användare kan:
- Se sin egen information
- Hantera sina klippkort
- Prenumerera på träningssessioner

För att skapa en användare:
1. Klicka på "Lägg till användare"
2. Fyll i namn och e-post
3. Klicka "Skapa användare"',
    '{"användare", "admin", "skapa", "redigera", "klippkort", "prenumeration"}',
    'user-management',
    2,
    'both',
    'system'
),
(
    'Training Management',
    'Training session management',
    'Träningshantering:

Admin-användare kan:
- Skapa nya träningssessioner
- Redigera befintliga sessioner
- Ta bort sessioner
- Se alla sessioner

För att skapa en träningssession:
1. Klicka på "Lägg till träning"
2. Fyll i titel, beskrivning, datum och tid
3. Klicka "Skapa träning"',
    '{"träning", "session", "skapa", "redigera", "datum", "tid"}',
    'training-management',
    3,
    'both',
    'system'
);

-- Insert default AI configuration
INSERT INTO ai_config (model, temperature, max_tokens, system_prompt_id, context_prompt_id, action_prompt_id) 
SELECT 
    'gemini-2.0-flash-exp',
    0.7,
    1000,
    (SELECT id FROM ai_prompts WHERE name = 'System Prompt - Main' LIMIT 1),
    (SELECT id FROM ai_prompts WHERE name = 'Context Awareness Prompt' LIMIT 1),
    (SELECT id FROM ai_prompts WHERE name = 'Action Prompt' LIMIT 1);

-- Display setup summary
SELECT 
    'AI Database Setup Complete' as status,
    (SELECT COUNT(*) FROM ai_prompts) as prompts_created,
    (SELECT COUNT(*) FROM ai_knowledge_sources) as knowledge_sources_created,
    (SELECT COUNT(*) FROM ai_config) as config_created;
