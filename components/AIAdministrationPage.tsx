import React, { useState, useEffect } from 'react';
import { useTranslations } from '../hooks/useTranslations';
import { useAuth } from '../contexts/AuthContext';
import { 
  aiManagementService, 
  type AIPrompt, 
  type KnowledgeSource, 
  type AIConfig,
  type AITrainingStatus 
} from '../services/aiManagementService';

interface AIAdministrationPageProps {
  onClose: () => void;
}

type TabType = 'prompts' | 'knowledge' | 'config' | 'training';

export const AIAdministrationPage: React.FC<AIAdministrationPageProps> = ({ onClose }) => {
  const { t } = useTranslations();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('prompts');
  
  // Prompts state
  const [prompts, setPrompts] = useState<AIPrompt[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<AIPrompt | null>(null);
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);
  const [promptForm, setPromptForm] = useState<Partial<AIPrompt>>({});
  
  // Knowledge sources state
  const [knowledgeSources, setKnowledgeSources] = useState<KnowledgeSource[]>([]);
  const [selectedSource, setSelectedSource] = useState<KnowledgeSource | null>(null);
  const [isEditingSource, setIsEditingSource] = useState(false);
  const [sourceForm, setSourceForm] = useState<Partial<KnowledgeSource>>({});
  
  // AI Config state
  const [aiConfig, setAiConfig] = useState<AIConfig | null>(null);
  const [configForm, setConfigForm] = useState<Partial<AIConfig>>({});
  
  // Training state
  const [trainingStatus, setTrainingStatus] = useState<AITrainingStatus>({
    isTraining: false,
    lastTraining: null,
    trainingProgress: 0,
    trainingMessage: '',
    errorMessage: null
  });
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [externalSources, setExternalSources] = useState<KnowledgeSource[]>([]);
  const [isCreatingExternalSource, setIsCreatingExternalSource] = useState(false);
  const [externalSourceForm, setExternalSourceForm] = useState({
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

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Update training status periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setTrainingStatus(aiManagementService.getTrainingStatus());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [promptsData, sourcesData, externalSourcesData, configData] = await Promise.all([
        aiManagementService.getPrompts(),
        aiManagementService.getKnowledgeSources(),
        aiManagementService.getExternalSources(),
        aiManagementService.getAIConfig()
      ]);
      
      setPrompts(promptsData);
      setKnowledgeSources(sourcesData);
      setExternalSources(externalSourcesData);
      setAiConfig(configData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // ===== PROMPT MANAGEMENT =====

  const handleCreatePrompt = () => {
    setSelectedPrompt(null);
    setPromptForm({
      name: '',
      description: '',
      category: 'custom',
      content: '',
      variables: [],
      isActive: true,
      priority: 0,
      createdBy: user?.email || 'unknown'
    });
    setIsEditingPrompt(true);
  };

  const handleEditPrompt = (prompt: AIPrompt) => {
    setSelectedPrompt(prompt);
    setPromptForm(prompt);
    setIsEditingPrompt(true);
  };

  const handleSavePrompt = async () => {
    if (!promptForm.name || !promptForm.content) {
      setError('Name and content are required');
      return;
    }

    try {
      if (selectedPrompt) {
        await aiManagementService.updatePrompt(selectedPrompt.id, promptForm);
      } else {
        await aiManagementService.createPrompt(promptForm as Omit<AIPrompt, 'id' | 'createdAt' | 'updatedAt'>);
      }
      
      await loadData();
      setIsEditingPrompt(false);
      setSelectedPrompt(null);
      setPromptForm({});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save prompt');
    }
  };

  const handleDeletePrompt = async (id: string) => {
    if (!confirm('Are you sure you want to delete this prompt?')) return;
    
    try {
      await aiManagementService.deletePrompt(id);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete prompt');
    }
  };

  const handleTogglePromptActive = async (prompt: AIPrompt) => {
    try {
      const updatedPrompt = { ...prompt, isActive: !prompt.isActive };
      await aiManagementService.updatePrompt(prompt.id, updatedPrompt);
      await loadData();
      
      // Update selected prompt if it's the one being toggled
      if (selectedPrompt && selectedPrompt.id === prompt.id) {
        setSelectedPrompt(updatedPrompt);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle prompt status');
    }
  };

  // ===== KNOWLEDGE SOURCE MANAGEMENT =====

  const handleCreateSource = () => {
    setSelectedSource(null);
    setSourceForm({
      name: '',
      description: '',
      content: '',
      keywords: [],
      category: '',
      priority: 0,
      language: 'both',
      isActive: true,
      createdBy: user?.email || 'unknown'
    });
    setIsEditingSource(true);
  };

  const handleEditSource = (source: KnowledgeSource) => {
    setSelectedSource(source);
    setSourceForm(source);
    setIsEditingSource(true);
  };

  const handleSaveSource = async () => {
    if (!sourceForm.name || !sourceForm.content) {
      setError('Name and content are required');
      return;
    }

    try {
      // Convert keywords string to array
      const sourceData = {
        ...sourceForm,
        keywords: typeof sourceForm.keywords === 'string' 
          ? sourceForm.keywords.split(',').map(k => k.trim()).filter(k => k)
          : sourceForm.keywords || []
      };

      if (selectedSource) {
        await aiManagementService.updateKnowledgeSource(selectedSource.id, sourceData);
      } else {
        await aiManagementService.createKnowledgeSource(sourceData as Omit<KnowledgeSource, 'id' | 'createdAt' | 'updatedAt' | 'lastTrained'>);
      }
      
      await loadData();
      setIsEditingSource(false);
      setSelectedSource(null);
      setSourceForm({});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save knowledge source');
    }
  };

  const handleDeleteSource = async (id: string) => {
    if (!confirm('Are you sure you want to delete this knowledge source?')) return;
    
    try {
      await aiManagementService.deleteKnowledgeSource(id);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete knowledge source');
    }
  };

  const handleRefreshInternalSource = async (sourceId: string) => {
    try {
      // For internal sources, we can trigger a re-training or just refresh the data
      await loadData();
      // Refresh the selected source if it's the one being refreshed
      if (selectedSource && selectedSource.id === sourceId) {
        const updatedSource = await aiManagementService.getKnowledgeSource(sourceId);
        if (updatedSource) {
          setSelectedSource(updatedSource);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh internal source');
    }
  };

  const handleEditExternalSource = (source: KnowledgeSource) => {
    setSelectedSource(source);
    setIsEditingSource(true);
    setSourceForm({
      name: source.name,
      description: source.description,
      content: source.content,
      keywords: Array.isArray(source.keywords) ? source.keywords.join(', ') : (source.keywords || ''),
      category: source.category,
      priority: source.priority,
      language: source.language,
      isActive: source.isActive
    });
  };

  const handleFetchExternalSource = async (sourceId: string) => {
    try {
      await aiManagementService.fetchExternalSource(sourceId);
      await loadData();
      // Refresh the selected source if it's the one being fetched
      if (selectedSource && selectedSource.id === sourceId) {
        const updatedSource = await aiManagementService.getKnowledgeSource(sourceId);
        if (updatedSource) {
          setSelectedSource(updatedSource);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch external source');
    }
  };

  const handleDeleteExternalSource = async (source: KnowledgeSource) => {
    if (!confirm(`Are you sure you want to delete "${source.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await aiManagementService.deleteKnowledgeSource(source.id);
      await loadData();
      
      // Clear selection if the deleted source was selected
      if (selectedSource && selectedSource.id === source.id) {
        setSelectedSource(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete external source');
    }
  };

  const handleCreateExternalSource = () => {
    setIsCreatingExternalSource(true);
    setExternalSourceForm({
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

  const handleSaveExternalSource = async () => {
    if (!externalSourceForm.name.trim() || !externalSourceForm.sourceUrl.trim()) {
      setError('Name and URL are required');
      return;
    }

    try {
      const sourceData = {
        name: externalSourceForm.name.trim(),
        description: externalSourceForm.description.trim(),
        content: externalSourceForm.manualContent.trim() || '',
        keywords: externalSourceForm.keywords.split(',').map(k => k.trim()).filter(k => k),
        category: externalSourceForm.category,
        priority: externalSourceForm.priority,
        language: externalSourceForm.language,
        isActive: true,
        createdBy: 'admin',
        sourceType: externalSourceForm.sourceType,
        sourceUrl: externalSourceForm.sourceUrl.trim(),
        autoFetch: externalSourceForm.autoFetch,
        fetchFrequency: externalSourceForm.fetchFrequency,
        contentSelector: externalSourceForm.contentSelector.trim(),
        maxContentLength: externalSourceForm.maxContentLength,
        requiresAuth: externalSourceForm.requiresAuth,
        authConfig: externalSourceForm.authConfig.trim() ? JSON.parse(externalSourceForm.authConfig) : null
      };

      await aiManagementService.createKnowledgeSource(sourceData);
      await loadData();
      setIsCreatingExternalSource(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create external source');
    }
  };

  // ===== AI TRAINING =====

  const handleRetrainAI = async () => {
    try {
      await aiManagementService.retrainAI();
      await loadData(); // Reload to get updated timestamps
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to retrain AI');
    }
  };

  // ===== RENDER HELPERS =====

  const renderPromptsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">{t('aiPrompts')}</h2>
        <button
          onClick={handleCreatePrompt}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {t('createNewPrompt')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Prompts List */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold">{t('availablePrompts')}</h3>
          </div>
          <div className="p-4 space-y-2">
            {prompts.map((prompt) => (
              <div
                key={prompt.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedPrompt?.id === prompt.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedPrompt(prompt)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">{prompt.name}</h4>
                    <p className="text-sm text-gray-600">{prompt.description}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-1 text-xs rounded ${
                        prompt.category === 'system' ? 'bg-red-100 text-red-800' :
                        prompt.category === 'context' ? 'bg-yellow-100 text-yellow-800' :
                        prompt.category === 'action' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {t(prompt.category)}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded ${
                        prompt.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {prompt.isActive ? t('active') : t('inactive')}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditPrompt(prompt);
                      }}
                      className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                      title={t('edit')}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTogglePromptActive(prompt);
                      }}
                      className={`p-1 rounded ${
                        prompt.isActive 
                          ? 'text-green-600 hover:bg-green-100' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                      title={prompt.isActive ? t('deactivate') : t('activate')}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePrompt(prompt.id);
                      }}
                      className="p-1 text-red-600 hover:bg-red-100 rounded"
                      title={t('delete')}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Prompt Editor */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold">
              {isEditingPrompt ? (selectedPrompt ? t('editPrompt') : t('createPrompt')) : t('promptDetails')}
            </h3>
          </div>
          <div className="p-4">
            {isEditingPrompt ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('promptName')}</label>
                  <input
                    type="text"
                    value={promptForm.name || ''}
                    onChange={(e) => setPromptForm({ ...promptForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('promptDescription')}</label>
                  <input
                    type="text"
                    value={promptForm.description || ''}
                    onChange={(e) => setPromptForm({ ...promptForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('promptCategory')}</label>
                  <select
                    value={promptForm.category || 'custom'}
                    onChange={(e) => setPromptForm({ ...promptForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="system">{t('system')}</option>
                    <option value="context">{t('context')}</option>
                    <option value="action">{t('action')}</option>
                    <option value="custom">{t('custom')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('promptContent')}</label>
                  <textarea
                    value={promptForm.content || ''}
                    onChange={(e) => setPromptForm({ ...promptForm, content: e.target.value })}
                    rows={10}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t('enterPromptContent')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('promptVariables')}</label>
                  <input
                    type="text"
                    value={promptForm.variables?.join(', ') || ''}
                    onChange={(e) => setPromptForm({ 
                      ...promptForm, 
                      variables: e.target.value.split(',').map(v => v.trim()).filter(v => v) 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t('variablePlaceholder')}
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={promptForm.isActive || false}
                      onChange={(e) => setPromptForm({ ...promptForm, isActive: e.target.checked })}
                      className="mr-2"
                    />
                    {t('promptActive')}
                  </label>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('promptPriority')}</label>
                    <input
                      type="number"
                      value={promptForm.priority || 0}
                      onChange={(e) => setPromptForm({ ...promptForm, priority: parseInt(e.target.value) })}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleSavePrompt}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {t('save')}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingPrompt(false);
                      setSelectedPrompt(null);
                      setPromptForm({});
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    {t('cancel')}
                  </button>
                </div>
              </div>
            ) : selectedPrompt ? (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">{selectedPrompt.name}</h4>
                  <p className="text-sm text-gray-600">{selectedPrompt.description}</p>
                </div>
                <div>
                  <h5 className="font-medium text-gray-700 mb-2">{t('promptContent')}:</h5>
                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-64">
                    {selectedPrompt.content}
                  </pre>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditPrompt(selectedPrompt)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {t('edit')}
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">{t('selectPromptToView')}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderKnowledgeTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">{t('knowledgeSources')}</h2>
        <div className="flex space-x-3">
          <button
            onClick={handleCreateExternalSource}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            {t('addExternalSource')}
          </button>
          <button
            onClick={handleCreateSource}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('addKnowledgeSource')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Knowledge Sources List */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold">{t('availableSources')}</h3>
          </div>
          <div className="p-4 space-y-4">
            {/* Internal Sources */}
            <div>
              <h4 className="text-md font-medium text-gray-700 mb-3">{t('internalKnowledgeSources')}</h4>
              <div className="space-y-2">
                {knowledgeSources.filter(source => !source.sourceType || source.sourceType === 'internal').map((source) => (
                  <div
                    key={source.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedSource?.id === source.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedSource(source)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">{source.name}</h4>
                        <p className="text-sm text-gray-600">{source.description}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                            {source.category}
                          </span>
                          <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">
                            {source.language}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded ${
                            source.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {source.isActive ? t('active') : t('inactive')}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditSource(source);
                          }}
                          className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                          title={t('edit')}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRefreshInternalSource(source.id);
                          }}
                          className="p-1 text-green-600 hover:bg-green-100 rounded"
                          title="Refresh"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSource(source.id);
                          }}
                          className="p-1 text-red-600 hover:bg-red-100 rounded"
                          title={t('delete')}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* External Sources */}
            <div>
              <h4 className="text-md font-medium text-gray-700 mb-3">{t('externalSources')}</h4>
              {externalSources.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  <p className="text-sm">{t('noExternalSources')}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {externalSources.map((source) => (
                    <div
                      key={source.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedSource?.id === source.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedSource(source)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-gray-900">{source.name}</h4>
                            <span className={`px-2 py-1 text-xs rounded ${
                              source.sourceType === 'forum' ? 'bg-blue-100 text-blue-800' :
                              source.sourceType === 'webpage' ? 'bg-green-100 text-green-800' :
                              source.sourceType === 'api' ? 'bg-purple-100 text-purple-800' :
                              'bg-orange-100 text-orange-800'
                            }`}>
                              {t(source.sourceType || 'external')}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded ${
                              source.fetchStatus === 'success' ? 'bg-green-100 text-green-800' :
                              source.fetchStatus === 'failed' ? 'bg-red-100 text-red-800' :
                              source.fetchStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {t(source.fetchStatus || 'pending')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{source.description}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                              {source.category}
                            </span>
                            <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">
                              {source.language}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded ${
                              source.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {source.isActive ? t('active') : t('inactive')}
                            </span>
                            {source.autoFetch && (
                              <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">
                                {t('autoFetch')}
                              </span>
                            )}
                          </div>
                          {source.sourceUrl && (
                            <p className="text-xs text-gray-500 mt-1 truncate">
                              {source.sourceUrl}
                            </p>
                          )}
                        </div>
                        <div className="flex space-x-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditExternalSource(source);
                            }}
                            className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                            title={t('edit')}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFetchExternalSource(source.id);
                            }}
                            className="p-1 text-green-600 hover:bg-green-100 rounded"
                            title={t('fetchNow')}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteExternalSource(source);
                            }}
                            className="p-1 text-red-600 hover:bg-red-100 rounded"
                            title={t('delete')}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* External Source Creation Form */}
        {isCreatingExternalSource && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">{t('addExternalSource')}</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('sourceName')}</label>
                  <input
                    type="text"
                    value={externalSourceForm.name}
                    onChange={(e) => setExternalSourceForm({ ...externalSourceForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Training Management Forum"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('sourceType')}</label>
                  <select
                    value={externalSourceForm.sourceType}
                    onChange={(e) => setExternalSourceForm({ ...externalSourceForm, sourceType: e.target.value as any })}
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
                  value={externalSourceForm.sourceUrl}
                  onChange={(e) => setExternalSourceForm({ ...externalSourceForm, sourceUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('description')}</label>
                <textarea
                  value={externalSourceForm.description}
                  onChange={(e) => setExternalSourceForm({ ...externalSourceForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Description of the external source..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Manual Content (if scraping fails)</label>
                <textarea
                  value={externalSourceForm.manualContent}
                  onChange={(e) => setExternalSourceForm({ ...externalSourceForm, manualContent: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Paste content here if automatic scraping doesn't work..."
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setIsCreatingExternalSource(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleSaveExternalSource}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  {t('save')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Knowledge Source Editor */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold">
              {isEditingSource ? (selectedSource ? 'Edit Knowledge Source' : 'Add Knowledge Source') : 'Source Details'}
            </h3>
          </div>
          <div className="p-4">
            {isEditingSource ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={sourceForm.name || ''}
                    onChange={(e) => setSourceForm({ ...sourceForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={sourceForm.description || ''}
                    onChange={(e) => setSourceForm({ ...sourceForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={sourceForm.category || ''}
                    onChange={(e) => setSourceForm({ ...sourceForm, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                  <select
                    value={sourceForm.language || 'both'}
                    onChange={(e) => setSourceForm({ ...sourceForm, language: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="sv">Swedish</option>
                    <option value="en">English</option>
                    <option value="both">Both</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Keywords (comma-separated)</label>
                  <input
                    type="text"
                    value={sourceForm.keywords || ''}
                    onChange={(e) => setSourceForm({ 
                      ...sourceForm, 
                      keywords: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="keyword1, keyword2, keyword3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                  <textarea
                    value={sourceForm.content || ''}
                    onChange={(e) => setSourceForm({ ...sourceForm, content: e.target.value })}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter knowledge content..."
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={sourceForm.isActive || false}
                      onChange={(e) => setSourceForm({ ...sourceForm, isActive: e.target.checked })}
                      className="mr-2"
                    />
                    Active
                  </label>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <input
                      type="number"
                      value={sourceForm.priority || 0}
                      onChange={(e) => setSourceForm({ ...sourceForm, priority: parseInt(e.target.value) })}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleSaveSource}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingSource(false);
                      setSelectedSource(null);
                      setSourceForm({});
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : selectedSource ? (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-medium text-gray-900">{selectedSource.name}</h4>
                    {selectedSource.sourceType && selectedSource.sourceType !== 'internal' && (
                      <span className={`px-2 py-1 text-xs rounded ${
                        selectedSource.sourceType === 'forum' ? 'bg-blue-100 text-blue-800' :
                        selectedSource.sourceType === 'webpage' ? 'bg-green-100 text-green-800' :
                        selectedSource.sourceType === 'api' ? 'bg-purple-100 text-purple-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {t(selectedSource.sourceType)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{selectedSource.description}</p>
                </div>

                {/* External Source Information */}
                {selectedSource.sourceType && selectedSource.sourceType !== 'internal' && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h5 className="font-medium text-gray-700 mb-2">{t('sourceConfiguration')}</h5>
                    <div className="grid grid-cols-2 gap-4 text-sm">
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
                      <div>
                        <span className="font-medium text-gray-700">{t('fetchStatus')}:</span>
                        <span className={`ml-2 px-2 py-1 text-xs rounded ${
                          selectedSource.fetchStatus === 'success' ? 'bg-green-100 text-green-800' :
                          selectedSource.fetchStatus === 'failed' ? 'bg-red-100 text-red-800' :
                          selectedSource.fetchStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {t(selectedSource.fetchStatus || 'pending')}
                        </span>
                      </div>
                      {selectedSource.fetchFrequency && (
                        <div>
                          <span className="font-medium text-gray-700">{t('fetchFrequency')}:</span>
                          <span className="ml-2">{t(selectedSource.fetchFrequency)}</span>
                        </div>
                      )}
                      {selectedSource.lastFetched && (
                        <div>
                          <span className="font-medium text-gray-700">{t('lastFetched')}:</span>
                          <span className="ml-2">{new Date(selectedSource.lastFetched).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                    {selectedSource.fetchError && (
                      <div className="mt-3 p-2 bg-red-100 border border-red-200 rounded">
                        <span className="font-medium text-red-800">{t('fetchError')}:</span>
                        <p className="text-sm text-red-700 mt-1">{selectedSource.fetchError}</p>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <h5 className="font-medium text-gray-700 mb-2">{t('sourceContent')}:</h5>
                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-64">
                    {selectedSource.content}
                  </pre>
                </div>
                <div>
                  <h5 className="font-medium text-gray-700 mb-2">{t('keywords')}:</h5>
                  <div className="flex flex-wrap gap-1">
                    {selectedSource.keywords.map((keyword, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex space-x-2">
                  {selectedSource.sourceType && selectedSource.sourceType !== 'internal' ? (
                    <button
                      onClick={() => setShowExternalManager(true)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      {t('manageExternalSource')}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEditSource(selectedSource)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {t('edit')}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-gray-500">{t('selectSourceToView')}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );


  const renderTrainingTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">{t('aiTraining')}</h2>
        <button
          onClick={handleRetrainAI}
          disabled={trainingStatus.isTraining}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {trainingStatus.isTraining ? t('trainingInProgress') : t('retrainAI')}
        </button>
      </div>

      {/* Training Status */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">{t('trainingStatus')}</h3>
          
          {trainingStatus.isTraining ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm text-gray-600">{trainingStatus.trainingMessage}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${trainingStatus.trainingProgress}%` }}
                ></div>
              </div>
              <div className="text-sm text-gray-600">
                {t('progress')}: {Math.round(trainingStatus.trainingProgress)}%
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${trainingStatus.errorMessage ? 'bg-red-500' : 'bg-green-500'}`}></div>
                <span className="text-sm text-gray-600">
                  {trainingStatus.errorMessage ? t('lastTrainingFailed') : t('aiReady')}
                </span>
              </div>
              
              {trainingStatus.lastTraining && (
                <div className="text-sm text-gray-600">
                  {t('lastTraining')}: {new Date(trainingStatus.lastTraining).toLocaleString()}
                </div>
              )}
              
              {trainingStatus.errorMessage && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                  {t('error')}: {trainingStatus.errorMessage}
                </div>
              )}
              
              {trainingStatus.trainingMessage && !trainingStatus.errorMessage && (
                <div className="text-sm text-green-600 bg-green-50 p-3 rounded">
                  {trainingStatus.trainingMessage}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Knowledge Sources Status */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">{t('knowledgeSourcesStatus')}</h3>
          
          {/* Internal Knowledge Sources */}
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-700 mb-3">{t('internalKnowledgeSources')}</h4>
            <div className="space-y-2">
              {knowledgeSources.filter(source => !source.sourceType || source.sourceType === 'internal').map((source) => (
                <div key={source.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <span className="font-medium">{source.name}</span>
                    <span className="text-sm text-gray-600 ml-2">({source.category})</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded ${
                      source.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {source.isActive ? t('active') : t('inactive')}
                    </span>
                    {source.lastTrained && (
                      <span className="text-xs text-gray-500">
                        {t('trained')}: {new Date(source.lastTrained).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* External Knowledge Sources */}
          <div>
            <h4 className="text-md font-medium text-gray-700 mb-3">{t('externalSources')}</h4>
            {externalSources.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                <p className="text-sm">{t('noExternalSources')}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {externalSources.map((source) => (
                  <div key={source.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{source.name}</span>
                        <span className={`px-2 py-1 text-xs rounded ${
                          source.sourceType === 'forum' ? 'bg-blue-100 text-blue-800' :
                          source.sourceType === 'webpage' ? 'bg-green-100 text-green-800' :
                          source.sourceType === 'api' ? 'bg-purple-100 text-purple-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {t(source.sourceType || 'external')}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded ${
                          source.fetchStatus === 'success' ? 'bg-green-100 text-green-800' :
                          source.fetchStatus === 'failed' ? 'bg-red-100 text-red-800' :
                          source.fetchStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {t(source.fetchStatus || 'pending')}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {source.sourceUrl && (
                          <span className="truncate block">{source.sourceUrl}</span>
                        )}
                        {source.lastFetched && (
                          <span className="text-xs text-gray-500">
                            {t('lastFetched')}: {new Date(source.lastFetched).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded ${
                        source.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {source.isActive ? t('active') : t('inactive')}
                      </span>
                      {source.autoFetch && (
                        <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">
                          {t('autoFetch')}
                        </span>
                      )}
                      {source.lastTrained && (
                        <span className="text-xs text-gray-500">
                          {t('trained')}: {new Date(source.lastTrained).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading AI Administration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-2xl font-bold text-gray-900">{t('aiAdministration')}</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'prompts', label: t('aiPrompts') },
              { id: 'knowledge', label: t('knowledgeSources') },
              { id: 'training', label: t('training') }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'prompts' && renderPromptsTab()}
        {activeTab === 'knowledge' && renderKnowledgeTab()}
        {activeTab === 'training' && renderTrainingTab()}
      </div>

    </div>
  );
};
