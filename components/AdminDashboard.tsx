
import React, { useState, useEffect } from 'react';
import type { User, Training } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useTranslations } from '../hooks/useTranslations';
import { useUserInteraction } from '../contexts/UserInteractionContext';
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
    const { user } = useAuth();
    const { t } = useTranslations();
    const { setContext } = useUserInteraction();

    useEffect(() => {
        setContext({ screen: 'Admin Dashboard', action: 'Viewing dashboard', data: {} });
    }, [setContext]);

    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [userVouchers, setUserVouchers] = useState<number>(10);
    const [userSearch, setUserSearch] = useState('');

    const [editingTrainingId, setEditingTrainingId] = useState<string | null>(null);
    const [trainingTitle, setTrainingTitle] = useState('');
    const [trainingDescription, setTrainingDescription] = useState('');
    const [trainingDate, setTrainingDate] = useState('');
    const [trainingTime, setTrainingTime] = useState('');

    const handleUserInputChange = (setter: React.Dispatch<React.SetStateAction<any>>, field: string, value: any) => {
        setter(value);
        setContext({
          action: 'Creating a new user',
          data: { ...{userName, userEmail, userVouchers: userVouchers.toString() }, [field]: value }
        });
      };
    
      const handleTrainingInputChange = (setter: React.Dispatch<React.SetStateAction<string>>, field: string, value: string) => {
        setter(value);
        setContext({
          action: 'Creating a new training',
          data: { ...{trainingTitle, trainingDescription, trainingDate, trainingTime}, [field]: value }
        });
      };

      const handleCreateUser = () => {
          if (userName.trim() && userEmail.trim()) {
              onCreateUser(userName, userEmail, userVouchers);
              setUserName('');
              setUserEmail('');
              setUserVouchers(10);
          }
      };

      const handleUpdateTraining = () => {
          if (editingTrainingId && trainingTitle.trim()) {
              onUpdateTraining(editingTrainingId, trainingTitle, trainingDescription, trainingDate, trainingTime);
              setEditingTrainingId(null);
              setTrainingTitle('');
              setTrainingDescription('');
              setTrainingDate('');
              setTrainingTime('');
          }
      };
      
      const handleCreateTraining = () => {
          if (trainingTitle.trim()) {
              onCreateTraining(trainingTitle, trainingDescription, trainingDate, trainingTime);
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
          setTrainingDate(training.date);
          setTrainingTime(training.time);
      };
      
      const handleCancelEdit = () => {
          setEditingTrainingId(null);
          setTrainingTitle('');
          setTrainingDescription('');
          setTrainingDate('');
          setTrainingTime('');
      };

      const filteredUsers = users.filter(u => u.name.toLowerCase().includes(userSearch.toLowerCase()));
      const isEditing = editingTrainingId !== null;

     return (
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8 bg-slate-100">
             <AdminCard 
                 title={isEditing ? t('adminEditTraining') : t('adminCreateTraining')}
                 helpContext="create training edit training admin training management"
                 onHelpClick={onHelpClick}
             >
                 <div className="space-y-4">
                     <FormInput id="training-title" label={t('adminTrainingTitleLabel')} value={trainingTitle} onChange={(e) => handleTrainingInputChange(setTrainingTitle, 'trainingTitle', e.target.value)} />
                     <FormInput id="training-desc" label={t('adminTrainingDescLabel')} value={trainingDescription} onChange={(e) => handleTrainingInputChange(setTrainingDescription, 'trainingDescription', e.target.value)} type="textarea" />
                     <FormInput id="training-date" label={t('adminTrainingDateLabel')} value={trainingDate} onChange={(e) => handleTrainingInputChange(setTrainingDate, 'trainingDate', e.target.value)} type="date" />
                     <FormInput id="training-time" label={t('adminTrainingTimeLabel')} value={trainingTime} onChange={(e) => handleTrainingInputChange(setTrainingTime, 'trainingTime', e.target.value)} type="time" />
                     
                     <div className="flex gap-4">
                         {isEditing ? (
                             <>
                                 <button
                                     onClick={handleUpdateTraining}
                                     className="w-full mt-4 px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-green-500 transition-colors duration-200"
                                 >
                                     {t('adminUpdateBtn')}
                                 </button>
                                 <button
                                     onClick={handleCancelEdit}
                                     className="w-full mt-4 px-6 py-3 border border-slate-300 text-base font-medium rounded-lg shadow-sm text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-slate-500 transition-colors duration-200"
                                 >
                                     {t('adminCancelBtn')}
                                 </button>
                             </>
                         ) : (
                             <button
                                 onClick={handleCreateTraining}
                                 disabled={!trainingTitle.trim()}
                                 className="w-full mt-4 px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-cyan-500 hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-cyan-500 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors duration-200"
                             >
                                 {t('adminCreateTrainingBtn')}
                             </button>
                         )}
                     </div>
                 </div>
                 <div className="flex-grow space-y-3 mt-8 overflow-y-auto pr-2">
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
                     <FormInput id="user-name" label={t('adminUserNameLabel')} value={userName} onChange={(e) => handleUserInputChange(setUserName, 'userName', e.target.value)} />
                     <FormInput id="user-email" label={t('adminEmailLabel')} value={userEmail} onChange={(e) => handleUserInputChange(setUserEmail, 'userEmail', e.target.value)} type="email" />
                     <FormInput id="user-vouchers" label={t('adminVouchersLabel')} value={userVouchers} onChange={(e) => handleUserInputChange(setUserVouchers, 'userVouchers', parseInt(e.target.value))} type="number" />
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

 interface AdminCardProps {
     title: string;
     helpContext: string;
     onHelpClick?: (context?: string) => void;
     children: React.ReactNode;
 }
 
 const AdminCard: React.FC<AdminCardProps> = ({ title, helpContext, children, onHelpClick }) => (
     <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-col h-full">
         <div className="flex justify-between items-center mb-4">
             <h2 className="text-xl font-bold text-slate-800">{title}</h2>
             {onHelpClick && <HelpButton onClick={() => onHelpClick(helpContext)} />}
         </div>
         {children}
     </div>
 );

 interface FormInputProps {
    id: string;
    label: string;
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    type?: string;
 }

 const FormInput: React.FC<FormInputProps> = ({ id, label, value, onChange, type = 'text' }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
        {type === 'textarea' ? (
            <textarea
                id={id}
                value={value}
                onChange={onChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-200"
                rows={3}
            />
        ) : (
            <input
                id={id}
                type={type}
                value={value}
                onChange={onChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-200"
            />
        )}
    </div>
 );