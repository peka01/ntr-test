import helpConfig from '../docs/help/help-config.json';

export interface HelpSection {
  id: string;
  title: string;
  content: string;
  keywords: string[];
  category: 'admin' | 'user' | 'general';
}

export interface HelpSectionConfig {
  id: string;
  title: {
    sv: string;
    en: string;
  };
  keywords: string[];
  category: 'admin' | 'user' | 'general';
}

// Cache for help content to avoid repeated file loads
let contentCache: { [key: string]: string } = {};
let lastCacheTime = 0;
const CACHE_DURATION = 2000; // 2 seconds cache

// Fallback content for when external repository is not accessible
const fallbackContent: { [key: string]: { [key: string]: string } } = {
  sv: {
    overview: `# Översikt\n\nVälkommen till utbildningshanteringssystemet. Detta system hjälper dig att hantera utbildningar, användare och närvaro.\n\n## Funktioner\n\n- **Användarhantering**: Skapa och hantera användare\n- **Utbildningshantering**: Skapa och hantera utbildningar\n- **Prenumerationer**: Hantera användares prenumerationer\n- **Närvaro**: Registrera och hantera närvaro\n- **Kuponger**: Hantera betalningar och rabatter`,
    vouchers: `# Kuponger\n\nKuponger används för att hantera betalningar och rabatter för utbildningar.\n\n## Skapa kupong\n\n1. Gå till admin-panelen\n2. Välj "Kuponger"\n3. Klicka på "Skapa ny"\n4. Fyll i kupongens information\n5. Spara kupongen\n\n## Hantera kuponger\n\n- Visa alla aktiva kuponger\n- Redigera befintliga kuponger\n- Inaktivera kuponger som inte längre behövs`,
    'user-management': `# Användarhantering\n\nHantera användare och deras roller i systemet.\n\n## Skapa användare\n\n1. Gå till admin-panelen\n2. Välj "Användare"\n3. Klicka på "Lägg till användare"\n4. Fyll i användarens information\n5. Välj roll (admin eller användare)\n6. Spara användaren\n\n## Hantera användare\n\n- Visa alla användare\n- Redigera användarinformation\n- Ta bort användare\n- Hantera användares prenumerationer`,
    'training-management': `# Utbildningshantering\n\nSkapa och hantera utbildningar i systemet.\n\n## Skapa utbildning\n\n1. Gå till admin-panelen\n2. Välj "Utbildningar"\n3. Klicka på "Skapa ny"\n4. Fyll i utbildningens information\n5. Sätt datum och tid\n6. Spara utbildningen\n\n## Hantera utbildningar\n\n- Visa alla utbildningar\n- Redigera befintliga utbildningar\n- Ta bort utbildningar\n- Hantera närvaro för utbildningar`,
    subscriptions: `# Prenumerationer\n\nHantera användares prenumerationer på utbildningar.\n\n## Prenumerera på utbildning\n\n1. Gå till prenumerationssidan\n2. Välj utbildning\n3. Klicka på "Prenumerera"\n4. Bekräfta prenumerationen\n\n## Hantera prenumerationer\n\n- Visa dina prenumerationer\n- Avbryt prenumerationer\n- Uppdatera prenumerationsinformation`,
    attendance: `# Närvaro\n\nRegistrera och hantera närvaro för utbildningar.\n\n## Registrera närvaro\n\n1. Gå till närvarosidan\n2. Välj utbildning\n3. Markera närvarande användare\n4. Spara närvaron\n\n## Hantera närvaro\n\n- Visa närvarolistor\n- Exportera närvarodata\n- Redigera närvaro`,
    troubleshooting: `# Felsökning\n\nHjälp med vanliga problem och lösningar.\n\n## Vanliga problem\n\n### Kan inte logga in\n- Kontrollera användarnamn och lösenord\n- Kontakta administratören\n\n### Kan inte prenumerera\n- Kontrollera att utbildningen är tillgänglig\n- Kontrollera att du har rätt behörigheter\n\n### Närvaro registreras inte\n- Kontrollera att du är inloggad\n- Kontrollera att utbildningen är aktiv`
  },
  en: {
    overview: `# Overview\n\nWelcome to the training management system. This system helps you manage trainings, users, and attendance.\n\n## Features\n\n- **User Management**: Create and manage users\n- **Training Management**: Create and manage trainings\n- **Subscriptions**: Manage user subscriptions\n- **Attendance**: Register and manage attendance\n- **Vouchers**: Handle payments and discounts`,
    vouchers: `# Vouchers\n\nVouchers are used to handle payments and discounts for trainings.\n\n## Create voucher\n\n1. Go to admin panel\n2. Select "Vouchers"\n3. Click "Create new"\n4. Fill in voucher information\n5. Save the voucher\n\n## Manage vouchers\n\n- View all active vouchers\n- Edit existing vouchers\n- Deactivate vouchers that are no longer needed`,
    'user-management': `# User Management\n\nManage users and their roles in the system.\n\n## Create user\n\n1. Go to admin panel\n2. Select "Users"\n3. Click "Add user"\n4. Fill in user information\n5. Select role (admin or user)\n6. Save the user\n\n## Manage users\n\n- View all users\n- Edit user information\n- Remove users\n- Manage user subscriptions`,
    'training-management': `# Training Management\n\nCreate and manage trainings in the system.\n\n## Create training\n\n1. Go to admin panel\n2. Select "Trainings"\n3. Click "Create new"\n4. Fill in training information\n5. Set date and time\n6. Save the training\n\n## Manage trainings\n\n- View all trainings\n- Edit existing trainings\n- Remove trainings\n- Manage attendance for trainings`,
    subscriptions: `# Subscriptions\n\nManage user subscriptions to trainings.\n\n## Subscribe to training\n\n1. Go to subscription page\n2. Select training\n3. Click "Subscribe"\n4. Confirm subscription\n\n## Manage subscriptions\n\n- View your subscriptions\n- Cancel subscriptions\n- Update subscription information`,
    attendance: `# Attendance\n\nRegister and manage attendance for trainings.\n\n## Register attendance\n\n1. Go to attendance page\n2. Select training\n3. Mark attending users\n4. Save attendance\n\n## Manage attendance\n\n- View attendance lists\n- Export attendance data\n- Edit attendance`,
    troubleshooting: `# Troubleshooting\n\nHelp with common problems and solutions.\n\n## Common issues\n\n### Cannot log in\n- Check username and password\n- Contact administrator\n\n### Cannot subscribe\n- Check that training is available\n- Check that you have correct permissions\n\n### Attendance not registering\n- Check that you are logged in\n- Check that training is active`
  }
};

