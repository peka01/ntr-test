import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useTranslations } from '../hooks/useTranslations';
import { useTour } from './TourContext';
import { tourManagementService } from '../services/tourManagementService';

export interface ShoutoutFeature {
  id: string;
  title: string;
  description: string;
  image?: string;
  icon?: string;
  tourId?: string;
  category: 'feature' | 'improvement' | 'announcement';
  priority: 'low' | 'medium' | 'high';
  releaseDate: string;
  expireDate?: string;
  isNew?: boolean;
}

interface ShoutoutContextType {
  currentShoutout: ShoutoutFeature | null;
  isVisible: boolean;
  showShoutout: (featureId: string) => void;
  hideShoutout: () => void;
  getAvailableFeatures: () => ShoutoutFeature[];
  markAsSeen: (featureId: string) => void;
  hasUnseenFeatures: () => boolean;
  handleStartTour: () => void;
}

const ShoutoutContext = createContext<ShoutoutContextType | undefined>(undefined);

export const useShoutout = () => {
  const context = useContext(ShoutoutContext);
  if (context === undefined) {
    throw new Error('useShoutout must be used within a ShoutoutProvider');
  }
  return context;
};

export const ShoutoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t } = useTranslations();
  
  // Optional tour integration - handle cases where TourProvider might not be available
  let startTour: ((tourId: string) => void) | null = null;
  try {
    const tourContext = useTour();
    startTour = tourContext.startTour;
  } catch (error) {
    // TourProvider not available, continue without tour integration
    console.warn('TourProvider not available, shoutout tours will be disabled');
  }
  const [currentShoutout, setCurrentShoutout] = useState<ShoutoutFeature | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [seenFeatures, setSeenFeatures] = useState<Set<string>>(new Set());

  // Load seen features from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('shoutout-seen');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setSeenFeatures(new Set(parsed));
        }
      }
    } catch (error) {
      console.warn('Failed to load seen features:', error);
      localStorage.removeItem('shoutout-seen');
    }
  }, []);

  // Save seen features to localStorage
  const saveSeenFeatures = useCallback((features: Set<string>) => {
    try {
      localStorage.setItem('shoutout-seen', JSON.stringify(Array.from(features)));
    } catch (error) {
      console.warn('Failed to save seen features:', error);
    }
  }, []);

  // Define available features (combines default and admin-created features)
  const getAvailableFeatures = useCallback((): ShoutoutFeature[] => {
    // Get admin-created shoutouts from backend
    const adminShoutouts = tourManagementService.getShoutouts();
    
    // Default shoutouts (fallback if no admin shoutouts exist)
    const defaultShoutouts: ShoutoutFeature[] = [
      {
        id: 'tour-system',
        title: t('shoutoutTourSystemTitle'),
        description: t('shoutoutTourSystemDescription'),
        icon: '🎯',
        tourId: 'welcome-tour',
        category: 'feature',
        priority: 'high',
        releaseDate: '2024-01-15',
        expireDate: '2025-01-15',
        isNew: true,
      },
      {
        id: 'admin-tours',
        title: t('shoutoutAdminToursTitle'),
        description: t('shoutoutAdminToursDescription'),
        icon: '⚙️',
        tourId: 'admin-tour',
        category: 'feature',
        priority: 'medium',
        releaseDate: '2024-01-15',
        expireDate: '2025-01-15',
        isNew: true,
      },
      {
        id: 'cinematic-tours',
        title: t('shoutoutCinematicToursTitle'),
        description: t('shoutoutCinematicToursDescription'),
        icon: '🎬',
        tourId: 'cinematic-demo',
        category: 'feature',
        priority: 'medium',
        releaseDate: '2024-01-15',
        expireDate: '2025-01-15',
        isNew: true,
      },
      {
        id: 'performance-improvements',
        title: t('shoutoutPerformanceTitle'),
        description: t('shoutoutPerformanceDescription'),
        icon: '⚡',
        category: 'improvement',
        priority: 'high',
        releaseDate: '2024-01-15',
        expireDate: '2025-01-15',
        isNew: true,
      },
    ];

    // If admin has created shoutouts, use those; otherwise use defaults
    const allShoutouts = adminShoutouts.length > 0 ? adminShoutouts : defaultShoutouts;
    
    // Filter out expired items
    const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    return allShoutouts.filter(shoutout => {
      if (!shoutout.expireDate) {
        return true; // No expire date means it never expires
      }
      return shoutout.expireDate >= currentDate;
    });
  }, [t]);

  const showShoutout = useCallback((featureId: string) => {
    const features = getAvailableFeatures();
    const feature = features.find(f => f.id === featureId);
    
    if (feature) {
      setCurrentShoutout(feature);
      setIsVisible(true);
    }
  }, [getAvailableFeatures]);

  const hideShoutout = useCallback(() => {
    setIsVisible(false);
    setCurrentShoutout(null);
  }, []);

  const markAsSeen = useCallback((featureId: string) => {
    const newSeenFeatures = new Set(seenFeatures);
    newSeenFeatures.add(featureId);
    setSeenFeatures(newSeenFeatures);
    saveSeenFeatures(newSeenFeatures);
  }, [seenFeatures, saveSeenFeatures]);

  const hasUnseenFeatures = useCallback(() => {
    const features = getAvailableFeatures();
    return features.some(feature => !seenFeatures.has(feature.id));
  }, [getAvailableFeatures, seenFeatures]);

  const handleStartTour = useCallback(() => {
    if (currentShoutout?.tourId && startTour) {
      markAsSeen(currentShoutout.id);
      hideShoutout();
      // Small delay to ensure the splash is hidden before starting tour
      setTimeout(() => {
        startTour(currentShoutout.tourId);
      }, 100);
    } else if (currentShoutout?.tourId && !startTour) {
      console.warn('Tour system not available');
      markAsSeen(currentShoutout.id);
      hideShoutout();
    }
  }, [currentShoutout, markAsSeen, hideShoutout, startTour]);

  const handleDismiss = useCallback(() => {
    if (currentShoutout) {
      markAsSeen(currentShoutout.id);
    }
    hideShoutout();
  }, [currentShoutout, markAsSeen, hideShoutout]);

  const value: ShoutoutContextType = {
    currentShoutout,
    isVisible,
    showShoutout,
    hideShoutout,
    getAvailableFeatures,
    markAsSeen,
    hasUnseenFeatures,
    handleStartTour,
  };

  return (
    <ShoutoutContext.Provider value={value}>
      {children}
    </ShoutoutContext.Provider>
  );
};
