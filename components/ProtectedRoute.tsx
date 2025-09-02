import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from './LoadingSpinner';
import { useTranslations } from '../hooks/useTranslations';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAdmin = false, 
  fallback 
}) => {
  const { user, loading, isAdmin } = useAuth();
  const { t } = useTranslations();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('authRequiredTitle')}</h2>
          <p className="text-gray-600 mb-4">{t('authRequiredMessage')}</p>
        </div>
      </div>
    );
  }

  if (requireAdmin && !isAdmin) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('accessDeniedTitle')}</h2>
          <p className="text-gray-600 mb-4">{t('accessDeniedMessage')}</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
