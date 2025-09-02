
import React, { useState } from 'react';
import type { Training } from './types';
import type { User } from '@supabase/supabase-js';
import { AdminDashboard } from './components/AdminDashboard';
import { SubscriptionPage } from './components/SubscriptionPage';
import { AttendancePage } from './components/AttendancePage';
import { useTranslations } from './hooks/useTranslations';
import { useData } from './hooks/useData';
import { LoadingSpinner } from './components/LoadingSpinner';
import { HelpSystem } from './components/HelpSystem';
import { HelpButton } from './components/HelpButton';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { UserMenu } from './components/UserMenu';
import { LoginForm } from './components/LoginForm';

type View = 'admin' | 'public' | 'attendance';

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
        updateUserVoucherBalance,
        createTraining,
        updateTraining,
        subscribe,
        unsubscribe,
        markAttendance,
        unmarkAttendance
    } = useData();

    const handleHelpClick = (context?: string) => {
        setHelpContext(context || '');
        setHelpOpen(true);
    };

    const handleCreateUser = async (name: string, email: string) => {
        try {
            await createUser(name, email);
        } catch (err) {
            console.error('Failed to create user:', err);
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
                                        <button
                                            onClick={() => setView('admin')}
                                            className={`px-3 py-2 rounded-md text-sm font-medium ${
                                                view === 'admin' 
                                                    ? 'bg-blue-100 text-blue-700' 
                                                    : 'text-slate-600 hover:text-slate-900'
                                            }`}
                                        >
                                            {t('navAdmin')}
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setView('public')}
                                        className={`px-3 py-2 rounded-md text-sm font-medium ${
                                            view === 'public' 
                                                ? 'bg-blue-100 text-blue-700' 
                                                : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                    >
                                        {t('navPublic')}
                                    </button>
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
                                    <UserMenu user={user} />
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={() => setView('public')}
                                        className={`px-3 py-2 rounded-md text-sm font-medium ${
                                            view === 'public' 
                                                ? 'bg-blue-100 text-blue-700' 
                                                : 'text-slate-600 hover:text-slate-900'
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
                {!user ? (
                    <div className="text-center py-12">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">
                            {t('welcomeTitle')}
                        </h2>
                        <p className="text-lg text-slate-600 mb-8">
                            {t('welcomeSubtitle')}
                        </p>
                        <button
                            onClick={() => setShowLogin(true)}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-lg"
                        >
                            {t('signInButton')}
                        </button>
                    </div>
                ) : (
                    <>
                        {view === 'admin' && (
                            <ProtectedRoute requireAdmin={true}>
                                <AdminDashboard
                                    users={users}
                                    trainings={trainings}
                                    onCreateUser={handleCreateUser}
                                    onCreateTraining={handleCreateTraining}
                                    onUpdateTraining={handleUpdateTraining}
                                    onAddVoucher={handleAddVoucher}
                                    onRemoveVoucher={handleRemoveVoucher}
                                    onHelpClick={handleHelpClick}
                                />
                            </ProtectedRoute>
                        )}

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
                    </>
                )}

                {/* Show public view for non-authenticated users */}
                {!user && view === 'public' && (
                    <SubscriptionPage
                        users={users}
                        trainings={trainings}
                        subscriptions={subscriptions}
                        onSubscribe={handleSubscribe}
                        onUnsubscribe={handleUnsubscribe}
                        onHelpClick={handleHelpClick}
                    />
                )}
            </main>

            {/* Help System */}
            <HelpSystem 
                isOpen={helpOpen} 
                onClose={() => setHelpOpen(false)} 
                context={helpContext} 
            />

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
