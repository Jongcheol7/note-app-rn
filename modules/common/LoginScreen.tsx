import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  useColorScheme,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/lib/AuthContext';

export default function LoginScreen() {
  const { signInWithGoogle } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}
    >
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Ionicons
            name="document-text"
            size={64}
            color={isDark ? '#fff' : '#000'}
          />
        </View>

        {/* Welcome text */}
        <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]}>
          Notie에 오신 걸 환영합니다
        </Text>
        <Text style={[styles.subtitle, { color: isDark ? '#999' : '#666' }]}>
          로그인하고 메모를 작성해보세요
        </Text>

        {/* Google login button */}
        <Pressable
          onPress={signInWithGoogle}
          style={({ pressed }) => [
            styles.loginButton,
            {
              backgroundColor: isDark ? '#fff' : '#000',
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <Ionicons
            name="logo-google"
            size={20}
            color={isDark ? '#000' : '#fff'}
          />
          <Text
            style={[styles.loginText, { color: isDark ? '#000' : '#fff' }]}
          >
            Google로 시작하기
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  logoContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    marginBottom: 48,
    textAlign: 'center',
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    maxWidth: 320,
    gap: 10,
  },
  loginText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
