import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslations } from '../hooks/useTranslations';

export const LanguageSelector: React.FC = () => {
    const { language, setLanguage } = useLanguage();
    const { t } = useTranslations();

    const handleLanguageChange = (lang: 'sv' | 'en') => {
        setLanguage(lang);
    };

    return (
        <div className="flex items-center space-x-1">
            <button
                onClick={() => handleLanguageChange('sv')}
                className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                    language === 'sv'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title={t('languageSwedish')}
            >
                SV
            </button>
            <button
                onClick={() => handleLanguageChange('en')}
                className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                    language === 'en'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title={t('languageEnglish')}
            >
                EN
            </button>
        </div>
    );
};
