import React, { memo } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useThemeColors } from '@/lib/theme';

interface AvatarProps {
  uri?: string | null;
  name?: string | null;
  size?: number;
}

function Avatar({ uri, name, size = 40 }: AvatarProps) {
  const colors = useThemeColors();
  const initial = (name || '?')[0];
  const fontSize = size * 0.4;

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
        accessibilityLabel={`${name || '사용자'} 프로필 사진`}
      />
    );
  }

  return (
    <View
      style={[
        styles.placeholder,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.inputBackground,
        },
      ]}
      accessibilityLabel={`${name || '사용자'} 프로필`}
    >
      <Text style={[styles.initial, { fontSize, color: colors.textTertiary }]}>
        {initial}
      </Text>
    </View>
  );
}

export default memo(Avatar);

const styles = StyleSheet.create({
  image: {
    resizeMode: 'cover',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initial: {
    fontWeight: '600',
  },
});
