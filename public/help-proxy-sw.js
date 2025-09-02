// Service Worker for Help Content Proxy
// This service worker intercepts requests to /help-proxy/ and fetches content
// from external repositories, bypassing CORS restrictions

const CACHE_NAME = 'help-proxy-v1';
const EXTERNAL_BASE = 'https://raw.githubusercontent.com/peka01/helpdoc/main/ntr-test';

// Install event - cache the service worker
self.addEventListener('install', (event) => {
  console.log('🔄 Help Proxy Service Worker installing...');
  console.log('🎯 Service Worker scope:', self.registration?.scope || 'unknown');
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('✅ Help Proxy Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Deleting old cache:', cacheName);
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
  
  console.log(`🔍 Service Worker intercepting request: ${event.request.method} ${url.pathname}`);
  
  // Handle CORS preflight requests
  if (event.request.method === 'OPTIONS') {
    console.log('🔄 Handling CORS preflight request');
    event.respondWith(handleCorsPreflight());
    return;
  }
  
  // Handle help-proxy requests (both absolute and relative paths)
  if (!url.pathname.includes('help-proxy/')) {
    console.log(`⏭️ Skipping non-help-proxy request: ${url.pathname}`);
    return;
  }
  
  console.log(`✅ Handling help-proxy request: ${url.pathname}`);
  console.log(`🔍 Full URL: ${url.href}`);
  console.log(`🔍 Pathname: ${url.pathname}`);
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
  
  console.log(`🔍 Path extraction: pathname="${url.pathname}", helpProxyIndex=${helpProxyIndex}, targetPath="${targetPath}"`);
  
  try {
    // Construct external URL
    const externalUrl = `${EXTERNAL_BASE}/${targetPath}`;
    console.log(`🌐 Proxying request: ${targetPath} → ${externalUrl}`);
    
    // Fetch from external repository
    const response = await fetch(externalUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'ntr-help-proxy/1.0',
        'Accept': 'text/plain, text/markdown, application/json',
        'Cache-Control': 'no-cache'
      }
    });
    
    if (!response.ok) {
      throw new Error(`External fetch failed: ${response.status} ${response.statusText}`);
    }
    
    // Get the content
    const content = await response.text();
    
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
        'X-Original-URL': externalUrl,
        'X-Proxy-Timestamp': new Date().toISOString()
      }
    });
    
    // Cache the response for offline use
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, proxyResponse.clone());
    
    console.log(`✅ Successfully proxied: ${targetPath} (${content.length} bytes)`);
    return proxyResponse;
    
  } catch (error) {
    console.error(`❌ Proxy failed for ${targetPath}:`, error);
    
    // Try to return cached version if available
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log(`📦 Returning cached version for ${targetPath}`);
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

// Log service worker lifecycle
console.log('🔄 Help Proxy Service Worker script loaded');
