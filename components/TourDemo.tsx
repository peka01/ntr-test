import React from 'react';
import { useTour } from '../contexts/TourContext';
import { useAuth } from '../contexts/AuthContext';
import { useTranslations } from '../hooks/useTranslations';

export const TourDemo: React.FC = () => {
  // Make resilient to missing TourProvider
  let tourContext = null;
  try {
    tourContext = useTour();
  } catch (error) {
    console.warn('TourProvider not available, tour demo will be disabled');
    return null;
  }

  // If tour context is not available, don't render the demo
  if (!tourContext) {
    return null;
  }

  const { state, startTour, getAvailableTours } = tourContext;
  const { isAdmin } = useAuth();
  const { t } = useTranslations();

  const availableTours = getAvailableTours().filter(tour => {
    if (tour.requiredRole === 'admin' && !isAdmin) return false;
    if (tour.requiredRole === 'user' && isAdmin) return false;
    return true;
  });

  return (
    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">
        Tour System Demo
      </h2>
      
      <div className="space-y-4">
        <p className="text-slate-600">
          The tour system can guide users through sequences, switch between pages, and highlight elements. 
          Here are the available tours for your role:
        </p>
        
        <div className="grid gap-3">
          {availableTours.map((tour) => (
            <div key={tour.id} className="border border-slate-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-slate-900">{tour.name}</h3>
                  <p className="text-sm text-slate-600 mt-1">{tour.description}</p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-slate-500">
                    <span>{tour.steps.length} steps</span>
                    {tour.estimatedDuration && (
                      <span>~{tour.estimatedDuration} min</span>
                    )}
                    <span className="capitalize">{tour.category}</span>
                  </div>
                </div>
                <button
                  onClick={() => startTour(tour.id)}
                  disabled={state.isActive}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {state.completedTours.includes(tour.id) ? 'Restart' : 'Start'}
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {state.isActive && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-blue-800 font-medium">
                Tour in progress: {state.currentTour?.name}
              </span>
            </div>
            <div className="mt-2">
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${state.progress}%` }}
                />
              </div>
              <p className="text-sm text-blue-700 mt-1">
                Step {state.currentStepIndex + 1} of {state.currentTour?.steps.length}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
