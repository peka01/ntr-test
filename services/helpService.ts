// Help section configuration
const helpConfig = {
  sections: [
    {
      id: "overview",
      title: {
        sv: "Systemöversikt",
        en: "System Overview"
      },
      keywords: ["overview", "system", "features", "architecture"],
      category: "general" as const
    },
    {
      id: "vouchers",
      title: {
        sv: "Klippkortssystem",
        en: "Voucher System"
      },
      keywords: ["voucher", "credits", "balance", "cost", "refund"],
      category: "general" as const
    },
    {
      id: "user-management",
      title: {
        sv: "Användarhantering (Admin)",
        en: "User Management (Admin)"
      },
      keywords: ["create user", "add user", "manage vouchers", "admin", "user list"],
      category: "admin" as const
    },
    {
      id: "training-management",
      title: {
        sv: "Träningshantering (Admin)",
        en: "Training Management (Admin)"
      },
      keywords: ["create training", "edit training", "admin training", "training management"],
      category: "admin" as const
    },
    {
      id: "subscriptions",
      title: {
        sv: "Träningsanmälningar (Användare)",
        en: "Training Subscriptions (User)"
      },
      keywords: ["subscribe", "unsubscribe", "subscription", "public view", "user subscription"],
      category: "user" as const
    },
    {
      id: "attendance",
      title: {
        sv: "Närvarohantering (Användare)",
        en: "Attendance Management (User)"
      },
      keywords: ["mark attendance", "cancel attendance", "attendance view", "voucher deduction", "refund"],
      category: "user" as const
    },
    {
      id: "troubleshooting",
      title: {
        sv: "Felsökning",
        en: "Troubleshooting"
      },
      keywords: ["error", "problem", "issue", "cannot mark", "not appearing", "balance not updating"],
      category: "general" as const
    }
  ]
};

export interface HelpSection {
  id: string;
  title: string;
  content: string;
  keywords: string[];
  category: 'admin' | 'user' | 'general';
}

interface GithubCommitInfo {
  sha: string;
  commit: {
    author: { date: string };
    committer: { date: string };
    message: string;
  };
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
const CACHE_DURATION = 0; // Always fetch fresh content



// Load help configuration from external repository
async function loadHelpConfig(): Promise<any> {
  try {
    const timestamp = Date.now();
    const configUrl = `/helpdocs/ntr-test/help-config.json?t=${timestamp}`;
    console.log(`Fetching help configuration: ${configUrl}`);

    const response = await fetch(configUrl, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache'
      }
    });

    if (response.ok) {
      const config = await response.json();
      return config;
    }
    
    throw new Error(`Failed to load help config: ${response.status} ${response.statusText}`);
  } catch (error) {
    console.error('Error loading help configuration:', error);
    throw error;
  }
}

