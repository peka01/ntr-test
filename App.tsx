
import React, { useState, useCallback } from 'react';
import type { User, Training } from './types';
import { AdminDashboard } from './components/AdminDashboard';
import { SubscriptionPage } from './components/SubscriptionPage';
import { AttendancePage } from './components/AttendancePage';
import { useTranslations } from './hooks/useTranslations';
import { LanguageSwitcher } from './components/LanguageSwitcher';

const initialUsers: User[] = [
    { id: 'u1', name: 'Alice Johnson', email: 'alice@example.com', voucherBalance: 5 },
    { id: 'u2', name: 'Bob Williams', email: 'bob@example.com', voucherBalance: 3 },
];

const initialTrainings: Training[] = [
    { id: 't1', name: 'React Fundamentals', description: 'Learn the basics of React.' },
    { id: 't2', name: 'Advanced TailwindCSS', description: 'Master utility-first CSS.' },
];

type View = 'admin' | 'public' | 'attendance';

const App: React.FC = () => {
    const { t } = useTranslations();
    const [view, setView] = useState<View>('public');
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [trainings, setTrainings] = useState<Training[]>(initialTrainings);
    const [subscriptions, setSubscriptions] = useState<Map<string, Set<string>>>(new Map([
        ['t1', new Set(['u1', 'u2'])]
    ]));
    const [attendance, setAttendance] = useState<Map<string, Set<string>>>(new Map());

    const handleCreateUser = useCallback((name: string, email: string) => {
        const newUser: User = { id: crypto.randomUUID(), name, email, voucherBalance: 0 };
        setUsers(prev => [...prev, newUser]);
    }, []);

    const handleCreateTraining = useCallback((name: string, description: string) => {
        const newTraining: Training = { id: crypto.randomUUID(), name, description };
        setTrainings(prev => [...prev, newTraining]);
        setSubscriptions(prev => {
            const newSubs = new Map(prev);
            newSubs.set(newTraining.id, new Set());
            return newSubs;
        });
    }, []);
    
    const handleUpdateTraining = useCallback((trainingId: string, name: string, description: string) => {
        setTrainings(prev => prev.map(t => 
            t.id === trainingId ? { ...t, name, description } : t
        ));
    }, []);

    const handleSubscribe = useCallback((trainingId: string, userId: string) => {
        setSubscriptions(prev => {
            const newSubs = new Map(prev);
            const userIds = newSubs.get(trainingId) || new Set();
            userIds.add(userId);
            newSubs.set(trainingId, userIds);
            return newSubs;
        });
    }, []);

    const handleMarkAttendance = useCallback((trainingId: string, userId: string) => {
        const user = users.find(u => u.id === userId);
        if (user && user.voucherBalance > 0) {
            // Deduct voucher
            setUsers(prevUsers => prevUsers.map(u => 
                u.id === userId ? { ...u, voucherBalance: u.voucherBalance - 1 } : u
            ));
            // Mark attendance
            setAttendance(prev => {
                const newAttendance = new Map(prev);
                const attendees = newAttendance.get(trainingId) || new Set();
                attendees.add(userId);
                newAttendance.set(trainingId, attendees);
                return newAttendance;
            });
        }
    }, [users]);

    const handleUnmarkAttendance = useCallback((trainingId: string, userId: string) => {
        // Refund voucher
        setUsers(prevUsers => prevUsers.map(u =>
            u.id === userId ? { ...u, voucherBalance: u.voucherBalance + 1 } : u
        ));
        // Unmark attendance
        setAttendance(prev => {
            const newAttendance = new Map(prev);
            const attendees = newAttendance.get(trainingId);
            if (attendees) {
                attendees.delete(userId);
                newAttendance.set(trainingId, attendees);
            }
            return newAttendance;
        });
    }, []);

    const handleAddVoucher = useCallback((userId: string) => {
        setUsers(prevUsers => prevUsers.map(u => 
            u.id === userId ? { ...u, voucherBalance: u.voucherBalance + 1 } : u
        ));
    }, []);

    const handleRemoveVoucher = useCallback((userId: string) => {
        setUsers(prevUsers => prevUsers.map(u => 
            u.id === userId && u.voucherBalance > 0 ? { ...u, voucherBalance: u.voucherBalance - 1 } : u
        ));
    }, []);

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
                />;
            case 'public':
                return <SubscriptionPage
                    users={users}
                    trainings={trainings}
                    subscriptions={subscriptions}
                    onSubscribe={handleSubscribe}
                />;
            case 'attendance':
                return <AttendancePage
                    users={users}
                    trainings={trainings}
                    subscriptions={subscriptions}
                    attendance={attendance}
                    onMarkAttendance={handleMarkAttendance}
                    onUnmarkAttendance={handleUnmarkAttendance}
                />;
            default:
                return null;
        }
    }

    return (
        <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-7xl mx-auto">
                <header className="text-center mb-8 relative">
                    <div className="absolute top-0 right-0 z-10">
                        <LanguageSwitcher />
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-cyan-600">
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
        </div>
    );
};

export default App;
