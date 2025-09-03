// Service Worker for Help Content Proxy
// This service worker intercepts requests to /help-proxy/ and fetches content
// from external repositories, bypassing CORS restrictions

const CACHE_NAME = 'help-proxy-v2'; // Increment cache version to force refresh
const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/peka01/helpdoc/main/ntr-test';

// Install event - cache the service worker
self.addEventListener('install', (event) => {
  console.log('🔄 Service Worker installing...');
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🔄 Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log(`🗑️ Deleting old cache: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log(`✅ Service Worker activated with cache: ${CACHE_NAME}`);
      // Force all clients to reload to get fresh content
      return self.clients.claim();
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
  
  // Check if this is a cache-busting request (has timestamp query param)
  const hasTimestamp = url.searchParams.has('t') || url.searchParams.has('timestamp') || url.searchParams.has('v');
  const forceRefresh = hasTimestamp || url.searchParams.has('refresh') || url.searchParams.has('nocache');
  
  try {
    // Use raw content URL directly (bypassing GitHub API)
    const rawUrl = `${GITHUB_RAW_BASE}/${targetPath}`;
    console.log(`🌐 Fetching from: ${rawUrl}${forceRefresh ? ' (forced refresh)' : ''}`);
    
    // Add cache-busting to GitHub URL if not already present
    let githubUrl = rawUrl;
    if (!forceRefresh) {
      const timestamp = Date.now();
      const separator = rawUrl.includes('?') ? '&' : '?';
      githubUrl = `${rawUrl}${separator}_sw=${timestamp}`;
    }
    
    // Fetch content directly from raw.githubusercontent.com with cache-busting headers
    const rawResponse = await fetch(githubUrl, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        'User-Agent': 'ntr-help-proxy/2.0',
        'Accept': 'text/plain, text/markdown, application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'X-Requested-With': 'XMLHttpRequest'
      }
    });
    
    if (!rawResponse.ok) {
      throw new Error(`Raw content fetch failed: ${rawResponse.status} ${rawResponse.statusText}`);
    }
    
    // Get the content
    const content = await rawResponse.text();
    
    // Create new response with CORS headers and no-cache directives
    const proxyResponse = new Response(content, {
      status: 200,
      statusText: 'OK',
      headers: {
        'Content-Type': getContentType(targetPath),
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cache-Control, Pragma',
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0, private',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Proxy-By': 'ntr-help-proxy-sw-v2',
        'X-Original-URL': rawUrl,
        'X-Proxy-Timestamp': new Date().toISOString(),
        'X-Cache-Status': 'MISS'
      }
    });
    
    // Only cache if not forcing refresh and content is not empty
    if (!forceRefresh && content.trim().length > 0) {
      const cache = await caches.open(CACHE_NAME);
      // Store with cache-busting key to avoid conflicts
      const cacheKey = new Request(`${request.url}?_sw_cache=${Date.now()}`);
      cache.put(cacheKey, proxyResponse.clone());
      console.log(`💾 Cached response for: ${targetPath}`);
    } else if (forceRefresh) {
      console.log(`🔄 Skipping cache for forced refresh: ${targetPath}`);
      // Clear any existing cached version
      const cache = await caches.open(CACHE_NAME);
      const keys = await cache.keys();
      for (const key of keys) {
        if (key.url.includes(targetPath)) {
          await cache.delete(key);
          console.log(`🗑️ Cleared cached version for: ${targetPath}`);
        }
      }
    }
    
    return proxyResponse;
    
  } catch (error) {
    console.error(`❌ Proxy failed for ${targetPath}:`, error);
    
    // Try to return cached version if available and not forcing refresh
    if (!forceRefresh) {
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match(request);
      
      if (cachedResponse) {
        console.log(`📦 Returning cached content for: ${targetPath}`);
        // Update headers to indicate cached content
        const cachedResponseClone = cachedResponse.clone();
        const newHeaders = new Headers(cachedResponseClone.headers);
        newHeaders.set('X-Cache-Status', 'HIT');
        newHeaders.set('X-Cache-Timestamp', new Date().toISOString());
        
        return new Response(cachedResponseClone.body, {
          status: cachedResponseClone.status,
          statusText: cachedResponseClone.statusText,
          headers: newHeaders
        });
      }
    }
    
    // Return error response
    return new Response(
      `# Content Unavailable

This help content is currently unavailable.

**Error:** ${error.message}
**Path:** ${targetPath}
**Time:** ${new Date().toISOString()}
**Cache Status:** ${forceRefresh ? 'Forced Refresh' : 'Cache Miss'}

## Possible Causes
- External repository is unavailable
- Network connectivity issues
- Service worker proxy error

## Solutions
1. Check your internet connection
2. Try refreshing the page
3. Contact support if the issue persists

---
*Proxied by NTR Help Service Worker v2*`,
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: {
          'Content-Type': 'text/markdown',
          'Access-Control-Allow-Origin': '*',
          'X-Proxy-Error': error.message,
          'X-Proxy-Timestamp': new Date().toISOString(),
          'X-Cache-Status': 'ERROR'
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
  } else if (event.data && event.data.type === 'CLEAR_CACHE') {
    // Clear all caches when requested
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log(`🗑️ Clearing cache: ${cacheName}`);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      console.log('✅ All caches cleared');
      // Notify all clients
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'CACHE_CLEARED' });
        });
      });
    });
  }
});

// Periodic cache cleanup (every hour)
setInterval(async () => {
  try {
    const cache = await caches.open(CACHE_NAME);
    const keys = await cache.keys();
    const now = Date.now();
    const maxAge = 60 * 60 * 1000; // 1 hour
    
    for (const key of keys) {
      const url = new URL(key.url);
      const timestamp = url.searchParams.get('_sw_cache');
      if (timestamp && (now - parseInt(timestamp)) > maxAge) {
        await cache.delete(key);
        console.log(`🗑️ Auto-cleaned old cache entry: ${url.pathname}`);
      }
    }
  } catch (error) {
    console.error('Error during periodic cache cleanup:', error);
  }
}, 60 * 60 * 1000); // Run every hour


