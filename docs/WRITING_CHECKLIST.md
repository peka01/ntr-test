# Help Text Writing Checklist

## Developer UI Text Checklist

### Before Adding Any UI Text
- [ ] **Swedish text written first** - Think about what it should say in Swedish
- [ ] **Key name chosen** - Descriptive, hierarchical naming (e.g., `adminCreateUserBtn`)
- [ ] **Swedish locale updated** - Added to `locales/sv.json`
- [ ] **English translation added** - Added to `locales/en.json`
- [ ] **Component uses translation hook** - `const t = useTranslations(); {t('keyName')}`
- [ ] **No hardcoded text** - All text comes from localization files
- [ ] **Both languages tested** - Verify Swedish and English work correctly

### Common UI Text Mistakes to Avoid
- [ ] ❌ Hardcoding "Create User" directly in component
- [ ] ❌ Hardcoding "Skapa användare" directly in component  
- [ ] ❌ Writing English text first, then translating to Swedish
- [ ] ❌ Using generic key names like `button1` or `text1`
- [ ] ❌ Adding only Swedish or only English translation
- [ ] ❌ Forgetting to test both languages in the application

### Correct UI Text Implementation
- [ ] ✅ Swedish text: `"adminCreateUserBtn": "Skapa användare"`
- [ ] ✅ English text: `"adminCreateUserBtn": "Create User"`
- [ ] ✅ Component: `<button>{t('adminCreateUserBtn')}</button>`
- [ ] ✅ Both languages tested and working

## Pre-Writing Checklist

### Content Planning
- [ ] **Determine information type:** Concept, Instruction, FAQ, Troubleshooting, etc.
- [ ] **Identify target audience:** Admin, User, or both
- [ ] **Define scope:** What exactly will this help text cover?
- [ ] **Check prerequisites:** What should users know before reading this?

### Research
- [ ] **Test the feature:** Follow the exact steps as a user would
- [ ] **Note interface text:** Write down exact button names, menu items, field labels
- [ ] **Find localization keys:** Look up the corresponding keys in `locales/sv.json` and `locales/en.json`
- [ ] **Identify common issues:** What problems do users typically encounter?
- [ ] **Check related features:** What other parts of the system are connected?

## Writing Checklist

### Structure and Organization
- [ ] **Header format correct** for content type:
  - [ ] Concept: Mirror interface (e.g., "Sales", "User Management")
  - [ ] Instructions: Start with verb in infinitive (e.g., "Create training", "Add user")
  - [ ] FAQ: Write as question (e.g., "How do I delete a training?")
  - [ ] Troubleshooting: Write as problem statement (e.g., "I can't mark attendance")

- [ ] **Content follows appropriate structure:**
  - [ ] Concept: Introduction → Purpose → Prerequisites → Next steps
  - [ ] Instructions: Preamble → Numbered steps → Additional info
  - [ ] FAQ: Question → Brief answer → Link to detailed topic
  - [ ] Troubleshooting: Problem → Solution steps → Prevention tips

### Language and Style
- [ ] **KISS principle applied:**
  - [ ] Short, simple words used
  - [ ] Short sentences (readable in one breath)
  - [ ] Keywords in headers
  - [ ] Takeaway information first

- [ ] **Tone and voice guidelines followed:**
  - [ ] **ENKLA:** Avoid technical jargon, use everyday language
  - [ ] **ENKLA:** Short, clear headings (scale down word count)
  - [ ] **ENKLA:** No unnecessary metaphors or analogies
  - [ ] **ENGAGERADE:** Create positive, encouraging experiences
  - [ ] **ENGAGERADE:** Feel like a knowledgeable, friendly colleague
  - [ ] **ENGAGERADE:** Celebrate small wins and create "moments of joy"
  - [ ] **MÄNSKLIGA:** Write as if talking face-to-face
  - [ ] **MÄNSKLIGA:** Focus on real benefits for the user
  - [ ] **MÄNSKLIGA:** Recognize life outside work (family, interests, etc.)
  - [ ] **Terminology:** Avoid "produkt", "system", "program", "applikation", "tillval", "tillägg", "tjänst"
  - [ ] **Terminology:** Use "funktioner", "ekonomiplattform", "plattform" instead
  - [ ] **Terminology:** Use "abonnemang" instead of "avtal", "licens"

- [ ] **Tone is appropriate:**
  - [ ] Direct, warm, and friendly
  - [ ] "You" used appropriately (not overused)
  - [ ] Imperative mood for instructions ("Click", "Select", "Enter")
  - [ ] **ENKLA:** Simple, direct, intuitive language
  - [ ] **ENGAGERADE:** Helpful, encouraging, accessible
  - [ ] **MÄNSKLIGA:** Empathetic, customer-centered, inclusive

- [ ] **Interface text handled correctly:**
  - [ ] Exact wording from interface used
  - [ ] Interface text in **bold**
  - [ ] Initial letter uppercase
  - [ ] Consistent terminology throughout
  - [ ] **CRITICAL: Used localization keys, not hardcoded text**
  - [ ] **Verified all interface references use {keyName} format**
  - [ ] **Checked that keys exist in both locales/sv.json and locales/en.json**
  - [ ] **Included both language examples where appropriate: {keyName} (Swedish: "Text", English: "Text")**


### Content Quality
- [ ] **Instructions are complete:**
  - [ ] All necessary steps included
  - [ ] Steps are in correct order
  - [ ] Minor steps combined logically
  - [ ] Prerequisites clearly stated

- [ ] **Information is accurate:**
  - [ ] All facts verified
  - [ ] Steps tested by following them
  - [ ] No outdated information
  - [ ] Links work correctly

