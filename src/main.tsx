import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { migrateOldData } from './utils/dataMigration';

// Run data migration before rendering
migrateOldData();

// Register service worker for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Add debug functions to window for manual data recovery
if (typeof window !== 'undefined') {
  (window as any).debugCodeTracker = {
    migrateData: () => {
      migrateOldData();
      window.location.reload();
    },
    showStorage: () => {
      console.log('All localStorage keys:');
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes('code')) {
          console.log(key, localStorage.getItem(key));
        }
      }
    }
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
); 