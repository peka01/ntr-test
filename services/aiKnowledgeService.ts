import { aiManagementService, type KnowledgeSource as DatabaseKnowledgeSource } from './aiManagementService';

// Legacy interface for backward compatibility
export interface KnowledgeSource {
  name: string;
  content: string;
  keywords: string[];
  category: 'system' | 'business' | 'technical' | 'user-guide';
  priority: number; // Higher number = higher priority
  sourceType?: 'internal' | 'external' | 'forum' | 'webpage' | 'api';
  sourceUrl?: string;
}

// Convert database knowledge source to legacy format
const convertDatabaseToLegacy = (dbSource: DatabaseKnowledgeSource): KnowledgeSource => {
  return {
    name: dbSource.name,
    content: dbSource.content,
    keywords: dbSource.keywords,
    category: dbSource.category as 'system' | 'business' | 'technical' | 'user-guide',
    priority: dbSource.priority,
    sourceType: dbSource.sourceType,
    sourceUrl: dbSource.sourceUrl
  };
};

// Cache for knowledge sources to avoid repeated database calls
let knowledgeSourcesCache: KnowledgeSource[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Get all knowledge sources from database
export const getAdditionalKnowledgeSources = async (): Promise<KnowledgeSource[]> => {
  const now = Date.now();
  
  // Return cached data if still valid
  if (knowledgeSourcesCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return knowledgeSourcesCache;
  }

  try {
    const dbSources = await aiManagementService.getKnowledgeSources();
    const activeSources = dbSources.filter(source => source.isActive);
    
    // Convert to legacy format and sort by priority
    knowledgeSourcesCache = activeSources
      .map(convertDatabaseToLegacy)
      .sort((a, b) => b.priority - a.priority);
    
    cacheTimestamp = now;
    return knowledgeSourcesCache;
  } catch (error) {
    console.error('Error fetching knowledge sources from database:', error);
    // Return fallback knowledge sources if database is unavailable
    return getFallbackKnowledgeSources();
  }
};

// Fallback knowledge sources when database is unavailable
const getFallbackKnowledgeSources = (): KnowledgeSource[] => {
  return [
    {
      name: 'System Overview',
      content: 'Träningshanteringssystemet är ett komplett system för att hantera träningssessioner, användare och klippkort.',
      keywords: ['system', 'overview', 'funktioner'],
      category: 'system',
      priority: 1
    },
    {
      name: 'User Management',
      content: 'Admin-användare kan skapa och hantera användare. Vanliga användare kan se sin egen information och hantera sina klippkort.',
      keywords: ['användare', 'admin', 'skapa'],
      category: 'system',
      priority: 2
    }
  ];
};

// Helper function to get sources by category
export const getSourcesByCategory = async (category: KnowledgeSource['category']): Promise<KnowledgeSource[]> => {
  const sources = await getAdditionalKnowledgeSources();
  return sources
    .filter(source => source.category === category)
    .sort((a, b) => b.priority - a.priority);
};

// Helper function to search sources by keyword
export const searchSourcesByKeyword = async (keyword: string): Promise<KnowledgeSource[]> => {
  const sources = await getAdditionalKnowledgeSources();
  const lowerKeyword = keyword.toLowerCase();
  
  return sources
    .filter(source => 
      source.keywords.some(k => k.toLowerCase().includes(lowerKeyword)) ||
      source.content.toLowerCase().includes(lowerKeyword) ||
      source.name.toLowerCase().includes(lowerKeyword)
    )
    .sort((a, b) => b.priority - a.priority);
};

// Helper function to get all sources as formatted text
export const getAllSourcesAsText = async (): Promise<string> => {
  const sources = await getAdditionalKnowledgeSources();
  
  return sources
    .map(source => {
      let sourceInfo = `### ${source.name}\n` +
             `Category: ${source.category}\n` +
             `Priority: ${source.priority}\n` +
             `Keywords: ${source.keywords.join(', ')}\n`;
      
      // Add source type and URL information for external sources
      if (source.sourceType && source.sourceType !== 'internal') {
        sourceInfo += `Source Type: ${source.sourceType}\n`;
        if (source.sourceUrl) {
          sourceInfo += `Source URL: ${source.sourceUrl}\n`;
        }
      }
      
      sourceInfo += `${source.content}\n\n`;
      return sourceInfo;
    })
    .join('');
};

// Clear cache when knowledge sources are updated
export const clearKnowledgeSourcesCache = (): void => {
  knowledgeSourcesCache = null;
  cacheTimestamp = 0;
};

// Legacy export for backward compatibility
export const additionalKnowledgeSources: KnowledgeSource[] = [];

// Initialize with empty array - will be populated from database when needed
export default additionalKnowledgeSources;
