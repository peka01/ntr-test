// Help section configuration
// 
// CORS Strategy:
// - GitHub Pages: Uses Service Worker proxy to avoid CORS issues
// - Development mode: Uses Service Worker proxy to avoid CORS issues
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

let isProxyReady: Promise<void> | null = null;

function ensureProxyIsReady(): Promise<void> {
    if (isProxyReady) {
        return isProxyReady;
    }

    isProxyReady = new Promise<void>((resolve, reject) => {
        if (!('serviceWorker' in navigator)) {
            console.warn('Service Worker not supported, help proxy will not work.');
            // Resolve anyway, but fetches will fail with a clearer error.
            resolve();
            return;
        }

        navigator.serviceWorker.ready.then(registration => {
            console.log('✅ Service Worker proxy is ready to handle requests.');
            resolve();
        }).catch(error => {
            console.error('❌ Service Worker proxy failed to become ready.', error);
            reject(error);
        });
    });

    return isProxyReady;
}

// Enhanced cache-busting and refresh utilities
function generateCacheBuster(): string {
  return `t=${Date.now()}&v=${Math.random().toString(36).substr(2, 9)}`;
}

function generateForceRefreshParams(): string {
  return `refresh=true&nocache=true&${generateCacheBuster()}`;
}

// Service Worker communication for cache management
async function clearServiceWorkerCache(): Promise<void> {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    try {
      navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' });
      // console.log('🗑️ Requested Service Worker cache clear');
    } catch (error) {
      console.warn('Could not communicate with Service Worker:', error);
    }
  }
}

// Force reload by fetching fresh content from external repository
async function forceReload(language: string = 'sv'): Promise<HelpSection[]> {
  // console.log(`Force reloading help content for language: ${language}`);
  
  // Clear Service Worker cache first
  await clearServiceWorkerCache();
  
  // Wait a bit for cache to clear
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return this.getAllSections(language, true); // Force refresh
}

