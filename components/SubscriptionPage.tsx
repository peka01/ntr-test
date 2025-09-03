
import React, { useState, useMemo, useEffect } from 'react';
import type { User, Training } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useTranslations } from '../hooks/useTranslations';
import { useUserInteraction } from '../contexts/UserInteractionContext';
import { HelpButton } from './HelpButton';

interface SubscriptionPageProps {
    users: User[];
    trainings: Training[];
    subscriptions: Map<string, Set<string>>;
    onSubscribe: (trainingId: string, userId: string) => void;
    onHelpClick?: (context?: string) => void;
}

const TrainingCard: React.FC<{
    training: Training;
    allUsers: User[];
    subscribedUserIds: Set<string>;
    onSubscribe: (trainingId: string, userId: string) => void;
}> = ({ training, allUsers, subscribedUserIds, onSubscribe }) => {
    const { t } = useTranslations();
    const [selectedUserId, setSelectedUserId] = useState<string>('');

    const subscribedUsers = useMemo(() => {
        return allUsers.filter(u => subscribedUserIds.has(u.id));
    }, [allUsers, subscribedUserIds]);

    const availableUsers = useMemo(() => {
        return allUsers.filter(u => !subscribedUserIds.has(u.id));
    }, [allUsers, subscribedUserIds]);

    const handleSubscribeClick = () => {
        if (selectedUserId) {
            onSubscribe(training.id, selectedUserId);
            setSelectedUserId('');
        }
    };
    
    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-md flex flex-col">
            <h2 className="text-2xl font-bold text-cyan-600 mb-2">{training.name}</h2>
            <p className="text-slate-500 mb-4 flex-grow">{training.description}</p>
            
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-slate-600 mb-2">{t('subSubscribedUsers')}</h3>
                {subscribedUsers.length > 0 ? (
                    <ul className="space-y-2">
                        {subscribedUsers.map(user => (
                            <li key={user.id} className="text-slate-700 bg-slate-100 px-3 py-1 rounded-md">{user.name}</li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-slate-500 italic">{t('subNoUsersSubscribed')}</p>
                )}
            </div>

            {availableUsers.length > 0 && (
                <div className="mt-auto pt-4 border-t border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-600 mb-2">{t('subSubscribeUserTitle')}</h3>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <select
                            value={selectedUserId}
                            onChange={(e) => setSelectedUserId(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg p-3 text-slate-900 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-200"
                        >
                            <option value="" disabled>{t('subSelectUser')}</option>
                            {availableUsers.map(user => (
                                <option key={user.id} value={user.id}>{user.name}</option>
                            ))}
                        </select>
                        <button
                            onClick={handleSubscribeClick}
                            disabled={!selectedUserId}
                            className="px-6 py-3 border border-transparent font-medium rounded-lg shadow-sm text-white bg-cyan-500 hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-cyan-500 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors duration-200 w-full sm:w-auto"
                        >
                            {t('subSubscribeBtn')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export const SubscriptionPage: React.FC<SubscriptionPageProps> = ({ users, trainings, subscriptions, onSubscribe, onHelpClick }) => {
    const { user } = useAuth();
    const { t } = useTranslations();
    const { setContext } = useUserInteraction();

    useEffect(() => {
        setContext({ screen: 'Subscription Page', action: 'Viewing subscriptions' });
    }, [setContext]);

    const [searchQuery, setSearchQuery] = useState('');

    const filteredTrainings = trainings.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-slate-800">{t('navPublic')}</h1>
                {onHelpClick && (
                    <HelpButton 
                        onClick={onHelpClick}
                        context="subscribe unsubscribe subscription public view user subscription"
                        variant="text"
                    />
                )}
            </div>
            
            {trainings.length > 0 && (
                <div className="mb-6 max-w-lg mx-auto">
                    <input
                        type="text"
                        placeholder={t('subSearchPlaceholder')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-md p-3 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-200"
                    />
                </div>
            )}
            
            {trainings.length > 0 ? (
                 filteredTrainings.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTrainings.map(training => (
                            <TrainingCard
                                key={training.id}
                                training={training}
                                allUsers={users}
                                subscribedUserIds={subscriptions.get(training.id) || new Set()}
                                onSubscribe={onSubscribe}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10">
                        <p className="text-slate-500 text-lg">{t('subNoTrainingsMatch')}</p>
                    </div>
                )
            ) : (
                 <div className="text-center py-10">
                    <p className="text-slate-500 text-lg">{t('subNoTrainingsCreated')}</p>
                </div>
            )}
        </div>
    );
};