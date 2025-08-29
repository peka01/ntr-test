# Help Content Guidelines

## Content Management Standards

### Language Priority
- **Swedish is the master language** - All content should be written in Swedish first
- **English is secondary** - English versions should be translated from Swedish
- **Keep both versions in sync** - When updating one language, update the other

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

**Example:**
```
✅ Good: Select **Sales** - **Articles**
❌ Bad: Go to the sales section and click on articles
```

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
