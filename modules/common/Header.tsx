import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  useColorScheme,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/lib/AuthContext';
import { useSearchStore } from '@/store/useSearchStore';
import { useFromStore } from '@/store/useFromStore';

export default function Header() {
  const router = useRouter();
  const { profile } = useAuth();
  const isDark = useColorScheme() === 'dark';
  const menuFrom = useFromStore((s) => s.menuFrom);
  const setKeyword = useSearchStore((s) => s.setKeyword);

  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = useCallback(
    (text: string) => {
      setSearchText(text);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => setKeyword(text), 300);
    },
    [setKeyword]
  );

  const title =
    menuFrom === 'community'
      ? '커뮤니티'
      : menuFrom === 'trash'
        ? '휴지통'
        : 'Notie';

  const avatarUrl = profile?.profileImage || profile?.image;

  return (
    <View
      style={[
        styles.header,
        { backgroundColor: isDark ? '#000' : '#fff', borderBottomColor: isDark ? '#333' : '#eee' },
      ]}
    >
      {/* Left: Logo / Title */}
      <Pressable
        onPress={() => {
          const { setMenuFrom } = useFromStore.getState();
          setMenuFrom('');
          router.push('/');
        }}
      >
        <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]}>
          {title}
        </Text>
      </Pressable>

      {/* Right: Search + Profile */}
      <View style={styles.rightSection}>
        {showSearch ? (
          <View style={[styles.searchBox, { backgroundColor: isDark ? '#333' : '#f3f4f6' }]}>
            <Ionicons name="search" size={16} color="#999" />
            <TextInput
              style={[styles.searchInput, { color: isDark ? '#fff' : '#000' }]}
              placeholder="검색..."
              placeholderTextColor="#999"
              value={searchText}
              onChangeText={handleSearch}
              autoFocus
            />
            <Pressable
              onPress={() => {
                setShowSearch(false);
                setSearchText('');
                setKeyword('');
              }}
            >
              <Ionicons name="close" size={18} color="#999" />
            </Pressable>
          </View>
        ) : (
          <>
            <Pressable onPress={() => setShowSearch(true)} style={styles.iconBtn}>
              <Ionicons
                name="search-outline"
                size={22}
                color={isDark ? '#ccc' : '#555'}
              />
            </Pressable>
            <Pressable onPress={() => router.push('/profile' as any)} style={styles.iconBtn}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.profileImg} />
              ) : (
                <View style={[styles.profileImg, styles.profilePlaceholder]}>
                  <Text style={styles.profileInitial}>
                    {(profile?.nickname || profile?.name || '?')[0]}
                  </Text>
                </View>
              )}
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    padding: 4,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
    width: 200,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  profileImg: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  profilePlaceholder: {
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
});
