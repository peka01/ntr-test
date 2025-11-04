# Help Content Guidelines

## Content Management Standards

### Language Priority
- **Swedish is the master language** - All content should be written in Swedish first
- **English is secondary** - English versions should be translated from Swedish
- **Keep both versions in sync** - When updating one language, update the other

## Developer Guidelines for UI Text

### CRITICAL: Never Hardcode UI Text

**The Problem:** Developers often hardcode English text directly in UI components, which creates several issues:
- Text cannot be easily translated
- Help documentation becomes outdated when UI text changes
- Inconsistent user experience across languages
- Difficult maintenance and updates

**The Solution:** Always use the localization system with Swedish-first approach.

### Step-by-Step Process for Adding New UI Text

#### 1. **Write Text in Swedish First**
- Think about what the text should say in Swedish
- Write it naturally, following the tone and voice guidelines
- Consider the context and user needs

#### 2. **Add to Swedish Locale File**
- Open `locales/sv.json`
- Add a new key with descriptive name
- Use camelCase naming convention
- Example: `"newFeatureButton": "Skapa ny funktion"`

#### 3. **Translate to English**
- Open `locales/en.json`
- Add the same key with English translation
- Maintain the same meaning and tone
- Example: `"newFeatureButton": "Create new feature"`

#### 4. **Use in UI Component**
- Import the translation hook: `import { useTranslations } from '../hooks/useTranslations'`
- Use the key in your component: `const t = useTranslations(); <button>{t('newFeatureButton')}</button>`

### Examples of Correct vs Incorrect Implementation

#### ❌ INCORRECT - Hardcoded English Text
```tsx
// DON'T DO THIS
function CreateUserButton() {
  return <button>Create User</button>;
}
```

#### ❌ INCORRECT - Hardcoded Swedish Text
```tsx
// DON'T DO THIS
function CreateUserButton() {
  return <button>Skapa användare</button>;
}
```

#### ✅ CORRECT - Using Localization System
```tsx
// DO THIS
function CreateUserButton() {
  const t = useTranslations();
  return <button>{t('adminCreateUserBtn')}</button>;
}
```

### Key Naming Conventions

**Use descriptive, hierarchical naming:**
- `adminCreateUserBtn` - Admin panel, create user button
- `navAttendance` - Navigation, attendance link
- `subSearchPlaceholder` - Subscription page, search placeholder
- `attMarkPresentBtn` - Attendance page, mark present button

**Avoid generic names:**
- ❌ `button1`, `text1`, `label1`
- ❌ `createBtn`, `saveBtn`, `cancelBtn` (too generic)
- ✅ `adminCreateTrainingBtn`, `adminSaveTrainingBtn`, `adminCancelBtn`

### Complete Workflow Example

**Scenario:** Adding a new "Delete Training" button to the admin panel

#### Step 1: Write Swedish Text
Think: "Ta bort träning" (Delete training)

#### Step 2: Add to Swedish Locale
```json
// locales/sv.json
{
  "adminDeleteTrainingBtn": "Ta bort träning"
}
```

#### Step 3: Translate to English
```json
// locales/en.json
{
  "adminDeleteTrainingBtn": "Delete Training"
}
```

#### Step 4: Use in Component
```tsx
// components/TrainingManagementPage.tsx
function TrainingManagementPage() {
  const t = useTranslations();
  
  return (
    <div>
      <button onClick={handleDelete}>
        {t('adminDeleteTrainingBtn')}
      </button>
    </div>
  );
}
```

### Verification Checklist for Developers

Before committing any UI changes:
- [ ] **No hardcoded text** in any UI component
- [ ] **Swedish text added first** to `locales/sv.json`
- [ ] **English translation added** to `locales/en.json`
- [ ] **Key names are descriptive** and follow naming convention
- [ ] **Component uses translation hook** correctly
- [ ] **Both languages tested** in the application
- [ ] **Text follows tone and voice guidelines** (Swedish first)

### Common Mistakes to Avoid

