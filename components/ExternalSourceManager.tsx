import React, { useState, useEffect } from 'react';
import { useTranslations } from '../hooks/useTranslations';
import { 
  aiManagementService, 
  type KnowledgeSource, 
  type FetchHistory,
  type ExternalSourceConfig 
} from '../services/aiManagementService';

interface ExternalSourceManagerProps {
  onClose: () => void;
}

export const ExternalSourceManager: React.FC<ExternalSourceManagerProps> = ({ onClose }) => {
  const { t } = useTranslations();
  const [externalSources, setExternalSources] = useState<KnowledgeSource[]>([]);
  const [selectedSource, setSelectedSource] = useState<KnowledgeSource | null>(null);
  const [fetchHistory, setFetchHistory] = useState<FetchHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingSource, setEditingSource] = useState<KnowledgeSource | null>(null);
  const [newSource, setNewSource] = useState({
    name: '',
    description: '',
    sourceUrl: '',
    sourceType: 'webpage' as 'forum' | 'webpage' | 'api' | 'external',
    category: 'business',
    keywords: '',
    language: 'both' as 'sv' | 'en' | 'both',
    priority: 5,
    autoFetch: false,
    fetchFrequency: 'weekly' as 'manual' | 'daily' | 'weekly' | 'monthly',
    contentSelector: '',
    maxContentLength: 10000,
    requiresAuth: false,
    authConfig: '',
    manualContent: ''
  });

  // Load external sources on mount
  useEffect(() => {
    loadExternalSources();
  }, []);

  // Load fetch history when source is selected
  useEffect(() => {
    if (selectedSource) {
      loadFetchHistory(selectedSource.id);
    }
  }, [selectedSource]);

  const loadExternalSources = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const sources = await aiManagementService.getExternalSources();
      setExternalSources(sources);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load external sources');
    } finally {
      setIsLoading(false);
    }
  };

  const loadFetchHistory = async (sourceId: string) => {
    try {
      const history = await aiManagementService.getFetchHistory(sourceId);
      setFetchHistory(history);
    } catch (err) {
      console.error('Failed to load fetch history:', err);
    }
  };

  const handleFetchSource = async (sourceId: string) => {
    setIsFetching(true);
    setError(null);
    
    try {
      await aiManagementService.fetchExternalSource(sourceId);
      await loadExternalSources();
      if (selectedSource && selectedSource.id === sourceId) {
        await loadFetchHistory(sourceId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch source');
    } finally {
      setIsFetching(false);
    }
  };

  const handleFetchAllPending = async () => {
    setIsFetching(true);
    setError(null);
    
    try {
      const results = await aiManagementService.fetchAllPendingSources();
      await loadExternalSources();
      console.log('Fetch results:', results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sources');
    } finally {
      setIsFetching(false);
    }
  };

  const handleCreateSource = async () => {
    if (!newSource.name.trim() || !newSource.sourceUrl.trim()) {
      setError('Name and URL are required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const sourceData = {
        name: newSource.name.trim(),
        description: newSource.description.trim(),
        content: newSource.manualContent.trim() || '', // Use manual content if provided
        keywords: newSource.keywords.split(',').map(k => k.trim()).filter(k => k),
        category: newSource.category,
        priority: newSource.priority,
        language: newSource.language,
        isActive: true,
        createdBy: 'admin', // You might want to get this from user context
        sourceType: newSource.sourceType,
        sourceUrl: newSource.sourceUrl.trim(),
        autoFetch: newSource.autoFetch,
        fetchFrequency: newSource.fetchFrequency,
        contentSelector: newSource.contentSelector.trim(),
        maxContentLength: newSource.maxContentLength,
        requiresAuth: newSource.requiresAuth,
        authConfig: newSource.authConfig.trim() ? JSON.parse(newSource.authConfig) : null
      };

      await aiManagementService.createKnowledgeSource(sourceData);
      await loadExternalSources();
      setIsCreating(false);
      setNewSource({
        name: '',
        description: '',
        sourceUrl: '',
        sourceType: 'webpage',
        category: 'business',
        keywords: '',
        language: 'both',
        priority: 5,
        autoFetch: false,
        fetchFrequency: 'weekly',
        contentSelector: '',
        maxContentLength: 10000,
        requiresAuth: false,
        authConfig: ''
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create external source');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSource = (source: KnowledgeSource) => {
    setEditingSource(source);
    setNewSource({
      name: source.name,
      description: source.description,
      sourceUrl: source.sourceUrl || '',
      sourceType: source.sourceType || 'webpage',
      category: source.category,
      keywords: source.keywords.join(', '),
      language: source.language,
      priority: source.priority,
      autoFetch: source.autoFetch || false,
      fetchFrequency: source.fetchFrequency || 'weekly',
      contentSelector: source.contentSelector || '',
      maxContentLength: source.maxContentLength || 10000,
      requiresAuth: source.requiresAuth || false,
      authConfig: source.authConfig ? JSON.stringify(source.authConfig, null, 2) : '',
      manualContent: source.content || ''
    });
    setIsEditing(true);
  };

  const handleUpdateSource = async () => {
    if (!editingSource || !newSource.name.trim() || !newSource.sourceUrl.trim()) {
      setError('Name and URL are required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const updateData = {
        name: newSource.name.trim(),
        description: newSource.description.trim(),
        content: newSource.manualContent.trim() || editingSource?.content || '', // Use manual content if provided
        keywords: newSource.keywords.split(',').map(k => k.trim()).filter(k => k),
        category: newSource.category,
        priority: newSource.priority,
        language: newSource.language,
        isActive: true,
        sourceType: newSource.sourceType,
        sourceUrl: newSource.sourceUrl.trim(),
        autoFetch: newSource.autoFetch,
        fetchFrequency: newSource.fetchFrequency,
        contentSelector: newSource.contentSelector.trim(),
        maxContentLength: newSource.maxContentLength,
        requiresAuth: newSource.requiresAuth,
        authConfig: newSource.authConfig.trim() ? JSON.parse(newSource.authConfig) : null
      };

      await aiManagementService.updateKnowledgeSource(editingSource.id, updateData);
      await loadExternalSources();
      setIsEditing(false);
      setEditingSource(null);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update external source');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setNewSource({
      name: '',
      description: '',
      sourceUrl: '',
      sourceType: 'webpage',
      category: 'business',
      keywords: '',
      language: 'both',
      priority: 5,
      autoFetch: false,
      fetchFrequency: 'weekly',
      contentSelector: '',
      maxContentLength: 10000,
      requiresAuth: false,
      authConfig: '',
      manualContent: ''
    });
  };

  const handleDeleteSource = async (source: KnowledgeSource) => {
    if (!confirm(`Are you sure you want to delete "${source.name}"? This action cannot be undone.`)) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await aiManagementService.deleteKnowledgeSource(source.id);
      await loadExternalSources();
      
      // Clear selection if the deleted source was selected
      if (selectedSource && selectedSource.id === source.id) {
        setSelectedSource(null);
        setFetchHistory([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete external source');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'disabled': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSourceTypeColor = (type: string) => {
    switch (type) {
      case 'forum': return 'text-blue-600 bg-blue-100';
      case 'webpage': return 'text-green-600 bg-green-100';
      case 'api': return 'text-purple-600 bg-purple-100';
      case 'external': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{t('loadingAIAdministration')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{t('externalSources')}</h2>
            <p className="text-sm text-gray-600 mt-1">{t('externalSourceHelp')}</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setIsCreating(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              {t('addExternalSource')}
            </button>
            <button
              onClick={handleFetchAllPending}
              disabled={isFetching}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isFetching ? t('fetchInProgress') : t('fetchAllPending')}
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {(isCreating || isEditing) ? (
            <div className="p-6 overflow-y-auto">
              <div className="max-w-2xl mx-auto">
                <h3 className="text-xl font-semibold mb-4">
                  {isEditing ? t('editExternalSource') : t('addExternalSource')}
                </h3>
                <div className="bg-white rounded-lg shadow-sm border p-6 space-y-4 pb-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('sourceName')}</label>
                      <input
                        type="text"
                        value={newSource.name}
                        onChange={(e) => setNewSource({ ...newSource, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Training Management Forum"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('sourceType')}</label>
                      <select
                        value={newSource.sourceType}
                        onChange={(e) => setNewSource({ ...newSource, sourceType: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="webpage">{t('webpage')}</option>
                        <option value="forum">{t('forum')}</option>
                        <option value="api">{t('api')}</option>
                        <option value="external">{t('external')}</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('sourceUrl')}</label>
                    <input
                      type="url"
                      value={newSource.sourceUrl}
                      onChange={(e) => setNewSource({ ...newSource, sourceUrl: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={t('urlPlaceholder')}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('sourceDescription')}</label>
                    <textarea
                      value={newSource.description}
                      onChange={(e) => setNewSource({ ...newSource, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Description of the external source..."
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('keywords')}</label>
                      <input
                        type="text"
                        value={newSource.keywords}
                        onChange={(e) => setNewSource({ ...newSource, keywords: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={t('keywordPlaceholder')}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('sourceLanguage')}</label>
                      <select
                        value={newSource.language}
                        onChange={(e) => setNewSource({ ...newSource, language: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="both">{t('both')}</option>
                        <option value="sv">{t('swedish')}</option>
                        <option value="en">{t('english')}</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('sourcePriority')}</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={newSource.priority}
                        onChange={(e) => setNewSource({ ...newSource, priority: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('fetchFrequency')}</label>
                      <select
                        value={newSource.fetchFrequency}
                        onChange={(e) => setNewSource({ ...newSource, fetchFrequency: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="manual">{t('manual')}</option>
                        <option value="daily">{t('daily')}</option>
                        <option value="weekly">{t('weekly')}</option>
                        <option value="monthly">{t('monthly')}</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newSource.autoFetch}
                        onChange={(e) => setNewSource({ ...newSource, autoFetch: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">{t('autoFetch')}</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newSource.requiresAuth}
                        onChange={(e) => setNewSource({ ...newSource, requiresAuth: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">{t('requiresAuth')}</span>
                    </label>
                  </div>
                  
                  {newSource.requiresAuth && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('authConfig')}</label>
                      <textarea
                        value={newSource.authConfig}
                        onChange={(e) => setNewSource({ ...newSource, authConfig: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        placeholder={t('authConfigPlaceholder')}
                      />
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('contentSelector')}</label>
                    <input
                      type="text"
                      value={newSource.contentSelector}
                      onChange={(e) => setNewSource({ ...newSource, contentSelector: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={t('selectorPlaceholder')}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Manual Content (if scraping fails)</label>
                    <textarea
                      value={newSource.manualContent}
                      onChange={(e) => setNewSource({ ...newSource, manualContent: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={4}
                      placeholder="Paste content here if automatic scraping doesn't work..."
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      onClick={() => {
                        setIsCreating(false);
                        setIsEditing(false);
                        setEditingSource(null);
                        resetForm();
                      }}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      {t('cancel')}
                    </button>
                    <button
                      onClick={isEditing ? handleUpdateSource : handleCreateSource}
                      disabled={isLoading}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      {isLoading ? t('saving') : t('save')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full p-6">
              {/* Sources List */}
              <div className="bg-gray-50 rounded-lg p-4 overflow-y-auto">
                <h3 className="text-lg font-semibold mb-4">{t('availableSources')}</h3>
                
                {externalSources.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">{t('noExternalSources')}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {externalSources.map((source) => (
                      <div
                        key={source.id}
                        className={`p-4 bg-white rounded-lg border cursor-pointer transition-colors ${
                          selectedSource?.id === source.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedSource(source)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium text-gray-900">{source.name}</h4>
                              <span className={`px-2 py-1 text-xs rounded ${getSourceTypeColor(source.sourceType || 'external')}`}>
                                {t(source.sourceType || 'external')}
                              </span>
                              <span className={`px-2 py-1 text-xs rounded ${getStatusColor(source.fetchStatus || 'pending')}`}>
                                {t(source.fetchStatus || 'pending')}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{source.description}</p>
                            {source.sourceUrl && (
                              <p className="text-xs text-gray-500 mt-1 truncate">
                                {source.sourceUrl}
                              </p>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditSource(source);
                              }}
                              className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                            >
                              {t('edit')}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleFetchSource(source.id);
                              }}
                              disabled={isFetching}
                              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                            >
                              {t('fetchNow')}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteSource(source);
                              }}
                              className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                            >
                              {t('delete')}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Source Details */}
              <div className="bg-gray-50 rounded-lg p-4 overflow-y-auto">
                {selectedSource ? (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">{t('sourceDetails')}</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900">{selectedSource.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{selectedSource.description}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">{t('sourceType')}:</span>
                          <span className={`ml-2 px-2 py-1 text-xs rounded ${getSourceTypeColor(selectedSource.sourceType || 'external')}`}>
                            {t(selectedSource.sourceType || 'external')}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">{t('fetchStatus')}:</span>
                          <span className={`ml-2 px-2 py-1 text-xs rounded ${getStatusColor(selectedSource.fetchStatus || 'pending')}`}>
                            {t(selectedSource.fetchStatus || 'pending')}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">{t('fetchFrequency')}:</span>
                          <span className="ml-2">{t(selectedSource.fetchFrequency || 'manual')}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">{t('lastFetched')}:</span>
                          <span className="ml-2">
                            {selectedSource.lastFetched 
                              ? new Date(selectedSource.lastFetched).toLocaleString()
                              : t('noContentFetched')
                            }
                          </span>
                        </div>
                      </div>

                      {selectedSource.sourceUrl && (
                        <div>
                          <span className="font-medium text-gray-700">{t('sourceUrl')}:</span>
                          <a 
                            href={selectedSource.sourceUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="ml-2 text-blue-600 hover:text-blue-800 underline"
                          >
                            {selectedSource.sourceUrl}
                          </a>
                        </div>
                      )}

                      {selectedSource.fetchError && (
                        <div className="bg-red-50 border border-red-200 rounded p-3">
                          <span className="font-medium text-red-800">{t('fetchError')}:</span>
                          <p className="text-sm text-red-700 mt-1">{selectedSource.fetchError}</p>
                        </div>
                      )}

                      {/* Fetched Content Display */}
                      {selectedSource.content && selectedSource.content.trim() !== '' && (
                        <div>
                          <h5 className="font-medium text-gray-700 mb-2">{t('sourceContent')}</h5>
                          <div className="bg-gray-50 border rounded p-3 max-h-64 overflow-y-auto">
                            <pre className="text-sm whitespace-pre-wrap break-words">
                              {selectedSource.content}
                            </pre>
                          </div>
                        </div>
                      )}

                      <div>
                        <h5 className="font-medium text-gray-700 mb-2">{t('fetchHistory')}</h5>
                        {fetchHistory.length === 0 ? (
                          <p className="text-sm text-gray-500">{t('noContentFetched')}</p>
                        ) : (
                          <div className="space-y-2">
                            {fetchHistory.map((entry) => (
                              <div key={entry.id} className="bg-white border rounded p-3">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <span className={`px-2 py-1 text-xs rounded ${getStatusColor(entry.status)}`}>
                                      {t(entry.status)}
                                    </span>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {entry.fetchedAt ? new Date(entry.fetchedAt).toLocaleString() : 'Unknown date'}
                                    </p>
                                  </div>
                                  <div className="text-right text-xs text-gray-500">
                                    {entry.contentLength && (
                                      <p>{entry.contentLength} chars</p>
                                    )}
                                    {entry.fetchDurationMs && (
                                      <p>{entry.fetchDurationMs}ms</p>
                                    )}
                                  </div>
                                </div>
                                {entry.errorMessage && (
                                  <p className="text-xs text-red-600 mt-2">{entry.errorMessage}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex justify-end space-x-3 pt-4 border-t">
                        <button
                          onClick={() => handleEditSource(selectedSource)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          {t('edit')}
                        </button>
                        <button
                          onClick={() => handleDeleteSource(selectedSource)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          {t('delete')}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">{t('selectSourceToView')}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mx-6 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{t('error')}</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};