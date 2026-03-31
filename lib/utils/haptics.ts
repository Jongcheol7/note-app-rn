import { Platform } from 'react-native';

/**
 * Light haptic feedback for selections and toggles.
 */
export function hapticLight() {
  if (Platform.OS === 'web') return;
  try {
    const Haptics = require('expo-haptics');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {}
}

/**
 * Medium haptic feedback for significant actions (save, send, delete).
 */
export function hapticMedium() {
  if (Platform.OS === 'web') return;
  try {
    const Haptics = require('expo-haptics');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch {}
}

/**
 * Selection haptic for toggle switches and pickers.
 */
export function hapticSelection() {
  if (Platform.OS === 'web') return;
  try {
    const Haptics = require('expo-haptics');
    Haptics.selectionAsync();
  } catch {}
}

/**
 * Success notification haptic.
 */
export function hapticSuccess() {
  if (Platform.OS === 'web') return;
  try {
    const Haptics = require('expo-haptics');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {}
}
