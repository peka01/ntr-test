import React, { useState, useRef, useEffect } from 'react';
import { useShoutout } from '../contexts/ShoutoutContext';
import { useTranslations } from '../hooks/useTranslations';

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
  
  // If shoutout context is not available, don't render the button
  if (!shoutoutContext) {
    return null;
  }

  const { getAvailableFeatures, showShoutout, hasUnseenFeatures, markAsSeen } = shoutoutContext;
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnseen, setHasUnseen] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);

  // Check for unseen features
  useEffect(() => {
    setHasUnseen(hasUnseenFeatures());
  }, [hasUnseenFeatures]);

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const features = getAvailableFeatures();

  const handleFeatureClick = (featureId: string) => {
    showShoutout(featureId);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={buttonRef}>
      {/* Gift box button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
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
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsSeen(feature.id);
                                setHasUnseen(hasUnseenFeatures());
                              }}
                              className="text-xs text-slate-500 hover:text-slate-700 underline"
                            >
                              {t('shoutoutDismiss')}
                            </button>
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
    </div>
  );
};
