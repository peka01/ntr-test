import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { useTranslations } from '../hooks/useTranslations';
import { useTour } from './TourContext';
import { useLanguage } from './LanguageContext';
import { useAuth } from './AuthContext';
import { helpSystemService, HelpShoutout } from '../services/helpSystemService';

export interface ShoutoutFeature {
  id: string;
  title: string;
  description: string;
  image?: string;
  icon?: string;
  tourId?: string;
  category: 'feature' | 'improvement' | 'announcement' | 'bugfix';
  priority: 'low' | 'medium' | 'high';
  language?: 'en' | 'sv';
  target_group: 'public' | 'authenticated' | 'admin';
  releaseDate: string;
  expireDate?: string;
  isNew?: boolean;
}

interface ShoutoutContextType {
  currentShoutout: ShoutoutFeature | null;
  isVisible: boolean;
  showShoutout: (featureId: string) => void;
  hideShoutout: () => void;
  getAvailableFeatures: () => Promise<ShoutoutFeature[]>;
  markAsSeen: (featureId: string) => void;
  hasUnseenFeatures: () => Promise<boolean>;
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
  
  // Get current language at the top level
  const { language } = useLanguage();
  const currentLanguage = language === 'sv' ? 'sv' : 'en';
  
  // Get authentication status
  const { user, isAdmin } = useAuth();
  
  console.log('🔧 ShoutoutProvider initializing:', { currentLanguage, user: !!user, isAdmin });
  
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

  // No default shoutouts - database is the master

  // Get available features from database only
  const getAvailableFeatures = useCallback(async (): Promise<ShoutoutFeature[]> => {
    try {
      // Get shoutouts from database for current language
      const dbShoutouts = await helpSystemService.getShoutouts(currentLanguage);
      
      // Convert database format to ShoutoutFeature format
      const shoutouts: ShoutoutFeature[] = dbShoutouts.map(dbShoutout => ({
        id: dbShoutout.id,
        title: dbShoutout.title,
        description: dbShoutout.description,
        image: dbShoutout.image,
        icon: dbShoutout.icon,
        tourId: dbShoutout.tour_id,
        category: dbShoutout.category,
        priority: dbShoutout.priority,
        language: dbShoutout.language,
        target_group: dbShoutout.target_group,
        releaseDate: dbShoutout.release_date,
        expireDate: dbShoutout.expire_date,
        isNew: dbShoutout.is_new,
      }));
      
      // Filter based on authentication status and target group
      if (!user) {
        // Non-logged-in users: only show public shoutouts
        return shoutouts.filter(shoutout => shoutout.target_group === 'public');
      } else if (!isAdmin) {
        // Logged-in users (non-admin): show public and authenticated shoutouts
        return shoutouts.filter(shoutout => 
          shoutout.target_group === 'public' || shoutout.target_group === 'authenticated'
        );
      } else {
        // Admin users: see all shoutouts
        return shoutouts;
      }
    } catch (error) {
      console.error('Error fetching shoutouts from database:', error);
      console.warn('ShoutoutProvider: Database table may not exist. Run setup-help-database.sql to create the help_shoutouts table.');
      // Return empty array instead of throwing - this allows the provider to work
      return [];
    }
  }, [currentLanguage, user, isAdmin]);

  const showShoutout = useCallback(async (featureId: string) => {
    const features = await getAvailableFeatures();
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

  const hasUnseenFeatures = useCallback(async (): Promise<boolean> => {
    const features = await getAvailableFeatures();
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