1. **Hardcoding any text** - Always use localization keys
2. **Writing English first** - Swedish is the master language
3. **Generic key names** - Use descriptive, hierarchical names
4. **Missing English translation** - Both languages must be added
5. **Inconsistent naming** - Follow the established pattern
6. **Forgetting to test** - Verify both languages work correctly

### Why This Approach Works

- **Consistent translations** - Swedish-first ensures natural language flow
- **Easy maintenance** - Update text in one place, affects entire application
- **Help documentation stays current** - Uses same keys as interface
- **Better user experience** - Proper localization support
- **Developer efficiency** - Clear process prevents confusion

### Real-World Examples

#### Example 1: Adding a New Button

**Scenario:** Adding a "Save Changes" button to the training edit form

**❌ WRONG WAY:**
```tsx
// Component with hardcoded English text
function TrainingEditForm() {
  return (
    <form>
      <button type="submit">Save Changes</button>
    </form>
  );
}
```

**✅ CORRECT WAY:**
```json
// locales/sv.json (Swedish first)
{
  "adminSaveChangesBtn": "Spara ändringar"
}
```

```json
// locales/en.json (English translation)
{
  "adminSaveChangesBtn": "Save Changes"
}
```

```tsx
// Component using localization
function TrainingEditForm() {
  const t = useTranslations();
  return (
    <form>
      <button type="submit">{t('adminSaveChangesBtn')}</button>
    </form>
  );
}
```

#### Example 2: Adding Form Labels

**Scenario:** Adding labels for a new user registration form

**❌ WRONG WAY:**
```tsx
// Hardcoded Swedish text
function UserRegistrationForm() {
  return (
    <form>
      <label>Förnamn</label>
      <input type="text" />
      <label>Efternamn</label>
      <input type="text" />
    </form>
  );
}
```

**✅ CORRECT WAY:**
```json
// locales/sv.json
{
  "userFirstNameLabel": "Förnamn",
  "userLastNameLabel": "Efternamn"
}
```

```json
// locales/en.json
{
  "userFirstNameLabel": "First Name",
  "userLastNameLabel": "Last Name"
}
```

```tsx
// Component using localization
function UserRegistrationForm() {
  const t = useTranslations();
  return (
    <form>
      <label>{t('userFirstNameLabel')}</label>
      <input type="text" />
      <label>{t('userLastNameLabel')}</label>
      <input type="text" />
    </form>
  );
}
```

#### Example 3: Adding Error Messages

**Scenario:** Adding validation error messages

**❌ WRONG WAY:**
```tsx
// Hardcoded English error message
function validateEmail(email) {
  if (!email.includes('@')) {
    return "Please enter a valid email address";
  }
}
```

**✅ CORRECT WAY:**
```json
// locales/sv.json
{
  "validationEmailInvalid": "Ange en giltig e-postadress"
}
```

```json
// locales/en.json
{
  "validationEmailInvalid": "Please enter a valid email address"
}
```

```tsx
// Using localization for error messages
function validateEmail(email, t) {
  if (!email.includes('@')) {
    return t('validationEmailInvalid');
  }
}
```

### Key Benefits Demonstrated

1. **Automatic Translation:** When you change `adminSaveChangesBtn` from "Spara ändringar" to "Spara alla ändringar", both the UI and help documentation automatically update.

2. **Consistent Experience:** Users see the same terminology across all parts of the application.

3. **Easy Maintenance:** Update text in one place (locale files) instead of searching through multiple components.

4. **Help Documentation Sync:** Help writers can reference `{adminSaveChangesBtn}` and it will always show the current button text.

### Quick Reference for Developers

**Always follow this pattern:**
1. Think in Swedish first
2. Add to `locales/sv.json`
3. Translate to `locales/en.json`
4. Use `{t('keyName')}` in component
5. Test both languages

**Never do this:**
- Hardcode any text in components
- Write English first, then translate
- Use generic key names
- Skip testing both languages

## Information Types and Structure

### Different Levels of Information

