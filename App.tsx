
import React, { useState } from 'react';
import type { User, Training } from './types';
import { AdminDashboard } from './components/AdminDashboard';
import { SubscriptionPage } from './components/SubscriptionPage';
import { AttendancePage } from './components/AttendancePage';
import { useTranslations } from './hooks/useTranslations';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { useData } from './hooks/useData';
import { LoadingSpinner } from './components/LoadingSpinner';
import { HelpSystem } from './components/HelpSystem';
import { HelpButton } from './components/HelpButton';

type View = 'admin' | 'public' | 'attendance';

const App: React.FC = () => {
    const { t } = useTranslations();
    const [view, setView] = useState<View>('public');
    const [helpOpen, setHelpOpen] = useState(false);
    const [helpContext, setHelpContext] = useState<string>('');
    
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
            if (user && user.voucherBalance > 0) {
                await updateUserVoucherBalance(userId, user.voucherBalance - 1);
            }
        } catch (err) {
            console.error('Failed to remove voucher:', err);
        }
    };

    const NavButton: React.FC<{ currentView: View; targetView: View; setView: (view: View) => void; children: React.ReactNode }> = ({ currentView, targetView, setView, children }) => (
        <button
            onClick={() => setView(targetView)}
            className={`px-5 py-3 text-base font-semibold rounded-lg transition-colors duration-200 w-full sm:w-auto ${
                currentView === targetView
                    ? 'bg-cyan-500 text-white shadow-lg'
                    : 'bg-white text-slate-700 hover:bg-slate-200 shadow-sm'
            }`}
        >
            {children}
        </button>
    );

    const renderContent = () => {
        switch (view) {
            case 'admin':
                return <AdminDashboard
                    users={users}
                    trainings={trainings}
                    onCreateUser={handleCreateUser}
                    onCreateTraining={handleCreateTraining}
                    onUpdateTraining={handleUpdateTraining}
                    onAddVoucher={handleAddVoucher}
                    onRemoveVoucher={handleRemoveVoucher}
                    onHelpClick={handleHelpClick}
                />;
            case 'public':
                return <SubscriptionPage
                    users={users}
                    trainings={trainings}
                    subscriptions={subscriptions}
                    onSubscribe={handleSubscribe}
                    onHelpClick={handleHelpClick}
                />;
            case 'attendance':
                return <AttendancePage
                    users={users}
                    trainings={trainings}
                    subscriptions={subscriptions}
                    attendance={attendance}
                    onMarkAttendance={handleMarkAttendance}
                    onUnmarkAttendance={handleUnmarkAttendance}
                    onHelpClick={handleHelpClick}
                />;
            default:
                return null;
        }
    }

    // Show loading spinner while data is loading
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    // Show error message if there's an error
    if (error) {
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center">
                <div className="bg-white rounded-lg p-8 shadow-lg max-w-md w-full mx-4">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Data</h2>
                    <p className="text-slate-600 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-7xl mx-auto">
                <header className="text-center mb-8 relative">
                    <div className="absolute top-0 right-0 z-10 flex items-center gap-2">
                        <HelpButton 
                            onClick={handleHelpClick}
                            variant="icon"
                            size="sm"
                            className="bg-white shadow-sm"
                        />
                        <LanguageSwitcher />
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight sm:leading-tight md:leading-tight break-words text-balance text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-cyan-600">
                        {t('appTitle')}
                    </h1>
                    <nav className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4">
                        <NavButton currentView={view} targetView="public" setView={setView}>{t('navPublic')}</NavButton>
                        <NavButton currentView={view} targetView="attendance" setView={setView}>{t('navAttendance')}</NavButton>
                        <NavButton currentView={view} targetView="admin" setView={setView}>{t('navAdmin')}</NavButton>
                    </nav>
                </header>

                <main>
                    {renderContent()}
                </main>
            </div>

            {/* Help System */}
            <HelpSystem 
                isOpen={helpOpen}
                onClose={() => setHelpOpen(false)}
                context={helpContext}
                isAdmin={view === 'admin'}
            />
        </div>
    );
};

export default App;
