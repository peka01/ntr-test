-- Create news announcement for new tour and shoutout management documentation
-- This script creates a news item to inform users about the updated help documentation

-- Insert Swedish version of the news announcement
INSERT INTO help_shoutouts (
    title,
    description,
    image,
    icon,
    tour_id,
    category,
    priority,
    language,
    target_group,
    release_date,
    expire_date,
    is_new,
    is_active,
    created_at,
    updated_at,
    created_by,
    updated_by
) VALUES (
    'Ny dokumentation för rundturs- och nyhetshantering',
    'Vi har lagt till omfattande dokumentation för rundturshantering och nyhetsmeddelanden i hjälpsystemet. 

**Nya funktioner:**
• **Rundturshantering (Admin)**: Lär dig hur du skapar och hanterar guidade rundturer
• **Nyhetshantering (Admin)**: Skapa och hantera nyhetsmeddelanden och funktionsannonser
• **Guidade rundturer (Användare)**: Lär dig systemets funktioner med interaktiva vägledningar
• **Nyhetsmeddelanden (Användare)**: Håll dig uppdaterad med systemets nyheter

**Förbättringar:**
• Utökad hjälpdokumentation med steg-för-steg instruktioner
• Kontextuell hjälp för alla nya funktioner
• AI-assistenten har uppdaterats med kunskap om de nya systemen
• Förbättrad sökfunktion i hjälpsystemet

Använd hjälpsystemet för att utforska de nya funktionerna och få praktisk vägledning.',
    NULL,
    '📚',
    NULL,
    'improvement',
    'medium',
    'sv',
    'public',
    CURRENT_DATE,
    NULL,
    true,
    true,
    NOW(),
    NOW(),
    'system',
    'system'
);

-- Insert English version of the news announcement
INSERT INTO help_shoutouts (
    title,
    description,
    image,
    icon,
    tour_id,
    category,
    priority,
    language,
    target_group,
    release_date,
    expire_date,
    is_new,
    is_active,
    created_at,
    updated_at,
    created_by,
    updated_by
) VALUES (
    'New Documentation for Tour and Shoutout Management',
    'We have added comprehensive documentation for tour management and news announcements to the help system.

**New Features:**
• **Tour Management (Admin)**: Learn how to create and manage guided tours
• **Shoutout Management (Admin)**: Create and manage news announcements and feature highlights
• **Guided Tours (User)**: Learn the system''s features with interactive walkthroughs
• **News Announcements (User)**: Stay updated with system news and notifications

**Improvements:**
• Expanded help documentation with step-by-step instructions
• Contextual help for all new features
• AI assistant updated with knowledge about the new systems
• Enhanced search functionality in the help system

Use the help system to explore the new features and get practical guidance.',
    NULL,
    '📚',
    NULL,
    'improvement',
    'medium',
    'en',
    'public',
    CURRENT_DATE,
    NULL,
    true,
    true,
    NOW(),
    NOW(),
    'system',
    'system'
);

-- Verify the insertions
SELECT 
    id,
    title,
    category,
    priority,
    language,
    is_new,
    is_active,
    release_date
FROM help_shoutouts 
WHERE title IN ('Ny dokumentation för rundturs- och nyhetshantering', 'New Documentation for Tour and Shoutout Management')
ORDER BY language, release_date DESC;