// Load help configuration from external repository - MAIN FUNCTION
async function loadHelpConfig(forceRefresh: boolean = false): Promise<any> {
  try {
    await ensureProxyIsReady(); // Wait for the service worker to be active
    const cacheParams = forceRefresh ? generateForceRefreshParams() : generateCacheBuster();
    
    // Always use service worker proxy to avoid CORS issues
    const configUrl = `./help-proxy/help-config.json?${cacheParams}`;
    // console.log(`🌐 Using service worker proxy to fetch help config: ${configUrl}`);
    
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
      console.log(`✅ Help configuration loaded successfully.`);
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

// Dynamic content loading from external help documentation repository - CONTENT LOADER
async function loadMarkdownContent(sectionId: string, language: string, forceRefresh: boolean = false): Promise<string> {
  
  try {
    // Load configuration to get the correct file path
    const config = await loadHelpConfig(forceRefresh);
    
    // Validate configuration structure - use 'ntr-app' as the app key
    if (!config || !config.apps || !config.apps['ntr-app']) {
      console.warn('Invalid configuration structure, falling back to static paths. Available app keys:', config?.apps ? Object.keys(config.apps) : 'none');
      throw new Error('Invalid configuration structure or "ntr-app" key missing.');
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

    // Always use service worker proxy to avoid CORS issues
    const cacheParams = forceRefresh ? generateForceRefreshParams() : generateCacheBuster();
    const internalUrl = `./help-proxy/${filePath}?${cacheParams}`;
    // console.log(`🌐 Using service worker proxy for content: ${internalUrl}`);
    
    // Try to fetch content via service worker proxy
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
      // console.log(`✅ Content loaded for ${sectionId} (${language}) via service worker proxy.`);
      return content;
    }
    
    throw new Error(`Service worker proxy failed: ${response.status} ${response.statusText}`);
  } catch (error) {
    console.error(`Error loading content for ${sectionId} in ${language}:`, error);
    
    // Log detailed error information for debugging
    if (error instanceof Error) {
      console.error(`Error details:`, {
        message: error.message,
        stack: error.stack,
        sectionId,
        language,
        forceRefresh
      });
    }
    
    // Return error message when both external and fallback fail
    const errorMessage = `# Content not available

This help content is currently not available from the external repository.

**Error:** ${error}

**Possible causes:**
- Service worker proxy not working
- Network connectivity issues
- External repository unavailable

**Solutions:**
1. **Check service worker**: Verify service worker is active in browser dev tools
2. **Check connection**: Verify internet connectivity
3. **Refresh**: Try refreshing the page
4. **Clear cache**: Use the refresh button to clear caches

**Debug Info:**
- Section: ${sectionId}
- Language: ${language}
- Time: ${new Date().toISOString()}
- Mode: Service Worker Proxy
- Force Refresh: ${forceRefresh}

---
*External documentation repository is required and unavailable.*`;
    
    return errorMessage;
  }
}

export const helpService = {
  // Force reload by fetching fresh content from external repository
  async forceReload(language: string = 'sv'): Promise<HelpSection[]> {
    // console.log(`Force reloading help content for language: ${language}`);
    
    // Clear Service Worker cache first
    await clearServiceWorkerCache();
    
    // Wait a bit for cache to clear
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return this.getAllSections(language, true); // Force refresh
  },

  // Get all help sections for a specific language
  async getAllSections(language: string = 'sv', forceRefresh: boolean = false): Promise<HelpSection[]> {
    // console.log(`Loading all help sections for language: ${language}${forceRefresh ? ' (forced refresh)' : ''}`);
    const sections: HelpSection[] = [];
    
    try {
      // Get sections from external configuration
      const availableSections = await this.getAvailableSections(language);
      
      for (const sectionId of availableSections) {
        try {
          const content = await loadMarkdownContent(sectionId, language, forceRefresh);
          
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
          // Skip sections that can't be loaded - external repository is required
          console.error(`Skipping section ${sectionId} - external content required`);
        }
      }
    } catch (error) {
      console.error('Error loading external help sections:', error);
      
      // No fallback - external repository is required
      throw new Error(`External help repository is required and unavailable: ${error.message}`);
    }
    
    // console.log(`Loaded ${sections.length} help sections`);
    return sections;
  },

  // Get a specific help section
  async getSection(sectionId: string, language: string = 'sv', forceRefresh: boolean = false): Promise<HelpSection | null> {
    try {
      const sectionConfig = helpConfig.sections.find(s => s.id === sectionId);
      if (!sectionConfig) return null;

      const content = await loadMarkdownContent(sectionId, language, forceRefresh);
      
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
  async getDynamicConfig(forceRefresh: boolean = false): Promise<any> {
    try {
      return await loadHelpConfig(forceRefresh);
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
      // No fallback - external repository is required
      throw new Error(`External help repository is required and unavailable: ${error.message}`);
    }
  },

  // Clear all caches and force fresh content
  async clearAllCaches(): Promise<void> {
    // console.log('🗑️ Clearing all help system caches...');
    
    // Clear Service Worker cache
    await clearServiceWorkerCache();
    
    // Clear browser cache for help-related requests
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        for (const cacheName of cacheNames) {
          if (cacheName.includes('help') || cacheName.includes('proxy')) {
            await caches.delete(cacheName);
            // console.log(`🗑️ Cleared browser cache: ${cacheName}`);
          }
        }
      } catch (error) {
        console.warn('Could not clear browser caches:', error);
      }
    }
    
    // console.log('✅ All caches cleared');
  },

  // Compare last update times between sv and en for a section - FUNCTION 1
  async isEnglishOutdated(sectionId: string): Promise<boolean> {
    try {
      await ensureProxyIsReady(); // Wait for the service worker to be active
      // Load configuration to get the correct file paths
      const config = await loadHelpConfig();
      
      // Validate configuration structure
      if (!config || !config.apps || !config.apps['ntr-app']) {
        throw new Error('Invalid configuration structure for metadata check');
      }
      
      const appConfig = config.apps['ntr-app'];
      if (!appConfig.locales || !appConfig.locales['sv-se'] || !appConfig.locales['en-se']) {
        throw new Error('Missing locale configuration for metadata check');
      }
      
      const svFilePath = appConfig.locales['sv-se'].file_paths[sectionId];
      const enFilePath = appConfig.locales['en-se'].file_paths[sectionId];
      
      if (!svFilePath || !enFilePath) {
        throw new Error(`No file paths found for section ${sectionId}`);
      }

      // Use service worker proxy for metadata
      const svCommitsUrl = `./help-proxy/commits?path=ntr-test/${svFilePath}&per_page=1`;
      const enCommitsUrl = `./help-proxy/commits?path=ntr-test/${enFilePath}&per_page=1`;
      // console.log(`🌐 Using service worker proxy for metadata`);
      
      const [svCommitsRes, enCommitsRes] = await Promise.all([
        fetch(svCommitsUrl, { cache: 'no-store' }),
        fetch(enCommitsUrl, { cache: 'no-store' })
      ]);

      if (!svCommitsRes.ok || !enCommitsRes.ok) {
        throw new Error(`Failed to fetch commit information: ${svCommitsRes.status} ${enCommitsRes.status}`);
      }
      const svCommits = await svCommitsRes.json() as GithubCommitInfo[];
      const enCommits = await enCommitsRes.json() as GithubCommitInfo[];

      if (!svCommits.length || !enCommits.length) {
        throw new Error('No commit information available');
      }

      const svDate = new Date(svCommits[0].commit.committer.date).getTime();
      const enDate = new Date(enCommits[0].commit.committer.date).getTime();
      return enDate < svDate; // English older than Swedish
    } catch (e) {
      console.error('Error checking translation freshness', e);
      throw new Error(`Failed to check translation freshness: ${e.message}`);
    }
  },

  // Get last updated timestamps for sv and en docs - FUNCTION 2
  async getLastUpdatedTimes(sectionId: string): Promise<{ sv?: string; en?: string }> {
    try {
      await ensureProxyIsReady(); // Wait for the service worker to be active
      // Load configuration to get the correct file paths
      const config = await loadHelpConfig();
      
      // Validate configuration structure
      if (!config || !config.apps || !config.apps['ntr-app']) {
        throw new Error('Invalid configuration structure for metadata check');
      }
      
      const appConfig = config.apps['ntr-app'];
      if (!appConfig.locales || !appConfig.locales['sv-se'] || !appConfig.locales['en-se']) {
        throw new Error('Missing locale configuration for metadata check');
      }
      
      const svFilePath = appConfig.locales['sv-se'].file_paths[sectionId];
      const enFilePath = appConfig.locales['en-se'].file_paths[sectionId];
      
      if (!svFilePath || !enFilePath) {
        throw new Error(`No file paths found for section ${sectionId}`);
      }

      // Use service worker proxy for metadata
      const svCommitsUrl = `./help-proxy/commits?path=ntr-test/${svFilePath}&per_page=1`;
      const enCommitsUrl = `./help-proxy/commits?path=ntr-test/${enFilePath}&per_page=1`;
      // console.log(`🌐 Using service worker proxy for metadata`);
      
      const [svCommitsRes, enCommitsRes] = await Promise.all([
        fetch(svCommitsUrl, { cache: 'no-store' }),
        fetch(enCommitsUrl, { cache: 'no-store' })
      ]);
      if (!svCommitsRes.ok || !enCommitsRes.ok) {
        throw new Error(`Failed to fetch commit information: ${svCommitsRes.status} ${enCommitsRes.status}`);
      }
      
      const svCommits = await svCommitsRes.json() as GithubCommitInfo[];
      const enCommits = await enCommitsRes.json() as GithubCommitInfo[];
      
      if (!svCommits.length || !enCommits.length) {
        throw new Error('No commit information available');
      }
      
      return {
        sv: svCommits[0].commit.committer.date,
        en: enCommits[0].commit.committer.date
      };
    } catch (e) {
      console.error('Error fetching last updated times', e);
      throw new Error(`Failed to fetch last updated times: ${e.message}`);
    }
  }
};
