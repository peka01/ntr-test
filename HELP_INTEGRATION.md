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
  
## Cache Management and Content Updates

### Problem: Stale Content from External Repository
When content is updated in the external repository, it may not immediately appear in the application due to various caching layers:
- Service Worker cache
- Browser cache
- GitHub CDN cache
- Network-level caching

### Solution: Enhanced Cache Invalidation
The help system now includes comprehensive cache invalidation mechanisms:

#### 1. Service Worker Cache Management
- **Cache Versioning**: Incremented cache version (`help-proxy-v2`) forces refresh
- **Force Refresh Detection**: Recognizes cache-busting query parameters
- **Automatic Cache Cleanup**: Periodic cleanup of old cache entries (every hour)
- **Cache Status Headers**: Response headers indicate cache status (HIT/MISS/FORCED_REFRESH)

#### 2. Enhanced Cache-Busting
- **Timestamp Parameters**: `?t=${Date.now()}&v=${randomString}`
- **Force Refresh Parameters**: `?refresh=true&nocache=true&${timestamp}`
- **Service Worker Cache Keys**: Unique cache keys prevent conflicts
- **GitHub CDN Bypass**: Cache-busting parameters ensure fresh content from GitHub

#### 3. Cache Clearing Functions
- **Integrated Cache Clear**: Refresh button automatically clears all caches
- **Service Worker Communication**: Direct cache clearing via postMessage
- **Browser Cache Clearing**: Clears all help-related browser caches
- **Force Reload**: Bypasses all caching layers

#### 4. CORS Issue Resolution
- **Minimal Headers**: Removed headers that trigger CORS preflight requests
- **Service Worker Proxy**: Bypasses CORS restrictions by proxying requests
- **GitHub Raw Content**: Direct access to GitHub raw content URLs
- **Error Handling**: Clear error messages when external repository is unavailable

### Content Update Workflow

#### For Content Managers (External Repository)

1. **Update Content Files**
   - Edit markdown files in the `helpdoc` repository
   - Make changes to files in `ntr-test/docs/sv/` or `ntr-test/docs/en/`
   - Update `help-config.json` if adding new sections

2. **Commit and Push Changes**
   ```bash
   git add .
   git commit -m "Update help content for [section]"
   git push origin main
   ```

3. **Wait for GitHub Deployment**
   - GitHub Pages typically updates within 2-5 minutes
   - Raw content URLs become available at:
     - `https://raw.githubusercontent.com/peka01/helpdoc/main/ntr-test/docs/sv/[section].md`
     - `https://raw.githubusercontent.com/peka01/helpdoc/main/ntr-test/docs/en/[section].md`

4. **Verify Content Availability**
   - Test direct access to raw content URLs
   - Ensure files are accessible without authentication

### Recent Updates (Latest Version)

#### CORS Issue Resolution
- **Problem**: Service Worker was hitting CORS preflight failures when fetching from GitHub
- **Solution**: Removed problematic headers that trigger CORS preflight requests
- **Result**: Direct GitHub content fetching now works without CORS issues

#### Enhanced Cache Busting (Latest Fix)
- **Problem**: GitHub CDN was still serving stale content even on forced refresh
- **Solution**: Always add cache-busting parameters to GitHub URLs, including timestamps and random IDs
- **Result**: Fresh content is now guaranteed on every refresh

#### Service Worker Improvements
- **Better Error Handling**: Clear error messages when external repository is unavailable
- **Cache Management**: Improved cache clearing and invalidation logic
- **Debug Logging**: Enhanced logging for troubleshooting cache issues

## Future Enhancements

## Cache Management and Content Updates

### Problem: Stale Content from External Repository
When content is updated in the external repository, it may not immediately appear in the application due to various caching layers:
- Service Worker cache
- Browser cache
- GitHub CDN cache
- Network-level caching

### Solution: Enhanced Cache Invalidation
The help system now includes comprehensive cache invalidation mechanisms:

#### 1. Service Worker Cache Management
- **Cache Versioning**: Incremented cache version (`help-proxy-v2`) forces refresh
- **Force Refresh Detection**: Recognizes cache-busting query parameters
- **Automatic Cache Cleanup**: Periodic cleanup of old cache entries (every hour)
- **Cache Status Headers**: Response headers indicate cache status (HIT/MISS/FORCED_REFRESH)

#### 2. Enhanced Cache-Busting
- **Timestamp Parameters**: `?t=${Date.now()}&v=${randomString}`
- **Force Refresh Parameters**: `?refresh=true&nocache=true&${timestamp}`
- **Service Worker Cache Keys**: Unique cache keys prevent conflicts
- **GitHub CDN Bypass**: Cache-busting parameters ensure fresh content from GitHub

#### 3. Cache Clearing Functions
- **Integrated Cache Clear**: Refresh button automatically clears all caches
- **Service Worker Communication**: Direct cache clearing via postMessage
- **Browser Cache Clearing**: Clears all help-related browser caches
- **Force Reload**: Bypasses all caching layers

