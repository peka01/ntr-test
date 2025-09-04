# Help System Integration

This document explains how the generic help system integrates with local documentation files.

## Overview

The help system dynamically loads content from local markdown files in the `docs/` folder. This approach is simple, reliable, and can be easily replicated across different repositories.

## Architecture

### 1. Local Documentation Structure
The help system expects documentation files to be organized as follows:

```
docs/
├── sv/           # Swedish documentation
│   ├── overview.md
│   ├── vouchers.md
│   ├── user-management.md
│   ├── training-management.md
│   ├── subscriptions.md
│   ├── attendance.md
│   └── troubleshooting.md
└── en/           # English documentation
    ├── overview.md
    ├── vouchers.md
    ├── user-management.md
    ├── training-management.md
    ├── subscriptions.md
    ├── attendance.md
    └── troubleshooting.md
```

### 2. Configuration
The help system uses a configuration object in `services/helpService.ts` that defines:
- Available help sections
- Section titles in multiple languages
- Keywords for search functionality
- Categories (admin, user, general)

### 3. Integration Pattern
The integration follows this simple pattern:
```typescript
// Load all help sections
const sections = await helpService.getAllSections(language);

// Load a specific section
const section = await helpService.getSection('overview', language);
```

### 4. Content Loading
The help system fetches content from local files using standard fetch requests:
- Base URL: `/docs/{language}/{sectionId}.md`
- Cache busting: Automatic timestamp parameters
- Error handling: Graceful fallback with error messages

## Implementation for New Repositories

To implement this help system in a new repository:

### 1. Copy Help System Files
Copy these files to your new repository:
- `services/helpService.ts` - Core help service
- `components/HelpSystem.tsx` - Help UI component
- `components/HelpButton.tsx` - Help button component

### 2. Create Documentation Structure
Create the `docs/` folder structure with your content.

### 3. Customize Configuration
Update the `helpConfig` object in `helpService.ts` to match your application's help sections.

### 4. Add Translations
Add help-related translations to your localization files.

### 5. Integrate Components
Use the help components in your application.

## Features

- **Multi-language Support**: Automatic language detection and content loading
- **Search Functionality**: Search through help content by title and keywords
- **Category Filtering**: Filter help content by category (admin, user, general)
- **Context-Sensitive Help**: Auto-select relevant sections based on user context
- **AI Integration**: AI chatbot that can answer questions using help content
- **Responsive Design**: Works on desktop and mobile devices
- **Edit Links**: Direct links to edit documentation files on GitHub

## Benefits

- **Simple Setup**: No external dependencies or complex configuration
- **Reliable**: No CORS issues or external service dependencies
- **Fast**: Local file serving is fast and reliable
- **Maintainable**: Easy to update and maintain documentation
- **Reusable**: Can be easily copied to other repositories
- **Version Controlled**: Documentation is part of the repository
