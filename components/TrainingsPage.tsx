import React, { useState, useEffect } from 'react';
import type { Training } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useTranslations } from '../hooks/useTranslations';
import { useUserInteraction } from '../contexts/UserInteractionContext';
import { HelpButton } from './HelpButton';
import { TrashIcon } from './icons/TrashIcon';
import { CalendarCard } from './CalendarCard';

interface TrainingsPageProps {
    trainings: Training[];
    onCreateTraining: (name: string, description: string, trainingDate?: string, trainingTime?: string) => void;
    onUpdateTraining: (trainingId: string, name: string, description: string, trainingDate?: string, trainingTime?: string) => void;
    onDeleteTraining: (trainingId: string) => void;
    onHelpClick?: (context?: string) => void;
}

const FormInput: React.FC<{ 
    id: string; 
    label: string; 
    value: string; 
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void; 
    type?: string; 
    isTextArea?: boolean 
}> = ({ id, label, value, onChange, type = 'text', isTextArea = false }) => (
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

export const TrainingsPage: React.FC<TrainingsPageProps> = ({ 
    trainings, 
    onCreateTraining, 
    onUpdateTraining, 
    onDeleteTraining,
    onHelpClick 
}) => {
    const { user } = useAuth();
    const { t } = useTranslations();
    const { setContext } = useUserInteraction();

    useEffect(() => {
        setContext({ screen: 'Trainings Page', action: 'Viewing trainings list', data: {} });
    }, [setContext]);

    const [showAddForm, setShowAddForm] = useState(false);
    const [editingTrainingId, setEditingTrainingId] = useState<string | null>(null);
    const [trainingTitle, setTrainingTitle] = useState('');
    const [trainingDescription, setTrainingDescription] = useState('');
    const [trainingDate, setTrainingDate] = useState('');
    const [trainingTime, setTrainingTime] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const handleTrainingInputChange = (setter: React.Dispatch<React.SetStateAction<string>>, field: string, value: string) => {
        setter(value);
        setContext(prev => ({
            ...prev,
            action: editingTrainingId ? 'Editing training' : 'Creating new training',
            data: { ...prev.data, [field]: value }
        }));
    };

    const handleCreateTraining = () => {
        if (trainingTitle.trim()) {
            onCreateTraining(trainingTitle, trainingDescription, trainingDate || undefined, trainingTime || undefined);
            setTrainingTitle('');
            setTrainingDescription('');
            setTrainingDate('');
            setTrainingTime('');
            setShowAddForm(false);
        }
    };

    const handleUpdateTraining = () => {
        if (editingTrainingId && trainingTitle.trim()) {
            onUpdateTraining(editingTrainingId, trainingTitle, trainingDescription, trainingDate || undefined, trainingTime || undefined);
            setEditingTrainingId(null);
            setTrainingTitle('');
            setTrainingDescription('');
            setTrainingDate('');
            setTrainingTime('');
        }
    };

    const handleEditClick = (training: Training) => {
        setEditingTrainingId(training.id);
        setTrainingTitle(training.name);
        setTrainingDescription(training.description);
        setTrainingDate(training.training_date || '');
        setTrainingTime(training.training_time || '');
        setShowAddForm(false);
    };

    const handleDeleteClick = (training: Training) => {
        if (window.confirm(t('confirmDeleteTraining', { name: training.name }))) {
            onDeleteTraining(training.id);
        }
    };

    const handleCancelEdit = () => {
        setEditingTrainingId(null);
        setTrainingTitle('');
        setTrainingDescription('');
        setTrainingDate('');
        setTrainingTime('');
    };

    const handleCancelAdd = () => {
        setShowAddForm(false);
        setTrainingTitle('');
        setTrainingDescription('');
        setTrainingDate('');
        setTrainingTime('');
    };

    const filteredTrainings = trainings.filter(training =>
        training.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        training.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const isEditing = editingTrainingId !== null;

    return (
        <div className="max-w-6xl mx-auto p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                    <h1 className="text-3xl font-bold text-slate-900">{t('navTrainings')}</h1>
                    <HelpButton 
                        onClick={onHelpClick}
                        context="trainings management list view"
                        variant="icon"
                        size="lg"
                    />
                </div>
                <button
                    onClick={() => setShowAddForm(true)}
                    disabled={isEditing}
                    className="px-6 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>{t('addTrainingButton')}</span>
                </button>
            </div>

            {/* Search */}
            <div className="mb-6">
                <input
                    type="text"
                    placeholder={t('searchTrainingsPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-3 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-200"
                />
            </div>

            {/* Add/Edit Form */}
            {(showAddForm || isEditing) && (
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-md mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-slate-800">
                            {isEditing ? t('adminEditTraining') : t('adminCreateTraining')}
                        </h2>
                        <button
                            onClick={isEditing ? handleCancelEdit : handleCancelAdd}
                            className="text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div className="space-y-4">
                        <FormInput 
                            id="training-title" 
                            label={t('adminTrainingTitleLabel')} 
                            value={trainingTitle} 
                            onChange={(e) => handleTrainingInputChange(setTrainingTitle, 'trainingTitle', e.target.value)} 
                        />
                        <FormInput 
                            id="training-desc" 
                            label={t('adminTrainingDescLabel')} 
                            value={trainingDescription} 
                            onChange={(e) => handleTrainingInputChange(setTrainingDescription, 'trainingDescription', e.target.value)} 
                            isTextArea={true}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormInput 
                                id="training-date" 
                                label={t('adminTrainingDateLabel')} 
                                value={trainingDate} 
                                onChange={(e) => handleTrainingInputChange(setTrainingDate, 'trainingDate', e.target.value)} 
                                type="date"
                            />
                            <FormInput 
                                id="training-time" 
                                label={t('adminTrainingTimeLabel')} 
                                value={trainingTime} 
                                onChange={(e) => handleTrainingInputChange(setTrainingTime, 'trainingTime', e.target.value)} 
                                type="time"
                            />
                        </div>
                    </div>
                    <div className="flex gap-4 mt-6">
                        {isEditing ? (
                            <>
                                <button
                                    onClick={handleUpdateTraining}
                                    className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200"
                                >
                                    {t('adminUpdateBtn')}
                                </button>
                                <button
                                    onClick={handleCancelEdit}
                                    className="px-6 py-3 bg-slate-300 text-slate-700 rounded-lg hover:bg-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-colors duration-200"
                                >
                                    {t('adminCancelBtn')}
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={handleCreateTraining}
                                disabled={!trainingTitle.trim()}
                                className="px-6 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors duration-200"
                            >
                                {t('adminCreateTrainingBtn')}
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Trainings List */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-md">
                <div className="p-6 border-b border-slate-200">
                    <h2 className="text-xl font-semibold text-slate-800">
                        {t('adminExistingTrainings')} ({filteredTrainings.length})
                    </h2>
                </div>
                <div className="p-6">
                    {filteredTrainings.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredTrainings.map(training => (
                                <div key={training.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:shadow-md transition-shadow duration-200">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-cyan-600 text-lg mb-2">{training.name}</h3>
                                            {training.description && (
                                                <p className="text-sm text-slate-600 mb-3">{training.description}</p>
                                            )}
                                            {(training.training_date || training.training_time) && (
                                                <div className="flex items-center space-x-3">
                                                    <CalendarCard 
                                                        date={training.training_date} 
                                                        time={training.training_time}
                                                        className="w-20"
                                                    />
                                                    <div className="text-sm text-slate-500">
                                                        {training.training_date && (
                                                            <div>{new Date(training.training_date).toLocaleDateString('sv-SE')}</div>
                                                        )}
                                                        {training.training_time && (
                                                            <div>{training.training_time.substring(0, 5)}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center space-x-2 ml-4">
                                            <button
                                                onClick={() => handleEditClick(training)}
                                                disabled={isEditing || showAddForm}
                                                title={t('adminEditBtn')}
                                                className="p-2 text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors duration-200"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(training)}
                                                disabled={isEditing || showAddForm}
                                                title={t('adminDeleteBtn')}
                                                className="p-2 text-red-600 bg-white border border-red-300 rounded-md hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors duration-200"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            <h3 className="text-lg font-medium text-slate-600 mb-2">
                                {searchTerm ? t('noTrainingsMatchSearch') : t('adminNoTrainings')}
                            </h3>
                            {!searchTerm && (
                                <p className="text-slate-500">
                                    {t('noTrainingsHint')}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
