-- Migration script to move existing AI resources to database
-- This script migrates all hardcoded AI prompts and knowledge sources to the database

-- First, let's add the existing knowledge sources from aiKnowledgeSources.ts
INSERT INTO ai_knowledge_sources (name, description, content, keywords, category, priority, language, is_active, created_by) VALUES

-- System Architecture
(
    'System Architecture',
    'Technical architecture and technology stack information',
    'The system is built with modern web technologies:
- Frontend: React 18 with TypeScript, using Tailwind CSS for styling
- Backend: Supabase (PostgreSQL database with real-time subscriptions)
- Authentication: Supabase Auth with role-based access control
- State Management: React Context API for global state
- Deployment: Docker containers with nginx reverse proxy',
    '{"architecture", "system", "react", "typescript", "supabase", "postgresql", "docker", "nginx"}',
    'technical',
    10,
    'both',
    true,
    'migration'
),

-- User Roles and Permissions
(
    'User Roles and Permissions',
    'Information about user roles and access permissions',
    'The system has two main user roles:

Admin Users:
- Create and manage user accounts
- Manage voucher credits and balances
- Create, edit, and delete training sessions
- View attendance reports and statistics
- Access admin dashboard

Regular Users:
- Subscribe to training sessions
- Mark attendance for sessions
- View personal training history
- Manage personal voucher balance
- Cancel attendance (with credit refund)',
    '{"roles", "admin", "user", "permissions", "access", "dashboard", "reports"}',
    'system',
    9,
    'both',
    true,
    'migration'
),

-- Training Session Management
(
    'Training Session Management',
    'How training sessions work and are managed',
    'Training sessions are the core of the system:

Session Creation (Admin):
- Set title, description, date, time, and duration
- Define capacity limits and location
- Set voucher cost per session
- Configure cancellation policies

Session Management:
- Users can subscribe to available sessions
- Real-time capacity tracking
- Automatic voucher deduction on attendance
- Credit refunds for cancellations
- Attendance marking and verification',
    '{"training", "sessions", "subscription", "attendance", "capacity", "cancellation", "refund"}',
    'business',
    8,
    'both',
    true,
    'migration'
),

-- Voucher and Credit System
(
    'Voucher and Credit System',
    'How the voucher and credit system works',
    'The voucher system manages user credits:

Credit Management:
- Users start with a voucher balance
- Credits are deducted when attending sessions
- Credits are refunded when cancelling attendance
- Admin can manually adjust balances
- Transaction history is maintained

Business Rules:
- Credits cannot go negative
- Refunds are processed immediately
- Credit transfers between users are possible
- Bulk credit purchases can be configured',
    '{"vouchers", "credits", "balance", "deduction", "refund", "transactions", "purchases"}',
    'business',
    8,
    'both',
    true,
    'migration'
),

-- User Experience Features
(
    'User Experience Features',
    'UI/UX features and design elements',
    'The system provides a modern, intuitive user experience:

Interface Features:
- Responsive design for all device sizes
- Dark/light theme support
- Multi-language support (Swedish/English)
- Real-time updates and notifications
- Drag-and-drop functionality for admins
- Search and filtering capabilities
- Subscriber count display on training cards
- Consistent card heights for uniform layout
- Action buttons positioned at bottom of cards

Training Card Features:
- Shows number of registered subscribers ("X anmälda" / "X registered")
- Uniform card heights across all training cards
- Edit and delete buttons at the bottom of each card
- Clean, organized layout with proper spacing

Attendance System:
- Check-in terminology throughout the application
- "Checka in" / "Check in" buttons instead of "Present"
- Real-time subscriber count updates
- Consistent terminology in Swedish and English',
    '{"ux", "ui", "responsive", "accessibility", "themes", "languages", "mobile", "subscriber count", "card height", "uniform cards", "action buttons", "check in", "checka in"}',
    'user-guide',
    7,
    'both',
    true,
    'migration'
),

-- Data Security and Privacy
(
    'Data Security and Privacy',
    'Security measures and privacy protection',
    'Security is a top priority:

Data Protection:
- All data is encrypted in transit and at rest
- User passwords are securely hashed
- Role-based access control (RBAC)
- Audit logging for all actions
- GDPR compliance measures

Privacy Features:
- Users control their own data
- Automatic data retention policies
- Secure API endpoints
- Regular security audits
- Backup and disaster recovery',
    '{"security", "privacy", "encryption", "gdpr", "audit", "backup", "compliance"}',
    'system',
    9,
    'both',
    true,
    'migration'
),

-- System Integration
(
    'System Integration',
    'External integrations and API access',
    'The system integrates with external services:

External Integrations:
- Payment gateways for credit purchases
- Email services for notifications
- SMS services for reminders
- Calendar integration (Google, Outlook)
- Reporting and analytics tools

API Access:
- RESTful API for external systems
- Webhook support for real-time updates
- OAuth 2.0 for third-party access
- Rate limiting and throttling
- Comprehensive API documentation',
    '{"integration", "api", "webhooks", "oauth", "payments", "email", "sms", "calendar"}',
    'technical',
    6,
    'both',
    true,
    'migration'
),