When writing help texts, we work with different types of topics/levels of information. The basic "start kit level" should include **Concept** and **Instruction** information types. Additional types are added based on complexity and user needs.

### 1. Concept Pages

**Purpose:** Serve as introduction to an area and can be used as landing pages when linking from external sites.

**Content should help readers understand:**
- If the feature is suitable for their task
- Any prerequisites to consider
- What to do next (next steps or related features)

**Structure:**
- Clear introduction to the main purpose
- How it relates to other parts of the system
- Best practice workflows (illustrations can complement text)
- Prerequisites and requirements

**Example:** System overview, voucher system explanation

### 2. Instructions

**Purpose:** Guide readers through performing specific tasks in the software.

**Structure:**
1. **Brief preamble** - Explain purpose and specify prerequisites
2. **Numbered action points** - Step-by-step instructions
3. **Use imperative mood** - "Click", "Select", "Enter" (not "You click", "You select")
4. **Combine minor steps** - Group related actions in one major step

**Interface Text Guidelines:**
- Make interface texts **bold**
- Use exact wording from the interface
- Initial letter in uppercase
- Example: "Select **Sales** - **Sales invoices** - **New sales invoice**"

**Additional Information:**
- Use info boxes for non-action information
- Distinguish between "need to know" vs "nice to know"
- Keep instructions focused and not too lengthy

### 3. Field Explanations

**Purpose:** Explain specific fields, buttons, or settings.

**Content should explain:**
- What the field/term means
- Whether it's relevant to use
- What information to enter
- Consequences/benefits of filling it out
- Where information comes from (if auto-filled)

**Note:** Only explain fields that are not self-explanatory in the interface.

### 4. Checklists

**Purpose:** Guide through processes involving multiple instructions across different parts of the system.

**Structure:**
- Can be standalone topics or part of concept topics
- Include instructions as steps or link to separate instruction topics
- Focus on "what and why" for each step

### 5. FAQ (Frequently Asked Questions)

**Purpose:** Provide quick answers to common questions and help users narrow down problems.

**Content should:**
1. Answer common "hang-ups" (Where do I find...? How do I...? When should I...?)
2. Help users phrase their questions and find more information
3. Provide links to detailed topics (not full instructions)

**Header format:** Write as questions
- "How do I delete an invoice?"
- "Why can't I access the user settings?"

### 6. Troubleshooting/Problem Solving

**Purpose:** Guide users to correct mistakes and solve problems.

