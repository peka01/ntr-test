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
      keywords: ["create user", "add user", "manage vouchers", "admin", "user list", "användare", "användarhantering", "skapa användare", "redigera användare", "klippkort", "vouchers", "användarlista", "användaröversikt", "lägg till användare", "uppdatera användare", "creating a new user", "editing user", "users page", "viewing users list"],
      category: "admin" as const
    },
    {
      id: "training-management",
      title: {
        sv: "Träningshantering (Admin)",
        en: "Training Management (Admin)"
      },
      keywords: ["create training", "edit training", "admin training", "training management", "träningar", "träningshantering", "skapa träning", "redigera träning", "träningslista", "träningsöversikt", "träningspass", "lägg till träning", "uppdatera träning", "creating new training", "editing training", "trainings page", "viewing trainings list", "subscriber count", "anmälda", "antal anmälda", "registered", "card height", "uniform cards", "action buttons", "bottom buttons"],
      category: "admin" as const
    },
    {
      id: "subscriptions",
      title: {
        sv: "Träningsanmälningar (Användare)",
        en: "Training Subscriptions (User)"
      },
      keywords: ["subscribe", "unsubscribe", "subscription", "public view", "user subscription", "subscription page", "viewing subscriptions", "anmälan", "open page", "public page", "visual indicator", "navigation", "blue styling", "minimalistic design"],
      category: "user" as const
    },
    {
      id: "attendance",
      title: {
        sv: "Incheckninghantering (Användare)",
        en: "Attendance Management (User)"
      },
      keywords: ["mark attendance", "cancel attendance", "attendance view", "voucher deduction", "refund", "attendance page", "viewing attendance", "incheckning", "incheckninghantering"],
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
    },
    {
      id: "tour-management",
      title: {
        sv: "Rundturshantering (Admin)",
        en: "Tour Management (Admin)"
      },
      keywords: ["rundtur", "guidad rundtur", "tour", "guida", "steg", "navigera", "klicka", "scrolla", "vänta", "markera", "tour management", "create tour", "edit tour", "tour steps", "tour statistics", "tour import", "tour export", "rundturshantering", "skapa rundtur", "redigera rundtur", "rundturssteg", "rundtursstatistik", "importera rundtur", "exportera rundtur", "guided tour", "step", "navigate", "click", "scroll", "wait", "highlight", "guide"],
      category: "admin" as const
    },
    {
      id: "shoutout-management",
      title: {
        sv: "Hantera nyheter (Admin)",
        en: "Shoutout Management (Admin)"
      },
      keywords: ["nyheter", "meddelanden", "funktioner", "förbättringar", "utgångsdatum", "markera som läst", "nytt", "news", "announcements", "features", "improvements", "expire date", "mark as read", "new", "shoutout management", "create shoutout", "edit shoutout", "news items", "feature announcements", "nyhetshantering", "skapa nyhet", "redigera nyhet", "nyhetsmeddelanden", "funktionsannonser"],
      category: "admin" as const
    },
    {
      id: "guided-tours",
      title: {
        sv: "Guidade rundturer (Användare)",
        en: "Guided Tours (User)"
      },
      keywords: ["rundtur", "guidad rundtur", "tour", "guida", "steg", "navigera", "klicka", "scrolla", "vänta", "markera", "guided tour", "step", "navigate", "click", "scroll", "wait", "highlight", "guide", "interactive walkthrough", "user guidance", "step by step"],
      category: "user" as const
    },
    {
      id: "news-announcements",
      title: {
        sv: "Nyhetsmeddelanden (Användare)",
        en: "News Announcements (User)"
      },
      keywords: ["nyheter", "meddelanden", "funktioner", "förbättringar", "utgångsdatum", "markera som läst", "nytt", "news", "announcements", "features", "improvements", "expire date", "mark as read", "new", "system updates", "feature highlights", "notifications"],
      category: "user" as const
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
  folderPath?: string;
  description?: string;
  order?: number;
  icon?: string;
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

export interface StructureMapSection {
  title: string;
  description: string;
  order: number;
  keywords?: string[];
}

export interface StructureMapFolder {
  title: string;
  description: string;
  icon: string;
  order: number;
  sections: Record<string, StructureMapSection>;
}

export interface StructureMapLanguage {
  name: string;
  folders: Record<string, StructureMapFolder>;
  rootSections: Record<string, StructureMapSection>;
}

export interface StructureMap {
  version: string;
  languages: Record<string, StructureMapLanguage>;
  metadata: {
    lastUpdated: string;
    version: string;
    description: string;
  };
}

// Generic help service that can be reused across different applications
export const helpService = {
  // Load structure map from JSON file
  async loadStructureMap(): Promise<StructureMap | null> {
    try {
      // Load structure map from docs folder
      const base = (import.meta as any).env?.BASE_URL || '/';
      const response = await fetch(`${base}docs/structure-map.json?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
        }
      });
      
      if (response.ok) {
        const structureMap = await response.json();
        console.log('✅ Structure map loaded from runtime fetch');
        return structureMap as StructureMap;
      } else {
        console.warn('⚠️ Could not load structure map, falling back to auto-discovery');
        return null;
      }
    } catch (error) {
      console.warn('⚠️ Error loading structure map:', error);
      return null;
    }
  },

  // Get all help sections for a specific language
  async getAllSections(language: string = 'sv', forceRefresh: boolean = false): Promise<HelpSection[]> {
    console.log(`Loading help sections for language: ${language}${forceRefresh ? ' (forced refresh)' : ''}`);
    let sections: HelpSection[] = [];
    
    try {
      // Try to load structure map first
      const structureMap = await this.loadStructureMap();
      
      // First try to discover docs from the repository docs folder at build-time
      const discovered = this.discoverDocs(language);
      if (Object.keys(discovered).length > 0) {
        sections = await this.buildSectionsFromStructure(discovered, language, structureMap);
      } else {
        // Fallback to configured sections using fetch from docs folder
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
      }
    } catch (error) {
      console.error('Error loading help sections:', error);
      throw new Error(`Failed to load help sections: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    console.log(`Loaded ${sections.length} help sections`);
    return sections;
  },

  // Build sections from discovered docs using structure map
  async buildSectionsFromStructure(discovered: Record<string, string>, language: string, structureMap: StructureMap | null): Promise<HelpSection[]> {
    const sections: HelpSection[] = [];
    const langData = structureMap?.languages[language];
    
    // Process root sections first
    if (langData?.rootSections) {
      for (const [sectionId, sectionInfo] of Object.entries(langData.rootSections)) {
        if (discovered[sectionId]) {
          const content = discovered[sectionId];
          const title = this.extractMarkdownTitle(content) || sectionInfo.title;
          sections.push({
            id: sectionId,
            title,
            content,
            keywords: [],
            category: 'general',
            pathSegments: [sectionId],
            description: sectionInfo.description,
            order: sectionInfo.order
          });
        }
      }
    }
    
    // Process folder sections
    if (langData?.folders) {
      for (const [folderName, folderInfo] of Object.entries(langData.folders)) {
        for (const [sectionId, sectionInfo] of Object.entries(folderInfo.sections)) {
          const fullPath = `${folderName}/${sectionId}`;
          if (discovered[fullPath]) {
            const content = discovered[fullPath];
            const title = this.extractMarkdownTitle(content) || sectionInfo.title;
            const category = this.deriveCategoryFromId(folderName) || 'general';
            sections.push({
              id: fullPath,
              title,
              content,
              keywords: sectionInfo.keywords || [],
              category,
              pathSegments: [folderName, sectionId],
              folderPath: folderName,
              description: sectionInfo.description,
              order: sectionInfo.order,
              icon: folderInfo.icon
            });
          }
        }
      }
    }
    
    // Fallback: process any remaining discovered docs not in structure map
    for (const [sectionId, content] of Object.entries(discovered)) {
      const existingSection = sections.find(s => s.id === sectionId);
      if (!existingSection) {
        const title = this.extractMarkdownTitle(content) || sectionId.split('/').pop() || sectionId;
        const category = this.deriveCategoryFromId(sectionId) || 'general';
        const pathSegments = this.splitPathSegments(sectionId);
        sections.push({
          id: sectionId,
          title,
          content,
          keywords: [],
          category,
          pathSegments
        });
      }
    }
    
    // Sort sections by order and then by title
    return sections.sort((a, b) => {
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order;
      }
      if (a.order !== undefined) return -1;
      if (b.order !== undefined) return 1;
      return a.title.localeCompare(b.title);
    });
  },

  // Get a specific help section
  async getSection(sectionId: string, language: string = 'sv', forceRefresh: boolean = false): Promise<HelpSection | null> {
    try {
      // Prefer discovered docs
      const discovered = this.discoverDocs(language);
      if (discovered[sectionId]) {
        const content = discovered[sectionId];
        const title = this.extractMarkdownTitle(content) || sectionId.split('/').pop() || sectionId;
        const category = this.deriveCategoryFromId(sectionId) || 'general';
        const pathSegments = this.splitPathSegments(sectionId);
        return { id: sectionId, title, content, keywords: [], category, pathSegments };
      }

      // Fallback to configured sections and public fetch
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

  // Discover docs from repository 'docs/{lang}/**/*.md' using Vite glob import
  discoverDocs(language: string): Record<string, string> {
    try {
      const langFolder = language === 'sv' ? 'sv' : 'en';
      // @ts-ignore Vite-specific API
      const globA: Record<string, string> = (import.meta as any).glob('/docs/**/*.md', { query: '?raw', import: 'default', eager: true });
      // @ts-ignore Vite-specific API
      const globB: Record<string, string> = (import.meta as any).glob('../docs/**/*.md', { query: '?raw', import: 'default', eager: true });
      // Merge results (support different path resolutions across environments)
      const modules: Record<string, string> = { ...globA, ...globB } as any;
      const result: Record<string, string> = {};
      Object.keys(modules).forEach((fullPath) => {
        // Normalize path like '/docs/sv/admin/page.md'
        const normalized = fullPath.replace(/\\/g, '/');
        const needle = `/docs/${langFolder}/`;
        if (normalized.startsWith(needle)) {
          const rel = normalized.substring(needle.length);
          if (rel.toLowerCase().endsWith('.md')) {
            const id = rel.substring(0, rel.length - 3);
            // @ts-ignore Vite glob eager returns raw content string
            const content = (modules as any)[fullPath];
            result[id] = content as unknown as string;
          }
        }
      });
      return result;
    } catch (e) {
      console.warn('Doc discovery via import.meta.glob failed; falling back to static config.', e);
      return {};
    }
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