- [ ] **User needs addressed:**
  - [ ] Common questions answered
  - [ ] Potential problems covered
  - [ ] Next steps provided
  - [ ] Related topics linked

## Post-Writing Checklist

### Review and Testing
- [ ] **Readability test:**
  - [ ] Read text out loud
  - [ ] No stumbling on words
  - [ ] Sentences short enough
  - [ ] Language sounds natural

- [ ] **Fact checking:**
  - [ ] Someone with software knowledge reviewed
  - [ ] Instructions followed exactly as written
  - [ ] All interface elements verified
  - [ ] Links tested and working

- [ ] **User perspective:**
  - [ ] Would a new user understand this?
  - [ ] Are all terms explained?
  - [ ] Is the information findable?
  - [ ] Does it solve the user's problem?

### Technical Quality
- [ ] **Markdown formatting:**
  - [ ] Headers properly formatted
  - [ ] Lists correctly structured
  - [ ] Bold text for interface elements
  - [ ] Links properly formatted

- [ ] **Content structure:**
  - [ ] Logical flow of information
  - [ ] Appropriate use of sections
  - [ ] Drop-down menus used if needed (max 2 levels)
  - [ ] Related links included at bottom

### Localization Verification
- [ ] **All interface references verified:**
  - [ ] No hardcoded interface text found in documentation
  - [ ] All interface elements use {keyName} format
  - [ ] Keys exist in both Swedish and English locale files
  - [ ] Both language versions included where appropriate
  - [ ] Examples show both languages: {keyName} (Swedish: "Text", English: "Text")

- [ ] **Key validation:**
  - [ ] Checked `locales/sv.json` for Swedish keys
  - [ ] Checked `locales/en.json` for English keys
  - [ ] Verified keys match exactly (case-sensitive)
  - [ ] Confirmed keys are still in use in the application

### Translation Preparation
- [ ] **Swedish version complete:**
  - [ ] Natural Swedish (not translated from English)
  - [ ] All sections included
  - [ ] Examples relevant to Swedish users

- [ ] **English version ready:**
  - [ ] Same structure as Swedish
  - [ ] Same level of detail
  - [ ] Technical terms consistent
  - [ ] Idioms adapted appropriately

## Final Quality Check

### Before Committing
- [ ] **Both language versions complete**
- [ ] **Content follows Visma guidelines**
- [ ] **Instructions tested and working**
- [ ] **No broken links or references**
- [ ] **Content is up-to-date**
- [ ] **File names follow convention**
- [ ] **Both files committed together**

### UI Development Quality Check
- [ ] **No hardcoded UI text** - All text uses localization keys
- [ ] **Swedish-first approach** - Swedish text written before English
- [ ] **Both locale files updated** - `locales/sv.json` and `locales/en.json`
- [ ] **Descriptive key names** - Following naming convention
- [ ] **Translation hook used** - Components use `useTranslations()`
- [ ] **Both languages tested** - Swedish and English work correctly
- [ ] **Help documentation updated** - Uses same localization keys

### Content Types Checklist

#### For Concept Pages
- [ ] Introduces the feature clearly
- [ ] Explains purpose and benefits
- [ ] Lists prerequisites
- [ ] Shows how it relates to other features
- [ ] Provides next steps

#### For Instructions
- [ ] Starts with purpose and prerequisites
- [ ] Uses numbered steps
- [ ] Uses imperative mood
- [ ] Makes interface text bold
- [ ] Combines minor steps logically
- [ ] Includes additional info in boxes

#### For FAQs
- [ ] Answers common questions
- [ ] Provides brief, helpful answers
- [ ] Links to detailed topics
- [ ] Uses question format in headers
- [ ] Helps users find more information

#### For Troubleshooting
- [ ] Focuses on specific problems
- [ ] Provides step-by-step solutions
- [ ] Uses problem statement headers
- [ ] Separated from regular instructions
- [ ] Includes prevention tips

## Quick Reference

### Header Formats
- **Concept:** "User Management", "Training System"
- **Instructions:** "Create user", "Add training"
- **FAQ:** "How do I delete a user?"
- **Troubleshooting:** "I can't mark attendance"

### Interface Text Examples
- ✅ "Click **{adminCreateTrainingBtn}**" (Swedish: "Skapa träning", English: "Create Training")
- ✅ "Select **{navAttendance}** - **{adminExistingTrainings}**"
- ❌ "Go to the admin section and click create user"
- ❌ "Click **Skapa träning**" (hardcoded text - will become outdated)

### Imperative Mood Examples
- ✅ "Click the button"
- ✅ "Enter your name"
- ❌ "You click the button"
- ❌ "You should enter your name"

### Tone and Voice Examples

#### ENKLA (Simple)
- ❌ "Genom en realtidsuppföljning av intäkter kan du öka värdet på de materiella tillgångarna."
- ✅ "Om du följer dina intäkter löpande kan du öka värdet på dina fysiska tillgångar."

#### ENGAGERADE (Engaging)
- ❌ "För att komma igång behöver du först navigera till inställningar och välja rätt behörigheter."
- ✅ "Tre steg och du är igång – vi guidar dig hela vägen!"

#### MÄNSKLIGA (Human)
- ❌ "Vår innovativa plattform förbättrar dina affärsprocesser."
- ✅ "Vi har tagit fram en lösning som gör din vardag som företagare enklare."

#### Terminology
- ❌ "vårt system", "produkten", "tjänsten"
- ✅ "plattformen", "funktionerna", "abonnemanget"
