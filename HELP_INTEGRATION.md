# Help System Integration

This document explains how the help system integrates with an external documentation repository using a Service Worker proxy solution.

## Overview

The help system dynamically loads content from an external documentation repository using a configuration-based approach. For GitHub Pages deployment, a Service Worker acts as a proxy to bypass CORS restrictions when fetching content from GitHub's raw content URLs.

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
    "ntr-test": {
      "locales": {
        "sv-se": {
          "file_paths": {
            "overview": "docs/sv/overview.md",
            "attendance": "docs/sv/attendance.md",
            "troubleshooting": "docs/sv/troubleshooting.md"
          }
        },
        "en-se": {
          "file_paths": {
            "overview": "docs/en/overview.md",
            "attendance": "docs/en/attendance.md",
            "troubleshooting": "docs/en/troubleshooting.md"
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
const config = await fetch('./help-proxy/help-config.json').then(r => r.json());
const filePath = config.apps['ntr-test'].locales['sv-se'].file_paths['overview'];
const content = await fetch(`./help-proxy/${filePath}`);
```

### 3. Service Worker Proxy (GitHub Pages)
For GitHub Pages deployment, a Service Worker intercepts requests to `/help-proxy/` and:
- Fetches content directly from `https://raw.githubusercontent.com/peka01/helpdoc/main/ntr-test/`
- Adds proper CORS headers to the response
- Caches content for offline use
- Handles errors gracefully

### 4. Nginx Reverse Proxy (Production)
For production Docker deployments, nginx configuration includes reverse proxies to:
- `/helpdocs/` - Fetches raw content from GitHub
- `/helpmeta/` - Fetches GitHub API metadata for commit timestamps

## Implementation Details

### Updated Files

1. **`public/help-proxy-sw.js`**
   - Service Worker that intercepts help-proxy requests
   - Fetches content from GitHub raw URLs
   - Adds CORS headers and caches responses
   - Handles errors with fallback content

2. **`services/helpService.ts`**
   - Added environment detection for GitHub Pages vs Production
   - Uses Service Worker proxy for GitHub Pages
   - Falls back to Nginx proxy for production
   - Enhanced error handling and logging

3. **`index.html`**
   - Service Worker registration before React app loads
   - Ensures proxy is available when help system initializes

4. **`nginx.conf`**
   - Existing reverse proxy configuration for production
   - No changes required

### Key Features

1. **Environment-Aware Fetching**
   - Automatically detects GitHub Pages vs Production
   - Uses appropriate proxy method for each environment
   - Seamless switching between deployment types

2. **Service Worker Proxy**
   - Bypasses CORS restrictions on GitHub Pages
   - Direct access to GitHub raw content
   - Offline caching and error handling

3. **Dynamic Configuration Loading**
   - Fetches configuration from external repository
   - Supports multiple apps and locales
   - Graceful fallback to static configuration

4. **External-Only Content**
   - All help content is loaded from external repository
   - No local documentation files
   - Clear error messages when external content is unavailable

5. **Error Handling**
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
   - Check browser console for integration logs
   - Verify content loading and error handling
   - Test with different languages and sections

### For Content Managers

1. **File Structure**
   - Swedish content: `docs/sv/`
   - English content: `docs/en/`
   - Configuration: `help-config.json`

2. **Content Guidelines**
   - Use standard markdown format
   - Include proper headings and structure
   - Test content rendering in the application

## Deployment Environments

### GitHub Pages
- Uses Service Worker proxy (`./help-proxy/`)
- Direct access to GitHub raw content
- No CORS issues
- Automatic environment detection

### Production (Docker/Nginx)
- Uses Nginx reverse proxy (`/helpdocs/`)
- GitHub API metadata access (`/helpmeta/`)
- Full proxy functionality
- Environment detection switches automatically

### Development
- Attempts direct GitHub access
- Falls back to static configuration if CORS blocks
- Service Worker available for testing

## Error Handling

The system handles various error scenarios:

1. **Network Issues**
   - Shows appropriate error messages
   - Continues to function with cached content
   - No fallback to local content

2. **Missing Files**
   - Logs warnings for missing content
   - Shows error messages
   - Maintains system stability

3. **Configuration Errors**
   - Validates configuration structure
   - Provides detailed error logging
   - No fallback to local configuration

4. **Service Worker Issues**
   - Graceful degradation if Service Worker fails
   - Clear error messages for proxy failures
   - Fallback to cached content when available

## Testing

The integration can be tested by:
- Checking browser console for integration logs
- Verifying content loading from external repository
- Testing error handling when external repository is unavailable
- Testing different languages and sections
- Testing Service Worker proxy functionality
- Testing production vs GitHub Pages environments

## Service Worker Details

### Registration
```javascript
// Registered in index.html before React app loads
navigator.serviceWorker.register('./help-proxy-sw.js', { scope: './' })
```

### Request Interception
- Intercepts requests to paths containing `help-proxy/`
- Fetches from `https://raw.githubusercontent.com/peka01/helpdoc/main/ntr-test/`
- Adds CORS headers and returns content

### Caching
- Caches responses for offline use
- Cache name: `help-proxy-v1`
- Automatic cache cleanup on updates

### Error Handling
- Returns cached content if available
- Provides helpful error messages
- Graceful degradation for network issues

## Future Enhancements

1. **Enhanced Caching Strategy**
   - Implement intelligent caching with cache invalidation
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

4. **Service Worker Improvements**
   - Background sync for offline content
   - Push notifications for content updates
   - Advanced caching strategies
