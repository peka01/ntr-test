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

export const HelpSystem: React.FC<HelpSystemProps> = ({ isOpen, onClose, context, isAdmin = false }) => {
  const { t } = useTranslations();
  const { language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState<string>('overview');
  const [filter, setFilter] = useState<'all' | 'admin' | 'user' | 'general'>('all');
  const [helpSections, setHelpSections] = useState<HelpSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 1200, height: 800 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeDirection, setResizeDirection] = useState<string>('');
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
        const sections = await helpService.getAllSections(language);
        setHelpSections(sections);
      } catch (error) {
        console.error('Error loading help content:', error);
        // Fallback to empty sections
        setHelpSections([]);
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

  // Center modal when it opens
  useEffect(() => {
    if (isOpen) {
      const centerX = (window.innerWidth - size.width) / 2;
      const centerY = (window.innerHeight - size.height) / 2;
      setPosition({ x: centerX, y: centerY });
      
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }
  }, [isOpen, size.width, size.height]);

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

  // Handle mouse events for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (modalRef.current) {
      const rect = modalRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle resizing
  const handleResizeStart = (e: React.MouseEvent, direction: string) => {
    e.stopPropagation();
    setResizeDirection(direction);
    setIsResizing(true);
  };

  const handleResizeMove = (e: MouseEvent) => {
    if (isResizing && modalRef.current) {
      const rect = modalRef.current.getBoundingClientRect();
      let newWidth = size.width;
      let newHeight = size.height;
      let newX = position.x;
      let newY = position.y;

      if (resizeDirection.includes('e')) {
        newWidth = e.clientX - rect.left;
      }
      if (resizeDirection.includes('w')) {
        const deltaX = e.clientX - rect.left;
        newWidth = size.width - deltaX;
        newX = position.x + deltaX;
      }
      if (resizeDirection.includes('s')) {
        newHeight = e.clientY - rect.top;
      }
      if (resizeDirection.includes('n')) {
        const deltaY = e.clientY - rect.top;
        newHeight = size.height - deltaY;
        newY = position.y + deltaY;
      }

      // Minimum size constraints
      newWidth = Math.max(800, newWidth);
      newHeight = Math.max(600, newHeight);

      setSize({ width: newWidth, height: newHeight });
      setPosition({ x: newX, y: newY });
    }
  };

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
  }, [isDragging, isResizing, dragOffset, resizeDirection, size.width, size.height, position.x, position.y]);

  const selectedSectionData = helpSections.find(section => section.id === selectedSection);

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
    <div 
      ref={modalRef}
      className="fixed bg-white rounded-2xl shadow-2xl flex flex-col border border-slate-200 z-50"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        cursor: isDragging ? 'grabbing' : 'default'
      }}
      onClick={handleWindowClick}
    >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-6 border-b border-slate-200 cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
        >
          <h2 className="text-2xl font-bold text-slate-900">{t('helpSystemTitle')}</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleManualRefresh}
              className={`p-2 text-slate-600 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors ${loading ? 'animate-spin' : ''}`}
              title="Refresh help content from repository"
              disabled={loading}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <a
                              href={`https://github.com/peka01/helpdoc/edit/main/ntr-test/${language}/${selectedSection}.md`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50 rounded-lg transition-colors"
              title={t('helpEditButton')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </a>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
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
                <p className="mt-2">Loading help content from repository...</p>
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

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {selectedSectionData ? (
              <div className="prose prose-slate max-w-none">
                <div 
                  dangerouslySetInnerHTML={{ 
                    __html: renderContent(selectedSectionData.content)
                  }} 
                />
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
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>{t('helpContactAdmin')}</span>
            <span>{t('helpSystemVersion')}</span>
          </div>
        </div>

        {/* Resize handles */}
        <div 
          className="absolute top-0 right-0 w-4 h-4 cursor-se-resize"
          onMouseDown={(e) => handleResizeStart(e, 'se')}
        />
        <div 
          className="absolute bottom-0 left-0 w-4 h-4 cursor-sw-resize"
          onMouseDown={(e) => handleResizeStart(e, 'sw')}
        />
        <div 
          className="absolute top-0 left-0 w-4 h-4 cursor-nw-resize"
          onMouseDown={(e) => handleResizeStart(e, 'nw')}
        />
        <div 
          className="absolute bottom-0 right-0 w-4 h-4 cursor-ne-resize"
          onMouseDown={(e) => handleResizeStart(e, 'ne')}
        />
        <div 
          className="absolute top-0 left-1/2 transform -translate-x-1/2 w-4 h-4 cursor-n-resize"
          onMouseDown={(e) => handleResizeStart(e, 'n')}
        />
        <div 
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4 h-4 cursor-s-resize"
          onMouseDown={(e) => handleResizeStart(e, 's')}
        />
        <div 
          className="absolute left-0 top-1/2 transform -translate-y-1/2 w-4 h-4 cursor-w-resize"
          onMouseDown={(e) => handleResizeStart(e, 'w')}
        />
        <div 
          className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 cursor-e-resize"
          onMouseDown={(e) => handleResizeStart(e, 'e')}
                 />
     </div>
   );
 };
