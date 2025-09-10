# Documentation Update Prompt

Use this prompt after implementing new functionality to ensure proper documentation integration.

## Quick Steps

### 1. Analyze New Feature Requirements
- **Review new feature functionality**: Understand what the feature does and how it works
- **Identify user workflows**: Determine the key user journeys and interactions
- **Assess tour potential**: Decide if the feature would benefit from a guided tour
- **Plan announcement strategy**: Determine if a shoutout is needed to inform users
- **Review existing docs**: Check `docs/` folder structure and current content
- **Identify integration points**: See where new features fit into existing documentation
- **Check for updates needed**: Determine if existing docs need updates for new features
- **Plan documentation structure**: Ensure new content integrates seamlessly

#### When to Create a Tour:
- **Complex workflows**: Multi-step processes that users might find confusing
- **New UI elements**: Features that introduce new interface components
- **Admin features**: Administrative functions that need proper guidance
- **User onboarding**: Features that help new users get started
- **Feature discovery**: Hidden or advanced features that users might not find

#### When to Create a Shoutout:
- **New features**: Significant functionality additions that users should know about
- **Improvements**: Enhancements to existing features that improve user experience
- **Announcements**: Important system updates, policy changes, or notifications
- **Feature highlights**: Drawing attention to useful but underutilized features
- **User engagement**: Encouraging users to explore new capabilities

### 2. Create Guided Tour for New Feature (if applicable)
- **Assess tour necessity**: Determine if the new feature would benefit from a guided tour
- **Plan tour structure**: Identify key steps and user interactions to highlight
- **Create tour steps**: Use appropriate step types (navigate, click, scroll, wait, highlight)
- **Add data-tour attributes**: Ensure target elements have proper `data-tour` attributes
- **Test tour flow**: Verify the tour works correctly and covers all important aspects
- **Set tour metadata**: Configure title, description, category, and required role
- **Create tour via admin interface**: Use the tour management system to create the tour
- **Link tour to shoutout**: If creating a shoutout, link it to the tour for seamless user experience

### 3. Create Shoutout for New Feature
- **Determine shoutout necessity**: Decide if users need to be informed about the new feature
- **Plan shoutout content**: Create compelling title and description
- **Set shoutout metadata**: Configure category (feature/improvement/announcement), priority, and release date
- **Add expire date**: Set appropriate expiration date for the announcement
- **Link to tour**: If a tour was created, link the shoutout to the tour
- **Create shoutout via admin interface**: Use the shoutout management system to create the announcement
- **Test notification system**: Verify the "New" indicator appears and works correctly

#### Tour-Shoutout Integration Workflow:
1. **Create tour first** (if applicable) - this provides the tour ID
2. **Create shoutout** with the tour ID linked
3. **Test the integration** - verify users can start the tour from the shoutout
4. **Verify user experience** - ensure the flow from announcement to guided tour is smooth
5. **Update documentation** - document the tour-shoutout relationship

### 4. Add Translations for Tours and Shoutouts
- **Update tour translations**: Add tour titles, descriptions, and step content to `locales/sv.json` and `locales/en.json`
- **Update shoutout translations**: Add shoutout titles, descriptions, and button text to localization files
- **Follow translation guidelines**: Use consistent terminology and maintain the same structure
- **Test translations**: Verify all text displays correctly in both languages
- **Update translation keys**: Ensure all new keys follow the established naming convention

### 5. Create Documentation Files
- **Follow guidelines**: Read `docs/CONTENT_GUIDELINES.md` and `docs/TONE_AND_VOICE_GUIDELINES.md`
- Write in Swedish first, then translate to English
- Place in correct folders: `docs/sv/Administratör/` and `docs/en/Administrator/` (or `Användare`/`User`)
- **CRITICAL: Use English file names for ALL languages** (e.g., `user-management.md`, `training-management.md`)
- **SINGLE SOURCE OF TRUTH**: Only edit files in `docs/` folder - no duplication needed
- Use translation variables for UI references: `{{navUsers}}`

### 6. Update Configuration Files
- **`docs/structure-map.json`**: Add new sections with keywords
- **`services/helpService.ts`**: Add matching keywords to helpConfig
- Keywords must include: Swedish terms, English terms, actual context strings from app

#### Tour System Keywords to Include:
- **Swedish**: "rundtur", "guidad rundtur", "tour", "guida", "steg", "navigera", "klicka", "scrolla", "vänta", "markera"
- **English**: "tour", "guided tour", "step", "navigate", "click", "scroll", "wait", "highlight", "guide"
- **Context strings**: "tour management", "create tour", "edit tour", "tour steps", "tour statistics", "tour import", "tour export"

#### Shoutout System Keywords to Include:
- **Swedish**: "nyheter", "meddelanden", "funktioner", "förbättringar", "utgångsdatum", "markera som läst", "nytt"
- **English**: "news", "announcements", "features", "improvements", "expire date", "mark as read", "new"
- **Context strings**: "shoutout management", "create shoutout", "edit shoutout", "news items", "feature announcements"

### 7. Set Context in Components
```typescript
// In component
useEffect(() => {
    setContext({ screen: 'Page Name', action: 'Current action', data: {} });
}, [setContext]);

// Add help button
<HelpButton onClick={onHelpClick} context="descriptive context" />
```

### 8. Update AI Knowledge Sources
- **Update AI knowledge sources** with new features and UI changes
- **Add new knowledge entries** in `services/aiKnowledgeSources.ts`
- **Update existing entries** to reflect UI improvements
- **Add relevant keywords** for AI search functionality
- **Test AI responses** with new features

