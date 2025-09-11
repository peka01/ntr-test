import React, { useState, useEffect } from 'react';
import { useTour } from '../contexts/TourContext';
import { useAuth } from '../contexts/AuthContext';
import { useTranslations } from '../hooks/useTranslations';
import TourManagementPage from './TourManagementPage';
import ShoutoutManagementPage from './ShoutoutManagementPage';

interface TourLauncherProps {
  variant?: 'button' | 'dropdown' | 'modal';
  className?: string;
  showCompleted?: boolean;
  showSkipped?: boolean;
  compact?: boolean;
}

export const TourLauncher: React.FC<TourLauncherProps> = ({ 
  variant = 'button', 
  className = '',
  showCompleted = false,
  showSkipped = false,
  compact = false
}) => {
  // Optional tour integration - handle cases where TourProvider might not be available
  let tourContext = null;
  try {
    tourContext = useTour();
  } catch (error) {
    // TourProvider not available, continue without tour functionality
    console.warn('TourProvider not available, tour launcher will be disabled');
  }

  const { isAdmin } = useAuth();
  const { t } = useTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const [showManagement, setShowManagement] = useState(false);
  const [showShoutoutManagement, setShowShoutoutManagement] = useState(false);

  const [showContextMenu, setShowContextMenu] = useState(false);

  const availableTours = tourContext ? tourContext.getAvailableTours().filter(tour => {
    // Always show all tours regardless of completion status
    // Users can restart completed tours or retry skipped ones
    return true;
  }) : [];

  // Listen for shoutout management events from ShoutoutButton
  useEffect(() => {
    const handleOpenShoutoutManagement = () => {
      setShowShoutoutManagement(true);
    };

    window.addEventListener('open-shoutout-management', handleOpenShoutoutManagement);
    return () => {
      window.removeEventListener('open-shoutout-management', handleOpenShoutoutManagement);
    };
  }, []);

  const handleStartTour = async (tourId: string) => {
    if (!tourContext) return;
    setIsOpen(false);
    await tourContext.startTour(tourId);
  };

  const getTourStatus = (tourId: string) => {
    if (!tourContext) return 'unavailable';
    if (tourContext.completedTours.includes(tourId)) return 'completed';
    if (tourContext.skippedTours.includes(tourId)) return 'skipped';
    return 'available';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'skipped':
        return (
          <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return t('tourStatusCompleted');
      case 'skipped': return t('tourStatusSkipped');
      default: return t('tourStatusAvailable');
    }
  };

  // If tour context is not available, don't render the component
  if (!tourContext) {
    return null;
  }

  if (variant === 'button') {
    return (
      <>
        <div className={`relative ${className}`}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            onContextMenu={(e) => {
              if (isAdmin) {
                e.preventDefault();
                setShowContextMenu(!showContextMenu);
              }
            }}
            disabled={tourContext.isActive}
            title={t('tourStartTour')}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
          >
            <svg className={compact ? "w-4 h-4" : "w-5 h-5"} fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            {!compact && <span className="hidden sm:inline">{t('tourStartTour')}</span>}
            {isAdmin && (
              <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            )}
          </button>

          {/* Admin Context Menu */}
          {isAdmin && showContextMenu && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-50">
              <button
                onClick={() => {
                  setShowManagement(true);
                  setShowContextMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{t('tourAdminManageTours')}</span>
                </div>
              </button>
            </div>
          )}

        {isOpen && (
          <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-slate-200 z-50">
            <div className="p-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">{t('tourSelectTour')}</h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {availableTours.length === 0 ? (
                <div className="p-4 text-center text-slate-500">
                  {t('tourNoToursAvailable')}
                </div>
              ) : (
                availableTours.map((tour) => {
                  const status = getTourStatus(tour.id);
                  return (
                    <button
                      key={tour.id}
                      onClick={() => handleStartTour(tour.id)}
                      className="w-full p-4 text-left hover:bg-slate-50 border-b border-slate-100 last:border-b-0 transition-colors"
                    >
                      <div className="flex items-start space-x-3">
                        {getStatusIcon(status)}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-slate-900 truncate">
                            {tour.name}
                          </h4>
                          <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                            {tour.description}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-slate-500">
                              {getStatusText(status)}
                            </span>
                            {tour.estimatedDuration && (
                              <span className="text-xs text-slate-500">
                                ~{tour.estimatedDuration} min
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}

          {/* Click outside to close */}
          {isOpen && (
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
          )}
        </div>

        {/* Tour Management Modal */}
        {showManagement && (
          <div className="fixed inset-0 z-50">
            <TourManagementPage onClose={() => setShowManagement(false)} />
          </div>
        )}

        {/* Shoutout Management Modal */}
        {showShoutoutManagement && (
          <div className="fixed inset-0 z-50">
            <ShoutoutManagementPage onClose={() => setShowShoutoutManagement(false)} />
          </div>
        )}

        {/* Click outside to close context menu */}
        {showContextMenu && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowContextMenu(false)}
          />
        )}
      </>
    );
  }

  if (variant === 'dropdown') {
    return (
      <div className={`relative ${className}`}>
        <select
          onChange={(e) => {
            if (e.target.value) {
              handleStartTour(e.target.value);
              e.target.value = '';
            }
          }}
          disabled={tourContext.isActive}
          className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">{t('tourSelectTour')}</option>
          {availableTours.map((tour) => {
            const status = getTourStatus(tour.id);
            return (
              <option key={tour.id} value={tour.id}>
                {tour.name} {status === 'completed' ? '✓' : status === 'skipped' ? '↻' : ''}
              </option>
            );
          })}
        </select>
      </div>
    );
  }

  if (variant === 'modal') {
    return (
      <div className={`${className}`}>
        <button
          onClick={() => setIsOpen(true)}
          disabled={tourContext.isActive}
          className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{t('tourGuidedTours')}</span>
        </button>

        {isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-slate-900">
                    {t('tourGuidedTours')}
                  </h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-96">
                {availableTours.length === 0 ? (
                  <div className="text-center text-slate-500 py-8">
                    {t('tourNoToursAvailable')}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {availableTours.map((tour) => {
                      const status = getTourStatus(tour.id);
                      return (
                        <div
                          key={tour.id}
                          className="border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition-colors"
                        >
                          <div className="flex items-start space-x-3">
                            {getStatusIcon(status)}
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-medium text-slate-900">
                                {tour.name}
                              </h3>
                              <p className="text-slate-600 mt-1">
                                {tour.description}
                              </p>
                              <div className="flex items-center justify-between mt-3">
                                <div className="flex items-center space-x-4 text-sm text-slate-500">
                                  <span className="flex items-center space-x-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>{tour.estimatedDuration} min</span>
                                  </span>
                                  <span className="flex items-center space-x-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                                    </svg>
                                    <span>{tour.steps.length} steps</span>
                                  </span>
                                </div>
                                <button
                                  onClick={() => handleStartTour(tour.id)}
                                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 transform hover:scale-105"
                                >
                                  {status === 'completed' ? t('tourRestart') : status === 'skipped' ? t('tourRetry') : t('tourStart')}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
};
