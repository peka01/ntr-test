// Create news announcement for new tour and shoutout management documentation
// This script can be run to programmatically create the news item

import { helpSystemService } from '../services/helpSystemService.js';

async function createDocumentationNewsItem() {
  console.log('Creating news announcement for documentation updates...');

  try {
    // Create Swedish version
    const swedishShoutout = await helpSystemService.createShoutout({
      title: 'Ny dokumentation för rundturs- och nyhetshantering',
      description: `Vi har lagt till omfattande dokumentation för rundturshantering och nyhetsmeddelanden i hjälpsystemet.

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

Använd hjälpsystemet för att utforska de nya funktionerna och få praktisk vägledning.`,
      image: null,
      icon: '📚',
      tour_id: null,
      category: 'improvement',
      priority: 'medium',
      language: 'sv',
      target_group: 'public',
      release_date: new Date().toISOString().split('T')[0],
      expire_date: null,
      is_new: true,
      is_active: true,
      created_by: 'system',
      updated_by: 'system'
    });

    // Create English version
    const englishShoutout = await helpSystemService.createShoutout({
      title: 'New Documentation for Tour and Shoutout Management',
      description: `We have added comprehensive documentation for tour management and news announcements to the help system.

**New Features:**
• **Tour Management (Admin)**: Learn how to create and manage guided tours
• **Shoutout Management (Admin)**: Create and manage news announcements and feature highlights
• **Guided Tours (User)**: Learn the system's features with interactive walkthroughs
• **News Announcements (User)**: Stay updated with system news and notifications

**Improvements:**
• Expanded help documentation with step-by-step instructions
• Contextual help for all new features
• AI assistant updated with knowledge about the new systems
• Enhanced search functionality in the help system

Use the help system to explore the new features and get practical guidance.`,
      image: null,
      icon: '📚',
      tour_id: null,
      category: 'improvement',
      priority: 'medium',
      language: 'en',
      target_group: 'public',
      release_date: new Date().toISOString().split('T')[0],
      expire_date: null,
      is_new: true,
      is_active: true,
      created_by: 'system',
      updated_by: 'system'
    });

    if (swedishShoutout && englishShoutout) {
      console.log('✅ Successfully created news announcements:');
      console.log(`   Swedish: ${swedishShoutout.title} (ID: ${swedishShoutout.id})`);
      console.log(`   English: ${englishShoutout.title} (ID: ${englishShoutout.id})`);
    } else {
      console.error('❌ Failed to create one or both news announcements');
    }

  } catch (error) {
    console.error('❌ Error creating news announcements:', error);
  }
}

// Run the function if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createDocumentationNewsItem();
}

export { createDocumentationNewsItem };