#### 4. CORS Issue Resolution
- **Minimal Headers**: Removed headers that trigger CORS preflight requests
- **Service Worker Proxy**: Bypasses CORS restrictions by proxying requests
- **GitHub Raw Content**: Direct access to GitHub raw content URLs
- **Error Handling**: Clear error messages when external repository is unavailable

### Content Update Workflow

#### For Content Managers (External Repository)

1. **Update Content Files**
   - Edit markdown files in the `helpdoc` repository
   - Make changes to files in `ntr-test/docs/sv/` or `ntr-test/docs/en/`
   - Update `help-config.json` if adding new sections

2. **Commit and Push Changes**
   ```bash
   git add .
   git commit -m "Update help content for [section]"
   git push origin main
   ```

3. **Wait for GitHub Deployment**
   - GitHub Pages typically updates within 2-5 minutes
   - Raw content URLs become available at:
     - `https://raw.githubusercontent.com/peka01/helpdoc/main/ntr-test/docs/sv/[section].md`
     - `https://raw.githubusercontent.com/peka01/helpdoc/main/ntr-test/docs/en/[section].md`

4. **Verify Content Availability**
   - Test direct access to raw content URLs
   - Ensure files are accessible without authentication

#### For Users (Application)

1. **Automatic Detection**: Content updates are detected automatically
2. **Smart Refresh**: Refresh button (🔄) automatically clears caches and fetches latest content
3. **Complete Refresh**: Single button handles both cache clearing and content reloading
4. **Visual Indicators**: Loading states and cache status in console

#### For Developers

1. **Cache Debugging**: Check browser console for cache status
2. **Force Updates**: Use `forceRefresh: true` parameter in API calls
3. **Service Worker**: Monitor Service Worker logs for cache operations
4. **Network Tab**: Verify fresh requests in browser dev tools

### Cache Invalidation Flow

```
Content Updated → GitHub Pages Deploy → Service Worker Detects → Cache Cleared → Fresh Content Loaded
     ↓
User Opens Help → Service Worker Checks → Cache Miss → Fetches Fresh → Updates Cache
     ↓
Next Request → Service Worker Checks → Cache Hit → Returns Cached (if not expired)
```

### Troubleshooting Cache Issues

#### Content Not Updating
1. **Check Service Worker**: Verify Service Worker is active and updated
2. **Clear Browser Cache**: Use cache clear button or browser dev tools
3. **Force Refresh**: Use refresh button with cache clearing
4. **Check Network**: Verify requests are reaching external repository

#### Service Worker Issues
1. **Check Registration**: Verify Service Worker is registered in browser
2. **Update Service Worker**: Increment cache version to force update
3. **Clear All Caches**: Use `helpService.clearAllCaches()`
4. **Browser Dev Tools**: Check Application > Service Workers tab

#### GitHub Repository Issues
1. **Verify Repository**: Check if `peka01/helpdoc` repository exists and is public
2. **Check File Structure**: Ensure files are in correct paths
3. **Branch Name**: Verify content is in `main` branch
4. **File Permissions**: Ensure files are accessible without authentication

#### Performance Considerations
- **Cache Duration**: Content cached for 1 hour maximum
- **Automatic Cleanup**: Old cache entries removed automatically
- **Selective Caching**: Only successful responses are cached
- **Error Handling**: Failed requests don't pollute cache

### Recent Updates (Latest Version)

#### CORS Issue Resolution
- **Problem**: Service Worker was hitting CORS preflight failures when fetching from GitHub
- **Solution**: Removed problematic headers that trigger CORS preflight requests
- **Result**: Direct GitHub content fetching now works without CORS issues

#### Enhanced Cache Busting
- **GitHub CDN Bypass**: Added timestamp and random parameters to bypass GitHub's CDN cache
- **Force Refresh Logic**: Improved cache clearing when refresh button is pressed
- **Cache Status Tracking**: Better visibility into cache operations and status

#### Service Worker Improvements
- **Better Error Handling**: Clear error messages when external repository is unavailable
- **Cache Management**: Improved cache clearing and invalidation logic
- **Debug Logging**: Enhanced logging for troubleshooting cache issues

### Testing the System

#### Verify External Repository Access
```javascript
// Test direct GitHub access
fetch('https://raw.githubusercontent.com/peka01/helpdoc/main/ntr-test/help-config.json')
  .then(response => console.log('Status:', response.status))
  .catch(error => console.error('Error:', error));
```

#### Test Service Worker
```javascript
// Test help-proxy request
fetch('./help-proxy/help-config.json?t=' + Date.now())
  .then(response => console.log('Status:', response.status))
  .catch(error => console.error('Error:', error));
```

#### Check Cache Status
```javascript
// Check Service Worker registrations
navigator.serviceWorker.getRegistrations()
  .then(regs => console.log('Service Workers:', regs));
```

1. **Enhanced Caching Strategy**
