import React, { useState, useEffect, useCallback } from 'react';
import { useShoutout } from '../contexts/ShoutoutContext';
import { useTranslations } from '../hooks/useTranslations';

export const ShoutoutSplash: React.FC = () => {
  const { t } = useTranslations();
  
  // Always call hooks in the same order - move all hooks to the top
  const [animationPhase, setAnimationPhase] = useState<'entering' | 'active' | 'exiting'>('entering');
  
  // Make resilient to missing ShoutoutProvider
  let shoutoutContext = null;
  try {
    shoutoutContext = useShoutout();
  } catch (error) {
    console.warn('ShoutoutProvider not available, shoutout splash will be disabled');
    return null;
  }

  // If shoutout context is not available, don't render the splash
  if (!shoutoutContext) {
    return null;
  }

  const { currentShoutout, isVisible, hideShoutout, markAsSeen, handleStartTour } = shoutoutContext;

  const handleDismiss = useCallback(() => {
    if (currentShoutout) {
      markAsSeen(currentShoutout.id);
    }
    hideShoutout();
  }, [currentShoutout, markAsSeen, hideShoutout]);

  const handleStartTourClick = () => {
    handleStartTour();
  };

  useEffect(() => {
    if (isVisible) {
      setAnimationPhase('entering');
      const timer = setTimeout(() => setAnimationPhase('active'), 100);
      return () => clearTimeout(timer);
    } else {
      setAnimationPhase('exiting');
    }
  }, [isVisible]);

  // Handle Esc key to close shoutout
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isVisible) {
        handleDismiss();
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isVisible, handleDismiss]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleDismiss();
    }
  };

  if (!isVisible || !currentShoutout) {
    return null;
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'feature': return 'bg-blue-500';
      case 'improvement': return 'bg-green-500';
      case 'announcement': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'feature': return t('shoutoutCategoryFeature');
      case 'improvement': return t('shoutoutCategoryImprovement');
      case 'announcement': return t('shoutoutCategoryAnnouncement');
      default: return category;
    }
  };

  return (
    <div
      className={`fixed inset-0 z-[10000] flex items-center justify-center transition-all duration-300 ${
        animationPhase === 'entering' ? 'opacity-0' : 
        animationPhase === 'exiting' ? 'opacity-0' : 'opacity-100'
      }`}
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
      
      {/* Content */}
      <div
        className={`relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-500 ease-out ${
          animationPhase === 'entering' ? 'scale-75 translate-y-8 opacity-0' : 
          animationPhase === 'exiting' ? 'scale-75 translate-y-8 opacity-0' : 'scale-100 translate-y-0 opacity-100'
        }`}
      >
        {/* Header with gradient */}
        <div className={`relative rounded-t-2xl ${getCategoryColor(currentShoutout.category)} p-6 text-white overflow-hidden`}>
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -translate-y-16 translate-x-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white bg-opacity-10 rounded-full translate-y-12 -translate-x-12" />
          
          <div className="relative z-10">
            {/* Icon and category */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="text-4xl">{currentShoutout.icon}</div>
                <div>
                  <div className="text-sm font-medium opacity-90">
                    {getCategoryText(currentShoutout.category)}
                  </div>
                  {currentShoutout.isNew && (
                    <div className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded-full">
                      {t('shoutoutNew')}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Title */}
            <h2 className="text-2xl font-bold mb-2">
              {currentShoutout.title}
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 text-lg leading-relaxed mb-6">
            {currentShoutout.description}
          </p>

          {/* Action buttons */}
          <div className="flex space-x-3">
            {currentShoutout.tourId && (
              <button
                onClick={handleStartTourClick}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{t('shoutoutStartTour')}</span>
              </button>
            )}
            
            <button
              onClick={handleDismiss}
              className={`${currentShoutout.tourId ? 'flex-1' : 'w-full'} bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors duration-200`}
            >
              {t('shoutoutDismiss')}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-4">
          <div className="text-xs text-gray-400 text-center">
            {t('shoutoutReleaseDate')}: {new Date(currentShoutout.releaseDate).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
};
