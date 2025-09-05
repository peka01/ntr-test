
import React, { useMemo, useState, useEffect } from 'react';
import type { User, Training } from '../types';
import { KioskModeView } from './KioskModeView';
import { useTranslations } from '../hooks/useTranslations';
import { useUserInteraction } from '../contexts/UserInteractionContext';
import { HelpButton } from './HelpButton';
import { TrashIcon } from './icons/TrashIcon';
import { StepIcon } from './icons/StepIcon';
import { CalendarCard } from './CalendarCard';
import { useAuth } from '../contexts/AuthContext';

export interface AttendancePageProps {
  users: User[];
  trainings: Training[];
  subscriptions: any[];
  attendance: any[];
  onMarkAttendance: (trainingId: string, userId: string, attended: boolean) => void;
  onUnmarkAttendance: (trainingId: string, userId: string) => void;
  onHelpClick: (context: string) => void;
}

const AttendanceCard: React.FC<{
    training: Training;
    allUsers: User[];
    subscribedUserIds: Set<string>;
    attendeeIds: Set<string>;
    onMarkAttendance: (trainingId: string, userId: string) => void;
    onUnmarkAttendance: (trainingId: string, userId: string) => void;
    onOpenKiosk: () => void;
}> = ({ training, allUsers, subscribedUserIds, attendeeIds, onMarkAttendance, onUnmarkAttendance, onOpenKiosk }) => {
    const { t } = useTranslations();
    
    const subscribedUsers = useMemo(() => {
        return allUsers.filter(u => subscribedUserIds.has(u.id));
    }, [allUsers, subscribedUserIds]);

    return (
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-md flex flex-col relative">
                    <div className="flex items-start justify-between mb-4">
                        <h2 className="text-2xl font-bold text-cyan-600">{training.name}</h2>
                        {(training.training_date || training.training_time) && (
                            <div className="ml-4">
                                <CalendarCard 
                                    date={training.training_date} 
                                    time={training.training_time}
                                    className="w-20"
                                />
                            </div>
                        )}
                    </div>
            
            <div className="flex-grow">
                <h3 className="text-lg font-semibold text-slate-600 mb-2 border-b border-slate-200 pb-2">{t('attSubscribedUsers')}</h3>
                {subscribedUsers.length > 0 ? (
                    <ul className="space-y-3 mt-3">
                        {subscribedUsers.map(user => {
                            const hasAttended = attendeeIds.has(user.id);
                            return (
                                <li key={user.id} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg relative">
                                    <div>
                                        <p className="font-medium text-slate-800">{user.name}</p>
                                        <p className="text-xs text-slate-500">{t('attVouchersLabel')}: {user.voucherBalance}</p>
                                    </div>
                                    {hasAttended && (
                                        <button
                                            onClick={() => onUnmarkAttendance(training.id, user.id)}
                                            className="absolute top-1 right-1 p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                                            title={t('attMarkNotPresentBtn')}
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    )}
                                                                         {hasAttended ? (
                                         <div className="text-green-600 text-sm font-medium">
                                             {t('kioskPresentStatus')}
                                         </div>
                                     ) : (
                                        <button
                                            onClick={() => onMarkAttendance(training.id, user.id)}
                                            disabled={user.voucherBalance <= 0}
                                            className="px-4 py-2 text-sm font-medium rounded-lg shadow-sm text-white bg-cyan-500 hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-cyan-500 disabled:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-200"
                                        >
                                            {t('attMarkPresentBtn')}
                                        </button>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <p className="text-slate-500 italic mt-3">{t('attNoUsersSubscribed')}</p>
                )}
            </div>
             <div className="mt-4 pt-4 border-t border-slate-200">
                <button
                    onClick={onOpenKiosk}
                    className="w-full text-center px-6 py-3 text-base font-medium rounded-lg transition-colors duration-200 bg-slate-200 text-slate-700 hover:bg-slate-300"
                >
                    {t('attOpenKioskBtn')}
                </button>
            </div>
        </div>
    );
};


export const AttendancePage: React.FC<AttendancePageProps> = ({ users, trainings, subscriptions, attendance, onMarkAttendance, onUnmarkAttendance, onHelpClick }) => {
     const { user } = useAuth();
      const { t } = useTranslations();
     const { setContext } = useUserInteraction();

     useEffect(() => {
         setContext({ screen: 'Attendance Page', action: 'Viewing attendance' });
     }, [setContext]);

      const [kioskModeTraining, setKioskModeTraining] = useState<Training | null>(null);

    // Debug logging
    console.log('AttendancePage props:', { users, trainings, subscriptions, attendance });
    console.log('subscriptions type:', typeof subscriptions);
    console.log('subscriptions instanceof Map:', subscriptions instanceof Map);

    const handleOpenKiosk = (training: Training) => {
        setKioskModeTraining(training);
    };

    const handleCloseKiosk = () => {
        setKioskModeTraining(null);
    };

    if (kioskModeTraining) {
        return (
            <KioskModeView
                training={kioskModeTraining}
                allUsers={users}
                subscribedUserIds={subscriptions?.get?.(kioskModeTraining.id) || new Set()}
                attendeeIds={attendance?.get?.(kioskModeTraining.id) || new Set()}
                onMarkAttendance={onMarkAttendance}
                onUnmarkAttendance={onUnmarkAttendance}
                onClose={handleCloseKiosk}
            />
        );
    }

    return (
        <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-slate-800">{t('navAttendance')}</h1>
            </div>
            
            {trainings.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {trainings.map(training => (
                            <AttendanceCard
                                key={training.id}
                                training={training}
                                allUsers={users}
                                subscribedUserIds={subscriptions?.get?.(training.id) || new Set()}
                                attendeeIds={attendance?.get?.(training.id) || new Set()}
                                onMarkAttendance={onMarkAttendance}
                                onUnmarkAttendance={onUnmarkAttendance}
                                onOpenKiosk={() => handleOpenKiosk(training)}
                            />
                        ))}
                </div>
            ) : (
                 <div className="text-center py-10">
                    <p className="text-slate-500 text-lg">{t('attNoTrainingsCreated')}</p>
                </div>
            )}
        </div>
    );
};