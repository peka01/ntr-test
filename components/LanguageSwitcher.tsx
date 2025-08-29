
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export const LanguageSwitcher: React.FC = () => {
    const { language, setLanguage } = useLanguage();

    const SwitcherButton: React.FC<{ lang: 'sv' | 'en', children: React.ReactNode }> = ({ lang, children }) => (
         <button
            onClick={() => setLanguage(lang)}
            className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors duration-200 ${
                language === lang
                    ? 'bg-cyan-500 text-white'
                    : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
        >
            {children}
        </button>
    );

    return (
        <div className="flex items-center gap-2 p-1 bg-slate-200 rounded-lg">
            <SwitcherButton lang="sv">Svenska</SwitcherButton>
            <SwitcherButton lang="en">English</SwitcherButton>
        </div>
    );
};