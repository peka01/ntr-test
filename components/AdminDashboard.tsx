
import React, { useState } from 'react';
import type { User, Training } from '../types';
import { useTranslations } from '../hooks/useTranslations';
import { HelpButton } from './HelpButton';

interface AdminDashboardProps {
    users: User[];
    trainings: Training[];
    onCreateUser: (name: string, email: string) => void;
    onCreateTraining: (name: string, description: string) => void;
    onUpdateTraining: (trainingId: string, name: string, description: string) => void;
    onAddVoucher: (userId: string) => void;
    onRemoveVoucher: (userId: string) => void;
    onHelpClick?: (context?: string) => void;
}

const AdminCard: React.FC<{ 
    title: string; 
    children: React.ReactNode;
    helpContext?: string;
    onHelpClick?: (context?: string) => void;
}> = ({ title, children, helpContext, onHelpClick }) => (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-md flex flex-col">
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
            {onHelpClick && (
                <HelpButton 
                    onClick={onHelpClick}
                    context={helpContext}
                    variant="icon"
                    size="sm"
                />
            )}
        </div>
        {children}
    </div>
);

const FormInput: React.FC<{ id: string; label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void; type?: string; isTextArea?: boolean }> = ({ id, label, value, onChange, type = 'text', isTextArea = false }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-600 mb-1">
            {label}
        </label>
        {isTextArea ? (
            <textarea
                id={id}
                value={value}
                onChange={onChange}
                rows={3}
                className="w-full bg-slate-50 border border-slate-300 rounded-md p-2 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-200 resize-none"
            />
        ) : (
            <input
                id={id}
                type={type}
                value={value}
                onChange={onChange}
                className="w-full bg-slate-50 border border-slate-300 rounded-md p-2 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-200"
            />
        )}
    </div>
);