#### Tour System AI Knowledge Entries:
- **Tour System Overview**: Explain what guided tours are and how they work
- **Tour Creation Process**: Step-by-step guide for creating tours
- **Tour Step Types**: Explain navigate, click, scroll, wait, highlight actions
- **Tour Targeting**: How to use data-tour attributes for element targeting
- **Admin Tour Management**: CRUD operations, import/export, statistics
- **Tour Troubleshooting**: Common issues and solutions

#### Shoutout System AI Knowledge Entries:
- **Shoutout System Overview**: Explain news announcements and feature highlights
- **Shoutout Categories**: Feature, improvement, announcement types
- **Shoutout Lifecycle**: Creation, visibility, read status, expiration
- **Admin Shoutout Management**: CRUD operations, import/export, statistics
- **Tour Integration**: How shoutouts can link to guided tours
- **Notification System**: "New" indicators and user notifications

### 9. Document Tour System Features
- **Create tour system documentation** in `docs/sv/Användare/guided-tours.md` and `docs/en/User/guided-tours.md`
- **Document tour management** in `docs/sv/Administratör/tour-management.md` and `docs/en/Administrator/tour-management.md`
- **Include tour creation process** with step-by-step instructions
- **Document tour step types**: navigate, click, scroll, wait, highlight
- **Explain tour targeting** with data-tour attributes
- **Cover admin tour management** features (create, edit, duplicate, delete, import/export)
- **Document tour statistics** and analytics features
- **Include troubleshooting** for common tour issues

### 10. Document Shoutout System Features
- **Create shoutout system documentation** in `docs/sv/Användare/news-announcements.md` and `docs/en/User/news-announcements.md`
- **Document shoutout management** in `docs/sv/Administratör/shoutout-management.md` and `docs/en/Administrator/shoutout-management.md`
- **Explain news item lifecycle**: creation, visibility, marking as read, expiration
- **Document shoutout categories**: feature, improvement, announcement
- **Cover priority levels**: low, medium, high
- **Explain expire date functionality** and automatic cleanup
- **Document tour integration** with shoutouts
- **Include admin management** features (create, edit, duplicate, delete, import/export)
- **Document notification system** and "New" indicators

### 11. Test
- [ ] Help button opens correct documentation
- [ ] Language switching works
- [ ] Keywords match context strings
- [ ] AI chatbot recognizes new features
- [ ] AI responses are accurate and up-to-date
- [ ] Tour system documentation is accessible and helpful
- [ ] Shoutout system documentation covers all features
- [ ] Tour management documentation is complete for admins
- [ ] Shoutout management documentation covers admin features
- [ ] AI can provide guidance on tour creation and management
- [ ] AI can explain shoutout system functionality
- [ ] **New feature tour works correctly** (if created)
- [ ] **New feature shoutout displays properly** (if created)
- [ ] **Tour and shoutout are properly linked** (if both created)
- [ ] **"New" indicator appears for shoutout** (if created)
- [ ] **Tour can be started from shoutout** (if linked)
- [ ] **Shoutout expires correctly** (if expire date set)
- [ ] **"Mark as read" functionality works** (if shoutout created)

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
- [ ] AI knowledge sources are updated with new features
- [ ] AI chatbot responses are tested and accurate

## Key Requirements

- **Folder structure must be identical between languages**
- **Keywords must match actual context strings** (e.g., "creating a new user", "users page")
- **File names must be consistent and use English names for ALL languages** (e.g., `user-management.md` in both `docs/en/` and `docs/sv/`)
- **NEVER use language-specific file names** (e.g., avoid `användarhantering.md`, `träningshantering.md`)

## Common Issues

- **Context-sensitive help not working**: Keywords don't match context strings
- **Language switching fails**: Folder/file names inconsistent between languages
- **Wrong help section opens**: Missing keywords in configuration files
- **Documentation not found**: Using language-specific file names instead of English names
- **Maintenance complexity**: Multiple files with different names for same content

## File Naming Convention

### ✅ CORRECT Examples
```
docs/en/Administrator/user-management.md
docs/sv/Administratör/user-management.md
docs/en/Administrator/training-management.md
docs/sv/Administratör/training-management.md
docs/en/Administrator/tour-management.md
docs/sv/Administratör/tour-management.md
docs/en/Administrator/shoutout-management.md
docs/sv/Administratör/shoutout-management.md
docs/en/User/guided-tours.md
docs/sv/Användare/guided-tours.md
docs/en/User/news-announcements.md
docs/sv/Användare/news-announcements.md
```

### ❌ INCORRECT Examples
```
docs/sv/Administratör/användarhantering.md  # Swedish name
docs/sv/Administratör/träningshantering.md  # Swedish name
docs/en/Administrator/user-management.md
docs/sv/Administratör/user-management.md
```

### Why English Names?
- **Consistency**: Same file name across all languages
- **Maintenance**: Easier to find and update corresponding files
- **Tooling**: Better support in IDEs and file systems
- **Team collaboration**: Clear naming convention for all developers

## Update Process

When updating help content:

1. **Update Swedish version first**
2. **Translate to English** maintaining the same structure
3. **Update AI knowledge sources** with new features and changes
4. **Review both versions** for consistency
5. **Test the content** in the application
6. **Test AI chatbot responses** with new features
7. **Commit both files** together
