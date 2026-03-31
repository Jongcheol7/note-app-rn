import 'react-native-url-polyfill/auto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Check your .env file.');
}

/**
 * SSR-safe, secure storage adapter.
 * - Native: expo-secure-store (encrypted keychain/keystore)
 * - Web browser: localStorage
 * - SSR: in-memory fallback
 */
function getStorage() {
  if (Platform.OS !== 'web') {
    // Use SecureStore for encrypted token storage on native
    const SecureStore = require('expo-secure-store');
    return {
      getItem: (key: string) => SecureStore.getItemAsync(key),
      setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
      removeItem: (key: string) => SecureStore.deleteItemAsync(key),
    };
  }
  // Web: use localStorage if available (not during SSR)
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  // SSR fallback: in-memory storage
  const memStore: Record<string, string> = {};
  return {
    getItem: (key: string) => memStore[key] ?? null,
    setItem: (key: string, value: string) => { memStore[key] = value; },
    removeItem: (key: string) => { delete memStore[key]; },
  };
}

let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    if (!supabaseUrl) {
      throw new Error('Supabase URL is not configured. Check your .env file.');
    }
    _supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: getStorage(),
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: Platform.OS === 'web' && typeof window !== 'undefined',
      },
    });
  }
  return _supabase;
}

// Lazy-initialized supabase client (backwards compatible export)
export const supabase: SupabaseClient = supabaseUrl
  ? getSupabase()
  : (new Proxy({} as SupabaseClient, {
      get: () => {
        console.warn('Supabase client not initialized. Check .env.');
        return () => ({ data: null, error: new Error('Not initialized') });
      },
    }));
