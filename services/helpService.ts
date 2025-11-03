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
    let sections: HelpSection[] = [];
    
    try {
      for (const sectionConfig of helpConfig.sections) {
        // loadMarkdownContentFromGitHub now returns error content instead of throwing
        const content = await this.loadMarkdownContentFromGitHub(sectionConfig.id, language, forceRefresh);
        const extractedTitle = this.extractMarkdownTitle(content);
        const title = extractedTitle || sectionConfig.title[language as keyof typeof sectionConfig.title] || sectionConfig.id;
        const keywords = sectionConfig.keywords || [];
        const category = this.deriveCategoryFromId(sectionConfig.id) || sectionConfig.category || 'general';
        const pathSegments = this.splitPathSegments(sectionConfig.id);
        sections.push({ id: sectionConfig.id, title, content, keywords, category, pathSegments });
      }
    } catch (error) {
      console.error('Error loading help sections:', error);
      throw new Error(`Failed to load help sections: ${error instanceof Error ? error.message : String(error)}`);
    }
    
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
    // Always fetch from GitHub for consistency
    // loadMarkdownContentFromGitHub now returns error content instead of throwing
    const content = await this.loadMarkdownContentFromGitHub(sectionId, language, forceRefresh);
    const extractedTitle = this.extractMarkdownTitle(content);
    
    // Find section config for metadata
    const sectionConfig = helpConfig.sections.find(s => s.id === sectionId);
    const title = extractedTitle || (sectionConfig ? sectionConfig.title[language as keyof typeof sectionConfig.title] : sectionId);
    const keywords = sectionConfig ? sectionConfig.keywords : [];
    const category = this.deriveCategoryFromId(sectionId) || (sectionConfig ? sectionConfig.category : 'general');
    const pathSegments = this.splitPathSegments(sectionId);
    
    return {
      id: sectionId,
      title: title || sectionId,
      content: content,
      keywords,
      category: category || 'general',
      pathSegments
    };
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

  // Map section IDs to their actual file paths in the GitHub repository
  getActualFilePath(sectionId: string, language: string): string {
    const langFolder = language === 'sv' ? 'sv' : 'en';
    
    // Mapping of section IDs to their actual folder structure
    const pathMapping: Record<string, Record<string, string>> = {
      sv: {
        'overview': 'overview',
        'troubleshooting': 'troubleshooting',
        'vouchers': 'Användare/vouchers',
        'subscriptions': 'Användare/subscriptions',
        'attendance': 'Användare/attendance',
        'guided-tours': 'Användare/guided-tours',
        'news-announcements': 'Användare/news-announcements',
        'user-management': 'Administratör/user-management',
        'training-management': 'Administratör/training-management',
        'tour-management': 'Administratör/tour-management',
        'shoutout-management': 'Administratör/shoutout-management'
      },
      en: {
        'overview': 'overview',
        'troubleshooting': 'troubleshooting',
        'vouchers': 'User/vouchers',
        'subscriptions': 'User/subscriptions',
        'attendance': 'User/attendance',
        'guided-tours': 'User/guided-tours',
        'news-announcements': 'User/news-announcements',
        'user-management': 'Admin/user-management',
        'training-management': 'Admin/training-management',
        'tour-management': 'Admin/tour-management',
        'shoutout-management': 'Admin/shoutout-management'
      }
    };
    
    const mappedPath = pathMapping[langFolder]?.[sectionId];
    if (mappedPath) {
      return `docs/${langFolder}/${mappedPath}.md`;
    }
    
    // Fallback to direct path if no mapping found
    return `docs/${langFolder}/${sectionId}.md`;
  },

  // Load markdown content directly from GitHub repository
  async loadMarkdownContentFromGitHub(sectionId: string, language: string, forceRefresh: boolean = false): Promise<string> {
    try {
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      
      // Try GitHub first (for updated content) - ALWAYS, even in development
      const githubApiUrl = `/api/help/content?section=${encodeURIComponent(sectionId)}&lang=${encodeURIComponent(language)}&source=github`;
      const cacheBuster = `&_t=${Date.now()}&_r=${Math.random()}`;
      const githubUrl = githubApiUrl + cacheBuster;
      
      try {
        const githubResponse = await fetch(githubUrl, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        });
        
        if (githubResponse.ok) {
          const githubData = await githubResponse.json();
          if (githubData.success && githubData.content) {
            return githubData.content;
          }
        }
      } catch (githubError) {
        // Silently fall back to local
      }
      
      // Fallback to local files via API
      const localApiUrl = `/api/help/content?section=${encodeURIComponent(sectionId)}&lang=${encodeURIComponent(language)}&source=local`;
      const localUrl = localApiUrl + cacheBuster;
      
      const localResponse = await fetch(localUrl, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      
      if (localResponse.ok) {
        const localData = await localResponse.json();
        if (localData.success && localData.content) {
          return localData.content;
        }
      }
      
      // If both failed
      if (localResponse.status === 404) {
        return this.generateNotFoundContent(sectionId, language);
      }
      
      const errorData = await localResponse.json().catch(() => ({ error: localResponse.statusText }));
      return this.generateErrorContent(sectionId, language, errorData.error || localResponse.statusText, isLocal);
      
    } catch (error) {
      console.error(`❌ Error loading content for ${sectionId} in ${language}:`, error);
      
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      return this.generateErrorContent(
        sectionId, 
        language, 
        error instanceof Error ? error.message : String(error),
        isLocal
      );
    }
  },

  // Generate error content message
  generateErrorContent(sectionId: string, language: string, errorMessage: string, isLocal: boolean): string {
    return `# Content Loading Error

This help content could not be loaded.

**Error:** ${errorMessage}

**Possible causes:**
- File doesn't exist in the repository yet
- Network connectivity issues  
- API server error
${isLocal ? '- Local file not found in docs folder' : '- GitHub API rate limiting or access issues'}

**Solutions:**
1. **${isLocal ? 'Check local files' : 'Check repository'}**: Verify the file exists at \`docs/${language === 'sv' ? 'sv' : 'en'}/${sectionId}.md\`
2. **Refresh**: Try refreshing the help system
3. **Create content**: Use the help editor to create this section
4. **Contact support**: If the issue persists

**Debug Info:**
- Section: ${sectionId}
- Language: ${language}
- Time: ${new Date().toISOString()}
- Environment: ${isLocal ? 'Local Development' : 'Production'}

---
*${isLocal ? 'Loading from local docs folder via internal API.' : 'Loading from GitHub via internal API.'}*`;
  },

  // Generate not found content message
  generateNotFoundContent(sectionId: string, language: string): string {
    return `# Help Content Not Found

This help section does not exist yet.

**Section:** ${sectionId}

**What you can do:**
1. **Create new content**: Use the "Edit" button to create this help section
2. **Check spelling**: Verify the section ID is correct
3. **Browse available topics**: Return to the help overview to see available sections

**Debug Info:**
- Section: ${sectionId}
- Language: ${language}
- Time: ${new Date().toISOString()}

---
*This section can be created using the help editor.*`;
  },

  // Load markdown content from local docs folder (used in development and as fallback)
  async loadMarkdownContentLocal(sectionId: string, language: string, forceRefresh: boolean = false): Promise<string> {
    try {
      // Super aggressive cache busting for instant updates
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substr(2, 15);
      const sessionId = Math.random().toString(36).substr(2, 10);
      const microTime = performance.now().toString().replace('.', '');
      const nanoSeed = Math.random().toString(36).substr(2, 20);
      
      // Multiple cache busting parameters to defeat all caching layers
      const cacheBusters = [
        `t=${timestamp}`,
        `v=${randomId}`,
        `_fresh=${Date.now()}`,
        `_session=${sessionId}`,
        `_bust=${Math.random()}`,
        `_micro=${microTime}`,
        `_nano=${nanoSeed}`,
        `_force=${forceRefresh ? '1' : '0'}`,
        `_r=${Math.floor(Math.random() * 999999)}`,
        `_ts=${new Date().getTime()}`
      ];
      const cacheParams = `?${cacheBusters.join('&')}`;
      
      const langFolder = language === 'sv' ? 'sv' : 'en';
      
      // Try to fetch from local docs folder (served directly by Vite)
      const base = (import.meta as any).env?.BASE_URL || '/';
      const localUrl = `${base}docs/${langFolder}/${sectionId}.md${cacheParams}`;
      
      console.log(`🔄 Loading content from: ${localUrl.substring(0, 100)}...`);
      
      // Super aggressive headers to prevent any caching
      const headers = {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0, private, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'If-Modified-Since': '0',
        'If-None-Match': '*',
        'X-Requested-With': 'XMLHttpRequest',
        'X-Cache-Buster': `${timestamp}-${randomId}-${sessionId}`,
        'X-Force-Refresh': forceRefresh.toString(),
        'X-Timestamp': timestamp.toString(),
        'X-Random': Math.random().toString()
      };
      
      const response = await fetch(localUrl, { 
        cache: 'no-store',
        method: 'GET',
        headers
      });
      
      if (response.ok) {
        const content = await response.text();
        console.log(`✅ Fresh content loaded for ${sectionId} (${language}), length: ${content.length}`);
        return content;
      }
      
      // Handle any non-200 response - try multiple fallbacks with different strategies
      console.warn(`⚠️ Response ${response.status} for ${sectionId}, trying fallbacks...`);
      
      // Fallback 1: Try without any cache params but with timestamp in URL path
      const pathTimestamp = Date.now();
      const fallback1Url = `${base}docs/${langFolder}/${sectionId}.md?_=${pathTimestamp}`;
      console.log(`🔄 Fallback 1: ${fallback1Url}`);
      
      const fallback1Response = await fetch(fallback1Url, {
        cache: 'no-store',
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (fallback1Response.ok) {
        const content = await fallback1Response.text();
        console.log(`✅ Content loaded for ${sectionId} (${language}) via fallback 1.`);
        return content;
      }
      
      // Fallback 2: Try with minimal cache busting
      const fallback2Url = `${base}docs/${langFolder}/${sectionId}.md?v=${Math.random()}`;
      console.log(`🔄 Fallback 2: ${fallback2Url}`);
      
      const fallback2Response = await fetch(fallback2Url, {
        cache: 'no-store',
        method: 'GET'
      });
      
      if (fallback2Response.ok) {
        const content = await fallback2Response.text();
        console.log(`✅ Content loaded for ${sectionId} (${language}) via fallback 2.`);
        return content;
      }
      
      // Fallback 3: Try plain request as last resort
      const fallback3Url = `${base}docs/${langFolder}/${sectionId}.md`;
      console.log(`🔄 Fallback 3: ${fallback3Url}`);
      
      const fallback3Response = await fetch(fallback3Url, {
        cache: 'no-store'
      });
      
      if (fallback3Response.ok) {
        const content = await fallback3Response.text();
        console.log(`✅ Content loaded for ${sectionId} (${language}) via fallback 3.`);
        return content;
      }
      
      throw new Error(`All fetch attempts failed. Last status: ${response.status} ${response.statusText}`);
    } catch (error) {
      console.error(`❌ Error loading content for ${sectionId} in ${language}:`, error);
      
      // Return error message when content cannot be loaded
      const errorMessage = `# Content not available

This help content is currently not available.

**Error:** ${error}

**Possible causes:**
- Documentation file not found
- Network connectivity issues  
- File path configuration error
- Caching issues

**Solutions:**
1. **Check file exists**: Verify the file exists at \`docs/${language === 'sv' ? 'sv' : 'en'}/${sectionId}.md\`
2. **Check connection**: Verify internet connectivity
3. **Hard refresh**: Try Ctrl+F5 to bypass all caches
4. **Wait and retry**: File changes may take a moment to propagate
5. **Contact support**: If the issue persists

**Debug Info:**
- Section: ${sectionId}
- Language: ${language}
- Time: ${new Date().toISOString()}
- Mode: Local Documentation
- Force Refresh: ${forceRefresh}

---
*Attempting to load fresh content...*`;
      
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

  // Clear all caches (enhanced for instant refresh)
  async clearAllCaches(): Promise<void> {
    // Clear browser caches programmatically where possible
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      } catch (error) {
        // Silently fail
      }
    }
    
    // Force reload any cached modules (Vite specific)
    try {
      if ((import.meta as any).hot) {
        (import.meta as any).hot.invalidate();
      }
    } catch (error) {
      // Silently fail
    }
  },

  // Verify if content has actually changed (for debugging cache issues)
  async verifyContentChange(sectionId: string, language: string, oldContent: string): Promise<{ changed: boolean, newContent: string, contentLength: number }> {
    try {
      // Always use GitHub for verification to match our source of truth
      const newContent = await this.loadMarkdownContentFromGitHub(sectionId, language, true);
      const changed = newContent !== oldContent;
      
      return {
        changed,
        newContent,
        contentLength: newContent.length
      };
    } catch (error) {
      return {
        changed: false,
        newContent: oldContent,
        contentLength: oldContent.length
      };
    }
  },

  // Force reload by fetching fresh content from GitHub
  async forceReload(language: string = 'sv'): Promise<HelpSection[]> {
    // Always force refresh when manually reloading
    return this.getAllSections(language, true);
  }
};

// Export configuration for customization
export { helpConfig };