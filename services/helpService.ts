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

// Import all help content files
const helpContent = {
  // Swedish content
  sv: {
    overview: () => import('../docs/help/overview.md?raw'),
    vouchers: () => import('../docs/help/vouchers.md?raw'),
    'user-management': () => import('../docs/help/user-management.md?raw'),
    'training-management': () => import('../docs/help/training-management.md?raw'),
    subscriptions: () => import('../docs/help/subscriptions.md?raw'),
    attendance: () => import('../docs/help/attendance.md?raw'),
    troubleshooting: () => import('../docs/help/troubleshooting.md?raw'),
  },
  // English content
  en: {
    overview: () => import('../docs/help/en/overview.md?raw'),
    vouchers: () => import('../docs/help/en/vouchers.md?raw'),
    'user-management': () => import('../docs/help/en/user-management.md?raw'),
    'training-management': () => import('../docs/help/en/training-management.md?raw'),
    subscriptions: () => import('../docs/help/en/subscriptions.md?raw'),
    attendance: () => import('../docs/help/en/attendance.md?raw'),
    troubleshooting: () => import('../docs/help/en/troubleshooting.md?raw'),
  }
};

export const helpService = {
  // Get all help sections for a specific language
  async getAllSections(language: string = 'sv'): Promise<HelpSection[]> {
    const sections: HelpSection[] = [];
    
    for (const sectionConfig of helpConfig.sections) {
      try {
        const contentModule = helpContent[language as keyof typeof helpContent];
        const contentLoader = contentModule[sectionConfig.id as keyof typeof contentModule];
        
        if (contentLoader) {
          const content = await contentLoader();
          sections.push({
            id: sectionConfig.id,
            title: sectionConfig.title[language as keyof typeof sectionConfig.title],
            content: content.default || content,
            keywords: sectionConfig.keywords,
            category: sectionConfig.category
          });
        }
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
    
    return sections;
  },

  // Get a specific help section
  async getSection(sectionId: string, language: string = 'sv'): Promise<HelpSection | null> {
    try {
      const sectionConfig = helpConfig.sections.find(s => s.id === sectionId);
      if (!sectionConfig) return null;

      const contentModule = helpContent[language as keyof typeof helpContent];
      const contentLoader = contentModule[sectionId as keyof typeof contentModule];
      
      if (contentLoader) {
        const content = await contentLoader();
        return {
          id: sectionConfig.id,
          title: sectionConfig.title[language as keyof typeof sectionConfig.title],
          content: content.default || content,
          keywords: sectionConfig.keywords,
          category: sectionConfig.category
        };
      }
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