-- Latest UI Updates and Features
(
    'Latest UI Updates and Features',
    'Recent improvements and new features',
    'Recent improvements to the user interface:

Subscriber Count Display:
- Training cards now show the number of registered subscribers
- Format: "X anmälda" (Swedish) / "X registered" (English)
- Updates in real-time when users subscribe/unsubscribe
- Visible on all training pages (admin, public, attendance)

Consistent Card Heights:
- All training cards now have uniform heights (256px minimum)
- Action buttons are vertically aligned across cards
- Better visual consistency and organization
- Responsive design maintained

Action Button Repositioning:
- Edit and delete buttons moved from header to bottom of cards
- Cleaner card layout with better information hierarchy
- Buttons separated from main content with subtle border
- Improved user experience and visual flow

Check-in Terminology Updates:
- Changed from "Present"/"Närvarande" to "Check in"/"Checka in"
- Consistent terminology across kiosk mode, attendance page, and welcome messages
- Better user understanding of the check-in process
- Updated in both Swedish and English languages

User Management Improvements:
- Removed explanatory note from user edit form
- Streamlined interface for user creation and editing
- Cleaner, more focused user management experience',
    '{"subscriber count", "card height", "uniform cards", "action buttons", "check in", "checka in", "ui updates", "latest features", "training cards", "real-time updates"}',
    'user-guide',
    8,
    'both',
    true,
    'migration'
),

-- Troubleshooting Common Issues
(
    'Troubleshooting Common Issues',
    'Common problems and their solutions',
    'Common problems and solutions:

User Issues:
- Can''t log in: Check credentials and account status
- Session not appearing: Verify subscription and availability
- Credit not updating: Check transaction history and refresh
- Attendance marking failed: Verify session time and status

Admin Issues:
- User creation failed: Check email format and permissions
- Session editing blocked: Verify session hasn''t started
- Report generation error: Check data permissions and format
- System performance: Monitor database connections and cache',
    '{"troubleshooting", "errors", "problems", "solutions", "debug", "fix"}',
    'user-guide',
    7,
    'both',
    true,
    'migration'
),

-- Tour System Overview
(
    'Tour System Overview',
    'Interactive guided tour system information',
    'The tour system provides interactive guided walkthroughs to help users learn the system:

Tour Features:
- Step-by-step guidance through system features
- Interactive elements with click, scroll, navigate, wait, and highlight actions
- Role-based access control (admin, user, or any user)
- Tour categories: onboarding, feature, admin, user
- Import/export functionality for tour management
- Tour statistics and analytics

Tour Step Types:
- Navigate: Moves user to specific pages
- Click: Highlights elements for user interaction
- Scroll: Shows content that''s not visible
- Wait: Pauses tour for reading time
- Highlight: Draws attention to important elements

Tour Management (Admin):
- Create, edit, duplicate, and delete tours
- Configure step actions and target selectors
- Set tour categories and role requirements
- Import/export tours for backup and sharing
- View tour statistics and completion rates

User Experience:
- Tours can be started from news announcements
- Context-sensitive help integration
- Smooth transitions between steps
- Ability to skip, pause, or exit tours',
    '{"tour", "guided tour", "step", "navigate", "click", "scroll", "wait", "highlight", "guide", "rundtur", "guidad rundtur", "steg", "navigera", "klicka", "scrolla", "vänta", "markera", "guida", "tour management", "create tour", "edit tour", "tour steps", "tour statistics", "tour import", "tour export"}',
    'system',
    8,
    'both',
    true,
    'migration'
),

-- Shoutout System Overview
(
    'Shoutout System Overview',
    'News announcements and feature highlights system',
    'The shoutout system manages news announcements and feature highlights:

Shoutout Features:
- News announcements for new features and updates
- Feature highlights and improvements
- System notifications and important messages
- Priority levels: low, medium, high
- Expiration date management
- "New" indicator for unread messages
- Mark as read functionality

Shoutout Categories:
- Feature: New features or functionality
- Improvement: Enhancements to existing features
- Announcement: Important system notifications

Shoutout Management (Admin):
- Create, edit, duplicate, and delete shoutouts
- Set priority levels and expiration dates
- Link shoutouts to guided tours
- Import/export shoutouts for backup and sharing
- View read statistics and user engagement

User Experience:
- "New" indicators for unread messages
- Direct links to guided tours from announcements
- Automatic expiration of time-limited messages
- Integration with help system and AI assistant
- Context-sensitive information based on user role

Tour Integration:
- Shoutouts can link to guided tours
- Smooth transition from information to practical guidance
- Contextual help for new features
- Improved user onboarding experience',
    '{"shoutout", "news", "announcements", "features", "improvements", "expire date", "mark as read", "new", "nyheter", "meddelanden", "funktioner", "förbättringar", "utgångsdatum", "markera som läst", "nytt", "shoutout management", "create shoutout", "edit shoutout", "news items", "feature announcements"}',
    'system',
    8,
    'both',
    true,
    'migration'
);

-- Now let's add some additional prompts that were found in the existing components
-- These are the prompts that were hardcoded in AIChatbot.tsx and HelpSystem.tsx

