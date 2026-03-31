import { Alert, Platform } from 'react-native';

/**
 * Simple cross-platform toast.
 * Uses Alert on native as a fallback (burnt/sonner can be added later for native toast).
 */
export function showToast(message: string) {
  if (Platform.OS === 'web') {
    // Simple web notification
    if (typeof window !== 'undefined') {
      const el = document.createElement('div');
      el.textContent = message;
      Object.assign(el.style, {
        position: 'fixed',
        bottom: '80px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#333',
        color: '#fff',
        padding: '10px 20px',
        borderRadius: '8px',
        fontSize: '14px',
        zIndex: '9999',
        transition: 'opacity 0.3s',
      });
      document.body.appendChild(el);
      setTimeout(() => {
        el.style.opacity = '0';
        setTimeout(() => el.remove(), 300);
      }, 2000);
    }
  } else {
    Alert.alert('', message);
  }
}
