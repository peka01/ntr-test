// Service Worker Manager for Help Proxy
// Handles registration, updates, and lifecycle management

export interface ServiceWorkerStatus {
  isRegistered: boolean;
  isActive: boolean;
  isControlling: boolean;
  hasUpdate: boolean;
  registration?: ServiceWorkerRegistration;
}

class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;
  private updateAvailable = false;

  // Check if service workers are supported
  isSupported(): boolean {
    return 'serviceWorker' in navigator;
  }

  // Register the help proxy service worker
  async register(): Promise<ServiceWorkerRegistration | null> {
    if (!this.isSupported()) {
      console.warn('⚠️ Service Workers not supported in this browser');
      return null;
    }

    try {
      console.log('🔄 Registering Help Proxy Service Worker...');
      
      this.registration = await navigator.serviceWorker.register('/help-proxy-sw.js', {
        scope: '/help-proxy/'
      });

      console.log('✅ Help Proxy Service Worker registered successfully:', this.registration);

      // Set up event listeners
      this.setupEventListeners();

      return this.registration;
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
      return null;
    }
  }

  // Set up event listeners for service worker lifecycle
  private setupEventListeners(): void {
    if (!this.registration) return;

    // Handle service worker updates
    this.registration.addEventListener('updatefound', () => {
      console.log('🔄 New Service Worker update found');
      
      const newWorker = this.registration!.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('📦 New Service Worker installed and waiting');
            this.updateAvailable = true;
            
            // Optionally notify user about update
            this.notifyUpdateAvailable();
          }
        });
      }
    });

    // Handle service worker state changes
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('🎮 Service Worker controller changed');
      this.updateAvailable = false;
    });

    // Handle service worker messages
    navigator.serviceWorker.addEventListener('message', (event) => {
      console.log('📨 Service Worker message received:', event.data);
    });
  }

  // Get current service worker status
  getStatus(): ServiceWorkerStatus {
    if (!this.registration) {
      return {
        isRegistered: false,
        isActive: false,
        isControlling: false,
        hasUpdate: false
      };
    }

    return {
      isRegistered: true,
      isActive: this.registration.active !== null,
      isControlling: !!navigator.serviceWorker.controller,
      hasUpdate: this.updateAvailable,
      registration: this.registration
    };
  }

  // Check if service worker is ready
  async isReady(): Promise<boolean> {
    if (!this.registration) return false;
    
    // Wait for service worker to be active
    if (this.registration.active) {
      return true;
    }

    // Wait for service worker to activate
    return new Promise((resolve) => {
      if (this.registration!.active) {
        resolve(true);
      } else {
        this.registration!.addEventListener('activate', () => resolve(true));
      }
    });
  }

  // Update the service worker
  async update(): Promise<void> {
    if (!this.registration) {
      console.warn('⚠️ No service worker registered to update');
      return;
    }

    try {
      console.log('🔄 Updating Service Worker...');
      await this.registration.update();
    } catch (error) {
      console.error('❌ Service Worker update failed:', error);
    }
  }

  // Skip waiting and activate new service worker
  async skipWaiting(): Promise<void> {
    if (!this.registration || !this.registration.waiting) {
      console.warn('⚠️ No service worker waiting to activate');
      return;
    }

    try {
      console.log('⏭️ Skipping waiting and activating new Service Worker...');
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    } catch (error) {
      console.error('❌ Failed to skip waiting:', error);
    }
  }

  // Unregister the service worker
  async unregister(): Promise<boolean> {
    if (!this.registration) {
      console.warn('⚠️ No service worker registered to unregister');
      return false;
    }

    try {
      console.log('🗑️ Unregistering Service Worker...');
      const result = await this.registration.unregister();
      this.registration = null;
      this.updateAvailable = false;
      console.log('✅ Service Worker unregistered:', result);
      return result;
    } catch (error) {
      console.error('❌ Service Worker unregistration failed:', error);
      return false;
    }
  }

  // Notify user about available update
  private notifyUpdateAvailable(): void {
    // You can customize this to show a notification to the user
    console.log('📢 New Service Worker update available!');
    
    // Example: Show a toast notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Help System Update', {
        body: 'A new version of the help system is available. Refresh to update.',
        icon: '/favicon.ico',
        tag: 'help-update'
      });
    }
  }

  // Test the service worker proxy
  async testProxy(): Promise<boolean> {
    try {
      console.log('🧪 Testing Service Worker proxy...');
      
      const response = await fetch('/help-proxy/help-config.json', {
        method: 'GET',
        cache: 'no-store'
      });

      if (response.ok) {
        const content = await response.text();
        console.log('✅ Proxy test successful:', {
          status: response.status,
          contentType: response.headers.get('Content-Type'),
          contentLength: content.length,
          proxyBy: response.headers.get('X-Proxy-By')
        });
        return true;
      } else {
        console.error('❌ Proxy test failed:', response.status, response.statusText);
        return false;
      }
    } catch (error) {
      console.error('❌ Proxy test error:', error);
      return false;
    }
  }
}

// Create singleton instance
export const serviceWorkerManager = new ServiceWorkerManager();

// Auto-register service worker when module is imported
if (typeof window !== 'undefined') {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      serviceWorkerManager.register();
    });
  } else {
    serviceWorkerManager.register();
  }
}
