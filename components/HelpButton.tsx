import React from 'react';
import { useTranslations } from '../hooks/useTranslations';

interface HelpButtonProps {
  context?: string;
  onClick: (context?: string) => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'icon' | 'text' | 'both';
  className?: string;
}

export const HelpButton: React.FC<HelpButtonProps> = ({ 
  context, 
  onClick, 
  size = 'md', 
  variant = 'icon',
  className = ''
}) => {
  const { t } = useTranslations();
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={() => onClick(context)}
        className={`inline-flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 transition-colors duration-200 ${sizeClasses[size]} ${className}`}
        title={t('helpButtonTitle')}
        aria-label={t('helpButtonTitle')}
      >
        <svg 
          className={`${iconSizeClasses[size]}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
          />
        </svg>
      </button>
    );
  }

  if (variant === 'text') {
    return (
      <button
        onClick={() => onClick(context)}
        className={`inline-flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors duration-200 ${textSizeClasses[size]} ${className}`}
        title={t('helpButtonTitle')}
      >
        <svg 
          className={`${iconSizeClasses[size]}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
          />
        </svg>
        {t('helpButtonText')}
      </button>
    );
  }

  // variant === 'both'
  return (
    <button
      onClick={() => onClick(context)}
      className={`inline-flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors duration-200 ${textSizeClasses[size]} ${className}`}
              title={t('helpButtonTitle')}
    >
      <svg 
        className={`${iconSizeClasses[size]}`} 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
        />
      </svg>
              {t('helpButtonText')}
    </button>
  );
};
