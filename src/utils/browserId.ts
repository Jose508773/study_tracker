// Generate a unique browser identifier for data isolation
const BROWSER_ID_KEY = 'code-tracker-browser-id';

export const getBrowserId = (): string => {
  if (typeof window === 'undefined') {
    return 'server-side';
  }

  let browserId = localStorage.getItem(BROWSER_ID_KEY);
  
  if (!browserId) {
    // Generate a unique ID using timestamp + random + user agent hash
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 15);
    const userAgentHash = btoa(navigator.userAgent).substring(0, 8);
    browserId = `${timestamp}-${random}-${userAgentHash}`;
    
    localStorage.setItem(BROWSER_ID_KEY, browserId);
  }
  
  return browserId;
};

export const getStorageKey = (baseKey: string): string => {
  const browserId = getBrowserId();
  return `${baseKey}-${browserId}`;
};
