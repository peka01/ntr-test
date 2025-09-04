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

### 5. Test
- [ ] Help button opens correct documentation
- [ ] Language switching works
- [ ] Keywords match context strings

## Key Requirements

- **Folder structure must be identical between languages**
- **Keywords must match actual context strings** (e.g., "creating a new user", "users page")
- **File names must be consistent** (e.g., `användarhantering.md` ↔ `user-management.md`)

## Common Issues

- **Context-sensitive help not working**: Keywords don't match context strings
- **Language switching fails**: Folder/file names inconsistent between languages
- **Wrong help section opens**: Missing keywords in configuration files