// Dynamic content loading from external help documentation repository
async function loadMarkdownContent(sectionId: string, language: string): Promise<string> {
  const cacheKey = `${sectionId}-${language}`;
  const now = Date.now();
  
  // Check if we have a valid cached version
  if (contentCache[cacheKey] && (now - lastCacheTime) < CACHE_DURATION) {
    return contentCache[cacheKey];
  }
  
  try {
    // Fetch from the external help documentation repository
    const repoUrl = `https://raw.githubusercontent.com/peka01/helpdoc/main/ntr-test/${language}/${sectionId}.md`;
    
    console.log(`Fetching content from: ${repoUrl}`);
    
    const response = await fetch(repoUrl, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    if (response.ok) {
      const content = await response.text();
      console.log(`Successfully fetched content for ${sectionId} in ${language}`);
      contentCache[cacheKey] = content;
      lastCacheTime = now;
      return content;
    } else {
      throw new Error(`Failed to fetch from repository: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error(`Error loading content for ${sectionId} in ${language}:`, error);
    
    // Use fallback content if external repository is not accessible
    try {
      const fallbackText = fallbackContent[language]?.[sectionId];
      if (fallbackText) {
        console.log(`Using fallback content for ${sectionId} in ${language}`);
        contentCache[cacheKey] = fallbackText;
        lastCacheTime = now;
        return fallbackText;
      }
    } catch (fallbackError) {
      console.error(`Fallback content failed for ${sectionId}:`, fallbackError);
    }
    
    // Final fallback message
    return `# Content not available\n\nThis help content is currently not available.\n\nError: ${error}\n\nPlease check your internet connection and try refreshing.`;
  }
}

export const helpService = {
  // Clear cache to force reload
  clearCache(): void {
    contentCache = {};
    lastCacheTime = 0;
    console.log('Help content cache cleared');
  },

  // Force reload by clearing cache and reloading content
  async forceReload(language: string = 'sv'): Promise<HelpSection[]> {
    console.log(`Force reloading help content for language: ${language}`);
    this.clearCache();
    return this.getAllSections(language);
  },

  // Get all help sections for a specific language
  async getAllSections(language: string = 'sv'): Promise<HelpSection[]> {
    console.log(`Loading all help sections for language: ${language}`);
    const sections: HelpSection[] = [];
    
    for (const sectionConfig of helpConfig.sections) {
      try {
        const content = await loadMarkdownContent(sectionConfig.id, language);
        
        sections.push({
          id: sectionConfig.id,
          title: sectionConfig.title[language as keyof typeof sectionConfig.title],
          content: content,
          keywords: sectionConfig.keywords,
          category: sectionConfig.category
        });
      } catch (error) {
        console.error(`Error loading help content for section ${sectionConfig.id}:`, error);
        // Fallback to empty content
        sections.push({
          id: sectionConfig.id,
          title: sectionConfig.title[language as keyof typeof sectionConfig.title],
          content: '# Content not available\n\nThis help content is currently not available.',
          keywords: sectionConfig.keywords,
          category: sectionConfig.category
        });
      }
    }
    
    console.log(`Loaded ${sections.length} help sections`);
    return sections;
  },

  // Get a specific help section
  async getSection(sectionId: string, language: string = 'sv'): Promise<HelpSection | null> {
    try {
      const sectionConfig = helpConfig.sections.find(s => s.id === sectionId);
      if (!sectionConfig) return null;

      const content = await loadMarkdownContent(sectionId, language);
      
      return {
        id: sectionConfig.id,
        title: sectionConfig.title[language as keyof typeof sectionConfig.title],
        content: content,
        keywords: sectionConfig.keywords,
        category: sectionConfig.category
      };
    } catch (error) {
      console.error(`Error loading help content for section ${sectionId}:`, error);
    }
    
    return null;
  },

  // Get help configuration
  getConfig(): HelpSectionConfig[] {
    return helpConfig.sections;
  }
};
