
import { useLanguage } from '../contexts/LanguageContext';

const sv = {
  "appTitle": "System för Träningshantering",
  "navPublic": "Anmälningssida",
  "navAttendance": "Närvaro",
  "navAdmin": "Adminpanel",
  "adminManageTrainings": "Hantera Träningar",
  "adminTrainingNameLabel": "Träningsnamn",
  "adminDescriptionLabel": "Beskrivning",
  "adminCreateTrainingBtn": "Skapa Träning",
  "adminUpdateTrainingBtn": "Uppdatera Träning",
  "adminCancelBtn": "Avbryt",
  "adminEditBtn": "Redigera",
  "adminUpdateTrainingTitle": "Uppdatera Träning",
  "adminExistingTrainings": "Befintliga Träningar",
  "adminNoTrainings": "Inga träningar har skapats än.",
  "adminManageUsers": "Hantera Användare",
  "adminUserNameLabel": "Användarnamn",
  "adminEmailLabel": "E-post",
  "adminCreateUserBtn": "Skapa Användare",
  "adminExistingUsers": "Befintliga Användare",
  "adminSearchPlaceholder": "Sök på namn eller e-post...",
  "adminVouchersLabel": "Klippkort",
  "adminNoUserMatches": "Inga användare matchar din sökning.",
  "adminNoUsers": "Inga användare har skapats än.",
  "subSearchPlaceholder": "Sök efter en träning...",
  "subSubscribedUsers": "Anmälda Användare",
  "subNoUsersSubscribed": "Inga användare anmälda än.",
  "subSubscribeUserTitle": "Anmäl en Användare",
  "subSelectUser": "Välj en användare",
  "subSubscribeBtn": "Anmäl",
  "subNoTrainingsMatch": "Inga träningar matchar din sökning.",
  "subNoTrainingsCreated": "Inga träningar har skapats än. Gå till Adminpanelen för att lägga till en.",
  "attSubscribedUsers": "Anmälda Användare",
  "attVouchersLabel": "Klippkort",
  "attMarkNotPresentBtn": "Markera som Ej Närvarande",
  "attMarkPresentBtn": "Markera som Närvarande",
  "attOpenKioskBtn": "Öppna Kioskläge",
  "attNoUsersSubscribed": "Inga användare är anmälda till denna träning.",
  "attNoTrainingsCreated": "Inga träningar har skapats än. Gå till Adminpanelen för att lägga till en.",
  "kioskExitBtn": "Avsluta Kioskläge",
  "kioskInstructions": "Markera din närvaro nedan",
  "kioskPresentStatus": "Närvarande",
  "kioskPresentBtn": "Närvarande",
  "welcomeMessage": "Välkommen, {name}!",
  "welcomeSubMessage": "Din närvaro har registrerats.",
  "welcomeBalanceLabel": "Återstående saldo på klippkort:",
  "welcomeCloseBtn": "Stäng"
};

const en = {
  "appTitle": "Training Management System",
  "navPublic": "Public Subscription Page",
  "navAttendance": "Attendance",
  "navAdmin": "Admin Panel",
  "adminManageTrainings": "Manage Trainings",
  "adminTrainingNameLabel": "Training Name",
  "adminDescriptionLabel": "Description",
  "adminCreateTrainingBtn": "Create Training",
  "adminUpdateTrainingBtn": "Update Training",
  "adminCancelBtn": "Cancel",
  "adminEditBtn": "Edit",
  "adminUpdateTrainingTitle": "Update Training",
  "adminExistingTrainings": "Existing Trainings",
  "adminNoTrainings": "No trainings created yet.",
  "adminManageUsers": "Manage Users",
  "adminUserNameLabel": "User Name",
  "adminEmailLabel": "Email",
  "adminCreateUserBtn": "Create User",
  "adminExistingUsers": "Existing Users",
  "adminSearchPlaceholder": "Search by name or email...",
  "adminVouchersLabel": "Vouchers",
  "adminNoUserMatches": "No users match your search.",
  "adminNoUsers": "No users created yet.",
  "subSearchPlaceholder": "Search for a training...",
  "subSubscribedUsers": "Subscribed Users",
  "subNoUsersSubscribed": "No users subscribed yet.",
  "subSubscribeUserTitle": "Subscribe a User",
  "subSelectUser": "Select a user",
  "subSubscribeBtn": "Subscribe",
  "subNoTrainingsMatch": "No trainings match your search.",
  "subNoTrainingsCreated": "No trainings have been created yet. Please go to the Admin Panel to add a training.",
  "attSubscribedUsers": "Subscribed Users",
  "attVouchersLabel": "Vouchers",
  "attMarkNotPresentBtn": "Mark as Not Present",
  "attMarkPresentBtn": "Mark as Present",
  "attOpenKioskBtn": "Open Kiosk Mode",
  "attNoUsersSubscribed": "No users are subscribed to this training.",
  "attNoTrainingsCreated": "No trainings have been created yet. Please go to the Admin Panel to add a training.",
  "kioskExitBtn": "Exit Kiosk Mode",
  "kioskInstructions": "Mark your attendance below",
  "kioskPresentStatus": "Present",
  "kioskPresentBtn": "Present",
  "welcomeMessage": "Welcome, {name}!",
  "welcomeSubMessage": "Your attendance has been registered.",
  "welcomeBalanceLabel": "Remaining voucher balance:",
  "welcomeCloseBtn": "Close"
};

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
