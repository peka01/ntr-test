import React, { useState } from 'react';
import type { Training } from './types';
import type { User } from '@supabase/supabase-js';
import { SubscriptionPage } from './components/SubscriptionPage';
import { AttendancePage } from './components/AttendancePage';
import { TrainingsPage } from './components/TrainingsPage';
import { UsersPage } from './components/UsersPage';
import { useTranslations } from './hooks/useTranslations';
import { useData } from './hooks/useData';
import { LoadingSpinner } from './components/LoadingSpinner';
import { HelpSystem } from './components/HelpSystem';
import { HelpButton } from './components/HelpButton';

import { useAuth, AuthProvider } from './contexts/AuthContext';
import { TourProvider } from './contexts/TourContext';
import { ShoutoutProvider } from './contexts/ShoutoutContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { UserInteractionProvider } from './contexts/UserInteractionContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { UserMenu } from './components/UserMenu';
import { LoginForm } from './components/LoginForm';
import { LanguageSelector } from './components/LanguageSelector';
import { TourOverlay } from './components/TourOverlay';
import { ShoutoutButton } from './components/ShoutoutButton';
import { TourLauncher } from './components/TourLauncher';
import { ShoutoutSplash } from './components/ShoutoutSplash';
import TourManagementPage from './components/TourManagementPage';
import { ShoutoutManagementPage } from './components/ShoutoutManagementPage';

type View = 'public' | 'attendance' | 'trainings' | 'users' | 'tour-management' | 'shoutout-management';

