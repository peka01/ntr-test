# Documentation Update Prompt

Use this prompt after implementing new functionality to ensure proper documentation integration.

## Quick Steps

### 1. Analyze Current Documentation
- **Review existing docs**: Check `docs/` folder structure and current content
- **Identify integration points**: See where new features fit into existing documentation
- **Check for updates needed**: Determine if existing docs need updates for new features
- **Plan documentation structure**: Ensure new content integrates seamlessly

### 2. Create Documentation Files
- **Follow guidelines**: Read `docs/CONTENT_GUIDELINES.md` and `docs/TONE_AND_VOICE_GUIDELINES.md`
- Write in Swedish first, then translate to English
- Place in correct folders: `docs/sv/Administratör/` and `docs/en/Administrator/` (or `Användare`/`User`)
- **CRITICAL: Use English file names for ALL languages** (e.g., `user-management.md`, `training-management.md`)
- **SINGLE SOURCE OF TRUTH**: Only edit files in `docs/` folder - no duplication needed
- Use translation variables for UI references: `{{navUsers}}`

### 3. Update Configuration Files
- **`docs/structure-map.json`**: Add new sections with keywords
- **`services/helpService.ts`**: Add matching keywords to helpConfig
- Keywords must include: Swedish terms, English terms, actual context strings from app

### 4. Set Context in Components
```typescript
// In component
useEffect(() => {
    setContext({ screen: 'Page Name', action: 'Current action', data: {} });
}, [setContext]);

// Add help button
<HelpButton onClick={onHelpClick} context="descriptive context" />
```

### 5. Update AI Knowledge Sources
- **Update AI knowledge sources** with new features and UI changes
- **Add new knowledge entries** in `services/aiKnowledgeSources.ts`
- **Update existing entries** to reflect UI improvements
- **Add relevant keywords** for AI search functionality
- **Test AI responses** with new features

### 6. Test
- [ ] Help button opens correct documentation
- [ ] Language switching works
- [ ] Keywords match context strings
- [ ] AI chatbot recognizes new features
- [ ] AI responses are accurate and up-to-date

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
