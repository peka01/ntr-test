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

// Static imports for all help content files
import overviewSv from '../docs/help/sv/overview.md?raw';
import vouchersSv from '../docs/help/sv/vouchers.md?raw';
import userManagementSv from '../docs/help/sv/user-management.md?raw';
import trainingManagementSv from '../docs/help/sv/training-management.md?raw';
import subscriptionsSv from '../docs/help/sv/subscriptions.md?raw';
import attendanceSv from '../docs/help/sv/attendance.md?raw';
import troubleshootingSv from '../docs/help/sv/troubleshooting.md?raw';

import overviewEn from '../docs/help/en/overview.md?raw';
import vouchersEn from '../docs/help/en/vouchers.md?raw';
import userManagementEn from '../docs/help/en/user-management.md?raw';
import trainingManagementEn from '../docs/help/en/training-management.md?raw';
import subscriptionsEn from '../docs/help/en/subscriptions.md?raw';
import attendanceEn from '../docs/help/en/attendance.md?raw';
import troubleshootingEn from '../docs/help/en/troubleshooting.md?raw';

// Content map for static imports
const helpContentMap = {
  sv: {
    overview: overviewSv,
    vouchers: vouchersSv,
    'user-management': userManagementSv,
    'training-management': trainingManagementSv,
    subscriptions: subscriptionsSv,
    attendance: attendanceSv,
    troubleshooting: troubleshootingSv
  },
  en: {
    overview: overviewEn,
    vouchers: vouchersEn,
    'user-management': userManagementEn,
    'training-management': trainingManagementEn,
    subscriptions: subscriptionsEn,
    attendance: attendanceEn,
    troubleshooting: troubleshootingEn
  }
};

// Load content from static imports
async function loadMarkdownContent(sectionId: string, language: string): Promise<string> {
  const cacheKey = `${sectionId}-${language}`;
  const now = Date.now();
  
  // Check if we have a valid cached version
  if (contentCache[cacheKey] && (now - lastCacheTime) < CACHE_DURATION) {
    return contentCache[cacheKey];
  }
  
  try {
    const content = helpContentMap[language as keyof typeof helpContentMap]?.[sectionId as keyof typeof helpContentMap[typeof language]];
    if (content) {
      contentCache[cacheKey] = content;
      lastCacheTime = now;
      return content;
    } else {
      throw new Error(`Content not found for section ${sectionId} in language ${language}`);
    }
  } catch (error) {
    console.error(`Error loading markdown file for ${sectionId} in ${language}:`, error);
    // Return a fallback message
    return `# Content not available\n\nThis help content is currently not available.\n\nError: ${error}`;
  }
};

export const helpService = {
  // Clear cache to force reload
  clearCache(): void {
    contentCache = {};
    lastCacheTime = 0;
  },

  // Force reload by clearing cache and reloading content
  async forceReload(language: string = 'sv'): Promise<HelpSection[]> {
    this.clearCache();
    return this.getAllSections(language);
  },

  // Get all help sections for a specific language
  async getAllSections(language: string = 'sv'): Promise<HelpSection[]> {
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
