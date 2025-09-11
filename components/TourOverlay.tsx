import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTour, type TourStep } from '../contexts/TourContext';
import { useTranslations } from '../hooks/useTranslations';

interface TourOverlayProps {
  className?: string;
}

interface ElementPosition {
  top: number;
  left: number;
  width: number;
  height: number;
  element: HTMLElement;
}

export const TourOverlay: React.FC<TourOverlayProps> = ({ className = '' }) => {
  // Optional tour integration - handle cases where TourProvider might not be available
  let tourContext = null;
  try {
    tourContext = useTour();
  } catch (error) {
    console.warn('TourProvider not available, tour overlay will be disabled');
  }

  const { t } = useTranslations();
  
  // If tour context is not available, don't render the overlay
  if (!tourContext) {
    return null;
  }

  const { currentTour, currentStepIndex, isActive, nextStep, previousStep, skipTour, completeTour } = tourContext;
  const [elementPosition, setElementPosition] = useState<ElementPosition | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<'entering' | 'active' | 'exiting'>('entering');
  const overlayRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);

  // Cache for element positions to avoid repeated DOM queries
  const elementCache = useRef<Map<string, ElementPosition>>(new Map());
  
  const getElementPosition = useCallback((selector: string): ElementPosition | null => {
    try {
      // Check cache first
      const cached = elementCache.current.get(selector);
      if (cached && document.contains(cached.element)) {
        // Update cached position
        const rect = cached.element.getBoundingClientRect();
        const updated = {
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height,
          element: cached.element
        };
        elementCache.current.set(selector, updated);
        return updated;
      }
      
      // Find element
      let element: HTMLElement | null = null;
      
      if (selector.startsWith('[data-tour=')) {
        element = document.querySelector(selector) as HTMLElement;
      } else {
        // Try as data-tour attribute first
        element = document.querySelector(`[data-tour="${selector}"]`) as HTMLElement;
        // If not found, try as regular selector
        if (!element) {
          element = document.querySelector(selector) as HTMLElement;
        }
      }
      
      if (!element) return null;

      const rect = element.getBoundingClientRect();
      const position = {
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height,
        element
      };
      
      // Cache the result
      elementCache.current.set(selector, position);
      return position;
    } catch (error) {
      console.warn('Error finding element:', selector, error);
      return null;
    }
  }, []);

  const calculateTooltipPosition = useCallback((
    elementPos: ElementPosition,
    position: TourStep['position'] = 'top',
    tooltipWidth: number = 300,
    tooltipHeight: number = 200
  ) => {
    const padding = 20;
    const arrowSize = 10;
    let top = 0;
    let left = 0;

    switch (position) {
      case 'top':
        top = elementPos.top - tooltipHeight - padding - arrowSize;
        left = elementPos.left + (elementPos.width / 2) - (tooltipWidth / 2);
        break;
      case 'bottom':
        top = elementPos.top + elementPos.height + padding + arrowSize;
        left = elementPos.left + (elementPos.width / 2) - (tooltipWidth / 2);
        break;
      case 'left':
        top = elementPos.top + (elementPos.height / 2) - (tooltipHeight / 2);
        left = elementPos.left - tooltipWidth - padding - arrowSize;
        break;
      case 'right':
        top = elementPos.top + (elementPos.height / 2) - (tooltipHeight / 2);
        left = elementPos.left + elementPos.width + padding + arrowSize;
        break;
      case 'center':
        top = window.innerHeight / 2 - tooltipHeight / 2;
        left = window.innerWidth / 2 - tooltipWidth / 2;
        break;
    }

    // Ensure tooltip stays within viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (left < padding) left = padding;
    if (left + tooltipWidth > viewportWidth - padding) {
      left = viewportWidth - tooltipWidth - padding;
    }
    if (top < padding) top = padding;
    if (top + tooltipHeight > viewportHeight - padding) {
      top = viewportHeight - tooltipHeight - padding;
    }

    return { top, left };
  }, []);

  const updateElementPosition = useCallback(async () => {
    if (!isActive || !currentTour || currentStepIndex < 0) {
      setElementPosition(null);
      setIsVisible(false);
      setAnimationPhase('exiting');
      return;
    }

    const currentStep = currentTour.steps[currentStepIndex];
    if (!currentStep) return;

    // Start transition animation
    setIsTransitioning(true);
    setAnimationPhase('entering');

    // Try to find element immediately
    const pos = getElementPosition(currentStep.target);
    if (pos) {
      // Set position immediately
      setElementPosition(pos);
      
      // Calculate tooltip position
      const tooltipPos = calculateTooltipPosition(pos, currentStep.position);
      setTooltipPosition(tooltipPos);
      
      // Quick scroll if needed (no waiting)
      const element = document.querySelector(currentStep.target);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      
      // Animate in quickly
      setTimeout(() => {
        setIsVisible(true);
        setAnimationPhase('active');
        setIsTransitioning(false);
      }, 150);
      
      return;
    }

    // Element not found
    if (currentStep.skipIfNotFound) {
      // Auto-advance to next step with delay
      setTimeout(() => {
        if (currentStepIndex < currentTour!.steps.length - 1) {
          nextStep();
        } else {
          completeTour();
        }
      }, 1000);
    } else {
      console.warn('Tour step target not found:', currentStep.target);
      setIsVisible(false);
      setAnimationPhase('exiting');
    }
  }, [isActive, currentTour, currentStepIndex, getElementPosition, calculateTooltipPosition, nextStep, completeTour]);

  // Update position when tour state changes
  useEffect(() => {
    updateElementPosition();
  }, [updateElementPosition]);

  // Update position on window resize/scroll (throttled)
  useEffect(() => {
    let resizeTimeout: NodeJS.Timeout;
    let scrollTimeout: NodeJS.Timeout;
    
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(updateElementPosition, 100);
    };
    
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(updateElementPosition, 50);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      clearTimeout(resizeTimeout);
      clearTimeout(scrollTimeout);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [updateElementPosition]);

  // Clear cache on unmount
  useEffect(() => {
    return () => {
      elementCache.current.clear();
    };
  }, []);

  const handleOverlayClick = (e: React.MouseEvent) => {
    // Don't close tour when clicking on overlay
    e.stopPropagation();
  };

  const handleNext = async () => {
    if (isTransitioning) return;
    
    // Add cinematic exit animation
    setAnimationPhase('exiting');
    setIsTransitioning(true);
    
    // Wait for exit animation
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (currentTour && currentStepIndex < currentTour.steps.length - 1) {
      await nextStep();
    } else {
      await completeTour();
    }
  };

  const handlePrevious = async () => {
    if (isTransitioning) return;
    
    // Add cinematic exit animation
    setAnimationPhase('exiting');
    setIsTransitioning(true);
    
    // Wait for exit animation
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (currentStepIndex > 0) {
      await previousStep();
    }
  };


  if (!isActive || !currentTour || !isVisible || !elementPosition) {
    return null;
  }


  const currentStep = currentTour.steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / currentTour.steps.length) * 100;

  return (
    <div
      ref={overlayRef}
      className={`fixed inset-0 z-[9999] transition-all duration-300 ${className} ${
        animationPhase === 'entering' ? 'opacity-0' : 
        animationPhase === 'exiting' ? 'opacity-0' : 'opacity-100'
      }`}
      onClick={handleOverlayClick}
      style={{ pointerEvents: 'none' }}
    >
      {/* Backdrop with spotlight */}
      <div className={`absolute inset-0 bg-black transition-all duration-300 ${
        animationPhase === 'entering' ? 'bg-opacity-0' : 
        animationPhase === 'exiting' ? 'bg-opacity-0' : 'bg-opacity-25'
      }`}>
        {/* Spotlight cutout */}
        <div
          ref={spotlightRef}
          className={`absolute bg-transparent border-4 border-blue-400 rounded-lg shadow-lg transition-transform duration-300 ease-out ${
            animationPhase === 'entering' ? 'scale-50 opacity-0' : 
            animationPhase === 'exiting' ? 'scale-50 opacity-0' : 'scale-100 opacity-100'
          }`}
          style={{
            top: elementPosition.top - 8,
            left: elementPosition.left - 8,
            width: elementPosition.width + 16,
            height: elementPosition.height + 16,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5), 0 0 20px rgba(59, 130, 246, 0.5)',
            animation: animationPhase === 'active' ? 'tour-pulse 2s infinite, tour-glow 3s infinite' : 'none'
          }}
        />
        
      </div>

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className={`absolute bg-white rounded-lg shadow-2xl border border-slate-200 max-w-xs transition-transform duration-300 ease-out ${
          animationPhase === 'entering' ? 'scale-75 opacity-0 translate-y-4' : 
          animationPhase === 'exiting' ? 'scale-75 opacity-0 translate-y-4' : 'scale-100 opacity-100 translate-y-0'
        }`}
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
          zIndex: 10000,
          pointerEvents: 'auto',
          transform: animationPhase === 'entering' ? 'scale(0.75) translateY(16px)' : 
                    animationPhase === 'exiting' ? 'scale(0.75) translateY(16px)' : 'scale(1) translateY(0)'
        }}
      >
        {/* Compact Progress bar */}
        <div className="w-full h-1 bg-slate-200 rounded-t-lg overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {currentStep.title}
            </h3>
            <div className="text-xs text-slate-500 mb-3">
              Step {currentStepIndex + 1} of {currentTour.steps.length}
            </div>
          </div>

          <p className="text-slate-700 mb-4 leading-relaxed text-sm">
            {currentStep.content}
          </p>

          {/* Compact Navigation */}
          <div className="pt-4 border-t border-slate-100">
            {/* Step Progress */}
            <div className="flex items-center justify-center mb-3">
              <div className="flex items-center space-x-1">
                {currentTour.steps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                      index === currentStepIndex 
                        ? 'bg-blue-500 scale-150' 
                        : index < currentStepIndex 
                          ? 'bg-green-400' 
                          : 'bg-slate-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between">
              {/* Left - Previous */}
              <button
                onClick={handlePrevious}
                disabled={currentStepIndex === 0 || isTransitioning}
                className="flex items-center justify-center w-8 h-8 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
                title={t('tourPrevious')}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Right - Next/Complete */}
              <button
                onClick={handleNext}
                disabled={isTransitioning}
                className="flex items-center justify-center w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                title={currentStepIndex < currentTour.steps.length - 1 ? t('tourNext') : t('tourComplete')}
              >
                {currentStepIndex < currentTour.steps.length - 1 ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            </div>

            {/* Exit option - subtle */}
            <div className="flex justify-center mt-2">
              <button
                onClick={skipTour}
                disabled={isTransitioning}
                className="text-xs text-slate-400 hover:text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {t('tourExit')}
              </button>
            </div>
          </div>
        </div>

        {/* Arrow pointing to element */}
        {currentStep.position !== 'center' && (
          <div
            className="absolute w-0 h-0"
            style={{
              ...(currentStep.position === 'top' && {
                top: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                borderLeft: '10px solid transparent',
                borderRight: '10px solid transparent',
                borderTop: '10px solid white'
              }),
              ...(currentStep.position === 'bottom' && {
                bottom: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                borderLeft: '10px solid transparent',
                borderRight: '10px solid transparent',
                borderBottom: '10px solid white'
              }),
              ...(currentStep.position === 'left' && {
                top: '50%',
                left: '100%',
                transform: 'translateY(-50%)',
                borderTop: '10px solid transparent',
                borderBottom: '10px solid transparent',
                borderLeft: '10px solid white'
              }),
              ...(currentStep.position === 'right' && {
                top: '50%',
                right: '100%',
                transform: 'translateY(-50%)',
                borderTop: '10px solid transparent',
                borderBottom: '10px solid transparent',
                borderRight: '10px solid white'
              })
            }}
          />
        )}
      </div>

      {/* Enhanced cinematic animations */}
      <style>{`
        @keyframes tour-pulse {
          0%, 100% {
            box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5), 0 0 20px rgba(59, 130, 246, 0.5);
          }
          50% {
            box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5), 0 0 30px rgba(59, 130, 246, 0.8);
          }
        }
        
        @keyframes tour-glow {
          0%, 100% {
            filter: brightness(1) drop-shadow(0 0 10px rgba(59, 130, 246, 0.3));
          }
          50% {
            filter: brightness(1.2) drop-shadow(0 0 20px rgba(59, 130, 246, 0.6));
          }
        }
        
        
        @keyframes tour-shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        .tour-shimmer {
          animation: tour-shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
};