INSERT INTO ai_prompts (name, description, category, content, variables, priority, is_active, created_by) VALUES

-- Enhanced System Prompt (from AIChatbot.tsx)
(
    'Enhanced System Prompt - AIChatbot',
    'Enhanced system prompt with context awareness and actions from AIChatbot component',
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
- Om du verkligen inte vet svaret, säg det tydligt

VIKTIGT - Interaktiva åtgärder (AI actions):
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
    '{"context"}',
    1,
    true,
    'migration'
),

-- HelpSystem Prompt (from HelpSystem.tsx)
(
    'HelpSystem Prompt',
    'System prompt used in HelpSystem component',
    'system',
    'Du är en hjälpsam AI-assistent för ett träningshanteringssystem. Använd följande information för att svara på användarens frågor:

{{context}}

Instruktioner:
- Svara på svenska om användaren skriver på svenska, annars på engelska
- Var hjälpsam, vänlig och professionell
- Använd informationen från dokumentationen och systemkunskapen
- Om du inte vet svaret, säg det tydligt
- Ge praktiska exempel när det är lämpligt
- Citera relevanta delar av dokumentationen när det hjälper
- Håll svaret koncist men informativt
- Om dokumentationen inte är tillgänglig, svara baserat på din allmänna kunskap om systemadministration

VIKTIGT - Interaktiva åtgärder (AI actions):
- Efter ditt svar, om det är relevant, lägg till en eller flera åtgärdshints på separata rader i formatet [action:NAMN nyckel=värde ...]
- Stödda åtgärder:
  - navigate view=public|admin|attendance|users|trainings|tour-management|shoutout-management
  - set_search value="text"
  - open_help id=overview|vouchers|user-management|training-management|subscriptions|attendance|troubleshooting
  - toggle_source value=local|remote
  - unsubscribe trainingId="..." userId="..." (använd endast som förslag)
  - start_tour tourId="tour-id" (starta en guidad rundtur)
  - add_user (öppna formuläret för att lägga till användare)
  - add_training (öppna formuläret för att lägga till träning)
  - create_tour (öppna formuläret för att skapa rundtur)
  - create_shoutout (öppna formuläret för att skapa shoutout)
- När du förklarar hur man skapar något, lägg alltid till en följdfråga som "Vill du att jag gör det åt dig?" (svenska) eller "Do you want me to do this for you?" (engelska)
- Exempel: [action:navigate view=public] eller [action:add_user]

Viktigt: Skriv alltid din naturliga text först. Lägg därefter (om relevant) till åtgärdshints på egna rader.',
    '{"context"}',
    2,
    true,
    'migration'
),

-- Simple Test Prompt (from AITest.tsx)
(
    'Simple Test Prompt',
    'Simple prompt used for AI testing',
    'custom',
    'Du är en hjälpsam AI-assistent för ett träningshanteringssystem. 

Systemet har följande huvudfunktioner:
- Användarhantering med admin- och vanliga användare
- Träningssessioner som användare kan prenumerera på
- Klippkortssystem för att hantera krediter
- Incheckningshantering för träningssessioner

Svara på svenska om användaren skriver på svenska, annars på engelska.
Var hjälpsam, vänlig och professionell.',
    '{}',
    10,
    true,
    'migration'
);

-- Update the AI configuration to use the new prompts
UPDATE ai_config SET 
    system_prompt_id = (SELECT id FROM ai_prompts WHERE name = 'System Prompt - Main' LIMIT 1),
    context_prompt_id = (SELECT id FROM ai_prompts WHERE name = 'Context Awareness Prompt' LIMIT 1),
    action_prompt_id = (SELECT id FROM ai_prompts WHERE name = 'Action Prompt' LIMIT 1),
    updated_at = NOW()
WHERE is_active = true;

-- Create a backup of the old configuration
INSERT INTO ai_config (model, temperature, max_tokens, system_prompt_id, context_prompt_id, action_prompt_id, is_active, created_at, updated_at)
SELECT 
    model,
    temperature,
    max_tokens,
    (SELECT id FROM ai_prompts WHERE name = 'Enhanced System Prompt - AIChatbot' LIMIT 1),
    (SELECT id FROM ai_prompts WHERE name = 'Context Awareness Prompt' LIMIT 1),
    (SELECT id FROM ai_prompts WHERE name = 'Action Prompt' LIMIT 1),
    false, -- Mark as inactive backup
    created_at,
    NOW()
FROM ai_config 
WHERE is_active = true;

-- Mark all migrated knowledge sources as trained
UPDATE ai_knowledge_sources 
SET last_trained = NOW() 
WHERE created_by = 'migration';

-- Display migration summary
SELECT 
    'Migration Summary' as summary,
    (SELECT COUNT(*) FROM ai_prompts WHERE created_by = 'migration') as prompts_migrated,
    (SELECT COUNT(*) FROM ai_knowledge_sources WHERE created_by = 'migration') as knowledge_sources_migrated,
    (SELECT COUNT(*) FROM ai_prompts) as total_prompts,
    (SELECT COUNT(*) FROM ai_knowledge_sources) as total_knowledge_sources;
