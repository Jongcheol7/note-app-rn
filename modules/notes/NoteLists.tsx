import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Platform,
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
  const menuFrom = useFromStore((s) => s.menuFrom);
  const colors = useThemeColors();
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
  const numColumns = isCommunity ? 1 : width > 1024 ? 4 : width > 768 ? 3 : 2;
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
          color={colors.textDisabled}
        />
        <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
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
        <Text style={{ color: colors.error, marginBottom: 12 }}>
          데이터를 불러오는데 실패했습니다
        </Text>
        <Pressable onPress={() => refetch()}>
          <Text style={{ color: colors.accent }}>다시 시도</Text>
        </Pressable>
      </View>
    );
  }

  // Web: center content with max-width
  const isWeb = Platform.OS === 'web';
  const maxWidth = isWeb ? 1200 : undefined;

  return (
    <View style={[styles.outer, { backgroundColor: colors.background }]}>
      <View style={[styles.inner, maxWidth ? { maxWidth, width: '100%' } : undefined]}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    alignItems: 'center',
  },
  inner: {
    flex: 1,
    alignSelf: 'center',
    width: '100%',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 8,
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