export const AdminDashboard: React.FC<AdminDashboardProps> = ({ users, trainings, onCreateUser, onCreateTraining, onUpdateTraining, onAddVoucher, onRemoveVoucher, onHelpClick }) => {
    const { t } = useTranslations();
    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [trainingName, setTrainingName] = useState('');
    const [trainingDesc, setTrainingDesc] = useState('');
    const [userSearch, setUserSearch] = useState('');
    const [editingTrainingId, setEditingTrainingId] = useState<string | null>(null);

    const isEditing = editingTrainingId !== null;

    const handleCreateUser = () => {
        if (userName.trim() && userEmail.trim()) {
            onCreateUser(userName.trim(), userEmail.trim());
            setUserName('');
            setUserEmail('');
        }
    };

    const handleTrainingFormSubmit = () => {
        if (!trainingName.trim() || !trainingDesc.trim()) return;

        if (isEditing) {
            onUpdateTraining(editingTrainingId, trainingName.trim(), trainingDesc.trim());
        } else {
            onCreateTraining(trainingName.trim(), trainingDesc.trim());
        }
        setEditingTrainingId(null);
        setTrainingName('');
        setTrainingDesc('');
    };
    
    const handleEditClick = (training: Training) => {
        setEditingTrainingId(training.id);
        setTrainingName(training.name);
        setTrainingDesc(training.description);
    };

    const handleCancelEdit = () => {
        setEditingTrainingId(null);
        setTrainingName('');
        setTrainingDesc('');
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearch.toLowerCase())
    );

    return (
        <div className="grid md:grid-cols-2 gap-8 animate-fade-in">
            <AdminCard 
                title={isEditing ? t('adminUpdateTrainingTitle') : t('adminManageTrainings')}
                helpContext="create training edit training admin training training management"
                onHelpClick={onHelpClick}
            >
                <div className="space-y-4 mb-6">
                    <FormInput id="training-name" label={t('adminTrainingNameLabel')} value={trainingName} onChange={(e) => setTrainingName(e.target.value)} />
                    <FormInput id="training-desc" label={t('adminDescriptionLabel')} value={trainingDesc} onChange={(e) => setTrainingDesc(e.target.value)} isTextArea />
                    
                    {isEditing ? (
                        <div className="flex flex-col sm:flex-row gap-2 mt-4">
                            <button
                                onClick={handleTrainingFormSubmit}
                                disabled={!trainingName.trim() || !trainingDesc.trim()}
                                className="w-full px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-cyan-500 hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-cyan-500 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors duration-200"
                            >
                                {t('adminUpdateTrainingBtn')}
                            </button>
                             <button
                                onClick={handleCancelEdit}
                                className="w-full px-6 py-3 border border-slate-300 text-base font-medium rounded-lg shadow-sm text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-cyan-500 transition-colors duration-200"
                            >
                                {t('adminCancelBtn')}
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={handleTrainingFormSubmit}
                            disabled={!trainingName.trim() || !trainingDesc.trim()}
                            className="w-full mt-4 px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-cyan-500 hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-cyan-500 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                            {t('adminCreateTrainingBtn')}
                        </button>
                    )}
                </div>
                <div className="flex-grow space-y-3 overflow-y-auto pr-2">
                    <h3 className="text-lg font-semibold text-slate-600 border-b border-slate-200 pb-2">{t('adminExistingTrainings')}</h3>
                     {trainings.length > 0 ? (
                        // FIX: Renamed `t` to `training` to avoid conflict with the translation function `t`.
                        trainings.map(training => (
                            <div key={training.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between gap-4">
                                <div className="flex-grow">
                                    <p className="font-semibold text-cyan-600">{training.name}</p>
                                    <p className="text-sm text-slate-500">{training.description}</p>
                                </div>
                                <button
                                    onClick={() => handleEditClick(training)}
                                    disabled={isEditing}
                                    className="px-4 py-2 text-sm font-medium rounded-lg shadow-sm text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-50 focus:ring-cyan-500 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors duration-200 flex-shrink-0"
                                >
                                    {t('adminEditBtn')}
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className="text-slate-500 italic">{t('adminNoTrainings')}</p>
                    )}
                </div>
            </AdminCard>

            <AdminCard 
                title={t('adminManageUsers')}
                helpContext="create participant add subscriber manage vouchers admin user list"
                onHelpClick={onHelpClick}
            >
                 <div className="space-y-4 mb-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                        <p className="text-sm text-blue-800">
                            <strong>{t('adminNoteLabel')}:</strong> {t('adminNoteText')}
                        </p>
                    </div>
                    <FormInput id="user-name" label={t('adminUserNameLabel')} value={userName} onChange={(e) => setUserName(e.target.value)} />
                    <FormInput id="user-email" label={t('adminEmailLabel')} value={userEmail} onChange={(e) => setUserEmail(e.target.value)} type="email" />
                    <button
                        onClick={handleCreateUser}
                        disabled={!userName.trim() || !userEmail.trim()}
                        className="w-full mt-4 px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-cyan-500 hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-cyan-500 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                        {t('adminCreateUserBtn')}
                    </button>
                </div>
                <div className="flex-grow space-y-3 overflow-y-auto pr-2">
                    <h3 className="text-lg font-semibold text-slate-600 border-b border-slate-200 pb-2">{t('adminExistingUsers')}</h3>
                    <div className="my-4">
                        <input
                            type="text"
                            placeholder={t('adminSearchPlaceholder')}
                            value={userSearch}
                            onChange={(e) => setUserSearch(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-md p-2 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-200"
                        />
                    </div>
                    {users.length > 0 ? (
                        filteredUsers.length > 0 ? (
                            filteredUsers.map(u => (
                                <div key={u.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                    <p className="font-semibold text-cyan-600">{u.name}</p>
                                    <p className="text-sm text-slate-500">{u.email}</p>
                                    <div className="flex items-center justify-between mt-2">
                                        <p className="text-sm text-slate-600">{t('adminVouchersLabel')}: <span className="font-bold">{u.voucherBalance}</span></p>
                                        <div className="flex gap-2">
                                            <button onClick={() => onAddVoucher(u.id)} className="w-10 h-10 flex items-center justify-center text-lg font-bold bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors">+</button>
                                            <button onClick={() => onRemoveVoucher(u.id)} disabled={u.voucherBalance <= 0} className="w-10 h-10 flex items-center justify-center text-lg font-bold bg-red-100 text-red-700 rounded-full hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">-</button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-slate-500 italic">{t('adminNoUserMatches')}</p>
                        )
                    ) : (
                        <p className="text-slate-500 italic">{t('adminNoUsers')}</p>
                    )}
                </div>
            </AdminCard>
        </div>
    );
};