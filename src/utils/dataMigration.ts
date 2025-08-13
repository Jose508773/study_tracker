import { getBrowserId, getStorageKey } from './browserId';

// Migration utility to restore old data
export const migrateOldData = () => {
  if (typeof window === 'undefined') return;

  const oldCodingKey = 'coding-storage';
  const oldStudyKey = 'study-storage';
  const oldGoalsKey = 'goals-storage';
  
  const newStudyKey = getStorageKey('study-storage');
  const newGoalsKey = getStorageKey('goals-storage');

  // Check if we have old data but no new data
  const oldCodingData = localStorage.getItem(oldCodingKey);
  const oldGoalsData = localStorage.getItem(oldGoalsKey);
  
  const newStudyData = localStorage.getItem(newStudyKey);
  const newGoalsData = localStorage.getItem(newGoalsKey);

  // Migrate coding data to study data if old exists but new doesn't
  if (oldCodingData && !newStudyData) {
    console.log('Migrating old coding data to study data...');
    localStorage.setItem(newStudyKey, oldCodingData);
    // Keep old data as backup
    localStorage.setItem(`${oldCodingKey}-backup`, oldCodingData);
  }

  // Migrate goals data if old exists but new doesn't
  if (oldGoalsData && !newGoalsData) {
    console.log('Migrating old goals data...');
    localStorage.setItem(newGoalsKey, oldGoalsData);
    // Keep old data as backup
    localStorage.setItem(`${oldGoalsKey}-backup`, oldGoalsData);
  }

  // Log migration status
  if (oldCodingData || oldGoalsData) {
    console.log('Data migration completed. Your old data has been preserved.');
    console.log('Browser ID:', getBrowserId());
  }
};

// Function to manually trigger migration (for debugging)
export const forceMigration = () => {
  migrateOldData();
  window.location.reload();
};
