import React, { useState, useEffect, useRef } from 'react';
import { useTranslations } from '../hooks/useTranslations';

interface HelpSection {
  id: string;
  title: string;
  content: string;
  keywords: string[];
  category: 'admin' | 'user' | 'general';
}

interface HelpSystemProps {
  isOpen: boolean;
  onClose: () => void;
  context?: string; // For context-sensitive help
}

const getHelpSections = (t: (key: string) => string): HelpSection[] => [
  {
    id: 'overview',
    title: t('helpOverviewTitle'),
    content: t('helpOverviewContent'),
    keywords: ['overview', 'system', 'features', 'architecture'],
    category: 'general'
  },
  {
    id: 'vouchers',
    title: t('helpVouchersTitle'),
    content: t('helpVouchersContent'),
    keywords: ['voucher', 'credits', 'balance', 'cost', 'refund'],
    category: 'general'
  },
  {
    id: 'user-management',
    title: t('helpUserManagementTitle'),
    content: t('helpUserManagementContent'),
    keywords: ['create user', 'add user', 'manage vouchers', 'admin', 'user list'],
    category: 'admin'
  },
  {
    id: 'training-management',
    title: t('helpTrainingManagementTitle'),
    content: t('helpTrainingManagementContent'),
    keywords: ['create training', 'edit training', 'admin training', 'training management'],
    category: 'admin'
  },
  {
    id: 'subscriptions',
    title: t('helpSubscriptionsTitle'),
    content: t('helpSubscriptionsContent'),
    keywords: ['subscribe', 'unsubscribe', 'subscription', 'public view', 'user subscription'],
    category: 'user'
  },
  {
    id: 'attendance',
    title: t('helpAttendanceTitle'),
    content: t('helpAttendanceContent'),
    keywords: ['mark attendance', 'cancel attendance', 'attendance view', 'voucher deduction', 'refund'],
    category: 'user'
  },
  {
    id: 'troubleshooting',
    title: t('helpTroubleshootingTitle'),
    content: t('helpTroubleshootingContent'),
    keywords: ['error', 'problem', 'issue', 'cannot mark', 'not appearing', 'balance not updating'],
    category: 'general'
  }
];

export const HelpSystem: React.FC<HelpSystemProps> = ({ isOpen, onClose, context }) => {
  const { t } = useTranslations();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState<string>('overview');
  const [filter, setFilter] = useState<'all' | 'admin' | 'user' | 'general'>('all');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Get translated help sections
  const helpSections = getHelpSections(t);

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
    if (context) {
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

  // Focus search input when modal opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const selectedSectionData = helpSections.find(section => section.id === selectedSection);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">{t('helpSystemTitle')}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
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
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {selectedSectionData ? (
              <div className="prose prose-slate max-w-none">
                <div 
                  dangerouslySetInnerHTML={{ 
                    __html: selectedSectionData.content
                      .replace(/\n/g, '<br>')
                      .replace(/# (.*?)\n/g, '<h1 class="text-2xl font-bold mb-4">$1</h1>')
                      .replace(/## (.*?)\n/g, '<h2 class="text-xl font-semibold mb-3 mt-6">$1</h2>')
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\*(.*?)\*/g, '<em>$1</em>')
                      .replace(/- (.*?)(?=\n|$)/g, '<li class="ml-4">$1</li>')
                      .replace(/(<li.*?<\/li>)/g, '<ul class="list-disc mb-4">$1</ul>')
                      .replace(/\n\n/g, '<br><br>')
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
      </div>
    </div>
  );
};
