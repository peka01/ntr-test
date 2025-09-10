import React, { useState, useEffect } from 'react';
import type { User } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useTranslations } from '../hooks/useTranslations';
import { useUserInteraction } from '../contexts/UserInteractionContext';
import { HelpButton } from './HelpButton';

interface UsersPageProps {
    users: User[];
    onCreateUser: (name: string, email: string) => void;
    onUpdateUser: (userId: string, name: string, email: string) => void;
    onAddVoucher: (userId: string) => void;
    onRemoveVoucher: (userId: string) => void;
    onHelpClick?: (context?: string) => void;
}

const FormInput: React.FC<{ 
    id: string; 
    label: string; 
    value: string | number; 
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; 
    type?: string; 
}> = ({ id, label, value, onChange, type = 'text' }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-600 mb-1">
            {label}
        </label>
        <input
            id={id}
            type={type}
            value={value}
            onChange={onChange}
            className="w-full bg-slate-50 border border-slate-300 rounded-md p-2 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-200"
        />
    </div>
);

export const UsersPage: React.FC<UsersPageProps> = ({ 
    users, 
    onCreateUser, 
    onUpdateUser,
    onAddVoucher, 
    onRemoveVoucher, 
    onHelpClick 
}) => {
    const { user } = useAuth();
    const { t } = useTranslations();
    const { setContext } = useUserInteraction();

    useEffect(() => {
        setContext({ screen: 'Users Page', action: 'Viewing users list', data: {} });
    }, []); // Remove setContext from dependencies to prevent infinite loop

    const [showAddForm, setShowAddForm] = useState(false);
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const handleUserInputChange = (setter: React.Dispatch<React.SetStateAction<any>>, field: string, value: any) => {
        setter(value);
        setContext(prev => ({
            ...prev,
            action: editingUserId ? 'Editing user' : 'Creating a new user',
            data: { ...prev.data, [field]: value }
        }));
    };

    const handleCreateUser = () => {
        if (userName.trim() && userEmail.trim()) {
            onCreateUser(userName, userEmail);
            setUserName('');
            setUserEmail('');
            setShowAddForm(false);
        }
    };

    const handleUpdateUser = () => {
        if (editingUserId && userName.trim() && userEmail.trim()) {
            onUpdateUser(editingUserId, userName, userEmail);
            setEditingUserId(null);
            setUserName('');
            setUserEmail('');
        }
    };

    const handleEditClick = (user: User) => {
        setEditingUserId(user.id);
        setUserName(user.name);
        setUserEmail(user.email);
        setShowAddForm(false);
    };

    const handleCancelEdit = () => {
        setEditingUserId(null);
        setUserName('');
        setUserEmail('');
    };

    const handleCancelAdd = () => {
        setShowAddForm(false);
        setUserName('');
        setUserEmail('');
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const isEditing = editingUserId !== null;

    return (
        <div className="max-w-6xl mx-auto p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                    <h1 className="text-3xl font-bold text-slate-900">{t('navUsers')}</h1>
                    <HelpButton 
                        onClick={onHelpClick}
                        context="users management list view"
                        variant="icon"
                        size="lg"
                    />
                </div>
                <button
                    onClick={() => setShowAddForm(true)}
                    disabled={isEditing}
                    data-tour="add-user-button"
                    className="px-6 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>{t('addUserButton')}</span>
                </button>
            </div>

            {/* Search */}
            <div className="mb-6">
                <input
                    type="text"
                    placeholder={t('adminSearchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-3 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-200"
                />
            </div>

            {/* Add/Edit Form */}
            {(showAddForm || isEditing) && (
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-md mb-8" data-tour="create-user-form">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-slate-800">
                            {isEditing ? t('adminEditUser') : t('adminCreateUser')}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput 
                            id="user-name" 
                            label={t('adminUserNameLabel')} 
                            value={userName} 
                            onChange={(e) => handleUserInputChange(setUserName, 'userName', e.target.value)} 
                        />
                        <FormInput 
                            id="user-email" 
                            label={t('adminEmailLabel')} 
                            value={userEmail} 
                            onChange={(e) => handleUserInputChange(setUserEmail, 'userEmail', e.target.value)} 
                            type="email" 
                        />
                    </div>
                    <div className="flex gap-4 mt-6">
                        {isEditing ? (
                            <>
                                <button
                                    onClick={handleUpdateUser}
                                    disabled={!userName.trim() || !userEmail.trim()}
                                    className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors duration-200"
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
                            <>
                                <button
                                    onClick={handleCreateUser}
                                    disabled={!userName.trim() || !userEmail.trim()}
                                    className="px-6 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors duration-200"
                                >
                                    {t('adminCreateUserBtn')}
                                </button>
                                <button
                                    onClick={handleCancelAdd}
                                    className="px-6 py-3 bg-slate-300 text-slate-700 rounded-lg hover:bg-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-colors duration-200"
                                >
                                    {t('adminCancelBtn')}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Users List */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-md">
                <div className="p-6 border-b border-slate-200">
                    <h2 className="text-xl font-semibold text-slate-800">
                        {t('adminExistingUsers')} ({filteredUsers.length})
                    </h2>
                </div>
                <div className="p-6">
                    {filteredUsers.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredUsers.map(user => (
                                <div key={user.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:shadow-md transition-shadow duration-200">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center text-white font-semibold">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-cyan-600">{user.name}</h3>
                                                <p className="text-sm text-slate-500">{user.email}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleEditClick(user)}
                                            disabled={isEditing || showAddForm}
                                            title={t('adminEditBtn')}
                                            className="p-2 text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors duration-200"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                                            </svg>
                                            <span className="text-sm text-slate-600">
                                                {t('adminVouchersLabel')}: <span className="font-bold text-slate-900">{user.voucherBalance}</span>
                                            </span>
                                        </div>
                                        <div className="flex gap-2" data-tour="voucher-management">
                                            <button 
                                                onClick={() => onAddVoucher(user.id)} 
                                                className="w-8 h-8 flex items-center justify-center text-sm font-bold bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
                                                title={t('addVoucherTooltip')}
                                            >
                                                +
                                            </button>
                                            <button 
                                                onClick={() => onRemoveVoucher(user.id)} 
                                                disabled={user.voucherBalance <= 0} 
                                                className="w-8 h-8 flex items-center justify-center text-sm font-bold bg-red-100 text-red-700 rounded-full hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                title={t('removeVoucherTooltip')}
                                            >
                                                -
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                            </svg>
                            <h3 className="text-lg font-medium text-slate-600 mb-2">
                                {searchTerm ? t('adminNoUserMatches') : t('adminNoUsers')}
                            </h3>
                            {!searchTerm && (
                                <p className="text-slate-500">
                                    {t('noUsersHint')}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
