# Help System Integration

This document explains how the help system integrates with the external documentation repository.

## Overview

The help system now dynamically loads content from an external documentation repository using a configuration-based approach. This allows for centralized management of help content while maintaining the existing help system functionality.

## Architecture

### 1. Configuration File
The external repository contains a `help-config.json` file that defines:
- Available applications
- Supported locales
- File paths for each help section

Example structure:
```json
{
  "apps": {
    "ntr-app": {
      "locales": {
        "sv-se": {
          "file_paths": {
            "overview": "docs/sv/overview.md",
            "vouchers": "docs/sv/vouchers.md"
          }
        },
        "en-se": {
          "file_paths": {
            "overview": "docs/en/overview.md",
            "vouchers": "docs/en/vouchers.md"
          }
        }
      }
    }
  }
}
```

### 2. Integration Pattern
The integration follows this pattern:
```javascript
const config = await fetch('ntr-test/help-config.json').then(r => r.json());
const filePath = config.apps['ntr-app'].locales['sv-se'].file_paths['overview'];
const content = await fetch(`ntr-test/${filePath}`);
```

### 3. Nginx Reverse Proxy
The nginx configuration includes reverse proxies to:
- `/helpdocs/` - Fetches raw content from GitHub
- `/helpmeta/` - Fetches GitHub API metadata for commit timestamps

## Implementation Details

### Updated Files

1. **`services/helpService.ts`**
   - Added `loadHelpConfig()` function to fetch configuration
   - Updated `loadMarkdownContent()` to use dynamic file paths
   - Added `getDynamicConfig()` and `getAvailableSections()` methods
   - Updated metadata functions to use dynamic paths
   - Enhanced `getAllSections()` with fallback to static config

2. **`nginx.conf`**
   - Existing reverse proxy configuration supports the new integration
   - No changes required

### Key Features

1. **Dynamic Configuration Loading**
   - Fetches configuration from external repository
   - Supports multiple apps and locales
   - Graceful fallback to static configuration

2. **Flexible File Paths**
   - File paths are defined in the external configuration
   - Supports different directory structures
   - Language-specific file paths

3. **Backward Compatibility**
   - Falls back to static configuration if external repo is unavailable
   - Maintains existing help system functionality
   - Preserves metadata and categorization

4. **Error Handling**
   - Comprehensive error handling for network issues
   - Graceful degradation when external content is unavailable
   - Detailed logging for debugging

## Usage

### For Developers

1. **Adding New Help Sections**
   - Add the section to the external `help-config.json`
   - Create the corresponding markdown files
   - The help system will automatically detect and load them

2. **Updating Content**
   - Update markdown files in the external repository
   - Changes are automatically reflected in the application
   - No application deployment required

3. **Testing Integration**
   - Use the provided test script: `node test-help-integration.js`
   - Check browser console for integration logs
   - Verify content loading and error handling

### For Content Managers

1. **File Structure**
   - Swedish content: `docs/sv/`
   - English content: `docs/en/`
   - Configuration: `help-config.json`

2. **Content Guidelines**
   - Use standard markdown format
   - Include proper headings and structure
   - Test content rendering in the application

## Error Handling

The system handles various error scenarios:

1. **Network Issues**
   - Falls back to static configuration
   - Shows appropriate error messages
   - Continues to function with cached content

2. **Missing Files**
   - Logs warnings for missing content
   - Shows fallback content
   - Maintains system stability

3. **Configuration Errors**
   - Validates configuration structure
   - Uses fallback paths when needed
   - Provides detailed error logging

## Testing

Run the integration test:
```bash
node test-help-integration.js
```

The test verifies:
- Configuration loading
- Content fetching
- Integration script pattern
- Error handling

## Future Enhancements

1. **Caching Strategy**
   - Implement intelligent caching
   - Cache invalidation based on commit timestamps
   - Reduce external repository load

2. **Content Validation**
   - Validate markdown syntax
   - Check for broken links
   - Ensure content completeness

3. **Multi-Repository Support**
   - Support multiple documentation repositories
   - Load balancing between repositories
   - Repository-specific configurations
