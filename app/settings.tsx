import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  useColorScheme,
  Alert,
  Appearance,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuthGuard } from '@/components/AuthGuard';
import { useAuth } from '@/lib/AuthContext';
import { deleteAccount } from '@/lib/services/userService';

type ThemeMode = 'light' | 'dark' | null; // null = system

export default function SettingsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user, signOut } = useAuth();
  const [theme, setTheme] = useState<ThemeMode>(null);

  // Restore saved theme preference
  useEffect(() => {
    if (Platform.OS !== 'web') {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      AsyncStorage.getItem('theme_preference').then((saved: string | null) => {
        if (saved === 'light' || saved === 'dark') {
          setTheme(saved);
          Appearance.setColorScheme(saved);
        }
      }).catch(() => {});
    }
  }, []);

  const handleThemeChange = (mode: ThemeMode) => {
    setTheme(mode);
    Appearance.setColorScheme(mode);
    // Persist
    if (Platform.OS !== 'web') {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      if (mode) {
        AsyncStorage.setItem('theme_preference', mode).catch(() => {});
      } else {
        AsyncStorage.removeItem('theme_preference').catch(() => {});
      }
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      '계정 삭제',
      '계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다. 정말 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            Alert.alert('최종 확인', '이 작업은 되돌릴 수 없습니다.', [
              { text: '취소', style: 'cancel' },
              {
                text: '계정 영구 삭제',
                style: 'destructive',
                onPress: async () => {
                  if (!user) return;
                  try {
                    await deleteAccount(user.id);
                    await signOut();
                    router.replace('/');
                  } catch (e) {
                    Alert.alert('오류', '계정 삭제에 실패했습니다.');
                  }
                },
              },
            ]);
          },
        },
      ]
    );
  };

  const MenuItem = ({
    icon,
    label,
    onPress,
    color,
  }: {
    icon: string;
    label: string;
    onPress: () => void;
    color?: string;
  }) => (
    <Pressable onPress={onPress} style={[styles.menuItem, { borderBottomColor: isDark ? '#333' : '#f0f0f0' }]} accessibilityLabel={label} accessibilityRole="button">
      <Ionicons name={icon as any} size={20} color={color || (isDark ? '#ccc' : '#555')} />
      <Text style={[styles.menuLabel, { color: color || (isDark ? '#fff' : '#000') }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color="#999" />
    </Pressable>
  );

  return (
    <AuthGuard showLogin>
      <SafeAreaView style={[styles.outer, { backgroundColor: isDark ? '#000' : '#fff' }]} edges={['top']}>
        <View style={styles.inner}>
        <View style={[styles.header, { borderBottomColor: isDark ? '#333' : '#eee' }]}>
          <Pressable onPress={() => router.back()} style={{ padding: 6 }} accessibilityLabel="뒤로 가기" accessibilityRole="button">
            <Ionicons name="arrow-back" size={24} color={isDark ? '#fff' : '#000'} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: isDark ? '#fff' : '#000' }]} accessibilityRole="header">설정</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {/* Theme */}
          <Text style={[styles.sectionTitle, { color: isDark ? '#aaa' : '#666' }]}>테마</Text>
          <View style={[styles.themeRow, { backgroundColor: isDark ? '#1a1a1a' : '#f9fafb' }]}>
            {(['light', null, 'dark'] as ThemeMode[]).map((mode) => {
              const label = mode === 'light' ? '라이트' : mode === 'dark' ? '다크' : '시스템';
              const isActive = theme === mode;
              return (
                <Pressable
                  key={String(mode)}
                  onPress={() => handleThemeChange(mode)}
                  style={[styles.themeBtn, isActive && styles.themeBtnActive]}
                  accessibilityLabel={`${label} 테마`}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isActive }}
                >
                  <Text style={[styles.themeBtnText, isActive && styles.themeBtnTextActive]}>
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Menu items */}
          <Text style={[styles.sectionTitle, { color: isDark ? '#aaa' : '#666', marginTop: 24 }]}>정보</Text>
          <MenuItem icon="document-text-outline" label="이용약관" onPress={() => router.push('/terms' as any)} />
          <MenuItem icon="shield-outline" label="개인정보처리방침" onPress={() => router.push('/privacy' as any)} />
          <MenuItem icon="mail-outline" label="문의하기" onPress={() => Linking.openURL('mailto:support@notie.app')} />

          <Text style={[styles.sectionTitle, { color: isDark ? '#aaa' : '#666', marginTop: 24 }]}>계정</Text>
          <MenuItem icon="log-out-outline" label="로그아웃" onPress={signOut} />
          <MenuItem icon="trash-outline" label="계정 삭제" onPress={handleDeleteAccount} color="#ef4444" />

          <Text style={styles.version}>버전 1.0.0</Text>
        </ScrollView>
        </View>
      </SafeAreaView>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    alignItems: 'center',
  },
  inner: {
    flex: 1,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 1200 : undefined,
  },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  content: { padding: 16 },
  sectionTitle: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  themeRow: { flexDirection: 'row', borderRadius: 10, padding: 4 },
  themeBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  themeBtnActive: { backgroundColor: '#FF6B6B' },
  themeBtnText: { fontSize: 14, color: '#666' },
  themeBtnTextActive: { color: '#fff', fontWeight: '600' },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 14,
    borderBottomWidth: 1, gap: 12,
  },
  menuLabel: { flex: 1, fontSize: 15 },
  version: { textAlign: 'center', color: '#999', fontSize: 12, marginTop: 32 },
});
