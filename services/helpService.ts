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

// Dynamic content loading from repository
async function loadMarkdownContent(sectionId: string, language: string): Promise<string> {
  const cacheKey = `${sectionId}-${language}`;
  const now = Date.now();
  
  // Check if we have a valid cached version
  if (contentCache[cacheKey] && (now - lastCacheTime) < CACHE_DURATION) {
    return contentCache[cacheKey];
  }
  
  try {
    // Fetch from the repository
    const repoUrl = `https://raw.githubusercontent.com/peka01/ntr-test/main/docs/help/${language}/${sectionId}.md`;
    
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
    // Return a fallback message
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
