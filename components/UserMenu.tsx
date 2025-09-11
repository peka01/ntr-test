import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslations } from '../hooks/useTranslations';
import { User } from '@supabase/supabase-js';

interface UserMenuProps {
    user: User;
    onTourManagement?: () => void;
    onShoutoutManagement?: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({ user, onTourManagement, onShoutoutManagement }) => {
    const { t } = useTranslations();
    const { signOut, isAdmin } = useAuth();
    const { language, setLanguage } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Safety check: don't render if no user
    if (!user) {
        return null;
    }

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLanguageChange = (lang: 'sv' | 'en') => {
        setLanguage(lang);
        setIsOpen(false);
    };

    const handleSignOut = () => {
        signOut();
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors duration-200"
            >
                <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {user.user_metadata?.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
                </div>
                <span className="hidden sm:block">{user.user_metadata?.name || user.email}</span>
                <svg
                    className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
                    {/* User Info Section */}
                    <div className="px-4 py-3 border-b border-slate-200">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                                {user.user_metadata?.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-900">
                                    {user.user_metadata?.name || 'User'}
                                </p>
                                <p className="text-xs text-slate-500">{user.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Admin Options */}
                    {isAdmin && (onTourManagement || onShoutoutManagement) && (
                        <div className="px-4 py-3 border-b border-slate-200">
                            <div className="space-y-2">
                                {onTourManagement && (
                                    <button
                                        onClick={() => {
                                            onTourManagement();
                                            setIsOpen(false);
                                        }}
                                        className="w-full px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors duration-200 flex items-center justify-center space-x-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                        <span>{t('navTourManagement')}</span>
                                    </button>
                                )}
                                {onShoutoutManagement && (
                                    <button
                                        onClick={() => {
                                            onShoutoutManagement();
                                            setIsOpen(false);
                                        }}
                                        className="w-full px-3 py-2 text-sm font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-md transition-colors duration-200 flex items-center justify-center space-x-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                                        </svg>
                                        <span>{t('navShoutoutManagement')}</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Language Selector */}
                    <div className="px-4 py-3 border-b border-slate-200">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                            {t('languageSwitcher')}
                        </p>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => handleLanguageChange('sv')}
                                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 ${
                                    language === 'sv'
                                        ? 'bg-cyan-500 text-white'
                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }`}
                            >
                                {t('languageSwedish')}
                            </button>
                            <button
                                onClick={() => handleLanguageChange('en')}
                                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 ${
                                    language === 'en'
                                        ? 'bg-cyan-500 text-white'
                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }`}
                            >
                                {t('languageEnglish')}
                            </button>
                        </div>
                    </div>

                    {/* Logout Button */}
                    <div className="px-4 py-2">
                        <button
                            onClick={handleSignOut}
                            className="w-full px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors duration-200 flex items-center justify-center space-x-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span>{t('signOutButton')}</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
