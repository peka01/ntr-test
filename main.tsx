import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { LanguageProvider } from './contexts/LanguageContext';

console.log('Main.tsx loaded, React version:', React.version);
console.log('ReactDOM version:', ReactDOM.version);

const rootElement = document.getElementById('root');
console.log('Root element found:', rootElement);

if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

console.log('Creating React root...');
const root = ReactDOM.createRoot(rootElement);

console.log('Rendering React app...');
root.render(
  <React.StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </React.StrictMode>
);

console.log('React app render called');

// Register service worker after React app is rendered
if ('serviceWorker' in navigator) {
  console.log('🔄 Registering Service Worker...');
  navigator.serviceWorker.register('/help-proxy-sw.js', { scope: '/' })
    .then((registration) => {
      console.log('✅ Service Worker registered successfully:', registration);
      console.log('🔍 Registration details:', {
        scope: registration.scope,
        active: registration.active,
        installing: registration.installing,
        waiting: registration.waiting
      });
    })
    .catch((error) => {
      console.error('❌ Service Worker registration failed:', error);
    });
} else {
  console.warn('⚠️ Service Workers not supported in this browser');
}
