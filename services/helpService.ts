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
let metadataCache: { [key: string]: any } = {};
let lastCacheTime = 0;
let lastMetadataCacheTime = 0;
const CACHE_DURATION = 0; // Always fetch fresh content
const METADATA_CACHE_DURATION = 5 * 60 * 1000; // Cache metadata for 5 minutes to avoid rate limits



// Dynamic content loading from external help documentation repository
async function loadMarkdownContent(sectionId: string, language: string): Promise<string> {
  const cacheKey = `${sectionId}-${language}`;
  const now = Date.now();
  
  // Check if we have a valid cached version
  if (contentCache[cacheKey] && (now - lastCacheTime) < CACHE_DURATION) {
    return contentCache[cacheKey];
  }
  
  try {
    // Use first-party Nginx reverse proxy to fetch centralized docs (no browser CORS, robust)
    const timestamp = Date.now();
    const internalUrl = `/helpdocs/ntr-test/${language}/${sectionId}.md?t=${timestamp}`;
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
    
    // Return error message when external repository is not accessible
    return `# Content not available\n\nThis help content is currently not available.\n\nError: ${error}\n\nPlease check your internet connection and try refreshing.\n\n**Debug Info:**\n- Section: ${sectionId}\n- Language: ${language}\n- Time: ${new Date().toISOString()}`;
  }
}

export const helpService = {
  // Clear cache to force reload
  clearCache(): void {
    contentCache = {};
    metadataCache = {};
    lastCacheTime = 0;
    lastMetadataCacheTime = 0;
    console.log('Help content and metadata cache cleared');
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
  },

  // Compare last update times between sv and en for a section
  async isEnglishOutdated(sectionId: string): Promise<boolean> {
    const cacheKey = `outdated-${sectionId}`;
    const now = Date.now();
    
    // Check if we have cached metadata to avoid hitting rate limits
    if (metadataCache[cacheKey] && (now - lastMetadataCacheTime) < METADATA_CACHE_DURATION) {
      return metadataCache[cacheKey];
    }
    
    try {
      const [svCommitsRes, enCommitsRes] = await Promise.all([
        fetch(`/helpmeta/repos/peka01/helpdoc/commits?path=ntr-test/sv/${sectionId}.md&per_page=1`, { cache: 'no-store' }),
        fetch(`/helpmeta/repos/peka01/helpdoc/commits?path=ntr-test/en/${sectionId}.md&per_page=1`, { cache: 'no-store' })
      ]);

      // If either request fails due to rate limiting, return false and cache the result
      if (!svCommitsRes.ok || !enCommitsRes.ok) {
        console.warn(`GitHub API request failed (${svCommitsRes.status}/${enCommitsRes.status}). Caching negative result to avoid rate limits.`);
        metadataCache[cacheKey] = false;
        lastMetadataCacheTime = now;
        return false;
      }

      const svCommits = await svCommitsRes.json() as GithubCommitInfo[];
      const enCommits = await enCommitsRes.json() as GithubCommitInfo[];

      if (!svCommits.length || !enCommits.length) {
        metadataCache[cacheKey] = false;
        lastMetadataCacheTime = now;
        return false;
      }

      const svDate = new Date(svCommits[0].commit.committer.date).getTime();
      const enDate = new Date(enCommits[0].commit.committer.date).getTime();
      const isOutdated = enDate < svDate; // English older than Swedish
      
      // Cache the result
      metadataCache[cacheKey] = isOutdated;
      lastMetadataCacheTime = now;
      
      return isOutdated;
    } catch (e) {
      console.error('Error checking translation freshness (likely rate limited):', e);
      // Cache a negative result to prevent repeated failed requests
      metadataCache[cacheKey] = false;
      lastMetadataCacheTime = now;
      return false;
    }
  },

  // Get last updated timestamps for sv and en docs
  async getLastUpdatedTimes(sectionId: string): Promise<{ sv?: string; en?: string }> {
    const cacheKey = `times-${sectionId}`;
    const now = Date.now();
    
    // Check if we have cached metadata to avoid hitting rate limits
    if (metadataCache[cacheKey] && (now - lastMetadataCacheTime) < METADATA_CACHE_DURATION) {
      return metadataCache[cacheKey];
    }
    
    try {
      const [svCommitsRes, enCommitsRes] = await Promise.all([
        fetch(`/helpmeta/repos/peka01/helpdoc/commits?path=ntr-test/sv/${sectionId}.md&per_page=1`, { cache: 'no-store' }),
        fetch(`/helpmeta/repos/peka01/helpdoc/commits?path=ntr-test/en/${sectionId}.md&per_page=1`, { cache: 'no-store' })
      ]);
      
      const result: { sv?: string; en?: string } = {};
      
      // Handle rate limiting gracefully
      if (svCommitsRes.ok) {
        try {
          const svCommits = await svCommitsRes.json() as GithubCommitInfo[];
          if (svCommits.length) {
            result.sv = svCommits[0].commit.committer.date;
          }
        } catch (e) {
          console.warn('Error parsing Swedish commit data:', e);
        }
      } else {
        console.warn(`GitHub API request for Swedish docs failed: ${svCommitsRes.status}`);
      }
      
      if (enCommitsRes.ok) {
        try {
          const enCommits = await enCommitsRes.json() as GithubCommitInfo[];
          if (enCommits.length) {
            result.en = enCommits[0].commit.committer.date;
          }
        } catch (e) {
          console.warn('Error parsing English commit data:', e);
        }
      } else {
        console.warn(`GitHub API request for English docs failed: ${enCommitsRes.status}`);
      }
      
      // Cache the result even if partially successful
      metadataCache[cacheKey] = result;
      lastMetadataCacheTime = now;
      
      return result;
    } catch (e) {
      console.error('Error fetching last updated times (likely rate limited):', e);
      // Return empty result and cache it to prevent repeated failed requests
      const emptyResult = {};
      metadataCache[cacheKey] = emptyResult;
      lastMetadataCacheTime = now;
      return emptyResult;
    }
  }
};
