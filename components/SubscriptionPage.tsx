
import React, { useState, useMemo, useEffect } from 'react';
import type { User, Training } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useTranslations } from '../hooks/useTranslations';
import { useUserInteraction } from '../contexts/UserInteractionContext';
import { HelpButton } from './HelpButton';
import { TrashIcon } from './icons/TrashIcon';
import { CalendarCard } from './CalendarCard';
import bannerImage from '/ntr_banner.png';

interface SubscriptionPageProps {
    users: User[];
    trainings: Training[];
    subscriptions: Map<string, Set<string>>;
    onSubscribe: (trainingId: string, userId: string) => void;
    onUnsubscribe: (trainingId: string, userId: string) => void;
    onHelpClick?: (context?: string) => void;
}

interface TrainingCardProps {
    training: Training;
    allUsers: User[];
    subscribedUserIds: Set<string>;
    onSubscribe: (trainingId: string, userId: string) => void;
    onUnsubscribe: (trainingId: string, userId: string) => void;
}

const TrainingCard: React.FC<TrainingCardProps> = ({ training, allUsers, subscribedUserIds, onSubscribe, onUnsubscribe }) => {
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
        <div className="bg-white p-6 rounded-xl border-l-4 border-l-blue-500 border border-slate-200 shadow-sm flex flex-col hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <h2 className="text-2xl font-bold text-cyan-600 mb-2">{training.name}</h2>
                    <p className="text-slate-500 mb-4 flex-grow">{training.description}</p>
                </div>
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
            
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-slate-600 mb-2">{t('subSubscribedUsers')}</h3>
                {subscribedUsers.length > 0 ? (
                    <ul className="space-y-2">
                        {subscribedUsers.map(subscribedUser => {
                            return (
                                <li key={subscribedUser.id} className="flex items-center justify-between text-slate-700 bg-slate-100 px-3 py-1 rounded-md">
                                    <span>{subscribedUser.name}</span>
                                    <button
                                        onClick={() => onUnsubscribe(training.id, subscribedUser.id)}
                                        className="p-1 text-slate-500 hover:text-red-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 opacity-60 hover:opacity-100 transition-opacity"
                                        aria-label={`Unsubscribe ${subscribedUser.name}`}
                                        title={t('unsubscribeTooltip')}
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </li>
                            );
                        })}
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

export const SubscriptionPage: React.FC<SubscriptionPageProps> = ({ users, trainings, subscriptions, onSubscribe, onUnsubscribe, onHelpClick }) => {
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
            {/* Hero Banner */}
            <div className="relative mb-8 rounded-xl overflow-hidden shadow-lg">
                <div className="relative h-48 md:h-64">
                    {/* Background Image */}
                    <div 
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                        style={{
                            backgroundImage: `url(${bannerImage})`
                        }}
                    ></div>
                    
                    {/* Content */}
                    <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
                        
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 drop-shadow-lg">
                            Kommande träningar hos oss
                        </h1>
                        <p className="text-lg md:text-xl lg:text-2xl text-blue-100 max-w-2xl drop-shadow-md">
                            Boka din plats och häng med på nästa pass
                        </p>
                        
                        {/* Decorative elements */}
                        <div className="absolute top-4 left-4 w-2 h-2 bg-white/30 rounded-full"></div>
                        <div className="absolute top-8 right-8 w-1 h-1 bg-white/40 rounded-full"></div>
                        <div className="absolute bottom-6 left-8 w-1.5 h-1.5 bg-white/25 rounded-full"></div>
                        <div className="absolute bottom-4 right-4 w-2 h-2 bg-white/35 rounded-full"></div>
                    </div>
                    
                    {/* Overlay gradient for better text readability */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-black/20"></div>
                </div>
            </div>

            
            {trainings.length > 0 && (
                <div className="mb-6">
                    <input
                        type="text"
                        placeholder={t('subSearchPlaceholder')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg p-3 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-200"
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
                                onUnsubscribe={onUnsubscribe}
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