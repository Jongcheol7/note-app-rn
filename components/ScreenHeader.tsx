import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useThemeColors, typography } from '@/lib/theme';

interface ScreenHeaderProps {
  title: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
}

export default function ScreenHeader({
  title,
  showBack = true,
  rightAction,
}: ScreenHeaderProps) {
  const router = useRouter();
  const colors = useThemeColors();

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
        },
      ]}
    >
      {showBack ? (
        <Pressable
          onPress={() => router.back()}
          style={styles.iconBtn}
          accessibilityLabel="뒤로 가기"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
      ) : (
        <View style={{ width: 36 }} />
      )}
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {rightAction || <View style={{ width: 36 }} />}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  title: {
    ...typography.subheading,
  },
  iconBtn: {
    padding: 6,
    minWidth: 36,
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
