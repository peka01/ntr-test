// Help section configuration
// 
// CORS Strategy:
// - Development mode: Attempts direct GitHub access, falls back to static config if CORS blocks
// - Production mode: Uses nginx reverse proxy to avoid CORS issues
// - All content is centralized in external repository, no local duplication
//
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

// No caching - always fetch fresh content from external repository



// Load help configuration from external repository
async function loadHelpConfig(): Promise<any> {
  try {
    const timestamp = Date.now();
    
    // Check if we're in development mode (no nginx proxy)
    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    let configUrl: string;
    if (isDevelopment) {
      // In development, use a CORS proxy or fallback to static config
      console.log(`🔧 Development mode: CORS restrictions may apply when fetching from GitHub directly`);
      
      // Try direct GitHub first (may fail due to CORS)
      try {
        configUrl = `https://raw.githubusercontent.com/peka01/helpdoc/main/ntr-test/help-config.json?t=${timestamp}`;
        console.log(`Attempting direct GitHub access: ${configUrl}`);
        
        const response = await fetch(configUrl, {
          method: 'GET',
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0, private',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        if (response.ok) {
          const config = await response.json();
          console.log(`✅ Direct GitHub access successful in development mode`);
          return config;
        }
      } catch (corsError) {
        console.warn(`⚠️ Direct GitHub access failed due to CORS:`, corsError);
        console.log(`🔄 Falling back to static configuration for development`);
        
        // Return static config for development when CORS blocks external access
        return {
          apps: {
            "ntr-app": {
              name: "NTR Training Management System",
              baseUrl: "ntr-test",
              locales: {
                "sv-se": {
                  code: "SV",
                  name: "Svenska",
                  file_paths: {
                    "overview": "docs/sv/overview.md",
                    "vouchers": "docs/sv/vouchers.md",
                    "user-management": "docs/sv/user-management.md",
                    "training-management": "docs/sv/training-management.md",
                    "subscriptions": "docs/sv/subscriptions.md",
                    "attendance": "docs/sv/attendance.md",
                    "troubleshooting": "docs/sv/troubleshooting.md"
                  }
                },
                "en-se": {
                  code: "EN",
                  name: "English",
                  file_paths: {
                    "overview": "docs/en/overview.md",
                    "vouchers": "docs/en/vouchers.md",
                    "user-management": "docs/en/user-management.md",
                    "training-management": "docs/en/training-management.md",
                    "subscriptions": "docs/en/subscriptions.md",
                    "attendance": "docs/en/attendance.md",
                    "troubleshooting": "docs/en/troubleshooting.md"
                  }
                }
              }
            }
          }
        };
      }
    } else {
      // In production, use nginx proxy
      configUrl = `/helpdocs/ntr-test/help-config.json?t=${timestamp}`;
      console.log(`🚀 Production mode: Fetching help configuration via nginx proxy: ${configUrl}`);
      console.log(`This will be proxied to: https://raw.githubusercontent.com/peka01/helpdoc/main/ntr-test/help-config.json`);
    }

    const response = await fetch(configUrl, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0, private',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

    if (response.ok) {
      const config = await response.json();
      console.log(`✅ Help configuration loaded:`, {
        url: configUrl,
        apps: Object.keys(config.apps || {}),
        ntrAppLocales: Object.keys(config.apps?.['ntr-app']?.locales || {}),
        svSections: Object.keys(config.apps?.['ntr-app']?.locales?.['sv-se']?.file_paths || {}),
        enSections: Object.keys(config.apps?.['ntr-app']?.locales?.['en-se']?.file_paths || {})
      });
      return config;
    }
    
    console.error(`❌ Failed to load help config: ${response.status} ${response.statusText}`);
    console.error(`Response headers:`, Object.fromEntries(response.headers.entries()));
    
    // Try to get response text for more details
    try {
      const errorText = await response.text();
      console.error(`Response body:`, errorText);
    } catch (e) {
      console.error(`Could not read response body:`, e);
    }
    
    throw new Error(`Failed to load help config: ${response.status} ${response.statusText}`);
  } catch (error) {
    console.error('Error loading help configuration:', error);
    throw error;
  }
}

// Dynamic content loading from external help documentation repository
async function loadMarkdownContent(sectionId: string, language: string): Promise<string> {
  
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
    
    // Check if we're in development mode (no nginx proxy)
    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    let internalUrl: string;
    if (isDevelopment) {
      // In development, try direct GitHub access (may fail due to CORS)
      internalUrl = `https://raw.githubusercontent.com/peka01/helpdoc/main/ntr-test/${filePath}?t=${timestamp}`;
      console.log(`🔧 Development mode: Attempting direct GitHub access: ${internalUrl}`);
      console.log(`⚠️ Note: This may fail due to CORS restrictions`);
    } else {
      // In production, use nginx proxy
      internalUrl = `/helpdocs/ntr-test/${filePath}?t=${timestamp}`;
      console.log(`🚀 Production mode: Fetching help content via nginx proxy: ${internalUrl}`);
    }

    const response = await fetch(internalUrl, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0, private',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

    if (response.ok) {
      const content = await response.text();
      console.log(`✅ Content loaded for ${sectionId} (${language}):`, {
        url: internalUrl,
        contentLength: content.length,
        first100Chars: content.substring(0, 100),
        last100Chars: content.substring(content.length - 100)
      });
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
    
    // Try fallback to direct external repository access
    console.log(`Attempting fallback to direct external repository access for ${sectionId} in ${language}`);
    try {
      // Check if we're in development mode (no nginx proxy)
      const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      
      let fallbackUrl: string;
      if (isDevelopment) {
        // In development, fetch directly from GitHub
        fallbackUrl = `https://raw.githubusercontent.com/peka01/helpdoc/main/ntr-test/docs/${language}/${sectionId}.md?t=${Date.now()}`;
        console.log(`🔧 Development mode: Fetching fallback content directly from GitHub: ${fallbackUrl}`);
      } else {
        // In production, use nginx proxy
        fallbackUrl = `/helpdocs/ntr-test/docs/${language}/${sectionId}.md?t=${Date.now()}`;
        console.log(`🚀 Production mode: Fetching fallback content via nginx proxy: ${fallbackUrl}`);
        console.log(`This will be proxied to: https://raw.githubusercontent.com/peka01/helpdoc/main/ntr-test/docs/${language}/${sectionId}.md`);
      }
      
      const fallbackResponse = await fetch(fallbackUrl, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0, private',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });

      if (fallbackResponse.ok) {
        const fallbackContent = await fallbackResponse.text();
        console.log(`✅ Fallback content loaded for ${sectionId} (${language}):`, {
          url: fallbackUrl,
          contentLength: fallbackContent.length,
          first100Chars: fallbackContent.substring(0, 100),
          last100Chars: fallbackContent.substring(fallbackContent.length - 100)
        });
        return fallbackContent;
      }
      
      console.error(`❌ Fallback failed: ${fallbackResponse.status} ${fallbackResponse.statusText}`);
    } catch (fallbackError) {
      console.error(`Fallback also failed for ${sectionId}:`, fallbackError);
    }
    
    // Return error message when both external and fallback fail
    const errorMessage = `# Content not available\n\nThis help content is currently not available from the external repository.\n\n**Error:** ${error}\n\n**Possible causes:**\n- CORS restrictions in development mode\n- Network connectivity issues\n- External repository unavailable\n\n**Solutions:**\n1. **Development mode**: Run with Docker/nginx to avoid CORS\n2. **Check connection**: Verify internet connectivity\n3. **Refresh**: Try refreshing the page\n\n**Debug Info:**\n- Section: ${sectionId}\n- Language: ${language}\n- Time: ${new Date().toISOString()}\n- Mode: ${window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'Development' : 'Production'}`;
    
    return errorMessage;
  }
}

export const helpService = {
  // Force reload by fetching fresh content from external repository
  async forceReload(language: string = 'sv'): Promise<HelpSection[]> {
    console.log(`Force reloading help content for language: ${language}`);
    return this.getAllSections(language);
  },

  // Get all help sections for a specific language
  async getAllSections(language: string = 'sv'): Promise<HelpSection[]> {
    console.log(`Loading all help sections for language: ${language}`);
    const sections: HelpSection[] = [];
    
    try {
      // Get sections from external configuration
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
          // Show error content when external content is unavailable
          const sectionConfig = helpConfig.sections.find(s => s.id === sectionId);
          const title = sectionConfig?.title[language as keyof typeof sectionConfig.title] || sectionId;
          const keywords = sectionConfig?.keywords || [];
          const category = sectionConfig?.category || 'general';
          
          sections.push({
            id: sectionId,
            title: title,
            content: `# Content not available\n\nThis help content is currently not available from the external repository.\n\n**Error:** ${error}\n\nPlease check your internet connection and try refreshing.\n\n**Debug Info:**\n- Section: ${sectionId}\n- Language: ${language}\n- Time: ${new Date().toISOString()}`,
            keywords: keywords,
            category: category
          });
        }
      }
    } catch (error) {
      console.error('Error loading external help sections:', error);
      // Fallback to static sections when external configuration is unavailable
      console.log('Falling back to static help sections');
      for (const sectionConfig of helpConfig.sections) {
        sections.push({
          id: sectionConfig.id,
          title: sectionConfig.title[language as keyof typeof sectionConfig.title],
          content: `# ${sectionConfig.title[language as keyof typeof sectionConfig.title]}\n\nThis help content is currently not available from the external repository.\n\nPlease check your internet connection and try refreshing.\n\n**Debug Info:**\n- Section: ${sectionConfig.id}\n- Language: ${language}\n- Time: ${new Date().toISOString()}`,
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
  },

  // Get help configuration from external repository
  async getDynamicConfig(): Promise<any> {
    try {
      return await loadHelpConfig();
    } catch (error) {
      console.error('Error loading help configuration from external repository:', error);
      throw error; // Re-throw to let calling code handle the error
    }
  },

  // Get available sections from external configuration
  async getAvailableSections(language: string = 'sv'): Promise<string[]> {
    try {
      const config = await loadHelpConfig();
      const localeKey = language === 'sv' ? 'sv-se' : 'en-se';
      const filePaths = config.apps['ntr-app'].locales[localeKey].file_paths;
      return Object.keys(filePaths);
    } catch (error) {
      console.error('Error getting available sections from external repository:', error);
      // Return static sections when external configuration is unavailable
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

      // Check if we're in development mode (no nginx proxy)
      const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      
      let svCommitsUrl: string;
      let enCommitsUrl: string;
      
      if (isDevelopment) {
        // In development, fetch directly from GitHub API
        svCommitsUrl = `https://api.github.com/repos/peka01/helpdoc/commits?path=ntr-test/${svFilePath}&per_page=1`;
        enCommitsUrl = `https://api.github.com/repos/peka01/helpdoc/commits?path=ntr-test/${enFilePath}&per_page=1`;
        console.log(`🔧 Development mode: Fetching metadata directly from GitHub API`);
      } else {
        // In production, use nginx proxy
        svCommitsUrl = `/helpmeta/repos/peka01/helpdoc/commits?path=ntr-test/${svFilePath}&per_page=1`;
        enCommitsUrl = `/helpmeta/repos/peka01/helpdoc/commits?path=ntr-test/${enFilePath}&per_page=1`;
        console.log(`🚀 Production mode: Fetching metadata via nginx proxy`);
      }
      
      const [svCommitsRes, enCommitsRes] = await Promise.all([
        fetch(svCommitsUrl, { cache: 'no-store' }),
        fetch(enCommitsUrl, { cache: 'no-store' })
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

      // Check if we're in development mode (no nginx proxy)
      const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      
      let svCommitsUrl: string;
      let enCommitsUrl: string;
      
      if (isDevelopment) {
        // In development, fetch directly from GitHub API
        svCommitsUrl = `https://api.github.com/repos/peka01/helpdoc/commits?path=ntr-test/${svFilePath}&per_page=1`;
        enCommitsUrl = `https://api.github.com/repos/peka01/helpdoc/commits?path=ntr-test/${enFilePath}&per_page=1`;
        console.log(`🔧 Development mode: Fetching metadata directly from GitHub API`);
      } else {
        // In production, use nginx proxy
        svCommitsUrl = `/helpmeta/repos/peka01/helpdoc/commits?path=ntr-test/${svFilePath}&per_page=1`;
        enCommitsUrl = `/helpmeta/repos/peka01/helpdoc/commits?path=ntr-test/${enFilePath}&per_page=1`;
        console.log(`🚀 Production mode: Fetching metadata via nginx proxy`);
      }
      
      const [svCommitsRes, enCommitsRes] = await Promise.all([
        fetch(svCommitsUrl, { cache: 'no-store' }),
        fetch(enCommitsUrl, { cache: 'no-store' })
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