// Dynamic content loading from external help documentation repository
async function loadMarkdownContent(sectionId: string, language: string): Promise<string> {
  const cacheKey = `${sectionId}-${language}`;
  const now = Date.now();
  
  // Check if we have a valid cached version
  if (contentCache[cacheKey] && (now - lastCacheTime) < CACHE_DURATION) {
    return contentCache[cacheKey];
  }
  
  try {
    // Load configuration to get the correct file path
    const config = await loadHelpConfig();
    
    // Validate configuration structure
    if (!config || !config.apps || !config.apps['ntr-app']) {
      console.warn('Invalid configuration structure, falling back to static paths');
      throw new Error('Invalid configuration structure');
    }
    
    const localeKey = language === 'sv' ? 'sv-se' : 'en-se';
    const appConfig = config.apps['ntr-app'];
    
    if (!appConfig.locales || !appConfig.locales[localeKey]) {
      console.warn(`Locale ${localeKey} not found in configuration, falling back to static paths`);
      throw new Error(`Locale ${localeKey} not found`);
    }
    
    const filePath = appConfig.locales[localeKey].file_paths[sectionId];
    
    if (!filePath) {
      console.warn(`No file path found for section ${sectionId} in locale ${localeKey}, falling back to static paths`);
      throw new Error(`No file path found for section ${sectionId} in locale ${localeKey}`);
    }

    // Use first-party Nginx reverse proxy to fetch centralized docs
    const timestamp = Date.now();
    const internalUrl = `/helpdocs/ntr-test/${filePath}?t=${timestamp}`;
    console.log(`Fetching help content via internal proxy: ${internalUrl}`);

    const response = await fetch(internalUrl, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache'
      }
    });

    if (response.ok) {
      const content = await response.text();
      contentCache[cacheKey] = content;
      lastCacheTime = now;
      return content;
    }
    
    throw new Error(`Internal proxy failed: ${response.status} ${response.statusText}`);
  } catch (error) {
    console.error(`Error loading content for ${sectionId} in ${language}:`, error);
    
    // Log detailed error information for debugging
    if (error instanceof Error) {
      console.error(`Error details:`, {
        message: error.message,
        stack: error.stack,
        sectionId,
        language
      });
    }
    
    // Try fallback to static paths if external configuration fails
    console.log(`Attempting fallback to static paths for ${sectionId} in ${language}`);
    try {
      const fallbackUrl = `/helpdocs/ntr-test/docs/${language}/${sectionId}.md?t=${Date.now()}`;
      console.log(`Fetching fallback content: ${fallbackUrl}`);
      
      const fallbackResponse = await fetch(fallbackUrl, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
          'Pragma': 'no-cache'
        }
      });

      if (fallbackResponse.ok) {
        const fallbackContent = await fallbackResponse.text();
        contentCache[cacheKey] = fallbackContent;
        lastCacheTime = now;
        console.log(`Fallback content loaded successfully for ${sectionId}`);
        return fallbackContent;
      }
    } catch (fallbackError) {
      console.error(`Fallback also failed for ${sectionId}:`, fallbackError);
    }
    
    // Return error message when both external and fallback fail
    return `# Content not available\n\nThis help content is currently not available.\n\nError: ${error}\n\nPlease check your internet connection and try refreshing.\n\n**Debug Info:**\n- Section: ${sectionId}\n- Language: ${language}\n- Time: ${new Date().toISOString()}`;
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
    // Force a fresh timestamp for all cache keys
    lastCacheTime = 0;
    return this.getAllSections(language);
  },

  // Get all help sections for a specific language
  async getAllSections(language: string = 'sv'): Promise<HelpSection[]> {
    console.log(`Loading all help sections for language: ${language}`);
    const sections: HelpSection[] = [];
    
    try {
      // Try to get sections from dynamic configuration first
      const availableSections = await this.getAvailableSections(language);
      
      for (const sectionId of availableSections) {
        try {
          const content = await loadMarkdownContent(sectionId, language);
          
          // Find matching static config for title and metadata
          const sectionConfig = helpConfig.sections.find(s => s.id === sectionId);
          const title = sectionConfig?.title[language as keyof typeof sectionConfig.title] || sectionId;
          const keywords = sectionConfig?.keywords || [];
          const category = sectionConfig?.category || 'general';
          
          sections.push({
            id: sectionId,
            title: title,
            content: content,
            keywords: keywords,
            category: category
          });
        } catch (error) {
          console.error(`Error loading help content for section ${sectionId}:`, error);
          // Fallback to empty content
          const sectionConfig = helpConfig.sections.find(s => s.id === sectionId);
          const title = sectionConfig?.title[language as keyof typeof sectionConfig.title] || sectionId;
          const keywords = sectionConfig?.keywords || [];
          const category = sectionConfig?.category || 'general';
          
          sections.push({
            id: sectionId,
            title: title,
            content: '# Content not available\n\nThis help content is currently not available.',
            keywords: keywords,
            category: category
          });
        }
      }
    } catch (error) {
      console.error('Error loading dynamic sections, falling back to static config:', error);
      
      // Fallback to static configuration
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
  },

  // Get dynamic help configuration from external repository
  async getDynamicConfig(): Promise<any> {
    try {
      return await loadHelpConfig();
    } catch (error) {
      console.error('Error loading dynamic help configuration:', error);
      // Return fallback configuration
      return {
        apps: {
          'ntr-app': {
            locales: {
              'sv-se': { file_paths: {} },
              'en-us': { file_paths: {} }
            }
          }
        }
      };
    }
  },

  // Get available sections from dynamic configuration
  async getAvailableSections(language: string = 'sv'): Promise<string[]> {
    try {
      const config = await loadHelpConfig();
      const localeKey = language === 'sv' ? 'sv-se' : 'en-se';
      const filePaths = config.apps['ntr-app'].locales[localeKey].file_paths;
      return Object.keys(filePaths);
    } catch (error) {
      console.error('Error getting available sections:', error);
      // Return fallback sections from static config
      return helpConfig.sections.map(s => s.id);
    }
  },

  // Compare last update times between sv and en for a section
  async isEnglishOutdated(sectionId: string): Promise<boolean> {
    try {
      // Load configuration to get the correct file paths
      const config = await loadHelpConfig();
      
      // Validate configuration structure
      if (!config || !config.apps || !config.apps['ntr-app']) {
        console.warn('Invalid configuration structure for metadata check, using fallback');
        return false;
      }
      
      const appConfig = config.apps['ntr-app'];
      if (!appConfig.locales || !appConfig.locales['sv-se'] || !appConfig.locales['en-se']) {
        console.warn('Missing locale configuration for metadata check, using fallback');
        return false;
      }
      
      const svFilePath = appConfig.locales['sv-se'].file_paths[sectionId];
      const enFilePath = appConfig.locales['en-se'].file_paths[sectionId];
      
      if (!svFilePath || !enFilePath) {
        console.warn(`No file paths found for section ${sectionId}, using fallback`);
        return false;
      }

      const [svCommitsRes, enCommitsRes] = await Promise.all([
        fetch(`/helpmeta/repos/peka01/helpdoc/commits?path=ntr-test/${svFilePath}&per_page=1`, { cache: 'no-store' }),
        fetch(`/helpmeta/repos/peka01/helpdoc/commits?path=ntr-test/${enFilePath}&per_page=1`, { cache: 'no-store' })
      ]);

      if (!svCommitsRes.ok || !enCommitsRes.ok) return false;
      const svCommits = await svCommitsRes.json() as GithubCommitInfo[];
      const enCommits = await enCommitsRes.json() as GithubCommitInfo[];

      if (!svCommits.length || !enCommits.length) return false;

      const svDate = new Date(svCommits[0].commit.committer.date).getTime();
      const enDate = new Date(enCommits[0].commit.committer.date).getTime();
      return enDate < svDate; // English older than Swedish
    } catch (e) {
      console.error('Error checking translation freshness', e);
      return false;
    }
  },

  // Get last updated timestamps for sv and en docs
  async getLastUpdatedTimes(sectionId: string): Promise<{ sv?: string; en?: string }> {
    try {
      // Load configuration to get the correct file paths
      const config = await loadHelpConfig();
      
      // Validate configuration structure
      if (!config || !config.apps || !config.apps['ntr-app']) {
        console.warn('Invalid configuration structure for metadata check, using fallback');
        return {};
      }
      
      const appConfig = config.apps['ntr-app'];
      if (!appConfig.locales || !appConfig.locales['sv-se'] || !appConfig.locales['en-se']) {
        console.warn('Missing locale configuration for metadata check, using fallback');
        return {};
      }
      
      const svFilePath = appConfig.locales['sv-se'].file_paths[sectionId];
      const enFilePath = appConfig.locales['en-se'].file_paths[sectionId];
      
      if (!svFilePath || !enFilePath) {
        console.warn(`No file paths found for section ${sectionId}, using fallback`);
        return {};
      }

      const [svCommitsRes, enCommitsRes] = await Promise.all([
        fetch(`/helpmeta/repos/peka01/helpdoc/commits?path=ntr-test/${svFilePath}&per_page=1`, { cache: 'no-store' }),
        fetch(`/helpmeta/repos/peka01/helpdoc/commits?path=ntr-test/${enFilePath}&per_page=1`, { cache: 'no-store' })
      ]);
      const result: { sv?: string; en?: string } = {};
      if (svCommitsRes.ok) {
        const svCommits = await svCommitsRes.json() as GithubCommitInfo[];
        if (svCommits.length) {
          result.sv = svCommits[0].commit.committer.date;
        }
      }
      if (enCommitsRes.ok) {
        const enCommits = await enCommitsRes.json() as GithubCommitInfo[];
        if (enCommits.length) {
          result.en = enCommits[0].commit.committer.date;
        }
      }
      return result;
    } catch (e) {
      console.error('Error fetching last updated times', e);
      return {};
    }
  }
};
