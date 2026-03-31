import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  useColorScheme,
  useWindowDimensions,
  Pressable,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNoteLists } from '@/hooks/notes/useNoteLists';
import { useTogglePin } from '@/hooks/notes/useNoteMutations';
import { useFromStore } from '@/store/useFromStore';
import { useThemeColors } from '@/lib/theme';
import { NoteListSkeleton } from '@/components/SkeletonLoader';
import NoteCard from './NoteCard';
import CategoryFilter from './CategoryFilter';
import Header from '@/modules/common/Header';
import { useAuth } from '@/lib/AuthContext';

export default function NoteLists() {
  const { user } = useAuth();
  const isDark = useColorScheme() === 'dark';
  const menuFrom = useFromStore((s) => s.menuFrom);
  const { width } = useWindowDimensions();

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    isError,
  } = useNoteLists();

  const notes = useMemo(
    () => data?.pages.flatMap((page) => page.notes) ?? [],
    [data]
  );

  const isCommunity = menuFrom === 'community';
  const numColumns = isCommunity ? 1 : width > 768 ? 3 : 2;
  const togglePin = useTogglePin();

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleTogglePin = useCallback(
    (noteNo: number, isPinned: boolean) => {
      togglePin.mutate({ noteNo, isPinned });
    },
    [togglePin]
  );

  const renderItem = useCallback(
    ({ item }: { item: any }) => (
      <NoteCard note={item} currentUserId={user?.id} onTogglePin={handleTogglePin} />
    ),
    [user?.id]
  );

  const renderEmpty = () => {
    if (isLoading) return null;
    const emptyMsg = isCommunity
      ? '아직 공개된 노트가 없습니다'
      : menuFrom === 'trash'
        ? '휴지통이 비어있습니다'
        : '노트를 작성해보세요';
    const emptyIcon = isCommunity
      ? 'people-outline'
      : menuFrom === 'trash'
        ? 'trash-outline'
        : 'document-text-outline';

    return (
      <View style={styles.emptyContainer}>
        <Ionicons
          name={emptyIcon as any}
          size={48}
          color={isDark ? '#555' : '#ccc'}
        />
        <Text style={[styles.emptyText, { color: isDark ? '#666' : '#999' }]}>
          {emptyMsg}
        </Text>
      </View>
    );
  };

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" />
      </View>
    );
  };

  if (isError) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={{ color: '#ef4444', marginBottom: 12 }}>
          데이터를 불러오는데 실패했습니다
        </Text>
        <Pressable onPress={() => refetch()}>
          <Text style={{ color: '#3b82f6' }}>다시 시도</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Header />
      {!isCommunity && menuFrom !== 'trash' && <CategoryFilter />}

      {isLoading ? (
        <NoteListSkeleton count={6} />
      ) : (
        <FlatList
          data={notes}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={false} onRefresh={() => refetch()} />
          }
          keyExtractor={(item) => String(item.noteNo)}
          numColumns={numColumns}
          key={`list-${numColumns}`}
          contentContainerStyle={[
            styles.listContent,
            notes.length === 0 && { flex: 1 },
          ]}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
