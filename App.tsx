
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

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { UserMenu } from './components/UserMenu';
import { LoginForm } from './components/LoginForm';

type View = 'public' | 'attendance' | 'trainings' | 'users';

const AppContent: React.FC = () => {
    const { t } = useTranslations();
    const { user, isAdmin, signOut } = useAuth();
    const [view, setView] = useState<View>('public');
    const [helpOpen, setHelpOpen] = useState(false);
    const [helpContext, setHelpContext] = useState<string>('');
    const [showLogin, setShowLogin] = useState(false);
    
    const {
        users,
        trainings,
        subscriptions,
        attendance,
        loading,
        error,
        createUser,
        updateUser,
        updateUserVoucherBalance,
        createTraining,
        updateTraining,
        deleteTraining,
        subscribe,
        unsubscribe,
        markAttendance,
        unmarkAttendance
    } = useData();

    const handleHelpClick = (context?: string) => {
        setHelpContext(context || '');
        setHelpOpen(true);
    };

    // Listen for AI action events (navigation, etc.)
    React.useEffect(() => {
        const handler = (event: Event) => {
            const custom = event as CustomEvent<any>;
            if (!custom.detail) return;
            const { type, payload } = custom.detail;
            if (type === 'navigate' && payload?.view) {
                setView(payload.view);
            }
        };
        window.addEventListener('ai-action', handler as EventListener);
        return () => window.removeEventListener('ai-action', handler as EventListener);
    }, []);

    const handleCreateUser = async (name: string, email: string) => {
        try {
            await createUser(name, email);
        } catch (err) {
            console.error('Failed to create user:', err);
        }
    };

    const handleUpdateUser = async (userId: string, name: string, email: string) => {
        try {
            await updateUser(userId, name, email);
        } catch (err) {
            console.error('Failed to update user:', err);
        }
    };

    const handleCreateTraining = async (name: string, description: string) => {
        try {
            await createTraining(name, description);
        } catch (err) {
            console.error('Failed to create training:', err);
        }
    };
    
    const handleUpdateTraining = async (trainingId: string, name: string, description: string) => {
        try {
            await updateTraining(trainingId, name, description);
        } catch (err) {
            console.error('Failed to update training:', err);
        }
    };

    const handleDeleteTraining = async (trainingId: string) => {
        try {
            await deleteTraining(trainingId);
        } catch (err) {
            console.error('Failed to delete training:', err);
        }
    };

    const handleSubscribe = async (trainingId: string, userId: string) => {
        try {
            await subscribe(trainingId, userId);
        } catch (err) {
            console.error('Failed to subscribe:', err);
        }
    };

    const handleUnsubscribe = async (trainingId: string, userId: string) => {
        try {
            await unsubscribe(trainingId, userId);
        } catch (err) {
            console.error('Failed to unsubscribe:', err);
        }
    };

    const handleMarkAttendance = async (trainingId: string, userId: string) => {
        try {
            await markAttendance(trainingId, userId);
        } catch (err) {
            console.error('Failed to mark attendance:', err);
        }
    };

    const handleUnmarkAttendance = async (trainingId: string, userId: string) => {
        try {
            await unmarkAttendance(trainingId, userId);
        } catch (err) {
            console.error('Failed to unmark attendance:', err);
        }
    };

    const handleAddVoucher = async (userId: string) => {
        try {
            const user = users.find(u => u.id === userId);
            if (user) {
                await updateUserVoucherBalance(userId, user.voucherBalance + 1);
            }
        } catch (err) {
            console.error('Failed to add voucher:', err);
        }
    };

    const handleRemoveVoucher = async (userId: string) => {
        try {
            const user = users.find(u => u.id === userId);
            if (user) {
                await updateUserVoucherBalance(userId, user.voucherBalance - 1);
            }
        } catch (err) {
            console.error('Failed to remove voucher:', err);
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">{t('errorTitle')}</h2>
                    <p className="text-gray-600">{error}</p>
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
                        <div className="flex items-center space-x-4">
                            <h1 className="text-xl font-semibold text-slate-900">
                                {t('appTitle')}
                            </h1>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            {user ? (
                                <>
                                    {isAdmin && (
                                        <>
                                            <button
                                                onClick={() => setView('trainings')}
                                                className={`px-3 py-2 rounded-md text-sm font-medium ${
                                                    view === 'trainings' 
                                                        ? 'bg-blue-100 text-blue-700' 
                                                        : 'text-slate-600 hover:text-slate-900'
                                                }`}
                                            >
                                                {t('navTrainings')}
                                            </button>
                                            <button
                                                onClick={() => setView('users')}
                                                className={`px-3 py-2 rounded-md text-sm font-medium ${
                                                    view === 'users' 
                                                        ? 'bg-blue-100 text-blue-700' 
                                                        : 'text-slate-600 hover:text-slate-900'
                                                }`}
                                            >
                                                {t('navUsers')}
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={() => setView('attendance')}
                                        className={`px-3 py-2 rounded-md text-sm font-medium ${
                                            view === 'attendance' 
                                                ? 'bg-blue-100 text-blue-700' 
                                                : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                    >
                                        {t('navAttendance')}
                                    </button>
                                    <button
                                        onClick={() => setView('public')}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                            view === 'public' 
                                                ? 'bg-blue-600 text-white shadow-sm' 
                                                : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
                                        }`}
                                    >
                                        {t('navPublic')}
                                    </button>
                                    <UserMenu user={user} />
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={() => setView('public')}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                            view === 'public' 
                                                ? 'bg-blue-600 text-white shadow-sm' 
                                                : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
                                        }`}
                                    >
                                        {t('viewTrainingsButton')}
                                    </button>
                                    <button
                                        onClick={() => setShowLogin(true)}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                    >
                                        {t('adminLoginButton')}
                                    </button>
                                </>
                            )}
                            
                            <HelpButton 
                                onClick={handleHelpClick}
                                context="main"
                                variant="icon"
                                size="lg"
                            />
                        </div>
                    </div>
                </div>
            </header>



            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Show public subscription page by default for non-authenticated users */}
                {!user ? (
                    <SubscriptionPage
                        users={users}
                        trainings={trainings}
                        subscriptions={subscriptions}
                        onSubscribe={handleSubscribe}
                        onUnsubscribe={handleUnsubscribe}
                        onHelpClick={handleHelpClick}
                    />
                ) : (
                    <>

                        {view === 'public' && (
                            <SubscriptionPage
                                users={users}
                                trainings={trainings}
                                subscriptions={subscriptions}
                                onSubscribe={handleSubscribe}
                                onUnsubscribe={handleUnsubscribe}
                                onHelpClick={handleHelpClick}
                            />
                        )}

                        {view === 'attendance' && (
                            <ProtectedRoute>
                                <AttendancePage
                                    users={users}
                                    trainings={trainings}
                                    subscriptions={subscriptions}
                                    attendance={attendance}
                                    onMarkAttendance={handleMarkAttendance}
                                    onUnmarkAttendance={handleUnmarkAttendance}
                                    onHelpClick={handleHelpClick}
                                />
                            </ProtectedRoute>
                        )}

                        {view === 'trainings' && (
                            <ProtectedRoute requireAdmin={true}>
                                <TrainingsPage
                                    trainings={trainings}
                                    onCreateTraining={handleCreateTraining}
                                    onUpdateTraining={handleUpdateTraining}
                                    onDeleteTraining={handleDeleteTraining}
                                    onHelpClick={handleHelpClick}
                                />
                            </ProtectedRoute>
                        )}

                        {view === 'users' && (
                            <ProtectedRoute requireAdmin={true}>
                                <UsersPage
                                    users={users}
                                    onCreateUser={handleCreateUser}
                                    onUpdateUser={handleUpdateUser}
                                    onAddVoucher={handleAddVoucher}
                                    onRemoveVoucher={handleRemoveVoucher}
                                    onHelpClick={handleHelpClick}
                                />
                            </ProtectedRoute>
                        )}
                    </>
                )}

            </main>

            {/* Help System */}
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
        </div>
    );
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
};

export default App;
