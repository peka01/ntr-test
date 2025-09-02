// Service Worker for Help Content Proxy
// This service worker intercepts requests to /help-proxy/ and fetches content
// from external repositories, bypassing CORS restrictions

const CACHE_NAME = 'help-proxy-v1';
const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/peka01/helpdoc/main/ntr-test';

// Install event - cache the service worker
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - intercept requests and proxy them
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Handle CORS preflight requests
  if (event.request.method === 'OPTIONS') {
    event.respondWith(handleCorsPreflight());
    return;
  }
  
  // Handle help-proxy requests (both absolute and relative paths)
  if (!url.pathname.includes('help-proxy/')) {
    return;
  }
  
  event.respondWith(handleHelpProxy(event.request));
});

// Handle CORS preflight requests
function handleCorsPreflight() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cache-Control, Pragma',
      'Access-Control-Max-Age': '86400',
      'X-Proxy-By': 'ntr-help-proxy-sw'
    }
  });
}

async function handleHelpProxy(request) {
  const url = new URL(request.url);
  // Extract the path after 'help-proxy/' regardless of whether it's absolute or relative
  const helpProxyIndex = url.pathname.indexOf('help-proxy/');
  const targetPath = url.pathname.substring(helpProxyIndex + 'help-proxy/'.length);
  
  try {
    // Use raw content URL directly (bypassing GitHub API)
    const rawUrl = `${GITHUB_RAW_BASE}/${targetPath}`;
    console.log(`🌐 Fetching from: ${rawUrl}`);
    
    // Fetch content directly from raw.githubusercontent.com
    const rawResponse = await fetch(rawUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'ntr-help-proxy/1.0',
        'Accept': 'text/plain, text/markdown, application/json'
      }
    });
    
    if (!rawResponse.ok) {
      throw new Error(`Raw content fetch failed: ${rawResponse.status} ${rawResponse.statusText}`);
    }
    
    // Get the content
    const content = await rawResponse.text();
    
    // Create new response with CORS headers
    const proxyResponse = new Response(content, {
      status: 200,
      statusText: 'OK',
      headers: {
        'Content-Type': getContentType(targetPath),
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cache-Control, Pragma',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Proxy-By': 'ntr-help-proxy-sw',
        'X-Original-URL': rawUrl,
        'X-Proxy-Timestamp': new Date().toISOString()
      }
    });
    
    // Cache the response for offline use
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, proxyResponse.clone());
    
    return proxyResponse;
    
  } catch (error) {
    console.error(`❌ Proxy failed for ${targetPath}:`, error);
    
    // Try to return cached version if available
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return error response
    return new Response(
      `# Content Unavailable

This help content is currently unavailable.

**Error:** ${error.message}
**Path:** ${targetPath}
**Time:** ${new Date().toISOString()}

## Possible Causes
- External repository is unavailable
- Network connectivity issues
- Service worker proxy error

## Solutions
1. Check your internet connection
2. Try refreshing the page
3. Contact support if the issue persists

---
*Proxied by NTR Help Service Worker*`,
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: {
          'Content-Type': 'text/markdown',
          'Access-Control-Allow-Origin': '*',
          'X-Proxy-Error': error.message,
          'X-Proxy-Timestamp': new Date().toISOString()
        }
      }
    );
  }
}

// Helper function to determine content type
function getContentType(path) {
  if (path.endsWith('.md')) return 'text/markdown';
  if (path.endsWith('.json')) return 'application/json';
  if (path.endsWith('.txt')) return 'text/plain';
  if (path.endsWith('.html')) return 'text/html';
  if (path.endsWith('.js')) return 'text/javascript';
  if (path.endsWith('.ts')) return 'text/typescript';
  if (path.endsWith('.tsx')) return 'text/typescript';
  if (path.endsWith('.jsx')) return 'text/javascript';
  return 'text/plain';
}

// Handle service worker updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});


