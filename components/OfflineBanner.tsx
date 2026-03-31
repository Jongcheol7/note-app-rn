import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useOffline } from '@/lib/offline/OfflineProvider';

export function OfflineBanner() {
  const { isOnline, isSyncing } = useOffline();

  if (isOnline && !isSyncing) return null;

  return (
    <View style={[styles.banner, !isOnline ? styles.offline : styles.syncing]}>
      <Ionicons
        name={isOnline ? 'sync' : 'cloud-offline-outline'}
        size={14}
        color="#fff"
      />
      <Text style={styles.text}>
        {isOnline ? '동기화 중...' : '오프라인 모드'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    gap: 6,
  },
  offline: {
    backgroundColor: '#ef4444',
  },
  syncing: {
    backgroundColor: '#3b82f6',
  },
  text: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
});
