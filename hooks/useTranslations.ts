
import { useLanguage } from '../contexts/LanguageContext';
import sv from '../locales/sv.json';
import en from '../locales/en.json';

const translations = { sv, en };

type TranslationKey = keyof typeof sv;

export const useTranslations = () => {
    const { language } = useLanguage();

    const t = (key: TranslationKey, replacements?: { [key: string]: string | number }): string => {
        let translation: string = translations[language][key] || key;
        
        if (replacements) {
            Object.keys(replacements).forEach(placeholder => {
                const value = replacements[placeholder];
                translation = translation.replace(`{${placeholder}}`, String(value));
            });
        }
        
        return translation;
    };

    return { t };
};
