import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Image,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/lib/AuthContext';
import { useSearchStore } from '@/store/useSearchStore';
import { useFromStore } from '@/store/useFromStore';
import { useThemeColors, spacing } from '@/lib/theme';

export default function Header() {
  const router = useRouter();
  const { profile } = useAuth();
  const colors = useThemeColors();
  const menuFrom = useFromStore((s) => s.menuFrom);
  const setKeyword = useSearchStore((s) => s.setKeyword);

  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Animations
  const searchAnim = useRef(new Animated.Value(0)).current;
  const titleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (showSearch) {
      Animated.parallel([
        Animated.timing(searchAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: false,
        }),
        Animated.timing(titleAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(searchAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(titleAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [showSearch]);

  const handleSearch = useCallback(
    (text: string) => {
      setSearchText(text);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => setKeyword(text), 300);
    },
    [setKeyword]
  );

  const closeSearch = useCallback(() => {
    setShowSearch(false);
    setSearchText('');
    setKeyword('');
  }, [setKeyword]);

  const title =
    menuFrom === 'community'
      ? '커뮤니티'
      : menuFrom === 'trash'
        ? '휴지통'
        : 'Notie';

  const avatarUrl = profile?.profileImage || profile?.image;

  const searchWidth = searchAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const searchOpacity = searchAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.5, 1],
  });

  return (
    <View
      style={[
        styles.header,
        { backgroundColor: colors.background, borderBottomColor: colors.borderLight },
      ]}
    >
      {showSearch ? (
        <Animated.View style={[styles.searchRow, { opacity: searchOpacity }]}>
          <View style={[styles.searchBox, { backgroundColor: colors.inputBackground }]}>
            <Ionicons name="search" size={18} color={colors.textTertiary} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="노트 검색..."
              placeholderTextColor={colors.textTertiary}
              value={searchText}
              onChangeText={handleSearch}
              autoFocus
            />
            {searchText.length > 0 && (
              <Pressable onPress={() => handleSearch('')}>
                <View style={[styles.clearBtn, { backgroundColor: colors.textTertiary }]}>
                  <Ionicons name="close" size={12} color={colors.background} />
                </View>
              </Pressable>
            )}
          </View>
          <Pressable onPress={closeSearch} style={styles.cancelBtn}>
            <Text style={[styles.cancelText, { color: colors.primary }]}>취소</Text>
          </Pressable>
        </Animated.View>
      ) : (
        <>
          <Animated.View style={{ opacity: titleAnim }}>
            <Pressable
              onPress={() => {
                const { setMenuFrom } = useFromStore.getState();
                setMenuFrom('');
                router.push('/');
              }}
            >
              <Text style={[styles.title, { color: colors.text }]}>
                {title}
              </Text>
            </Pressable>
          </Animated.View>

          <Animated.View style={[styles.rightSection, { opacity: titleAnim }]}>
            <Pressable onPress={() => setShowSearch(true)} style={styles.iconBtn}>
              <Ionicons name="search-outline" size={22} color={colors.textSecondary} />
            </Pressable>
            <Pressable onPress={() => router.push('/profile' as any)} style={styles.iconBtn}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.profileImg} />
              ) : (
                <View style={[styles.profileImg, { backgroundColor: colors.inputBackground }]}>
                  <Text style={[styles.profileInitial, { color: colors.textSecondary }]}>
                    {(profile?.nickname || profile?.name || '?')[0]}
                  </Text>
                </View>
              )}
            </Pressable>
          </Animated.View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    height: 56,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    padding: 6,
  },
  searchRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 40,
    gap: 10,
    outlineStyle: 'none',
  } as any,
  searchInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
    outlineStyle: 'none',
  } as any,
  clearBtn: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtn: {
    paddingVertical: 6,
    paddingHorizontal: 2,
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
  },
  profileImg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    fontSize: 13,
    fontWeight: '600',
  },
});
