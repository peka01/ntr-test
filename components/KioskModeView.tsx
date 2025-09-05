
import React, { useState, useMemo } from 'react';
import type { User, Training } from '../types';
import { WelcomeModal } from './WelcomeModal';
import { useTranslations } from '../hooks/useTranslations';
import { TrashIcon } from './icons/TrashIcon';

interface KioskModeViewProps {
    training: Training;
    allUsers: User[];
    subscribedUserIds: Set<string>;
    attendeeIds: Set<string>;
    onMarkAttendance: (trainingId: string, userId: string) => void;
    onUnmarkAttendance: (trainingId: string, userId: string) => void;
    onClose: () => void;
}

export const KioskModeView: React.FC<KioskModeViewProps> = ({
    training,
    allUsers,
    subscribedUserIds,
    attendeeIds,
    onMarkAttendance,
    onUnmarkAttendance,
    onClose
}) => {
    const { t } = useTranslations();
    const [welcomedUser, setWelcomedUser] = useState<User | null>(null);

    const subscribedUsers = useMemo(() => {
        return allUsers.filter(u => subscribedUserIds.has(u.id)).sort((a, b) => a.name.localeCompare(b.name));
    }, [allUsers, subscribedUserIds]);

    const handleMarkNärvarande = (user: User) => {
        if (user.voucherBalance > 0 && !attendeeIds.has(user.id)) {
            onMarkAttendance(training.id, user.id);
            setWelcomedUser(user);
        }
    };

    const handleMarkEjNärvarande = (user: User) => {
        if (attendeeIds.has(user.id)) {
            onUnmarkAttendance(training.id, user.id);
        }
    };

    return (
        <>
            <div className="fixed inset-0 bg-slate-100/95 backdrop-blur-sm z-40 p-4 sm:p-8 flex flex-col items-center animate-fade-in">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 px-5 py-3 text-base font-medium rounded-lg transition-colors duration-200 bg-slate-200 text-slate-700 hover:bg-slate-300"
                >
                    {t('kioskExitBtn')}
                </button>

                <div className="text-center w-full max-w-4xl mx-auto">
                    <h1 className="text-3xl sm:text-5xl font-extrabold text-cyan-600">{training.name}</h1>
                    <div className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-md mt-3 mb-2">
                        {training.subscriberCount || 0} {(training.subscriberCount || 0) === 1 ? t('subscriberCountSingular') : t('subscriberCountPlural')}
                    </div>
                    <p className="text-lg sm:text-xl text-slate-500 mt-2">{t('kioskInstructions')}</p>
                </div>

                <div className="mt-8 w-full max-w-4xl mx-auto overflow-y-auto flex-grow">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {subscribedUsers.map(user => {
                            const hasAttended = attendeeIds.has(user.id);
                            return (
                                <div
                                    key={user.id}
                                    className={`p-6 rounded-xl text-center transition-all duration-300 flex flex-col justify-center relative ${
                                        hasAttended
                                            ? 'bg-green-100 border border-green-300'
                                            : 'bg-white border border-slate-200 shadow-sm'
                                    }`}
                                >
                                    {hasAttended && (
                                        <button
                                            onClick={() => handleMarkEjNärvarande(user)}
                                            className="absolute top-2 right-2 p-2 text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 transition-colors duration-200"
                                            title={t('kioskMarkNotPresentTitle')}
                                        >
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    )}
                                    <p className="text-xl font-semibold text-slate-800 truncate">{user.name}</p>
                                    {hasAttended ? (
                                        <div className="mt-4 flex flex-col items-center">
                                            <p className="text-green-700 font-bold text-lg">{t('kioskPresentStatus')}</p>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handleMarkNärvarande(user)}
                                            disabled={user.voucherBalance <= 0}
                                            className="mt-4 w-full px-6 py-4 text-lg font-semibold rounded-lg shadow-sm text-white bg-cyan-500 hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-100 focus:ring-cyan-500 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors duration-200"
                                        >
                                            {t('kioskPresentBtn')}
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            {welcomedUser && (
                <WelcomeModal user={welcomedUser} onClose={() => setWelcomedUser(null)} />
            )}
        </>
    );
};