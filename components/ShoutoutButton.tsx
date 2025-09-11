import React, { useState, useRef, useEffect } from 'react';
import { useShoutout } from '../contexts/ShoutoutContext';
import { useTranslations } from '../hooks/useTranslations';
import { useAuth } from '../contexts/AuthContext';

interface ShoutoutButtonProps {
  className?: string;
}

export const ShoutoutButton: React.FC<ShoutoutButtonProps> = ({ className = '' }) => {
  // Optional shoutout integration - handle cases where ShoutoutProvider might not be available
  let shoutoutContext = null;
  try {
    shoutoutContext = useShoutout();
  } catch (error) {
    console.warn('ShoutoutProvider not available, shoutout button will be disabled');
  }

  const { t } = useTranslations();
  const { user, isAdmin } = useAuth();
  
  // If shoutout context is not available, don't render the button
  if (!shoutoutContext) {
    return null;
  }

  const { getAvailableFeatures, showShoutout, hasUnseenFeatures, markAsSeen } = shoutoutContext;
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnseen, setHasUnseen] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLDivElement>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  // Check for unseen features
  useEffect(() => {
    const checkUnseen = async () => {
      const unseen = await hasUnseenFeatures();
      setHasUnseen(unseen);
    };
    checkUnseen();
  }, [hasUnseenFeatures]);

  // Debug context menu state
  useEffect(() => {
    console.log('Context menu state changed:', { showContextMenu, isAdmin, user });
  }, [showContextMenu, isAdmin, user]);

  // Check if a specific feature has been seen
  const isFeatureSeen = (featureId: string): boolean => {
    try {
      const stored = localStorage.getItem('shoutout-seen');
      if (stored) {
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) && parsed.includes(featureId);
      }
    } catch (error) {
      console.warn('Failed to check if feature is seen:', error);
    }
    return false;
  };

  // Close dropdown and context menu when clicking outside or pressing Esc
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        setShowContextMenu(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setShowContextMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Handle right-click context menu
  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    console.log('Right-click detected on ShoutoutButton');
    console.log('isAdmin:', isAdmin);
    console.log('user:', user);
    
    if (!isAdmin) {
      console.log('User is not an admin, context menu not shown');
      return; // Only show context menu for admins
    }
    
    console.log('Showing context menu at position:', { x: event.clientX, y: event.clientY });
    setContextMenuPosition({ x: event.clientX, y: event.clientY });
    setShowContextMenu(true);
    setIsOpen(false); // Close dropdown if open
  };

  // Handle context menu actions
  const handleManageShoutouts = () => {
    setShowContextMenu(false);
    // Dispatch event to open shoutout management
    window.dispatchEvent(new CustomEvent('open-shoutout-management'));
  };

  const [features, setFeatures] = useState<ShoutoutFeature[]>([]);

  // Load features on mount
  useEffect(() => {
    const loadFeatures = async () => {
      const fetchedFeatures = await getAvailableFeatures();
      setFeatures(fetchedFeatures);
    };
    loadFeatures();
  }, [getAvailableFeatures]);

  const handleFeatureClick = async (featureId: string) => {
    await showShoutout(featureId);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={buttonRef}>
      {/* Gift box button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        onContextMenu={handleContextMenu}
        className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors duration-200"
        title={t('shoutoutButtonTitle')}
      >
        {/* Gift box icon */}
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
        </svg>
        
        {/* Notification dot */}
        {hasUnseen && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
        )}
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-slate-200 z-50">
          {/* Header */}
          <div className="p-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center space-x-2">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
              <span>{t('shoutoutMenuTitle')}</span>
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              {t('shoutoutMenuSubtitle')}
            </p>
          </div>

          {/* Features list */}
          <div className="max-h-96 overflow-y-auto">
            {features.length === 0 ? (
              <div className="p-4 text-center text-slate-500">
                {t('shoutoutNoFeatures')}
              </div>
            ) : (
              features.map((feature) => (
                <button
                  key={feature.id}
                  onClick={() => handleFeatureClick(feature.id)}
                  className="w-full p-4 text-left hover:bg-slate-50 transition-colors duration-200 border-b border-slate-100 last:border-b-0"
                >
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl flex-shrink-0">{feature.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-slate-900 truncate">
                          {feature.title}
                        </h4>
                        {feature.isNew && !isFeatureSeen(feature.id) && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {t('shoutoutNew')}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 line-clamp-2">
                        {feature.description}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-slate-400">
                          {new Date(feature.releaseDate).toLocaleDateString()}
                        </span>
                        <div className="flex items-center space-x-2">
                          {feature.tourId && (
                            <span className="text-xs text-blue-600 font-medium">
                              {t('shoutoutHasTour')}
                            </span>
                          )}
                          {!isFeatureSeen(feature.id) && (
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsSeen(feature.id);
                                setHasUnseen(hasUnseenFeatures());
                              }}
                              className="text-xs text-slate-500 hover:text-slate-700 underline cursor-pointer"
                            >
                              {t('shoutoutDismiss')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 bg-slate-50 rounded-b-lg">
            <p className="text-xs text-slate-500 text-center">
              {t('shoutoutMenuFooter')}
            </p>
          </div>
        </div>
      )}

      {/* Context Menu */}
      {showContextMenu && isAdmin && (
        <div
          ref={contextMenuRef}
          className="fixed bg-white rounded-lg shadow-lg border border-slate-200 z-50 py-1 min-w-48"
          style={{
            left: contextMenuPosition.x,
            top: contextMenuPosition.y,
          }}
        >
          <button
            onClick={handleManageShoutouts}
            className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{t('shoutoutManageShoutouts')}</span>
          </button>
        </div>
      )}
    </div>
  );
};
