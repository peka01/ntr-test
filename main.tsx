import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { UserInteractionProvider } from './contexts/UserInteractionContext';

console.log('Main.tsx loaded, React version:', React.version);
console.log('ReactDOM version:', ReactDOM.version);

const AppContainer: React.FC = () => {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      console.log('🔄 Registering Service Worker from main.tsx...');
      navigator.serviceWorker.register('./help-proxy-sw.js', { scope: './' })
        .then(registration => {
          console.log('✅ Service Worker registered successfully:', registration.scope);
          return navigator.serviceWorker.ready;
        })
        .then(registration => {
          console.log('✅ Service Worker is ready and active.');
        })
        .catch(error => {
          console.error('❌ Service Worker registration failed:', error);
        });
    } else {
      console.warn('⚠️ Service Worker not supported in this browser');
    }
  }, []);

  return (
    <React.StrictMode>
      <LanguageProvider>
        <AuthProvider>
          <UserInteractionProvider>
            <App />
          </UserInteractionProvider>
        </AuthProvider>
      </LanguageProvider>
    </React.StrictMode>
  );
};

const rootElement = document.getElementById('root');
console.log('Root element found:', rootElement);

if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

console.log('Creating React root...');
const root = ReactDOM.createRoot(rootElement);

console.log('Rendering React app...');
root.render(<AppContainer />);

console.log('React app render called');
