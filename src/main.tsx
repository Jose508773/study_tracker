import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { migrateOldData } from './utils/dataMigration';

// Run data migration before rendering
migrateOldData();

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

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 