const AppContent: React.FC = () => {
    const { t } = useTranslations();
    const { user, isAdmin, signOut } = useAuth();
    const [view, setView] = useState<View>('public');
    const [helpOpen, setHelpOpen] = useState(false);
    const [helpContext, setHelpContext] = useState<string>('');
    const [showLogin, setShowLogin] = useState(false);

    // Debug: Log when component mounts
    React.useEffect(() => {
        console.log('AppContent mounted, checking for interaction issues...');
        console.log('User state:', { user, isAdmin });
        
        // Check if body has any problematic styles
        const bodyStyles = window.getComputedStyle(document.body);
        console.log('Body styles:', {
            pointerEvents: bodyStyles.pointerEvents,
            overflow: bodyStyles.overflow,
            opacity: bodyStyles.opacity,
            position: bodyStyles.position,
            zIndex: bodyStyles.zIndex
        });
        
        // Force reset any problematic styles
        document.body.style.pointerEvents = 'auto';
        document.body.style.overflow = 'auto';
        document.body.style.opacity = '1';
        document.body.style.position = 'relative';
        document.body.style.zIndex = '1';
        
        console.log('Forced body styles reset');
    }, []); // Empty dependency array for mount-only effect

    // Update document title when language changes
    React.useEffect(() => {
        document.title = t('appTitle');
    }, [t]);

    // Track user state changes
    React.useEffect(() => {
        console.log('User state changed:', { user, isAdmin });
    }, [user, isAdmin]);

    // Listen for tour events to open help system
    React.useEffect(() => {
        const handleOpenHelpSystem = () => {
            setHelpOpen(true);
        };

        document.addEventListener('open-help-system', handleOpenHelpSystem);
        
        return () => {
            document.removeEventListener('open-help-system', handleOpenHelpSystem);
        };
    }, []);

    // Handle AI actions for navigation
    React.useEffect(() => {
        const handleAIAction = (event: CustomEvent) => {
            console.log('📡 Received AI action event:', event.detail);
            const { type, payload } = event.detail;
            
            if (type === 'navigate' && payload?.view) {
                console.log('🧭 Navigating to view:', payload.view);
                setView(payload.view as View);
            }
        };

        window.addEventListener('ai-action', handleAIAction as EventListener);
        return () => window.removeEventListener('ai-action', handleAIAction as EventListener);
    }, []);

    const { 
        users, 
        trainings, 
        subscriptions, 
        attendance, 
        loading, 
        error,
        createUser,
        updateUser,
        createTraining,
        updateTraining,
        deleteTraining,
        subscribe,
        unsubscribe,
        markAttendance,
        unmarkAttendance
    } = useData();

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-slate-900 mb-2">Error Loading Data</h2>
                    <p className="text-slate-600">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-8">
                            <h1 className="text-xl font-semibold text-slate-900" data-tour="app-title">
                                {t('appTitle')}
                            </h1>
                            
                            {/* Navigation */}
                            <nav className="hidden md:flex space-x-6">
                                <button
                                    onClick={() => setView('public')}
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                        view === 'public'
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                    }`}
                                    data-tour="nav-home"
                                >
                                    {t('navPublic')}
                                </button>
                                
                                <ProtectedRoute fallback={null}>
                                    <button
                                        onClick={() => setView('attendance')}
                                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                            view === 'attendance'
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                        }`}
                                        data-tour="nav-attendance"
                                    >
                                        {t('navAttendance')}
                                    </button>
                                </ProtectedRoute>
                                
                                <ProtectedRoute requireAdmin={true} fallback={null}>
                                    <button
                                        onClick={() => setView('trainings')}
                                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                            view === 'trainings'
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                        }`}
                                        data-tour="nav-trainings"
                                    >
                                        {t('navTrainings')}
                                    </button>
                                    
                                    <button
                                        onClick={() => setView('users')}
                                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                            view === 'users'
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                        }`}
                                        data-tour="nav-users"
                                    >
                                        {t('navUsers')}
                                    </button>
                                </ProtectedRoute>
                            </nav>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            {/* Shoutout Button */}
                            <ShoutoutButton />
                            
                            {/* Help Button */}
                            <HelpButton 
                                onClick={() => setHelpOpen(true)}
                                context={helpContext}
                                data-tour="help-button"
                            />
                            
                            {/* User Menu */}
                            {user && user.id ? (
                                <UserMenu 
                                    user={user}
                                    onTourManagement={() => setView('tour-management')}
                                    onShoutoutManagement={() => setView('shoutout-management')}
                                />
                            ) : (
                                <div className="flex items-center space-x-3">
                                    {/* Language Selector for non-logged-in users */}
                                    <LanguageSelector />
                                    
                                    <button
                                        onClick={() => setShowLogin(true)}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        {t('signInButton')}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {view === 'public' && (
                    <SubscriptionPage 
                        users={users}
                        trainings={trainings}
                        subscriptions={subscriptions}
                        onSubscribe={subscribe}
                        onUnsubscribe={unsubscribe}
                    />
                )}
                {view === 'attendance' && (
                    <AttendancePage 
                        users={users}
                        trainings={trainings}
                        subscriptions={subscriptions}
                        attendance={attendance}
                        onMarkAttendance={markAttendance}
                        onUnmarkAttendance={unmarkAttendance}
                        onHelpClick={() => setHelpOpen(true)}
                    />
                )}
                {view === 'trainings' && (
                    <TrainingsPage 
                        trainings={trainings}
                        onCreateTraining={createTraining}
                        onUpdateTraining={updateTraining}
                        onDeleteTraining={deleteTraining}
                    />
                )}
                {view === 'users' && (
                    <UsersPage 
                        users={users}
                        onCreateUser={createUser}
                        onUpdateUser={updateUser}
                        onAddVoucher={() => {}}
                        onRemoveVoucher={() => {}}
                    />
                )}
                {view === 'tour-management' && isAdmin && (
                    <TourManagementPage onClose={() => setView('public')} />
                )}
                {view === 'shoutout-management' && isAdmin && (
                    <ShoutoutManagementPage onClose={() => setView('public')} />
                )}
            </main>

            {/* Help System Modal */}
            {helpOpen && (
                <HelpSystem 
                    isOpen={helpOpen}
                    onClose={() => setHelpOpen(false)}
                    context={helpContext}
                />
            )}

            {/* Login Modal */}
            {showLogin && (
                <LoginForm onClose={() => setShowLogin(false)} />
            )}

            {/* Tour and Shoutout Components */}
            <TourOverlay />
            <ShoutoutSplash />
            <TourLauncher />
        </div>
    );
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <LanguageProvider>
                <UserInteractionProvider>
                    <TourProvider>
                        <ShoutoutProvider>
                            <AppContent />
                        </ShoutoutProvider>
                    </TourProvider>
                </UserInteractionProvider>
            </LanguageProvider>
        </AuthProvider>
    );
};

export default App;