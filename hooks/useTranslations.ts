
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
  "welcomeCloseBtn": "Stäng",
  // Help System
  "helpButtonTitle": "Hjälp",
  "helpButtonText": "Hjälp",
  "helpSystemTitle": "Hjälp & Dokumentation",
  "helpSearchPlaceholder": "Sök hjälpämnen...",
  "helpCategoryAll": "Alla Kategorier",
  "helpCategoryGeneral": "Allmänt",
  "helpCategoryAdmin": "Administratör",
  "helpCategoryUser": "Slutanvändare",
  "helpNoResults": "Inga hjälpämnen hittades som matchar din sökning.",
  "helpContactAdmin": "Behöver mer hjälp? Kontakta din systemadministratör.",
  "helpSystemVersion": "System för Träningshantering v1.0",
  "helpEditButton": "Redigera hjälpinnehåll på GitHub",
  // Help Content - Overview
  "helpOverviewTitle": "Systemöversikt",
  "helpOverviewContent": `# Systemöversikt för Träningshantering

Systemet för Träningshantering är en omfattande plattform för att hantera träningskurser, användaranmälningar och närvarospårning. Systemet använder ett klippkortsbaserat tillvägagångssätt där användare spenderar klippkort för att delta i träningssessioner.

## Huvudfunktioner:
- **Klippkortssystem**: Användare spenderar klippkort för att delta i träningar
- **Användarhantering**: Administratörer kan skapa användare och hantera klippkort
- **Träningshantering**: Skapa och hantera träningskurser
- **Närvarospårning**: Markera och spåra närvaro vid träningar
- **Realtidsuppdateringar**: Live datasynkronisering

## Systemarkitektur:
- **Frontend**: React-applikation med TypeScript
- **Backend**: Supabase (PostgreSQL-databas)
- **Autentisering**: Anonym åtkomst (konfigurerbar)`,
  // Help Content - Vouchers
  "helpVouchersTitle": "Klippkortssystem",
  "helpVouchersContent": `# Klippkortssystem

## Vad är klippkort?
Klippkort är krediter som användare spenderar för att delta i träningssessioner. Varje träningssession kostar 1 klippkort.

## Hur fungerar klippkort?
- Användare börjar med 0 klippkort (eller ett angivet belopp)
- Administratörer kan lägga till/ta bort klippkort från användarkonton
- När en användare deltar i en träning dras 1 klippkort
- Om närvaro avbryts återbetalas klippkortet
- Klippkort kan inte gå under 0

## Klippkortsregler:
- Du kan inte delta i träningar utan klippkort
- Klippkort spenderas endast när du markerar närvaro
- Klippkort återbetalas när du avbryter närvaro
- Kontakta en administratör för att lägga till klippkort på ditt konto`,
  // Help Content - User Management
  "helpUserManagementTitle": "Användarhantering (Admin)",
  "helpUserManagementContent": `# Användarhantering för Administratörer

## Skapa Användare
1. Navigera till **Admin**-vyn
2. I "Skapa Användare"-sektionen:
   - Ange användarens **fullständiga namn**
   - Ange en **unik e-postadress**
3. Klicka **"Skapa Användare"**
4. Användaren skapas med 0 klippkort

## Hantera Klippkort
**Lägga till Klippkort:**
1. Hitta användaren i användarlistan
2. Klicka **"+"**-knappen bredvid deras klippkortssaldo
3. Ett klippkort läggs till på deras konto

**Ta bort Klippkort:**
1. Hitta användaren i användarlistan
2. Klicka **"-"**-knappen bredvid deras klippkortssaldo
3. Ett klippkort tas bort (om saldo > 0)

## Bästa Praktiker:
- Övervaka klippkortsanvändningsmönster
- Sätt upp klippkortsallokeringsprinciper
- Överväg bulkdistribution av klippkort för team`,
  // Help Content - Training Management
  "helpTrainingManagementTitle": "Träningshantering (Admin)",
  "helpTrainingManagementContent": `# Träningshantering för Administratörer

## Skapa Träningar
1. Navigera till **Admin**-vyn
2. I "Skapa Träning"-sektionen:
   - Ange ett **beskrivande namn** (t.ex. "React Grunderna")
   - Ge en **detaljerad beskrivning** av träningsinnehållet
3. Klicka **"Skapa Träning"**
4. Träningen visas i träningslistan

## Redigera Träningar
1. Hitta träningen i träningslistan
2. Klicka **redigeringsikonen** (penna)
3. Ändra namn och/eller beskrivning
4. Klicka **"Spara"** för att uppdatera

## Tränings Bästa Praktiker
**Namngivningskonventioner:**
- Använd tydliga, beskrivande namn
- Inkludera färdighetsnivå om tillämpligt (Nybörjare, Mellan, Avancerad)
- Överväg att lägga till datum för tidskänsliga träningar

**Beskrivningsriktlinjer:**
- Inkludera lärandemål
- Lista förkunskaper
- Nämn varaktighet och format
- Specificera målgrupp`,
  // Help Content - Subscriptions
  "helpSubscriptionsTitle": "Träningsanmälningar (Användare)",
  "helpSubscriptionsContent": `# Träningsanmälningar för Användare

## Anmäla sig till Träningar
1. Gå till **Anmälningssidan**
2. Bläddra bland tillgängliga träningar
3. Klicka **"Anmäl"** bredvid träningar du vill delta i
4. Du kan anmäla dig till flera träningar

**Viktiga Anmärkningar:**
- Anmälan är gratis (ingen klippkortskostnad)
- Du kan avanmäla dig när som helst
- Anmälan garanterar inte närvaro

## Hantera Anmälningar
**Visa dina anmälningar:**
- Dina anmälda träningar markeras i Anmälningssidan
- Du kan se anmälningsstatus i Närvarovyn

**Avanmäla dig:**
- Klicka **"Avanmäl"** för att ta bort dig från en träning
- Detta påverkar inte ditt klippkortssaldo

## Bästa Praktiker:
- Anmäl dig till träningar du verkligen är intresserad av
- Anmäl dig inte till träningar du inte kan delta i
- Håll din anmälningslista hanterbar`,
  // Help Content - Attendance
  "helpAttendanceTitle": "Närvarohantering (Användare)",
  "helpAttendanceContent": `# Närvarohantering för Användare

## Markera Närvaro
1. Gå till **Närvaro**-vyn
2. Hitta träningen du vill delta i
3. Klicka **"Markera Närvaro"** bredvid ditt namn
4. Ett klippkort dras från ditt saldo

**Krav:**
- Du måste vara anmäld till träningen
- Du måste ha minst 1 klippkort tillgängligt
- Du kan endast markera närvaro en gång per träning

## Avbryta Närvaro
1. Gå till **Närvaro**-vyn
2. Hitta träningen där du markerade närvaro
3. Klicka **"Avbryt Närvaro"** bredvid ditt namn
4. Ditt klippkort återbetalas

**Viktiga Anmärkningar:**
- Du kan endast avbryta närvaro om du tidigare markerade det
- Avbrytande återbetalar klippkortet omedelbart
- Det finns ingen tidsgräns för avbrytande

## Bästa Praktiker:
- Säkerställ att du verkligen kan delta innan du markerar närvaro
- Kontrollera ditt klippkortssaldo innan du markerar närvaro
- Lägg till träningar i din kalender efter att du markerat närvaro`,
  // Help Content - Troubleshooting
  "helpTroubleshootingTitle": "Felsökning",
  "helpTroubleshootingContent": `# Felsökning av Vanliga Problem

## "Kan inte markera närvaro"
**Möjliga Orsaker:**
- Otillräckliga klippkort
- Inte anmäld till träningen
- Redan markerat närvaro

**Lösningar:**
1. Kontrollera ditt klippkortssaldo
2. Anmäl dig till träningen först
3. Avbryt tidigare närvaro om nödvändigt

## "Träning visas inte"
**Möjliga Orsaker:**
- Träningen togs bort av administratör
- Systemladdningsproblem
- Nätverksanslutningsproblem

**Lösningar:**
1. Uppdatera sidan
2. Kontrollera din internetanslutning
3. Kontakta en administratör

## "Klippkortssaldo uppdateras inte"
**Möjliga Orsaker:**
- Nätverksfördröjning
- Systemfel
- Webbläsarcache-problem

**Lösningar:**
1. Vänta några sekunder och uppdatera
2. Rensa webbläsarcache
3. Prova en annan webbläsare
4. Kontakta en administratör

## Få Hjälp
**För Tekniska Problem:**
- Kontakta din systemadministratör
- Ange din e-postadress
- Beskriv problemet i detalj
- Inkludera eventuella felmeddelanden`
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
  "welcomeCloseBtn": "Close",
  // Help System
  "helpButtonTitle": "Help",
  "helpButtonText": "Help",
  "helpSystemTitle": "Help & Documentation",
  "helpSearchPlaceholder": "Search help topics...",
  "helpCategoryAll": "All Categories",
  "helpCategoryGeneral": "General",
  "helpCategoryAdmin": "Administrator",
  "helpCategoryUser": "End User",
  "helpNoResults": "No help topics found matching your search.",
  "helpContactAdmin": "Need more help? Contact your system administrator.",
  "helpSystemVersion": "Training Management System v1.0",
  "helpEditButton": "Edit help content on GitHub",
  // Help Content - Overview
  "helpOverviewTitle": "System Overview",
  "helpOverviewContent": `# Training Management System Overview

The Training Management System is a comprehensive platform for managing training courses, user subscriptions, and attendance tracking. The system uses a voucher-based approach where users spend vouchers to attend training sessions.

## Key Features:
- **Voucher System**: Users spend vouchers to attend trainings
- **User Management**: Admins can create users and manage vouchers
- **Training Management**: Create and manage training courses
- **Attendance Tracking**: Mark and track attendance at trainings
- **Real-time Updates**: Live data synchronization

## System Architecture:
- **Frontend**: React application with TypeScript
- **Backend**: Supabase (PostgreSQL database)
- **Authentication**: Anonymous access (configurable)`,
  // Help Content - Vouchers
  "helpVouchersTitle": "Voucher System",
  "helpVouchersContent": `# Voucher System

## What are vouchers?
Vouchers are credits that users spend to attend training sessions. Each training session costs 1 voucher.

## How do vouchers work?
- Users start with 0 vouchers (or a specified amount)
- Admins can add/remove vouchers from user accounts
- When a user attends a training, 1 voucher is deducted
- If attendance is cancelled, the voucher is refunded
- Vouchers cannot go below 0

## Voucher Rules:
- You cannot attend trainings without vouchers
- Vouchers are only spent when marking attendance
- Vouchers are refunded when cancelling attendance
- Contact an administrator to add vouchers to your account`,
  // Help Content - User Management
  "helpUserManagementTitle": "User Management (Admin)",
  "helpUserManagementContent": `# User Management for Administrators

## Creating Users
1. Navigate to **Admin** view
2. In the "Create User" section:
   - Enter the user's **full name**
   - Enter a **unique email address**
3. Click **"Create User"**
4. The user will be created with 0 vouchers

## Managing Vouchers
**Adding Vouchers:**
1. Find the user in the user list
2. Click the **"+"** button next to their voucher balance
3. One voucher will be added to their account

**Removing Vouchers:**
1. Find the user in the user list
2. Click the **"-"** button next to their voucher balance
3. One voucher will be removed (if balance > 0)

## Best Practices:
- Monitor voucher usage patterns
- Set up voucher allocation policies
- Consider bulk voucher distribution for teams`,
  // Help Content - Training Management
  "helpTrainingManagementTitle": "Training Management (Admin)",
  "helpTrainingManagementContent": `# Training Management for Administrators

## Creating Trainings
1. Navigate to **Admin** view
2. In the "Create Training" section:
   - Enter a **descriptive name** (e.g., "React Fundamentals")
   - Provide a **detailed description** of the training content
3. Click **"Create Training"**
4. The training will appear in the training list

## Editing Trainings
1. Find the training in the training list
2. Click the **edit icon** (pencil)
3. Modify the name and/or description
4. Click **"Save"** to update

## Training Best Practices
**Naming Conventions:**
- Use clear, descriptive names
- Include skill level if applicable (Beginner, Intermediate, Advanced)
- Consider adding dates for time-sensitive trainings

**Description Guidelines:**
- Include learning objectives
- List prerequisites
- Mention duration and format
- Specify target audience`,
  // Help Content - Subscriptions
  "helpSubscriptionsTitle": "Training Subscriptions (User)",
  "helpSubscriptionsContent": `# Training Subscriptions for Users

## Subscribing to Trainings
1. Go to the **Public** view
2. Browse available trainings
3. Click **"Subscribe"** next to trainings you want to attend
4. You can subscribe to multiple trainings

**Important Notes:**
- Subscribing is free (no voucher cost)
- You can unsubscribe at any time
- Subscribing doesn't guarantee attendance

## Managing Subscriptions
**Viewing Your Subscriptions:**
- Your subscribed trainings are highlighted in the Public view
- You can see subscription status in the Attendance view

**Unsubscribing:**
- Click **"Unsubscribe"** to remove yourself from a training
- This won't affect your voucher balance

## Best Practices:
- Subscribe to trainings you're genuinely interested in
- Don't subscribe to trainings you can't attend
- Keep your subscription list manageable`,
  // Help Content - Attendance
  "helpAttendanceTitle": "Attendance Management (User)",
  "helpAttendanceContent": `# Attendance Management for Users

## Marking Attendance
1. Go to the **Attendance** view
2. Find the training you want to attend
3. Click **"Mark Attendance"** next to your name
4. One voucher will be deducted from your balance

**Requirements:**
- You must be subscribed to the training
- You must have at least 1 voucher available
- You can only mark attendance once per training

## Cancelling Attendance
1. Go to the **Attendance** view
2. Find the training where you marked attendance
3. Click **"Cancel Attendance"** next to your name
4. Your voucher will be refunded

**Important Notes:**
- You can only cancel attendance if you previously marked it
- Cancelling immediately refunds the voucher
- There's no time limit for cancellation

## Best Practices:
- Ensure you can actually attend before marking attendance
- Check your voucher balance before marking attendance
- Add trainings to your calendar after marking attendance`,
  // Help Content - Troubleshooting
  "helpTroubleshootingTitle": "Troubleshooting",
  "helpTroubleshootingContent": `# Troubleshooting Common Issues

## "Cannot Mark Attendance"
**Possible Causes:**
- Insufficient vouchers
- Not subscribed to the training
- Already marked attendance

**Solutions:**
1. Check your voucher balance
2. Subscribe to the training first
3. Cancel previous attendance if needed

## "Training Not Appearing"
**Possible Causes:**
- Training was deleted by admin
- System loading issue
- Network connectivity problem

**Solutions:**
1. Refresh the page
2. Check your internet connection
3. Contact an administrator

## "Voucher Balance Not Updating"
**Possible Causes:**
- Network delay
- System error
- Browser cache issue

**Solutions:**
1. Wait a few seconds and refresh
2. Clear browser cache
3. Try a different browser
4. Contact an administrator

## Getting Help
**For Technical Issues:**
- Contact your system administrator
- Provide your email address
- Describe the issue in detail
- Include any error messages`
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
