
import React, { useEffect } from 'react';
import type { User } from '../types';
import { useTranslations } from '../hooks/useTranslations';

interface WelcomeModalProps {
    user: User;
    onClose: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ user, onClose }) => {
    const { t } = useTranslations();

    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000); // Auto-close after 5 seconds

        return () => clearTimeout(timer);
    }, [onClose]);

    // The user object passed here is from before the state update,
    // so we subtract 1 from the balance to show the correct new total.
    const newBalance = user.voucherBalance > 0 ? user.voucherBalance - 1 : 0;

    return (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white rounded-2xl p-8 md:p-12 border border-slate-200 shadow-2xl text-center max-w-md w-full mx-4">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-cyan-600 mb-4">
                    {t('welcomeMessage', { name: user.name })}
                </h2>
                <p className="text-slate-600 text-lg mb-6">
                    {t('welcomeSubMessage')}
                </p>
                <div className="bg-slate-100 rounded-lg p-4 border border-slate-200">
                    <p className="text-slate-500">{t('welcomeBalanceLabel')}</p>
                    <p className="text-slate-900 text-3xl font-bold">{newBalance}</p>
                </div>
                <button
                    onClick={onClose}
                    className="mt-8 w-full px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-cyan-500 hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-cyan-500 transition-colors duration-200"
                >
                    {t('welcomeCloseBtn')}
                </button>
            </div>
        </div>
    );
};