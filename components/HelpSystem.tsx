import React, { useState, useEffect, useRef } from 'react';
import { useTranslations } from '../hooks/useTranslations';
import { useLanguage } from '../contexts/LanguageContext';
import { helpService, type HelpSection } from '../services/helpService';

interface HelpSystemProps {
  isOpen: boolean;
  onClose: () => void;
  context?: string; // For context-sensitive help
  isAdmin?: boolean; // Whether the current user is an admin
}

interface SourceInfo {
  name: string;
  id?: string;
  type: 'help' | 'knowledge';
}

export const HelpSystem: React.FC<HelpSystemProps> = ({ isOpen, onClose, context, isAdmin = false }) => {
  const { t } = useTranslations();
  const { language } = useLanguage();
  const [isCompact, setIsCompact] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState<string>('overview');
  const [filter, setFilter] = useState<'all' | 'admin' | 'user' | 'general'>('all');
  const [helpSections, setHelpSections] = useState<HelpSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // AI Chat state
  const [aiInputValue, setAiInputValue] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiSources, setAiSources] = useState<SourceInfo[]>([]);
  const [isAILoading, setIsAILoading] = useState(false);

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 1200, height: 800 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeDirection, setResizeDirection] = useState<string>('');
  const [resizeStartPos, setResizeStartPos] = useState({ x: 0, y: 0 });
  const [resizeStartSize, setResizeStartSize] = useState({ width: 0, height: 0 });
  const [resizeStartPosition, setResizeStartPosition] = useState({ x: 0, y: 0 });
  const searchInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Bring window to front when clicked
  const handleWindowClick = () => {
    if (modalRef.current) {
      modalRef.current.style.zIndex = '9999';
    }
  };

  // Load help content from Markdown files
  useEffect(() => {
    const loadHelpContent = async () => {
      try {
        setLoading(true);
        setError(null);
        // Force reload to bypass any stale cache
        const sections = await helpService.forceReload(language);
        setHelpSections(sections);
      } catch (error) {
        console.error('Error loading help content:', error);
        setError(error);
        // Don't fail completely - set empty sections and continue
        setHelpSections([]);
        
        // Show a user-friendly message in the content area
        console.warn('Help content unavailable, but AI chat will still work with additional knowledge sources');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      loadHelpContent();
    }
  }, [isOpen, language]);



  // Manual refresh function
  const handleManualRefresh = async () => {
    try {
      setLoading(true);
      console.log('Refreshing help content from repository...');
      
      // Clear all caches first for a complete refresh
      await helpService.clearAllCaches();
      
      // Force reload with cache busting
      const sections = await helpService.forceReload(language);
      setHelpSections(sections);
      
      console.log('Help content refreshed successfully');
    } catch (error) {
      console.error('Error manually refreshing help content:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter sections based on search and category
  const filteredSections = helpSections.filter(section => {
    const matchesSearch = searchTerm === '' || 
      section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filter === 'all' || section.category === filter;
    
    return matchesSearch && matchesFilter;
  });

  // Auto-select relevant section based on context
  useEffect(() => {
    if (context && helpSections.length > 0) {
      const contextLower = context.toLowerCase();
      
      // First, try to find exact matches for user-specific contexts
      const userContexts = ['subscribe', 'unsubscribe', 'subscription', 'public view'];
      const adminContexts = ['create user', 'add user', 'manage vouchers', 'create training', 'edit training'];
      
      // Check if this is a user context
      const isUserContext = userContexts.some(userCtx => contextLower.includes(userCtx));
      const isAdminContext = adminContexts.some(adminCtx => contextLower.includes(adminCtx));
      
      let relevantSection;
      
      if (isUserContext) {
        // Prioritize user sections for user contexts
        relevantSection = helpSections.find(section => 
          section.category === 'user' && 
          section.keywords.some(keyword => contextLower.includes(keyword.toLowerCase()))
        );
      } else if (isAdminContext) {
        // Prioritize admin sections for admin contexts
        relevantSection = helpSections.find(section => 
          section.category === 'admin' && 
          section.keywords.some(keyword => contextLower.includes(keyword.toLowerCase()))
        );
      }
      
      // If no specific match found, fall back to general matching
      if (!relevantSection) {
        relevantSection = helpSections.find(section => 
          section.keywords.some(keyword => contextLower.includes(keyword.toLowerCase()))
        );
      }
      
      if (relevantSection) {
        setSelectedSection(relevantSection.id);
      }
    }
  }, [context, helpSections]);

  // Position on open (center when expanded; compact docks top-right) and reset to defaults
  useEffect(() => {
    if (isOpen) {
      // Default to compact side-docked each time opened; forget previous size/pos
      setIsCompact(true);
      setShowToc(false);
      const defaultWidth = Math.min(420, window.innerWidth - 32);
      const defaultHeight = Math.max(400, Math.min(window.innerHeight - 32, 800));
      const x = Math.max(16, window.innerWidth - defaultWidth - 16);
      const y = 16;
      setSize({ width: defaultWidth, height: defaultHeight });
      setPosition({ x, y });
      
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }
  }, [isOpen]); // Removed size.width, size.height, isCompact dependencies to prevent conflicts with resize

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  // Handle mouse events for dragging with robust coordinate system
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!modalRef.current) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const rect = modalRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setIsDragging(true);
  };

  const handleMouseMove = React.useCallback((e: MouseEvent) => {
    if (!isDragging || !modalRef.current) return;
    
    e.preventDefault();
    
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    
    // Apply viewport constraints
    const rect = modalRef.current.getBoundingClientRect();
    const maxX = window.innerWidth - rect.width - 10;
    const maxY = window.innerHeight - rect.height - 10;
    
    const constrainedX = Math.max(10, Math.min(maxX, newX));
    const constrainedY = Math.max(10, Math.min(maxY, newY));
    
    setPosition({
      x: constrainedX,
      y: constrainedY
    });
  }, [isDragging, dragOffset]);

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle resizing with robust coordinate system
  const handleResizeStart = (e: React.MouseEvent, direction: string) => {
    e.stopPropagation();
    e.preventDefault();
    

    
    setResizeDirection(direction);
    setResizeStartPos({ x: e.clientX, y: e.clientY });
    setResizeStartSize({ width: size.width, height: size.height });
    setResizeStartPosition({ x: position.x, y: position.y });
    setIsResizing(true);
  };

  const handleResizeMove = React.useCallback((e: MouseEvent) => {
    if (!isResizing) {
      return;
    }
    
    e.preventDefault();
    
    const deltaX = e.clientX - resizeStartPos.x;
    const deltaY = e.clientY - resizeStartPos.y;
    
    let newWidth = resizeStartSize.width;
    let newHeight = resizeStartSize.height;
    let newX = resizeStartPosition.x;
    let newY = resizeStartPosition.y;

    // Correct resize logic
    if (resizeDirection.includes('e')) {
      // East edge: dragging right increases width
      newWidth = resizeStartSize.width + deltaX;
    }
    if (resizeDirection.includes('w')) {
      // West edge: dragging right decreases width, dragging left increases width
      newWidth = resizeStartSize.width - deltaX;
      // Position moves by the same amount as the width change
      newX = resizeStartPosition.x + deltaX;
    }
    if (resizeDirection.includes('s')) {
      // South edge: dragging down increases height
      newHeight = resizeStartSize.height + deltaY;
    }
    if (resizeDirection.includes('n')) {
      // North edge: dragging down decreases height, dragging up increases height
      newHeight = resizeStartSize.height - deltaY;
      // Position moves by the same amount as the height change
      newY = resizeStartPosition.y + deltaY;
    }

    // Apply minimum constraints
    const minW = isCompact ? 320 : 800;
    const minH = isCompact ? 400 : 600;
    
    newWidth = Math.max(minW, newWidth);
    newHeight = Math.max(minH, newHeight);
    
    // Apply maximum constraints
    const maxW = window.innerWidth - 20;
    const maxH = window.innerHeight - 20;
    
    newWidth = Math.min(maxW, newWidth);
    newHeight = Math.min(maxH, newHeight);
    
    // Ensure position stays within viewport bounds
    newX = Math.max(10, Math.min(window.innerWidth - newWidth - 10, newX));
    newY = Math.max(10, Math.min(window.innerHeight - newHeight - 10, newY));


    
    setSize({ width: newWidth, height: newHeight });
    setPosition({ x: newX, y: newY });
  }, [isResizing, resizeDirection, resizeStartPos, resizeStartSize, resizeStartPosition, isCompact]);

  const handleResizeEnd = () => {
    setIsResizing(false);
    setResizeDirection('');
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      const moveHandler = isDragging ? handleMouseMove : handleResizeMove;
      const upHandler = isDragging ? handleMouseUp : handleResizeEnd;
      
      document.addEventListener('mousemove', moveHandler);
      document.addEventListener('mouseup', upHandler);
      return () => {
        document.removeEventListener('mousemove', moveHandler);
        document.removeEventListener('mouseup', upHandler);
      };
    }
  }, [isDragging, isResizing, resizeDirection]);

  const selectedSectionData = helpSections.find(section => section.id === selectedSection);
  const [svFallbackContent, setSvFallbackContent] = useState<string | null>(null);
  const [showToc, setShowToc] = useState<boolean>(false);

  // AI Chat function
  const sendAIMessage = async (content: string) => {
    if (!content.trim()) return;

    setIsAILoading(true);
    setAiResponse('');
    setAiSources([]);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      console.log('🔑 API Key check:', {
        hasApiKey: !!apiKey,
        apiKeyLength: apiKey ? apiKey.length : 0,
        apiKeyStart: apiKey ? apiKey.substring(0, 4) + '...' : 'none',
        envVars: Object.keys(import.meta.env).filter(key => key.startsWith('VITE_')),
        fullEnv: import.meta.env,
        mode: import.meta.env.MODE,
        base: import.meta.env.BASE_URL
      });
      
      if (!apiKey) {
        console.error('❌ Gemini API key is missing!');
        console.error('Environment variables available:', Object.keys(import.meta.env));
        console.error('VITE_ variables:', Object.keys(import.meta.env).filter(key => key.startsWith('VITE_')));
        throw new Error('Gemini API key not configured. This usually means the environment variable was not loaded during build time. Check your GitHub Actions secrets and Vite configuration.');
      }

      // Import GoogleGenAI dynamically to avoid build issues
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey });

      // Prepare context from help sections and additional knowledge
      let contextString = '';
      
      // Try to get help sections, but don't fail if unavailable
      try {
        if (helpSections.length > 0) {
          contextString += '## Help Documentation\n\n';
          helpSections.forEach(section => {
            contextString += `### ${section.title}\n`;
            contextString += `Category: ${section.category}\n`;
            contextString += `Keywords: ${section.keywords.join(', ')}\n`;
            contextString += `${section.content}\n\n`;
          });
        }
      } catch (helpError) {
        console.warn('Help sections not available, continuing with additional knowledge only:', helpError);
      }

      // Add additional knowledge sources (this should always work)
      try {
        const { getAllSourcesAsText, searchSourcesByKeyword } = await import('../services/aiKnowledgeSources');
        contextString += '## Additional System Knowledge\n\n';
        contextString += getAllSourcesAsText();
      } catch (knowledgeError) {
        console.error('Could not load additional knowledge sources:', knowledgeError);
        contextString += '## Additional System Knowledge\n\n';
        contextString += 'System knowledge sources are currently unavailable.\n\n';
      }

      // Add current context
      if (context) {
        contextString += `## Current Context\n\nUser is currently working with: ${context}\n\n`;
      }

      // If no help documentation is available, provide a fallback context
      if (!contextString.includes('Help Documentation') && !contextString.includes('Additional System Knowledge')) {
        contextString = `## System Information\n\nThis is a training management system with the following features:\n- User management and roles\n- Training session management\n- Voucher/credit system\n- Attendance tracking\n\n`;
      }

      const systemPrompt = `Du är en hjälpsam AI-assistent för ett träningshanteringssystem. Använd följande information för att svara på användarens frågor:

${contextString}

Instruktioner:
- Svara på svenska om användaren skriver på svenska, annars på engelska
- Var hjälpsam, vänlig och professionell
- Använd informationen från dokumentationen och systemkunskapen
- Om du inte vet svaret, säg det tydligt
- Ge praktiska exempel när det är lämpligt
- Citera relevanta delar av dokumentationen när det hjälper
- Håll svaret koncist men informativt
- Om dokumentationen inte är tillgänglig, svara baserat på din allmänna kunskap om systemadministration

Användarens fråga: ${content}`;

      const result = await ai.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: systemPrompt,
      });

      const text = result.text.trim();

      // Extract sources from response
      const sources: SourceInfo[] = [];
      
      try {
        // Search for sources in additional knowledge
        const { searchSourcesByKeyword } = await import('../services/aiKnowledgeSources');
        const relevantSources = searchSourcesByKeyword(text);
        relevantSources.forEach(source => {
          if (!sources.some(s => s.name === source.name)) {
            sources.push({ name: source.name, type: 'knowledge' });
          }
        });
        
        // Also check help sections by matching keywords and title
        helpSections.forEach(section => {
          if (text.toLowerCase().includes(section.title.toLowerCase()) || section.keywords.some(k => text.toLowerCase().includes(k.toLowerCase()))) {
            if (!sources.some(s => s.name === section.title)) {
              sources.push({ name: section.title, id: section.id, type: 'help' });
            }
          }
        });
      } catch (sourceError) {
        console.warn('Could not extract sources:', sourceError);
      }

      setAiResponse(text);
      setAiSources(sources);
      setAiInputValue(''); // Clear input after successful response
    } catch (error) {
      console.error('Error sending message to AI:', error);
      setAiResponse(t('aiHelpError'));
    } finally {
      setIsAILoading(false);
    }
  };

  // Update document info when section changes


  const renderContent = (content: string) => {
    let html = content;
    
    // Process headers first (before other replacements)
    html = html.replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mb-2 mt-4">$1</h3>');
    html = html.replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mb-3 mt-6">$1</h2>');
    html = html.replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mb-4">$1</h1>');
    
    // Process bold and italic
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Process lists
    const lines = html.split('\n');
    let inList = false;
    let listItems = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim().startsWith('- ')) {
        if (!inList) {
          inList = true;
          listItems = [];
        }
        listItems.push(line.replace(/^- (.*)/, '<li class="ml-4">$1</li>'));
      } else {
        if (inList && listItems.length > 0) {
          lines[i - listItems.length] = `<ul class="list-disc mb-4">${listItems.join('')}</ul>`;
          // Remove the individual list item lines
          for (let j = i - listItems.length + 1; j < i; j++) {
            lines[j] = '';
          }
          inList = false;
          listItems = [];
        }
      }
    }
    
    // Handle any remaining list at the end
    if (inList && listItems.length > 0) {
      lines[lines.length - listItems.length] = `<ul class="list-disc mb-4">${listItems.join('')}</ul>`;
      for (let j = lines.length - listItems.length + 1; j < lines.length; j++) {
        lines[j] = '';
      }
    }
    
    html = lines.join('\n');
    
    // Convert remaining newlines to breaks
    html = html.replace(/\n/g, '<br>');
    
    return html;
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        key={language}
        ref={modalRef}
        className="fixed bg-white rounded-2xl shadow-2xl flex flex-col border border-slate-200 z-50 select-none"
        style={
          {
            left: `${position.x}px`,
            top: `${position.y}px`,
            width: isCompact ? `${Math.min(size.width, window.innerWidth - 32)}px` : `${size.width}px`,
            height: isCompact ? `${Math.min(size.height, window.innerHeight - 32)}px` : `${size.height}px`,
            cursor: isDragging ? 'grabbing' : 'default'
          }
        }
        onClick={handleWindowClick}
      >
        {/* Header */}
        <div 
          className={`relative z-20 flex items-center justify-between ${isCompact ? 'p-4' : 'p-6'} border-b border-slate-200 cursor-move`}
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center gap-3">
            <span
              className={`w-4 h-4 rounded-full ${
                loading ? 'bg-yellow-400 animate-pulse' : error ? 'bg-red-500' : 'bg-green-500'
              }`}
              title={
                loading
                  ? t('helpStatusLoading')
                  : error
                  ? t('helpStatusError', { errorMessage: error.message })
                  : t('helpStatusSuccess')
              }
            />
            <h2 className="text-2xl font-bold text-slate-900">{t('helpSystemTitle')}</h2>
          </div>
          <div className="flex items-center gap-2">
            {isCompact && (
              <button
                onClick={() => setShowToc(!showToc)}
                className="p-2 text-slate-600 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                title={showToc ? 'Hide contents' : 'Show contents'}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h16" />
                </svg>
              </button>
            )}
            <button
              onClick={() => {

                
                if (isCompact) {
                  // Expand to centered full view
                  const maxWidth = Math.min(1200, window.innerWidth - 40);
                  const maxHeight = Math.min(800, window.innerHeight - 40);
                  const newSize = { width: maxWidth, height: maxHeight };
                  const centerX = Math.max(20, (window.innerWidth - newSize.width) / 2);
                  const centerY = Math.max(20, (window.innerHeight - newSize.height) / 2);
                  

                  
                  // Use requestAnimationFrame for smooth transitions
                  requestAnimationFrame(() => {
                    setSize(newSize);
                    setPosition({ x: centerX, y: centerY });
                    setIsCompact(false);
                    setShowToc(false);
                  });
                } else {
                  // Collapse to docked view
                  const defaultWidth = Math.min(420, window.innerWidth - 32);
                  const defaultHeight = Math.max(400, Math.min(window.innerHeight - 32, 800));
                  const x = Math.max(16, window.innerWidth - defaultWidth - 16);
                  const y = 16;
                  

                  
                  // Use requestAnimationFrame for smooth transitions
                  requestAnimationFrame(() => {
                    setIsDragging(false);
                    setIsResizing(false);
                    setSize({ width: defaultWidth, height: defaultHeight });
                    setPosition({ x, y });
                    setIsCompact(true);
                    setShowToc(false);
                  });
                }
              }}
              className="p-2 text-slate-600 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
              title={isCompact ? t('helpMaximizeTitle') : t('helpMinimizeTitle')}
              onMouseDown={(e) => e.stopPropagation()}
            >
              {isCompact ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 3v3a2 2 0 01-2 2H3m18 0h-3a2 2 0 01-2-2V3m0 18v-3a2 2 0 012-2h3M3 16h3a2 2 0 012 2v3" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2" />
                </svg>
              )}
            </button>

            <button
              onClick={handleManualRefresh}
              className={`p-2 text-slate-600 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors ${loading ? 'animate-spin' : ''}`}
              title={t('helpRefreshTitle')}
              disabled={loading}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <a
                              href={`https://github.com/peka01/helpdoc/edit/main/ntr-test/docs/${language}/${selectedSection}.md`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50 rounded-lg transition-colors"
              title={t('helpEditButton')}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </a>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar (hidden in compact mode) */}
          {!isCompact && (
          <div className="w-80 border-r border-slate-200 flex flex-col">
            {/* Search */}
            <div className="p-4 border-b border-slate-200">
              <input
                ref={searchInputRef}
                type="text"
                placeholder={t('helpSearchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="p-4 border-b border-slate-200">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="all">{t('helpCategoryAll')}</option>
                <option value="general">{t('helpCategoryGeneral')}</option>
                <option value="admin">{t('helpCategoryAdmin')}</option>
                <option value="user">{t('helpCategoryUser')}</option>
              </select>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto p-4">
                          {loading ? (
              <div className="text-center text-slate-500 py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto"></div>
                <p className="mt-2">{t('helpLoadingText')}</p>
              </div>
            ) : (
                <nav className="space-y-2">
                  {filteredSections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setSelectedSection(section.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        selectedSection === section.id
                          ? 'bg-cyan-500 text-white'
                          : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div className="font-medium">{section.title}</div>
                      <div className="text-xs opacity-75 capitalize">{section.category}</div>
                    </button>
                  ))}
                </nav>
              )}
            </div>
          </div>
          )}

          {/* Compact TOC overlay */}
          {isCompact && showToc && (
            <div className="absolute left-0 top-0 bottom-0 w-80 bg-white border-r border-slate-200 shadow-lg z-30 flex flex-col">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <span className="font-semibold text-slate-800">{t('helpContentsTitle')}</span>
                <button className="text-slate-500 hover:text-slate-700" onClick={() => setShowToc(false)}>✕</button>
              </div>
              <div className="p-4 border-b border-slate-200">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={t('helpSearchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {loading ? (
                  <div className="text-center text-slate-500 py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto"></div>
                    <p className="mt-2">{t('helpLoadingText')}</p>
                  </div>
                ) : (
                  <nav className="space-y-2">
                    {filteredSections.map((section) => (
                      <button
                        key={section.id}
                        onClick={() => { setSelectedSection(section.id); setShowToc(false); }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          selectedSection === section.id
                            ? 'bg-cyan-500 text-white'
                            : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <div className="font-medium">{section.title}</div>
                        <div className="text-xs opacity-75 capitalize">{section.category}</div>
                      </button>
                    ))}
                  </nav>
                )}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {selectedSectionData ? (
              <>
                {/* Breadcrumb Navigation */}
                <div className="mb-6 flex items-center space-x-2 text-sm text-slate-600">
                  <button
                    onClick={() => setFilter('all')}
                    className="hover:text-slate-800 hover:underline transition-colors"
                  >
                    {t('helpSystemTitle')}
                  </button>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="capitalize">{selectedSectionData.category}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="font-medium text-slate-800">{selectedSectionData.title}</span>
                </div>
                
                {/* Content */}
                <div className="prose prose-slate max-w-none">
                  <div 
                    dangerouslySetInnerHTML={{ 
                      __html: renderContent(
                        svFallbackContent ?? selectedSectionData.content
                      )
                    }} 
                  />
                </div>
              </>
            ) : helpSections.length === 0 && !loading ? (
              <div className="text-center text-slate-500 py-8">
                <div className="mb-4">
                  <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <h3 className="text-lg font-medium text-slate-700 mb-2">Help Content Unavailable</h3>
                  <p className="text-slate-600 mb-4">
                    The help documentation is currently not available from the external repository.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                    <h4 className="font-medium text-blue-800 mb-2">💡 Good News!</h4>
                    <p className="text-blue-700 text-sm">
                      You can still get help using the AI chat at the bottom of this window. 
                      The AI has access to system knowledge and can answer your questions about:
                    </p>
                    <ul className="text-blue-700 text-sm mt-2 list-disc list-inside space-y-1">
                      <li>User roles and permissions</li>
                      <li>Training session management</li>
                      <li>Voucher and credit system</li>
                      <li>System architecture and features</li>
                      <li>Troubleshooting common issues</li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-500 py-8">
                <p>{t('helpNoResults')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          {/* AI Chat Search Field */}
          <div className="space-y-3">
            <form onSubmit={(e) => {
              e.preventDefault();
              if (aiInputValue.trim()) {
                sendAIMessage(aiInputValue);
              }
            }} className="flex space-x-2">
              <input
                type="text"
                value={aiInputValue}
                onChange={(e) => setAiInputValue(e.target.value)}
                placeholder={t('aiChatPlaceholder')}
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                disabled={isAILoading}
              />
              <button
                type="submit"
                disabled={isAILoading || !aiInputValue.trim()}
                className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                {isAILoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Fråga'
                )}
              </button>
            </form>
            
            {/* AI Response Display */}
            {aiResponse && (
              <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-700">{t('aiHelpResponseTitle')}</span>
                  <button
                    onClick={() => setAiResponse('')}
                    className="text-slate-400 hover:text-slate-600 text-xs"
                  >
                    ✕
                  </button>
                </div>
                <div className="text-sm text-slate-800 whitespace-pre-wrap">
                  {aiResponse}
                </div>
                {aiSources && aiSources.length > 0 && (
                  <div className="pt-2 border-t border-slate-100">
                    <div className="text-xs text-slate-500 mb-1">{t('aiHelpSourcesTitle')}</div>
                    <div className="flex flex-wrap gap-1">
                      {aiSources.map((source, index) => (
                        source.type === 'help' && source.id ? (
                          <button
                            key={index}
                            onClick={() => {
                              setSelectedSection(source.id!);
                              setAiResponse('');
                              setAiSources([]);
                              setAiInputValue('');
                            }}
                            className="text-xs bg-cyan-100 text-cyan-800 px-2 py-1 rounded hover:bg-cyan-200 transition-colors cursor-pointer"
                            title={t('aiHelpGoToSection', { sectionName: source.name })}
                          >
                            {source.name}
                          </button>
                        ) : (
                          <span
                            key={index}
                            className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded"
                            title={t('aiHelpKnowledgeSourceTooltip')}
                          >
                            {source.name}
                          </span>
                        )
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <div className="text-xs text-slate-500 text-center">
              <a 
                href="https://www.spiris.se/kontakt" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-cyan-600 hover:text-cyan-700 underline"
              >
                {t('helpContactUs')}
              </a>
            </div>
          </div>
        </div>

        {/* Resize handles (edges and corners) */}
        {/* Edges */}
        <div 
          className="absolute top-0 left-2 right-2 h-2 cursor-n-resize z-50 hover:bg-blue-500 hover:opacity-30" 
          onMouseDown={(e) => handleResizeStart(e, 'n')}
        />
        <div 
          className="absolute bottom-0 left-2 right-2 h-2 cursor-s-resize z-50 hover:bg-blue-500 hover:opacity-30" 
          onMouseDown={(e) => handleResizeStart(e, 's')}
        />
        <div 
          className="absolute top-2 bottom-2 left-0 w-2 cursor-w-resize z-50 hover:bg-blue-500 hover:opacity-30" 
          onMouseDown={(e) => handleResizeStart(e, 'w')}
        />
        <div 
          className="absolute top-2 bottom-2 right-0 w-2 cursor-e-resize z-50 hover:bg-blue-500 hover:opacity-30" 
          onMouseDown={(e) => handleResizeStart(e, 'e')}
        />
        {/* Corners */}
        <div 
          className="absolute top-0 left-0 w-4 h-4 cursor-nw-resize z-50 hover:bg-blue-500 hover:opacity-50" 
          onMouseDown={(e) => handleResizeStart(e, 'nw')}
        />
        <div 
          className="absolute top-0 right-0 w-4 h-4 cursor-ne-resize z-50 hover:bg-blue-500 hover:opacity-50" 
          onMouseDown={(e) => handleResizeStart(e, 'ne')}
        />
        <div 
          className="absolute bottom-0 left-0 w-4 h-4 cursor-sw-resize z-50 hover:bg-blue-500 hover:opacity-50" 
          onMouseDown={(e) => handleResizeStart(e, 'sw')}
        />
        <div 
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-50 hover:bg-blue-500 hover:opacity-50" 
          onMouseDown={(e) => handleResizeStart(e, 'se')}
        />
      </div>
    </>
  );
};
