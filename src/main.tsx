import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '../App';
import { LanguageProvider } from '../contexts/LanguageContext';

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
