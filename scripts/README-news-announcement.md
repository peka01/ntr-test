# Documentation Update News Announcement

This directory contains scripts to create a news announcement informing users about the new tour and shoutout management documentation that has been added to the help system.

## Files

### `create-documentation-news-item.sql`
SQL script that can be run directly in the Supabase SQL editor to create the news announcement in both Swedish and English.

**Usage:**
1. Open your Supabase project dashboard
2. Go to the SQL Editor
3. Copy and paste the contents of `create-documentation-news-item.sql`
4. Run the script

### `create-documentation-news-item.js`
JavaScript/TypeScript script that can be run programmatically to create the news announcement using the help system service.

**Usage:**
```bash
# From the project root directory
node scripts/create-documentation-news-item.js
```

## News Announcement Details

**Title (Swedish):** "Ny dokumentation för rundturs- och nyhetshantering"
**Title (English):** "New Documentation for Tour and Shoutout Management"

**Category:** Improvement
**Priority:** Medium
**Target Group:** Public (all users)
**Icon:** 📚

## Content

The news announcement informs users about:

### New Features
- **Tour Management (Admin)**: Learn how to create and manage guided tours
- **Shoutout Management (Admin)**: Create and manage news announcements and feature highlights
- **Guided Tours (User)**: Learn the system's features with interactive walkthroughs
- **News Announcements (User)**: Stay updated with system news and notifications

### Improvements
- Expanded help documentation with step-by-step instructions
- Contextual help for all new features
- AI assistant updated with knowledge about the new systems
- Enhanced search functionality in the help system

## Verification

After running either script, you can verify the news announcement was created by:

1. **In the application**: Check the news announcements section
2. **In the database**: Query the `help_shoutouts` table for entries with IDs:
   - `doc-update-tour-shoutout-sv` (Swedish)
   - `doc-update-tour-shoutout-en` (English)

## Notes

- The news announcement is set to be active immediately
- No expiration date is set (will remain active until manually removed)
- Both Swedish and English versions are created
- The announcement is marked as "new" to show the "New" indicator to users
