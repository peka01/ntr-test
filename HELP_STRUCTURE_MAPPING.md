# Help Documentation Structure Mapping

This document explains how to use the new JSON structure mapping system to control the folder hierarchy visibility in the help system's TOC and breadcrumbs.

## Overview

The help system now supports a JSON structure map file (`public/docs/structure-map.json`) that provides explicit control over:
- Folder hierarchy and organization
- Section ordering and grouping
- Icons and descriptions for folders and sections
- Multi-language support

## Structure Map Format

The structure map follows this format:

```json
{
  "version": "1.0",
  "languages": {
    "sv": {
      "name": "Svenska",
      "folders": {
        "Administratör": {
          "title": "Administratör",
          "description": "Administrativa funktioner och användarhantering",
          "icon": "settings",
          "order": 1,
          "sections": {
            "user-management": {
              "title": "Användarhantering",
              "description": "Skapa och hantera användarkonton",
              "order": 1
            }
          }
        }
      },
      "rootSections": {
        "overview": {
          "title": "Systemöversikt",
          "description": "Översikt över systemets funktioner och arkitektur",
          "order": 1
        }
      }
    }
  }
}
```

## Key Features

### 1. Folder Organization
- **Folders**: Group related sections under named folders
- **Icons**: Assign icons to folders (settings, user, etc.)
- **Descriptions**: Provide descriptions for better context
- **Ordering**: Control the display order of folders and sections

### 2. Multi-language Support
- Separate configurations for each language (sv, en)
- Language-specific titles and descriptions
- Consistent folder structure across languages

### 3. Root Sections
- Sections that appear at the root level (not in folders)
- Useful for general topics like "Overview" and "Troubleshooting"

## Available Icons

The system supports these predefined icons:
- `settings`: Administrative/settings icon
- `user`: User-related functions icon
- Default folder icon for other cases

## File Structure Requirements

Your documentation files should be organized as:
```
public/docs/
├── structure-map.json          # Structure mapping configuration
├── sv/                         # Swedish documentation
│   ├── overview.md
│   ├── troubleshooting.md
│   ├── Administratör/          # Admin folder
│   │   ├── user-management.md
│   │   └── training-management.md
│   └── Användare/              # User folder
│       ├── attendance.md
│       ├── subscriptions.md
│       └── vouchers.md
└── en/                         # English documentation
    ├── overview.md
    ├── troubleshooting.md
    ├── Administrator/          # Admin folder
    │   ├── user-management.md
    │   └── training-management.md
    └── User/                   # User folder
        ├── attendance.md
        ├── subscriptions.md
        └── vouchers.md
```

## Benefits

### 1. Clear Folder Structure
- TOC now shows explicit folder hierarchy
- Folders are expandable/collapsible
- Icons make it easy to identify folder types

### 2. Enhanced Breadcrumbs
- Full folder path visible in breadcrumbs
- Clickable breadcrumb segments for navigation
- Icons in breadcrumbs for better visual context

### 3. Better Organization
- Explicit control over section ordering
- Grouped related content under logical folders
- Consistent structure across languages

### 4. Fallback Support
- If structure map is missing, system falls back to auto-discovery
- Existing documentation continues to work without changes
- Graceful degradation ensures reliability

## Usage

1. **Create/Update Structure Map**: Edit `public/docs/structure-map.json`
2. **Organize Files**: Place markdown files in appropriate folders
3. **Test**: The help system will automatically use the new structure
4. **Customize**: Add icons, descriptions, and ordering as needed

## Migration

If you have existing documentation:
1. The system will continue to work with auto-discovery
2. Gradually move files into folders as defined in structure map
3. Update structure map to reflect your desired organization
4. Test the new hierarchy in the help system

## Troubleshooting

- **Missing Structure Map**: System falls back to auto-discovery
- **File Not Found**: Check file paths match structure map exactly
- **Icons Not Showing**: Verify icon names match supported values
- **Ordering Issues**: Check order values in structure map

The structure mapping system provides a powerful way to organize and present your help documentation with clear folder hierarchy, making it easier for users to navigate and find the information they need.
