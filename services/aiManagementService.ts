import { supabase } from './supabase';

// AI Prompt Management
export interface AIPrompt {
  id: string;
  name: string;
  description: string;
  category: 'system' | 'context' | 'action' | 'custom';
  content: string;
  variables: string[]; // Variables that can be interpolated like {{context}}
  isActive: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// Knowledge Source Management
export interface KnowledgeSource {
  id: string;
  name: string;
  description: string;
  content: string;
  keywords: string[];
  category: string;
  priority: number;
  language: 'sv' | 'en' | 'both';
  isActive: boolean;
  lastTrained: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  // External source fields
  sourceType?: 'internal' | 'external' | 'forum' | 'webpage' | 'api';
  sourceUrl?: string;
  fetchFrequency?: 'manual' | 'daily' | 'weekly' | 'monthly';
  lastFetched?: string | null;
  fetchStatus?: 'pending' | 'success' | 'failed' | 'disabled';
  fetchError?: string | null;
  autoFetch?: boolean;
  contentSelector?: string;
  maxContentLength?: number;
  requiresAuth?: boolean;
  authConfig?: any;
}

// External Source Configuration
export interface ExternalSourceConfig {
  id: string;
  sourceId: string;
  configType: 'auth' | 'parser' | 'filter' | 'transformer';
  configData: any;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Fetch History
export interface FetchHistory {
  id: string;
  sourceId: string;
  fetchedAt: string;
  status: 'success' | 'failed' | 'partial';
  contentLength?: number;
  errorMessage?: string;
  fetchDurationMs?: number;
  contentHash?: string;
}

// AI Configuration
export interface AIConfig {
  id: string;
  model: string;
  temperature: number;
  maxTokens: number;
  systemPromptId: string;
  contextPromptId: string;
  actionPromptId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// AI Training Status
export interface AITrainingStatus {
  isTraining: boolean;
  lastTraining: string | null;
  trainingProgress: number;
  trainingMessage: string;
  errorMessage: string | null;
}

class AIManagementService {
  private trainingStatus: AITrainingStatus = {
    isTraining: false,
    lastTraining: null,
    trainingProgress: 0,
    trainingMessage: '',
    errorMessage: null
  };

  // ===== PROMPT MANAGEMENT =====

  async getPrompts(): Promise<AIPrompt[]> {
    const { data, error } = await supabase
      .from('ai_prompts')
      .select('*')
      .order('priority', { ascending: true });

    if (error) throw error;
    
    // Convert database snake_case to camelCase
    return (data || []).map((dbPrompt: any) => ({
      id: dbPrompt.id,
      name: dbPrompt.name,
      description: dbPrompt.description,
      category: dbPrompt.category,
      content: dbPrompt.content,
      variables: dbPrompt.variables || [],
      isActive: dbPrompt.is_active,
      priority: dbPrompt.priority,
      createdAt: dbPrompt.created_at,
      updatedAt: dbPrompt.updated_at,
      createdBy: dbPrompt.created_by
    }));
  }

  async getPrompt(id: string): Promise<AIPrompt | null> {
    const { data, error } = await supabase
      .from('ai_prompts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return null;
    
    // Convert database snake_case to camelCase
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      category: data.category,
      content: data.content,
      variables: data.variables || [],
      isActive: data.is_active,
      priority: data.priority,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: data.created_by
    };
  }

