import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Check your .env file.');
}

// SSR-safe storage: use AsyncStorage on native, localStorage on web (only in browser)
function getStorage() {
  if (Platform.OS !== 'web') {
    return require('@react-native-async-storage/async-storage').default;
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

export const supabase = supabaseUrl
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: getStorage(),
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: Platform.OS === 'web' && typeof window !== 'undefined',
      },
    })
  : (null as any);
