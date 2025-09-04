// Generic Help System Service
// This service provides a reusable help system that fetches content from local docs folder
// It can be easily integrated into any repository by following the same pattern

// Help section configuration - this should be customized for each application
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
  category: string;
  pathSegments?: string[];
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

// Generic help service that can be reused across different applications
export const helpService = {
  // Get all help sections for a specific language
  async getAllSections(language: string = 'sv', forceRefresh: boolean = false): Promise<HelpSection[]> {
    console.log(`Loading help sections for language: ${language}${forceRefresh ? ' (forced refresh)' : ''}`);
    const sections: HelpSection[] = [];
    
    try {
      for (const sectionConfig of helpConfig.sections) {
        try {
          const content = await this.loadMarkdownContent(sectionConfig.id, language, forceRefresh);
          const extractedTitle = this.extractMarkdownTitle(content);
          const title = extractedTitle || sectionConfig.title[language as keyof typeof sectionConfig.title] || sectionConfig.id;
          const keywords = sectionConfig.keywords || [];
          const category = this.deriveCategoryFromId(sectionConfig.id) || sectionConfig.category || 'general';
          const pathSegments = this.splitPathSegments(sectionConfig.id);
          sections.push({ id: sectionConfig.id, title, content, keywords, category, pathSegments });
        } catch (error) {
          console.error(`Error loading help content for section ${sectionConfig.id}:`, error);
          // Skip sections that cannot be loaded
        }
      }
    } catch (error) {
      console.error('Error loading help sections:', error);
      throw new Error(`Failed to load help sections: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    console.log(`Loaded ${sections.length} help sections`);
    return sections;
  },

  // Get a specific help section
  async getSection(sectionId: string, language: string = 'sv', forceRefresh: boolean = false): Promise<HelpSection | null> {
    try {
      const sectionConfig = helpConfig.sections.find(s => s.id === sectionId);
      if (!sectionConfig) return null;

      const content = await this.loadMarkdownContent(sectionId, language, forceRefresh);
      const extractedTitle = this.extractMarkdownTitle(content);
      const derivedCategory = this.deriveCategoryFromId(sectionConfig.id) || sectionConfig.category;
      const pathSegments = this.splitPathSegments(sectionConfig.id);
      return {
        id: sectionConfig.id,
        title: extractedTitle || sectionConfig.title[language as keyof typeof sectionConfig.title],
        content: content,
        keywords: sectionConfig.keywords,
        category: derivedCategory || 'general',
        pathSegments
      };
    } catch (error) {
      console.error(`Error loading help content for section ${sectionId}:`, error);
    }
    
    return null;
  },

  // Extract the first-level heading (H1) from markdown content
  extractMarkdownTitle(markdown: string): string | null {
    if (!markdown) return null;
    const lines = markdown.split(/\r?\n/);
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;
      // Match '# Title' heading
      if (line.startsWith('# ')) {
        return line.replace(/^#\s+/, '').trim();
      }
      // Some docs might use frontmatter or start with other content; stop after first non-empty if no heading
      // Continue scanning to allow front matter or comments at top.
    }
    return null;
  },

  // Derive category from section id path (e.g., "admin/attendance" -> "admin").
  deriveCategoryFromId(sectionId: string): string {
    if (!sectionId) return 'general';
    const normalized = sectionId.replace(/^\/+|\/+$/g, '');
    const slashIndex = normalized.indexOf('/');
    if (slashIndex === -1) return 'general';
    const category = normalized.substring(0, slashIndex).trim();
    return category || 'general';
  },

  // Split an id path into its segments, excluding language.
  splitPathSegments(sectionId: string): string[] {
    if (!sectionId) return [];
    return sectionId
      .replace(/^\/+|\/+$/g, '')
      .split('/')
      .filter(Boolean);
  },

  // Load markdown content from local docs folder
  async loadMarkdownContent(sectionId: string, language: string, forceRefresh: boolean = false): Promise<string> {
    try {
      // Always use aggressive cache busting to ensure fresh content
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substr(2, 15);
      const sessionId = Math.random().toString(36).substr(2, 10);
      const cacheParams = `?t=${timestamp}&v=${randomId}&_fresh=${Date.now()}&_session=${sessionId}&_bust=${Math.random()}`;
      const langFolder = language === 'sv' ? 'sv' : 'en';
      
      // Try to fetch from local docs folder (served directly by Vite)
      const base = (import.meta as any).env?.BASE_URL || '/';
      const localUrl = `${base}docs/${langFolder}/${sectionId}.md${cacheParams}`;
      
      console.log(`Loading help content from: ${localUrl}`);
      
      const response = await fetch(localUrl, { 
        cache: 'no-store',
        method: 'GET',
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0, private',
          'Pragma': 'no-cache',
          'Expires': '0',
          'If-Modified-Since': '0',
          'If-None-Match': '*',
          'X-Requested-With': 'XMLHttpRequest',
          'X-Cache-Buster': `${timestamp}-${randomId}-${sessionId}`
        }
      });
      
      if (response.ok) {
        const content = await response.text();
        console.log(`✅ Content loaded for ${sectionId} (${language}) from local docs.`);
        return content;
      }
      
      // Handle 304 Not Modified - this means the content is cached but we want fresh content
      if (response.status === 304) {
        console.warn(`⚠️ Got 304 Not Modified for ${sectionId}, retrying with different cache buster...`);
        // Retry with a completely different cache buster
        const newTimestamp = Date.now() + Math.random() * 1000;
        const newRandomId = Math.random().toString(36).substr(2, 15);
        const newCacheParams = `?t=${newTimestamp}&v=${newRandomId}&_fresh=${Date.now()}&_retry=${Math.random()}`;
        const retryUrl = `${base}docs/${langFolder}/${sectionId}.md${newCacheParams}`;
        
        console.log(`🔄 Retrying with new URL: ${retryUrl}`);
        
        const retryResponse = await fetch(retryUrl, {
          cache: 'no-store',
          method: 'GET',
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0, private',
            'Pragma': 'no-cache',
            'Expires': '0',
            'If-Modified-Since': '0',
            'If-None-Match': '*'
          }
        });
        
        if (retryResponse.ok) {
          const content = await retryResponse.text();
          console.log(`✅ Content loaded for ${sectionId} (${language}) on retry.`);
          return content;
        }
      }
      
      // Final fallback: try without any cache busting at all
      console.warn(`⚠️ All cache busting attempts failed, trying simple request...`);
      const simpleUrl = `${base}docs/${langFolder}/${sectionId}.md`;
      const simpleResponse = await fetch(simpleUrl, {
        cache: 'no-store',
        method: 'GET'
      });
      
      if (simpleResponse.ok) {
        const content = await simpleResponse.text();
        console.log(`✅ Content loaded for ${sectionId} (${language}) with simple request.`);
        return content;
      }
      
      throw new Error(`Failed to load content: ${response.status} ${response.statusText}`);
    } catch (error) {
      console.error(`Error loading content for ${sectionId} in ${language}:`, error);
      
      // Return error message when content cannot be loaded
      const errorMessage = `# Content not available

This help content is currently not available.

**Error:** ${error}

**Possible causes:**
- Documentation file not found
- Network connectivity issues
- File path configuration error

**Solutions:**
1. **Check file exists**: Verify the file exists at \`docs/${language === 'sv' ? 'sv' : 'en'}/${sectionId}.md\`
2. **Check connection**: Verify internet connectivity
3. **Refresh**: Try refreshing the page
4. **Contact support**: If the issue persists

**Debug Info:**
- Section: ${sectionId}
- Language: ${language}
- Time: ${new Date().toISOString()}
- Mode: Local Documentation

---
*Local documentation is required and unavailable.*`;
      
      return errorMessage;
    }
  },

  // Get help configuration
  getConfig(): HelpSectionConfig[] {
    return helpConfig.sections;
  },

  // Get available sections
  getAvailableSections(language: string = 'sv'): string[] {
    return helpConfig.sections.map(s => s.id);
  },

  // Clear all caches (no-op for local docs, but kept for compatibility)
  async clearAllCaches(): Promise<void> {
    console.log('🗑️ Clearing help system caches...');
    // For local docs, we don't need to clear caches as we use cache-busting URLs
    console.log('✅ Caches cleared (local docs mode)');
  },

  // Force reload by fetching fresh content
  async forceReload(language: string = 'sv'): Promise<HelpSection[]> {
    console.log(`🔄 Force reloading help content for language: ${language}`);
    // Always force refresh when manually reloading
    return this.getAllSections(language, true);
  }
};

// Export configuration for customization
export { helpConfig };