  async createPrompt(prompt: Omit<AIPrompt, 'id' | 'createdAt' | 'updatedAt'>): Promise<AIPrompt> {
    const { data, error } = await supabase
      .from('ai_prompts')
      .insert([{
        ...prompt,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updatePrompt(id: string, updates: Partial<AIPrompt>): Promise<AIPrompt> {
    const { data, error } = await supabase
      .from('ai_prompts')
      .update({
        ...updates,
        updatedAt: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deletePrompt(id: string): Promise<void> {
    const { error } = await supabase
      .from('ai_prompts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // ===== KNOWLEDGE SOURCE MANAGEMENT =====

  // Helper function to convert database fields to camelCase
  private convertDbToCamelCase(dbSource: any): KnowledgeSource {
    return {
      id: dbSource.id,
      name: dbSource.name,
      description: dbSource.description,
      content: dbSource.content,
      keywords: dbSource.keywords || [],
      category: dbSource.category,
      priority: dbSource.priority,
      language: dbSource.language,
      isActive: dbSource.is_active,
      lastTrained: dbSource.last_trained,
      createdAt: dbSource.created_at,
      updatedAt: dbSource.updated_at,
      createdBy: dbSource.created_by,
      // External source fields
      sourceType: dbSource.source_type,
      sourceUrl: dbSource.source_url,
      fetchFrequency: dbSource.fetch_frequency,
      lastFetched: dbSource.last_fetched,
      fetchStatus: dbSource.fetch_status,
      fetchError: dbSource.fetch_error,
      autoFetch: dbSource.auto_fetch,
      contentSelector: dbSource.content_selector,
      maxContentLength: dbSource.max_content_length,
      requiresAuth: dbSource.requires_auth,
      authConfig: dbSource.auth_config
    };
  }

  async getKnowledgeSources(): Promise<KnowledgeSource[]> {
    const { data, error } = await supabase
      .from('ai_knowledge_sources')
      .select('*')
      .order('priority', { ascending: true });

    if (error) {
      console.error('Error fetching knowledge sources:', error);
      throw error;
    }
    
    return (data || []).map(this.convertDbToCamelCase);
  }

  async getKnowledgeSource(id: string): Promise<KnowledgeSource | null> {
    const { data, error } = await supabase
      .from('ai_knowledge_sources')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No rows found
      }
      console.error('Error fetching knowledge source:', error);
      throw error;
    }
    
    return this.convertDbToCamelCase(data);
  }

  async createKnowledgeSource(source: Omit<KnowledgeSource, 'id' | 'createdAt' | 'updatedAt' | 'lastTrained'>): Promise<KnowledgeSource> {
    // Convert camelCase to snake_case for database
    const dbSource = {
      name: source.name,
      description: source.description,
      content: source.content,
      keywords: source.keywords,
      category: source.category,
      priority: source.priority,
      language: source.language,
      is_active: source.isActive,
      created_by: source.createdBy || 'system', // Provide default if not specified
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_trained: null,
      // External source fields
      source_type: source.sourceType || 'internal',
      source_url: source.sourceUrl,
      fetch_frequency: source.fetchFrequency || 'manual',
      last_fetched: source.lastFetched,
      fetch_status: source.fetchStatus || 'pending',
      fetch_error: source.fetchError,
      auto_fetch: source.autoFetch || false,
      content_selector: source.contentSelector,
      max_content_length: source.maxContentLength || 10000,
      requires_auth: source.requiresAuth || false,
      auth_config: source.authConfig
    };

    const { data, error } = await supabase
      .from('ai_knowledge_sources')
      .insert([dbSource])
      .select()
      .single();

    if (error) {
      console.error('Error creating knowledge source:', error);
      throw error;
    }
    return this.convertDbToCamelCase(data);
  }

  async updateKnowledgeSource(id: string, updates: Partial<KnowledgeSource>): Promise<KnowledgeSource> {
    // Convert camelCase to snake_case for database
    const dbUpdates: any = {
      updated_at: new Date().toISOString()
    };

    // Map camelCase fields to snake_case
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.content !== undefined) dbUpdates.content = updates.content;
    if (updates.keywords !== undefined) dbUpdates.keywords = updates.keywords;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
    if (updates.language !== undefined) dbUpdates.language = updates.language;
    if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;
    if (updates.createdBy !== undefined) dbUpdates.created_by = updates.createdBy;
    if (updates.lastTrained !== undefined) dbUpdates.last_trained = updates.lastTrained;
    
    // External source fields
    if (updates.sourceType !== undefined) dbUpdates.source_type = updates.sourceType;
    if (updates.sourceUrl !== undefined) dbUpdates.source_url = updates.sourceUrl;
    if (updates.fetchFrequency !== undefined) dbUpdates.fetch_frequency = updates.fetchFrequency;
    if (updates.lastFetched !== undefined) dbUpdates.last_fetched = updates.lastFetched;
    if (updates.fetchStatus !== undefined) dbUpdates.fetch_status = updates.fetchStatus;
    if (updates.fetchError !== undefined) dbUpdates.fetch_error = updates.fetchError;
    if (updates.autoFetch !== undefined) dbUpdates.auto_fetch = updates.autoFetch;
    if (updates.contentSelector !== undefined) dbUpdates.content_selector = updates.contentSelector;
    if (updates.maxContentLength !== undefined) dbUpdates.max_content_length = updates.maxContentLength;
    if (updates.requiresAuth !== undefined) dbUpdates.requires_auth = updates.requiresAuth;
    if (updates.authConfig !== undefined) dbUpdates.auth_config = updates.authConfig;

    const { data, error } = await supabase
      .from('ai_knowledge_sources')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating knowledge source:', error);
      throw error;
    }
    return this.convertDbToCamelCase(data);
  }

  async deleteKnowledgeSource(id: string): Promise<void> {
    const { error } = await supabase
      .from('ai_knowledge_sources')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // ===== AI CONFIGURATION =====

  async getAIConfig(): Promise<AIConfig | null> {
    try {
      const { data, error } = await supabase
        .from('ai_config')
        .select('*')
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching AI config:', error);
        return null;
      }
      return data;
    } catch (error) {
      console.error('Failed to fetch AI config:', error);
      return null;
    }
  }

  async updateAIConfig(config: Partial<AIConfig>): Promise<AIConfig> {
    const { data, error } = await supabase
      .from('ai_config')
      .upsert([{
        ...config,
        updatedAt: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // ===== PROMPT COMPILATION =====

  async compileSystemPrompt(context: any = {}): Promise<string> {
    try {
      const config = await this.getAIConfig();
      if (!config) {
        console.warn('No AI configuration found, using fallback prompt');
        return this.getFallbackSystemPrompt(context);
      }

      const systemPrompt = await this.getPrompt(config.systemPromptId);
      const contextPrompt = await this.getPrompt(config.contextPromptId);
      const actionPrompt = await this.getPrompt(config.actionPromptId);

      if (!systemPrompt) {
        console.warn('System prompt not found, using fallback prompt');
        return this.getFallbackSystemPrompt(context);
      }

      let compiledPrompt = systemPrompt.content;

      // Add context prompt if available
      if (contextPrompt) {
        compiledPrompt += `\n\n${contextPrompt.content}`;
      }

      // Add action prompt if available
      if (actionPrompt) {
        compiledPrompt += `\n\n${actionPrompt.content}`;
      }

      // Interpolate variables
      compiledPrompt = this.interpolateVariables(compiledPrompt, context);

      return compiledPrompt;
    } catch (error) {
      console.error('Error compiling system prompt:', error);
      return this.getFallbackSystemPrompt(context);
    }
  }

  private getFallbackSystemPrompt(context: any = {}): string {
    return `Du är en hjälpsam AI-assistent för ett träningshanteringssystem. Använd följande information för att svara på användarens frågor:

${context.context || 'No context available'}

VIKTIGA INSTRUKTIONER:
- Svara på svenska om användaren skriver på svenska, annars på engelska
- Var hjälpsam, vänlig och professionell
- ANVÄND ALLTID KONTEXTINFORMATIONEN för att förstå vad användaren menar
- BÖRJA ALLTID med att förklara din tolkning av kontexten innan du ger svaret
- Ge praktiska exempel när det är lämpligt
- Citera relevanta delar av dokumentationen när det hjälper
- Om du verkligen inte vet svaret, säg det tydligt

VIKTIGT - Externa källor (External Sources):
- När du refererar till externa källor (forum, webbsidor, API:er), markera dem tydligt
- Använd formatet: "Enligt [källnamn](URL) (extern källa)" för externa källor
- Externa källor ska alltid öppnas i nya flikar
- Skilj mellan interna källor (systemdokumentation) och externa källor (forum, webbsidor, API:er)
- Exempel: "Enligt Training Management Forum (extern källa)" eller "Baserat på API-dokumentationen (extern källa)"

VIKTIGT - Interaktiva åtgärder (AI actions):
- Efter ditt svar, om det är relevant, lägg till en eller flera åtgärdshints på separata rader i formatet [action:NAMN nyckel=värde ...]
- Stödda åtgärder:
  - navigate view=public|admin|attendance|users|trainings|tour-management|shoutout-management
  - open_help id=overview|vouchers|user-management|training-management|subscriptions|attendance|troubleshooting
  - start_tour tourId="tour-id" (starta en guidad rundtur)
  - add_user (öppna formuläret för att lägga till användare)
  - add_training (öppna formuläret för att lägga till träning)
  - create_tour (öppna formuläret för att skapa rundtur)
  - create_shoutout (öppna formuläret för att skapa shoutout)
- När du förklarar hur man skapar något, lägg alltid till en följdfråga som "Vill du att jag gör det åt dig?" (svenska) eller "Do you want me to do this for you?" (engelska)
- Exempel: [action:add_user] eller [action:add_training]

Viktigt: Skriv alltid din naturliga text först. Lägg därefter (om relevant) till åtgärdshints på egna rader.`;
  }

  private interpolateVariables(template: string, context: any): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return context[key] || match;
    });
  }

  // ===== KNOWLEDGE SOURCE COMPILATION =====

  async compileKnowledgeSources(language: 'sv' | 'en' = 'sv'): Promise<string> {
    const sources = await this.getKnowledgeSources();
    const activeSources = sources.filter(s => s.isActive && (s.language === language || s.language === 'both'));

    let compiledKnowledge = '';
    
    activeSources.forEach(source => {
      compiledKnowledge += `\n\n## ${source.name}\n`;
      compiledKnowledge += `${source.description}\n\n`;
      compiledKnowledge += `${source.content}\n`;
      if (source.keywords.length > 0) {
        compiledKnowledge += `\nKeywords: ${source.keywords.join(', ')}\n`;
      }
    });

    return compiledKnowledge;
  }

  // ===== AI TRAINING =====

  async retrainAI(): Promise<void> {
    if (this.trainingStatus.isTraining) {
      throw new Error('AI training is already in progress');
    }

    this.trainingStatus = {
      isTraining: true,
      lastTraining: null,
      trainingProgress: 0,
      trainingMessage: 'Starting AI re-training...',
      errorMessage: null
    };

    try {
      // Update all knowledge sources with new training timestamp
      this.trainingStatus.trainingMessage = 'Updating knowledge sources...';
      this.trainingStatus.trainingProgress = 25;

      const sources = await this.getKnowledgeSources();
      const activeSources = sources.filter(s => s.isActive);

      for (let i = 0; i < activeSources.length; i++) {
        const source = activeSources[i];
        await this.updateKnowledgeSource(source.id, {
          lastTrained: new Date().toISOString()
        });

        this.trainingStatus.trainingProgress = 25 + (i / activeSources.length) * 50;
        this.trainingStatus.trainingMessage = `Training source: ${source.name}`;
      }

      // Simulate AI model re-training (in a real implementation, this would call the AI service)
      this.trainingStatus.trainingMessage = 'Re-training AI model...';
      this.trainingStatus.trainingProgress = 75;

      // Simulate training time
      await new Promise(resolve => setTimeout(resolve, 2000));

      this.trainingStatus = {
        isTraining: false,
        lastTraining: new Date().toISOString(),
        trainingProgress: 100,
        trainingMessage: 'AI re-training completed successfully!',
        errorMessage: null
      };

    } catch (error) {
      this.trainingStatus = {
        isTraining: false,
        lastTraining: null,
        trainingProgress: 0,
        trainingMessage: '',
        errorMessage: error instanceof Error ? error.message : 'Unknown error occurred'
      };
      throw error;
    }
  }

  getTrainingStatus(): AITrainingStatus {
    return { ...this.trainingStatus };
  }

  // ===== TESTING =====

  async testPrompt(promptId: string, testContext: any = {}): Promise<string> {
    const prompt = await this.getPrompt(promptId);
    if (!prompt) {
      throw new Error('Prompt not found');
    }

    const compiledPrompt = this.interpolateVariables(prompt.content, testContext);
    
    // In a real implementation, this would send a test request to the AI
    return `Test prompt compiled successfully:\n\n${compiledPrompt}`;
  }

  async testKnowledgeSource(sourceId: string): Promise<string> {
    const source = await this.getKnowledgeSource(sourceId);
    if (!source) {
      throw new Error('Knowledge source not found');
    }

    return `Knowledge source test:\n\nName: ${source.name}\nContent: ${source.content.substring(0, 200)}...`;
  }

  // ===== EXTERNAL SOURCE MANAGEMENT =====

  async getExternalSources(): Promise<KnowledgeSource[]> {
    const { data, error } = await supabase
      .from('ai_knowledge_sources')
      .select('*')
      .neq('source_type', 'internal')
      .order('priority', { ascending: true });

    if (error) {
      console.error('Error fetching external sources:', error);
      throw error;
    }
    return (data || []).map(this.convertDbToCamelCase);
  }

  async fetchExternalSource(sourceId: string): Promise<any> {
    const startTime = Date.now();
    
    try {
      // First, get the source details
      const source = await this.getKnowledgeSource(sourceId);
      if (!source || !source.sourceUrl) {
        throw new Error('Source not found or no URL provided');
      }

      // Try to use RPC function first
      try {
        const { data, error } = await supabase.rpc('fetch_external_source_content', {
          source_id: sourceId
        });

        if (!error && data) {
          return data;
        }
      } catch (rpcError) {
        console.warn('RPC function not available, using client-side fetch:', rpcError);
      }

      // Fallback: client-side fetch
      console.log('Fetching content from:', source.sourceUrl);
      
      let response;
      let content;
      
      // Try direct fetch first
      try {
        response = await fetch(source.sourceUrl, {
          method: 'GET',
          mode: 'cors',
          headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
          }
        });
      } catch (corsError) {
        console.warn('Direct fetch failed due to CORS, trying proxy:', corsError);
        
        // Try with a CORS proxy
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(source.sourceUrl)}`;
        response = await fetch(proxyUrl, {
          method: 'GET',
          headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
          }
        });
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      content = await response.text();
      const contentLength = content.length;
      const maxLength = source.maxContentLength || 10000;
      
      // Truncate content if too long
      const truncatedContent = content.length > maxLength 
        ? content.substring(0, maxLength) + '... [Content truncated]'
        : content;

        // Update the source with fetched content
        await this.updateKnowledgeSource(sourceId, {
          content: truncatedContent,
          fetchStatus: 'success',
          lastFetched: new Date().toISOString(),
          fetchError: null
        });

        // Record fetch history
        await this.recordFetchHistory(sourceId, {
          status: 'success',
          contentLength,
          fetchDurationMs: Date.now() - startTime,
          contentHash: this.generateContentHash(truncatedContent)
        });

        return { 
          success: true, 
          contentLength,
          message: `Successfully fetched ${contentLength} characters from ${source.sourceUrl}` 
        };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error fetching external source:', err);
      
      // Update status to failed
      await this.updateKnowledgeSource(sourceId, {
        fetchStatus: 'failed',
        fetchError: errorMessage
      });

      // Record failed fetch in history
      await this.recordFetchHistory(sourceId, {
        status: 'failed',
        errorMessage,
        fetchDurationMs: Date.now() - startTime
      });

      throw err;
    }
  }

  private generateContentHash(content: string): string {
    // Simple hash function for content
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  private async recordFetchHistory(sourceId: string, data: {
    status: 'success' | 'failed' | 'partial';
    contentLength?: number;
    errorMessage?: string;
    fetchDurationMs?: number;
    contentHash?: string;
  }): Promise<void> {
    try {
      const { error } = await supabase
        .from('ai_source_fetch_history')
        .insert([{
          source_id: sourceId,
          fetched_at: new Date().toISOString(),
          status: data.status,
          content_length: data.contentLength,
          error_message: data.errorMessage,
          fetch_duration_ms: data.fetchDurationMs,
          content_hash: data.contentHash
        }]);

      if (error) {
        console.error('Error recording fetch history:', error);
      }
    } catch (err) {
      console.error('Error recording fetch history:', err);
    }
  }

  async getSourcesNeedingFetch(): Promise<KnowledgeSource[]> {
    const { data, error } = await supabase.rpc('get_sources_needing_fetch');

    if (error) throw error;
    return data || [];
  }

  async getFetchHistory(sourceId: string): Promise<FetchHistory[]> {
    const { data, error } = await supabase
      .from('ai_source_fetch_history')
      .select('*')
      .eq('source_id', sourceId)
      .order('fetched_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching fetch history:', error);
      throw error;
    }
    
    // Convert database fields to camelCase
    return (data || []).map((entry: any) => ({
      id: entry.id,
      sourceId: entry.source_id,
      fetchedAt: entry.fetched_at,
      status: entry.status,
      contentLength: entry.content_length,
      errorMessage: entry.error_message,
      fetchDurationMs: entry.fetch_duration_ms,
      contentHash: entry.content_hash
    }));
  }

  async getExternalSourceConfigs(sourceId: string): Promise<ExternalSourceConfig[]> {
    const { data, error } = await supabase
      .from('ai_external_source_configs')
      .select('*')
      .eq('source_id', sourceId)
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async createExternalSourceConfig(config: Omit<ExternalSourceConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<ExternalSourceConfig> {
    const { data, error } = await supabase
      .from('ai_external_source_configs')
      .insert([{
        ...config,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateExternalSourceConfig(id: string, updates: Partial<ExternalSourceConfig>): Promise<ExternalSourceConfig> {
    const { data, error } = await supabase
      .from('ai_external_source_configs')
      .update({
        ...updates,
        updatedAt: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteExternalSourceConfig(id: string): Promise<void> {
    const { error } = await supabase
      .from('ai_external_source_configs')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // ===== BULK OPERATIONS =====

  async fetchAllPendingSources(): Promise<any[]> {
    const sources = await this.getSourcesNeedingFetch();
    const results = [];

    for (const source of sources) {
      try {
        const result = await this.fetchExternalSource(source.id);
        results.push({ sourceId: source.id, success: true, result });
      } catch (error) {
        results.push({ 
          sourceId: source.id, 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    return results;
  }

  async testExternalSource(sourceId: string): Promise<string> {
    const source = await this.getKnowledgeSource(sourceId);
    if (!source) {
      throw new Error('External source not found');
    }

    if (source.sourceType === 'internal') {
      throw new Error('Source is not external');
    }

    return `External source test:\n\nName: ${source.name}\nURL: ${source.sourceUrl}\nType: ${source.sourceType}\nAuto-fetch: ${source.autoFetch}\nLast fetched: ${source.lastFetched || 'Never'}`;
  }
}

export const aiManagementService = new AIManagementService();
