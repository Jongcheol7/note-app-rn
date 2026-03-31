import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { Platform, AppState } from 'react-native';
import { useAuth } from '../AuthContext';
import {
  initNetworkListener,
  getIsOnline,
  fullSync,
  pushOfflineQueue,
} from './syncEngine';

interface OfflineContextType {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncedAt: string | null;
  syncNow: () => Promise<void>;
}

const OfflineContext = createContext<OfflineContextType>({
  isOnline: true,
  isSyncing: false,
  lastSyncedAt: null,
  syncNow: async () => {},
});

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const syncIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const syncNow = async () => {
    if (!user || isSyncing || Platform.OS === 'web') return;
    setIsSyncing(true);
    try {
      await fullSync(user.id);
      setLastSyncedAt(new Date().toISOString());
    } catch (e) {
      console.warn('Sync failed:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  // Network listener
  useEffect(() => {
    const cleanup = initNetworkListener((online) => {
      setIsOnline(online);
      // Auto-sync when coming back online
      if (online && user) {
        syncNow();
      }
    });
    setIsOnline(getIsOnline());
    return typeof cleanup === 'function' ? cleanup : () => {};
  }, [user]);

  // Initial sync + periodic sync every 5 minutes
  useEffect(() => {
    if (!user || Platform.OS === 'web') return;

    syncNow();

    syncIntervalRef.current = setInterval(() => {
      if (getIsOnline()) syncNow();
    }, 5 * 60 * 1000);

    return () => {
      if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
    };
  }, [user]);

  // Sync when app comes to foreground
  useEffect(() => {
    if (Platform.OS === 'web') return;

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active' && user && getIsOnline()) {
        syncNow();
      }
    });

    return () => subscription.remove();
  }, [user]);

  return (
    <OfflineContext.Provider value={{ isOnline, isSyncing, lastSyncedAt, syncNow }}>
      {children}
    </OfflineContext.Provider>
  );
}

export const useOffline = () => useContext(OfflineContext);
