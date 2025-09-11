import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { useTranslations } from '../hooks/useTranslations';
import { tourManagementService } from '../services/tourManagementService';

export interface TourStep {
  id: string;
  title: string;
  content: string;
  target?: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: 'none' | 'click' | 'wait' | 'navigate' | 'scroll';
  actionTarget?: string;
  waitTime?: number;
  requiredView?: string;
  skipIfNotFound?: boolean;
  beforeStep?: () => Promise<void>;
}

export interface Tour {
  id: string;
  name: string;
  description: string;
  category: 'onboarding' | 'feature' | 'admin' | 'user';
  requiredRole?: 'any' | 'admin' | 'user';
  estimatedDuration: number;
  steps: TourStep[];
}

interface TourContextType {
  currentTour: Tour | null;
  currentStepIndex: number;
  isActive: boolean;
  completedTours: string[];
  skippedTours: string[];
  startTour: (tourId: string) => Promise<void>;
  nextStep: () => Promise<void>;
  previousStep: () => void;
  completeTour: () => void;
  skipTour: () => void;
  getAvailableTours: () => Tour[];
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export const useTour = () => {
  const context = useContext(TourContext);
  if (context === undefined) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
};

export const TourProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t } = useTranslations();
  const [currentTour, setCurrentTour] = useState<Tour | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [completedTours, setCompletedTours] = useState<Set<string>>(new Set());
  const [skippedTours, setSkippedTours] = useState<Set<string>>(new Set());

  // Reset any body styles that might be causing issues
  const resetBodyStyles = useCallback(() => {
    document.body.style.opacity = '';
    document.body.style.transition = '';
    document.body.style.pointerEvents = '';
    document.body.style.overflow = '';
  }, []);

  // Reset body styles on mount and when tour completes
  useEffect(() => {
    resetBodyStyles();
  }, [resetBodyStyles]);

  useEffect(() => {
    if (!isActive) {
      resetBodyStyles();
    }
  }, [isActive, resetBodyStyles]);

  // Load completed/skipped tours from localStorage
  useEffect(() => {
    // Clear any corrupted tour data first
    const clearCorruptedTourData = () => {
      const keys = ['tour-completed', 'tour-skipped'];
      keys.forEach(key => {
        try {
          const data = localStorage.getItem(key);
          if (data && data !== '[]' && data !== 'null') {
            JSON.parse(data);
          }
        } catch (error) {
          console.warn(`Clearing corrupted tour data for key: ${key}`, error);
          localStorage.removeItem(key);
        }
      });
    };

    clearCorruptedTourData();

    const savedCompleted = localStorage.getItem('tour-completed');
    const savedSkipped = localStorage.getItem('tour-skipped');
    
    if (savedCompleted) {
      try {
        const parsed = JSON.parse(savedCompleted);
        if (Array.isArray(parsed)) {
          setCompletedTours(new Set(parsed));
        }
      } catch (error) {
        console.warn('Invalid tour-completed data in localStorage, clearing:', error);
        localStorage.removeItem('tour-completed');
      }
    }
    if (savedSkipped) {
      try {
        const parsed = JSON.parse(savedSkipped);
        if (Array.isArray(parsed)) {
          setSkippedTours(new Set(parsed));
        }
      } catch (error) {
        console.warn('Invalid tour-skipped data in localStorage, clearing:', error);
        localStorage.removeItem('tour-skipped');
      }
    }
  }, []);

  // Save completed/skipped tours to localStorage
  const saveTourStatus = useCallback((tourId: string, status: 'completed' | 'skipped') => {
    if (status === 'completed') {
      setCompletedTours(prev => {
        const newSet = new Set(prev);
        newSet.add(tourId);
        localStorage.setItem('tour-completed', JSON.stringify([...newSet]));
        return newSet;
      });
    } else {
      setSkippedTours(prev => {
        const newSet = new Set(prev);
        newSet.add(tourId);
        localStorage.setItem('tour-skipped', JSON.stringify([...newSet]));
        return newSet;
      });
    }
  }, []);

  // Get default tours with translations - memoized to prevent infinite re-renders
  const getTours = useCallback(() => {
    return [
      {
        id: 'welcome-tour',
        name: t('tourWelcomeName'),
        description: t('tourWelcomeDescription'),
        category: 'onboarding' as const,
        requiredRole: 'any' as const,
        estimatedDuration: 3,
        steps: [
          {
            id: 'welcome-1',
            title: t('tourWelcomeStep1Title'),
            content: t('tourWelcomeStep1Content'),
            target: 'app-title',
            position: 'bottom' as const,
            action: 'none' as const,
            skipIfNotFound: true,
          },
          {
            id: 'welcome-2',
            title: t('tourWelcomeStep2Title'),
            content: t('tourWelcomeStep2Content'),
            target: 'subscription-cards',
            position: 'top' as const,
            action: 'none' as const,
            skipIfNotFound: true,
          },
        ],
      },
      {
        id: 'admin-tour',
        name: t('tourAdminName'),
        description: t('tourAdminDescription'),
        category: 'admin' as const,
        requiredRole: 'admin' as const,
        estimatedDuration: 5,
        steps: [
          {
            id: 'admin-1',
            title: t('tourAdminStep1Title'),
            content: t('tourAdminStep1Content'),
            target: 'nav-trainings',
            position: 'bottom' as const,
            action: 'navigate' as const,
            actionTarget: 'trainings',
            requiredView: 'trainings',
            skipIfNotFound: true,
          },
          {
            id: 'admin-2',
            title: t('tourAdminStep2Title'),
            content: t('tourAdminStep2Content'),
            target: 'add-training-button',
            position: 'bottom' as const,
            action: 'click' as const,
            skipIfNotFound: true,
          },
          {
            id: 'admin-3',
            title: t('tourAdminStep3Title'),
            content: t('tourAdminStep3Content'),
            target: 'create-training-form',
            position: 'top' as const,
            action: 'none' as const,
            skipIfNotFound: true,
            beforeStep: async () => {
              const button = document.querySelector('[data-tour="add-training-button"]') as HTMLButtonElement;
              if (button && !document.querySelector('[data-tour="create-training-form"]')) {
                button.click();
                await new Promise(resolve => setTimeout(resolve, 300));
              }
            },
          },
          {
            id: 'admin-4',
            title: t('tourAdminStep4Title'),
            content: t('tourAdminStep4Content'),
            target: 'nav-users',
            position: 'bottom' as const,
            action: 'navigate' as const,
            actionTarget: 'users',
            requiredView: 'users',
            skipIfNotFound: true,
          },
          {
            id: 'admin-5',
            title: t('tourAdminStep5Title'),
            content: t('tourAdminStep5Content'),
            target: 'add-user-button',
            position: 'bottom' as const,
            action: 'click' as const,
            skipIfNotFound: true,
          },
          {
            id: 'admin-6',
            title: t('tourAdminStep6Title'),
            content: t('tourAdminStep6Content'),
            target: 'create-user-form',
            position: 'top' as const,
            action: 'none' as const,
            skipIfNotFound: true,
            beforeStep: async () => {
              const button = document.querySelector('[data-tour="add-user-button"]') as HTMLButtonElement;
              if (button && !document.querySelector('[data-tour="create-user-form"]')) {
                button.click();
                await new Promise(resolve => setTimeout(resolve, 300));
              }
            },
          },
          {
            id: 'admin-7',
            title: t('tourAdminStep7Title'),
            content: t('tourAdminStep7Content'),
            target: 'voucher-management',
            position: 'top' as const,
            action: 'none' as const,
            skipIfNotFound: true,
          },
        ],
      },
      {
        id: 'attendance-tour',
        name: t('tourAttendanceName'),
        description: t('tourAttendanceDescription'),
        category: 'feature' as const,
        requiredRole: 'any' as const,
        estimatedDuration: 4,
        steps: [
          {
            id: 'attendance-1',
            title: t('tourAttendanceStep1Title'),
            content: t('tourAttendanceStep1Content'),
            target: 'nav-attendance',
            position: 'bottom' as const,
            action: 'navigate' as const,
            actionTarget: 'attendance',
            requiredView: 'attendance',
            skipIfNotFound: true,
            beforeStep: async () => {
              // Check if user is logged in, if not, skip this step
              const userElement = document.querySelector('[data-tour="nav-attendance"]');
              if (!userElement) {
                return;
              }
            },
          },
          {
            id: 'attendance-2',
            title: t('tourAttendanceStep2Title'),
            content: t('tourAttendanceStep2Content'),
            target: 'attendance-cards',
            position: 'top' as const,
            action: 'none' as const,
            skipIfNotFound: true,
          },
          {
            id: 'attendance-3',
            title: t('tourAttendanceStep3Title'),
            content: t('tourAttendanceStep3Content'),
            target: 'kiosk-mode',
            position: 'top' as const,
            action: 'none' as const,
            skipIfNotFound: true,
          },
        ],
      },
      {
        id: 'cinematic-demo',
        name: t('tourCinematicName'),
        description: t('tourCinematicDescription'),
        category: 'feature' as const,
        requiredRole: 'any' as const,
        estimatedDuration: 8,
        steps: [
          {
            id: 'cinematic-1',
            title: t('tourCinematicStep1Title'),
            content: t('tourCinematicStep1Content'),
            target: 'app-title',
            position: 'bottom' as const,
            action: 'none' as const,
            skipIfNotFound: true,
          },
          {
            id: 'cinematic-2',
            title: t('tourCinematicStep2Title'),
            content: t('tourCinematicStep2Content'),
            target: 'help-button',
            position: 'left' as const,
            action: 'click' as const,
            skipIfNotFound: true,
          },
          {
            id: 'cinematic-3',
            title: t('tourCinematicStep3Title'),
            content: t('tourCinematicStep3Content'),
            target: 'subscription-cards',
            position: 'top' as const,
            action: 'none' as const,
            skipIfNotFound: true,
          },
        ],
      },
      {
        id: 'help-tour',
        name: t('tourHelpName'),
        description: t('tourHelpDescription'),
        category: 'feature' as const,
        requiredRole: 'any' as const,
        estimatedDuration: 6,
        steps: [
          {
            id: 'help-1',
            title: t('tourHelpStep1Title'),
            content: t('tourHelpStep1Content'),
            target: 'help-window',
            position: 'center' as const,
            action: 'none' as const,
            skipIfNotFound: true,
            beforeStep: async () => {
              // Check if help system is already open
              const helpWindow = document.querySelector('[data-tour="help-window"]');
              if (!helpWindow) {
                // Help system is not open, trigger the help button click
                const helpButton = document.querySelector('[data-tour="help-button"]') as HTMLButtonElement;
                if (helpButton) {
                  helpButton.click();
                  // Wait a moment for the help system to open
                  await new Promise(resolve => setTimeout(resolve, 500));
                } else {
                  console.warn('Help button not found, cannot open help system');
                }
              }
            },
          },
          {
            id: 'help-2',
            title: t('tourHelpStep2Title'),
            content: t('tourHelpStep2Content'),
            target: 'help-toc',
            position: 'right' as const,
            action: 'none' as const,
            skipIfNotFound: true,
          },
          {
            id: 'help-3',
            title: t('tourHelpStep3Title'),
            content: t('tourHelpStep3Content'),
            target: 'help-search',
            position: 'bottom' as const,
            action: 'none' as const,
            skipIfNotFound: true,
          },
          {
            id: 'help-4',
            title: t('tourHelpStep4Title'),
            content: t('tourHelpStep4Content'),
            target: 'help-ai-input',
            position: 'top' as const,
            action: 'none' as const,
            skipIfNotFound: true,
          },
          {
            id: 'help-5',
            title: t('tourHelpStep5Title'),
            content: t('tourHelpStep5Content'),
            target: 'help-ai-response',
            position: 'top' as const,
            action: 'none' as const,
            skipIfNotFound: true,
          },
          {
            id: 'help-6',
            title: t('tourHelpStep6Title'),
            content: t('tourHelpStep6Content'),
            target: 'help-context-info',
            position: 'bottom' as const,
            action: 'none' as const,
            skipIfNotFound: true,
          },
        ],
      },
    ];
  }, [t]);

  // Get available tours (default + admin created)
  const getAvailableTours = useCallback(() => {
    const defaultTours = getTours();
    const adminTours = tourManagementService.getTours();
    return [...defaultTours, ...adminTours];
  }, [getTours]);

  // Execute step action
  const executeStepAction = useCallback(async (step: TourStep) => {
    if (!step.action || step.action === 'none') return;

    switch (step.action) {
      case 'click':
        if (step.actionTarget) {
          const element = document.querySelector(`[data-tour="${step.actionTarget}"]`) as HTMLElement;
          if (element) {
            // Cinematic click animation
            element.style.transform = 'scale(0.95)';
            element.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.5)';
            await new Promise(resolve => setTimeout(resolve, 100));
            element.click();
            await new Promise(resolve => setTimeout(resolve, 100));
            element.style.transform = '';
            element.style.boxShadow = '';
          }
        }
        break;
      case 'navigate':
        if (step.actionTarget) {
          // Cinematic page transition
          document.body.style.opacity = '0.7';
          document.body.style.transition = 'opacity 0.3s ease';
          
          const event = new CustomEvent('ai-action', {
            detail: { type: 'navigate', payload: { view: step.actionTarget } }
          });
          window.dispatchEvent(event);
          
          await new Promise(resolve => setTimeout(resolve, 150));
          document.body.style.opacity = '1';
          // Ensure we reset the transition after the animation
          setTimeout(() => {
            document.body.style.transition = '';
          }, 300);
        }
        break;
      case 'wait':
        await new Promise(resolve => setTimeout(resolve, Math.min(step.waitTime || 1000, 1000)));
        break;
      case 'scroll':
        if (step.actionTarget) {
          const element = document.querySelector(`[data-tour="${step.actionTarget}"]`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        }
        break;
    }
  }, []);

  const startTour = useCallback(async (tourId: string) => {
    const tours = getAvailableTours();
    const tour = tours.find(t => t.id === tourId);
    if (!tour) return;

    // Cinematic entrance
    document.body.style.opacity = '0.8';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setCurrentTour(tour);
    setCurrentStepIndex(0);
    setIsActive(true);
    
    // Wait for entrance animation
    await new Promise(resolve => setTimeout(resolve, 500));
    document.body.style.opacity = '1';
  }, [getAvailableTours]);

  const nextStep = useCallback(async () => {
    if (!currentTour) return;

    const currentStep = currentTour.steps[currentStepIndex];
    if (currentStep) {
      await executeStepAction(currentStep);
    }

    if (currentStepIndex < currentTour.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      completeTour();
    }
  }, [currentTour, currentStepIndex, executeStepAction]);

  const previousStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  }, [currentStepIndex]);

  const completeTour = useCallback(() => {
    if (currentTour) {
      saveTourStatus(currentTour.id, 'completed');
      
      // Cinematic exit
      document.body.style.opacity = '0.8';
      document.body.style.transition = 'opacity 0.5s ease';
      
      setTimeout(() => {
        setCurrentTour(null);
        setCurrentStepIndex(0);
        setIsActive(false);
        document.body.style.opacity = '1';
      }, 500);
    }
  }, [currentTour, saveTourStatus]);

  const skipTour = useCallback(() => {
    if (currentTour) {
      saveTourStatus(currentTour.id, 'skipped');
      
      // Cinematic exit
      document.body.style.opacity = '0.8';
      document.body.style.transition = 'opacity 0.5s ease';
      
      setTimeout(() => {
        setCurrentTour(null);
        setCurrentStepIndex(0);
        setIsActive(false);
        document.body.style.opacity = '1';
      }, 500);
    }
  }, [currentTour, saveTourStatus]);

  const value: TourContextType = {
    currentTour,
    currentStepIndex,
    isActive,
    completedTours: Array.from(completedTours),
    skippedTours: Array.from(skippedTours),
    startTour,
    nextStep,
    previousStep,
    completeTour,
    skipTour,
    getAvailableTours,
  };

  return (
    <TourContext.Provider value={value}>
      {children}
    </TourContext.Provider>
  );
};