**Structure:**
- Separate from instructions (don't mix with "how to do it right")
- Focus on correcting specific mistakes
- Header should be a statement describing the problem

**Header format:** Write as problem statements
- "I have entered an incorrect date on an unpaid invoice"
- "I have posted an invoice to the ledger by mistake"

## Writing Principles

### KISS - Keep It Short and Simple

**Goal:** Make texts possible to "consume at a glance"

**Techniques:**
- Use short, simple words
- Write short sentences
- Use keywords in headers
- Start with the takeaway of the text
- Help readers quickly understand if they're in the right place

### Language Usage

**Tone and Voice Guidelines:**

#### 1. ENKLA: RAKT PÅ SAK / SMIDIGA / INTUITIVA
- **Keep it simple:** Ju enklare desto bättre
- **Avoid technical jargon:** Use everyday language instead of complex terms
- **Short, clear headings:** Scale down word count in headers
- **No metaphors:** Avoid unnecessary comparisons and analogies

**Examples:**
```
❌ Bad: "Genom en realtidsuppföljning av intäkter kan du öka värdet på de materiella tillgångarna."
✅ Good: "Om du följer dina intäkter löpande kan du öka värdet på dina fysiska tillgångar."

❌ Bad: "Vårt ekonomisystem gör det superenkelt att logga in och se över alla dina fakturor på nolltid."
✅ Good: "Checka in, checka av, checka ut."
```

#### 2. ENGAGERADE: HJÄLPSAMMA / PEPPANDE / LÄTTILLGÄNGLIGA
- **Be generous and guiding:** Create positive experiences
- **Feel like a knowledgeable colleague:** Friendly and helpful without complications
- **Celebrate small wins:** Create "moments of joy" naturally
- **Make it feel easy and safe:** Guide users forward clearly

**Examples:**
```
❌ Bad: "För att komma igång behöver du först navigera till inställningar och välja rätt behörigheter innan du kan aktivera din tjänst."
✅ Good: "Tre steg och du är igång – vi guidar dig hela vägen!"

❌ Bad: "Du har registrerat ditt konto."
✅ Good: "Har du registrerat ditt konto? Då är vi igång!"
```

#### 3. MÄNSKLIGA: EMPATISKA / KUNDCENTRERADE / INKLUDERANDE
- **Sound human:** Write as if talking face-to-face
- **Focus on real benefits:** Not what we offer, but what it means for the user
- **Recognize life outside work:** People have interests, feelings, and lives
- **Show empathy and warmth:** Create recognition and connection

**Examples:**
```
❌ Bad: "Vår innovativa plattform förbättrar dina affärsprocesser."
✅ Good: "Vi har tagit fram en lösning som gör din vardag som företagare enklare."

❌ Bad: "Med Spiris minskar din administrativa börda genom automatiserade processer."
✅ Good: "Glöm adminstress. Vi fixar allt det där tråkiga, så att du kan fokusera på livet – hämta barnen i tid eller ta en extra kafferast."

❌ Bad: "Vi har effektiva tjänster."
✅ Good: "Tid över till det du tycker om."
```

**Terminology Guidelines:**
- **Avoid:** "produkt", "system", "program", "applikation", "tillval", "tillägg", "tjänst"
- **Use instead:** "funktioner", "ekonomiplattform", "plattform"
- **Use "abonnemang"** instead of "avtal", "licens", or similar
- **Keep it unified:** Convey the feeling of one cohesive system

**Interface References:**
- Always use exact words/phrases from the interface
- Mark interface texts in **bold**
- Use consistent wording for same actions

**CRITICAL: Use Localization Keys, Not Hardcoded Text**

When referencing interface elements in help documentation, you must use the localization keys from the locales JSON files, not the actual displayed text values. This ensures help documentation stays synchronized when interface texts are updated.

**How to Reference Interface Text Correctly:**

1. **Find the localization key** in `locales/sv.json` or `locales/en.json`
2. **Use the key format** in your documentation: `{keyName}`
3. **Include both languages** when documenting: `{keyName}` (Swedish: "Displayed Text", English: "Displayed Text")

**Examples:**

```
✅ Correct: Click **{adminCreateTrainingBtn}** to create a new training
   (Swedish: "Skapa träning", English: "Create Training")

✅ Correct: Select **{navAttendance}** from the menu
   (Swedish: "Incheckning", English: "Attendance")

❌ Incorrect: Click **Skapa träning** to create a new training
❌ Incorrect: Select **Incheckning** from the menu
```

**Why This Matters:**
- When interface texts are updated in the code, help documentation automatically reflects the changes
- Prevents outdated help content that shows old button names or menu items
- Ensures consistency between interface and documentation
- Makes maintenance easier for developers

**Example:**
```
✅ Good: Select **{navPublic}** - **{adminExistingTrainings}**
❌ Bad: Go to the sales section and click on articles
```

**Comprehensive Examples:**

**Creating a Training:**
```
✅ Correct: Click **{adminCreateTrainingBtn}** to start creating a new training
   (Swedish: "Skapa träning", English: "Create Training")

❌ Incorrect: Click **Skapa träning** to start creating a new training
❌ Incorrect: Click **Create Training** to start creating a new training
```

**User Management:**
```
✅ Correct: Go to **{adminExistingUsers}** to see all registered users
   (Swedish: "Befintliga användare", English: "Existing Users")

❌ Incorrect: Go to **Befintliga användare** to see all registered users
❌ Incorrect: Go to **Existing Users** to see all registered users
```

**Navigation:**
```
✅ Correct: Select **{navAttendance}** from the main menu
   (Swedish: "Incheckning", English: "Attendance")

❌ Incorrect: Select **Incheckning** from the main menu
❌ Incorrect: Select **Attendance** from the main menu
```

**Search Functionality:**
```
✅ Correct: Use **{adminSearchPlaceholder}** to find specific users
   (Swedish: "Sök på namn eller e-post...", English: "Search by name or email...")

❌ Incorrect: Use **Sök på namn eller e-post...** to find specific users
❌ Incorrect: Use **Search by name or email...** to find specific users
```

**Multi-step Instructions:**
```
✅ Correct: 
1. Click **{adminCreateTrainingBtn}**
2. Fill in **{adminUserNameLabel}** field
3. Click **{adminUpdateTrainingBtn}** to save

❌ Incorrect:
1. Click **Skapa träning**
2. Fill in **Visningsnamn** field  
3. Click **Uppdatera träning** to save
```

**Why the Correct Approach Works:**
- When developers update `adminCreateTrainingBtn` from "Skapa träning" to "Skapa ny träning", help documentation automatically reflects the change
- No need to manually update help files when interface text changes
- Maintains consistency across all documentation
- Reduces maintenance overhead and prevents outdated help content

### Structure and Headers

**Headers by Topic Type:**
- **Concept topics:** Mirror the interface (e.g., "Sales", "Purchasing")
- **Instructions:** Start with verb in infinitive (e.g., "Create invoice", "Add customer")
- **FAQs:** Write as questions (e.g., "How do I delete an invoice?")
- **Field explanations:** Mirror the interface detail (e.g., "Terms of delivery")
- **Troubleshooting:** Write as problem statements (e.g., "I have entered an incorrect date")

**Drop-down Menus:**
- Use for long content with clear divisions
- Maximum two levels
- Helps readers select amount of text to read

### Links and Related Information

**Guidelines:**
- Place related links at bottom of help topics
- Only include truly related links
- Use two-column table with media type symbols
- Internal links: move to linked page
- External links: open in new tab
- Link text should match the header of target page

**Example:**
```
📖 [Create invoice](link-to-create-invoice)
🎥 [Video tutorial](external-video-link)
```

## Content Sections

Current help sections:
- `overview.md` - System overview and introduction (Concept)
- `vouchers.md` - Voucher system explanation (Concept)
- `user-management.md` - Admin guide for user management (Concept + Instructions)
- `training-management.md` - Admin guide for training management (Concept + Instructions)
- `subscriptions.md` - User guide for training registration (Concept + Instructions)
- `attendance.md` - User guide for attendance management (Concept + Instructions)
- `troubleshooting.md` - Common problems and solutions (Troubleshooting)

## Update Process

When updating help content:

1. **Update Swedish version first**
2. **Translate to English** maintaining the same structure
3. **Review both versions** for consistency
4. **Test the content** in the application
5. **Commit both files** together

## Quality Checklist

Before committing changes:
- [ ] Swedish content is natural and comprehensive
- [ ] English content matches Swedish structure
- [ ] Both versions cover the same topics
- [ ] Technical terms are consistent
- [ ] Interface text is bold and exact
- [ ] Instructions use imperative mood
- [ ] Headers follow appropriate format for content type
- [ ] Content follows KISS principle
- [ ] Examples are relevant and helpful
- [ ] No broken links or references
- [ ] Content is up-to-date with current system features
- [ ] Text has been read aloud for readability test
- [ ] Someone has tested the instructions by following them

## File Naming Convention
- Swedish: `docs/help/sv/filename.md`
- English: `docs/help/en/filename.md`
- Both files should have the same filename

## Review Process

**Fact Checking:**
- Have someone with software knowledge check facts
- Ask reviewer to follow instructions as end user would

**Readability Test:**
- Read text out loud
- Check: Can you read without stumbling?
- Check: Are sentences short enough to read in one breath?
- Check: Does language sound natural?
- Check: Can you easily and accurately translate it?
