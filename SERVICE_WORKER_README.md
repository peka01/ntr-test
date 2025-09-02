# Service Worker Help Proxy - Implementation Guide

## Overview

This implementation uses a **Service Worker** to act as a CORS-free proxy for fetching help content from external repositories. It solves the CORS restrictions that prevent direct access to GitHub raw content from GitHub Pages.

## How It Works

### Architecture
```
Your App (https://peka01.github.io/ntr-test/)
    ↓ (fetch request to /help-proxy/...)
Service Worker (intercepts requests)
    ↓ (server-side fetch, no CORS restrictions)
External Repository (https://raw.githubusercontent.com/...)
    ↓ (content returned)
Service Worker (adds CORS headers)
    ↓ (content with proper headers)
Your App (receives content)
```

### Key Benefits
✅ **No External Dependencies** - Everything runs on your domain
✅ **Full Control** - You control the proxy logic and headers
✅ **CORS-Free** - Service worker acts as a server-side proxy
✅ **Secure** - No third-party services involved
✅ **Reliable** - Works consistently across browsers

## Files Created

### 1. `public/help-proxy-sw.js`
The main service worker that:
- Intercepts requests to `/help-proxy/`
- Fetches content from external repositories
- Adds proper CORS headers
- Implements caching for offline use
- Handles errors gracefully

### 2. `services/serviceWorkerManager.ts`
Utility class that:
- Registers the service worker
- Manages lifecycle events
- Provides status information
- Handles updates and testing

### 3. `components/ServiceWorkerStatus.tsx`
Debug component that:
- Shows service worker status
- Allows testing the proxy
- Manages updates
- Displays current mode

## Usage

### Automatic Registration
The service worker automatically registers when your app loads:

```typescript
// Import in main.tsx
import { serviceWorkerManager } from './services/serviceWorkerManager';

// Auto-registers on import
```

### Manual Control
You can also control the service worker manually:

```typescript
import { serviceWorkerManager } from './services/serviceWorkerManager';

// Check status
const status = serviceWorkerManager.getStatus();

// Test proxy
const isWorking = await serviceWorkerManager.testProxy();

// Update service worker
await serviceWorkerManager.update();
```

### URL Patterns
The service worker handles these URL patterns:

- **Configuration**: `/help-proxy/help-config.json`
- **Content**: `/help-proxy/docs/sv/overview.md`
- **Fallback**: `/help-proxy/docs/sv/troubleshooting.md`

## Configuration

### External Repository
The service worker is configured to fetch from:
```
https://raw.githubusercontent.com/peka01/helpdoc/main/ntr-test/
```

### Caching
- **Cache Name**: `help-proxy-v1`
- **Strategy**: Cache-first with network fallback
- **Offline Support**: Returns cached content when network fails

## Testing

### 1. Check Registration
Open browser dev tools → Application → Service Workers
Look for `help-proxy-sw.js` in the list

### 2. Test Proxy
Use the `ServiceWorkerStatus` component or test manually:
```typescript
const response = await fetch('/help-proxy/help-config.json');
console.log('Status:', response.status);
console.log('Content:', await response.text());
```

### 3. Monitor Console
The service worker logs all activities:
```
🔄 Help Proxy Service Worker installing...
✅ Help Proxy Service Worker activating...
🌐 Proxying request: help-config.json → https://raw.githubusercontent.com/...
✅ Successfully proxied: help-config.json (1234 bytes)
```

## Troubleshooting

### Service Worker Not Registering
- Check browser support (`'serviceWorker' in navigator`)
- Verify file path (`/help-proxy-sw.js`)
- Check console for errors

### Proxy Not Working
- Ensure service worker is active
- Check network tab for failed requests
- Verify external repository accessibility

### CORS Still Blocking
- Service worker must be registered and active
- Requests must use `/help-proxy/` prefix
- Check service worker scope (`/help-proxy/`)

## Browser Support

- **Chrome**: 40+ ✅
- **Firefox**: 44+ ✅
- **Safari**: 11.1+ ✅
- **Edge**: 17+ ✅

## Performance

- **First Load**: Service worker downloads and installs
- **Subsequent Loads**: Instant proxy with caching
- **Offline**: Cached content available
- **Updates**: Automatic background updates

## Security

- **Scope Limited**: Only handles `/help-proxy/` requests
- **No External Scripts**: All code runs on your domain
- **Content Validation**: Validates responses before caching
- **Error Handling**: Graceful fallbacks for failures

## Deployment

### GitHub Pages
1. Service worker automatically registers
2. Works immediately after deployment
3. No additional configuration needed

### Local Development
1. Service worker registers on localhost
2. Falls back to direct GitHub access
3. CORS may still block (expected behavior)

### Production (nginx)
1. Service worker not used
2. nginx proxy handles requests
3. Full functionality maintained

## Future Enhancements

- **Background Sync**: Sync content when connection improves
- **Push Notifications**: Notify users of content updates
- **Advanced Caching**: Intelligent cache invalidation
- **Performance Metrics**: Track proxy performance

## Support

If you encounter issues:
1. Check browser console for errors
2. Verify service worker registration
3. Test proxy functionality
4. Check external repository accessibility

---

*This implementation provides a robust, CORS-free solution for loading external help content while maintaining full control over the proxy logic.*
