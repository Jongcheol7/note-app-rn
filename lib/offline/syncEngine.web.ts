// Web stub - offline sync not supported on web (uses Supabase directly)

let isOnline = true;

export function getIsOnline() { return isOnline; }

export function initNetworkListener(onChange?: (online: boolean) => void) {
  isOnline = navigator.onLine;
  const onlineHandler = () => { isOnline = true; onChange?.(true); };
  const offlineHandler = () => { isOnline = false; onChange?.(false); };
  window.addEventListener('online', onlineHandler);
  window.addEventListener('offline', offlineHandler);
  return () => {
    window.removeEventListener('online', onlineHandler);
    window.removeEventListener('offline', offlineHandler);
  };
}

export async function pullNotes(_userId: string) {}
export async function pullCategories(_userId: string) {}
export async function pushOfflineQueue() {}
export async function enqueueAction() {}
export async function getLocalNotes() { return []; }
export async function getLocalCategories() { return []; }
export async function fullSync(_userId: string) {}
