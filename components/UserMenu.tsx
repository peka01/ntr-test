import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslations } from '../hooks/useTranslations';
import { User } from '@supabase/supabase-js';

interface UserMenuProps {
    user: User;
}

export const UserMenu: React.FC<UserMenuProps> = ({ user }) => {
    const { t } = useTranslations();
    const { signOut } = useAuth();
    const { language, setLanguage } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

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
