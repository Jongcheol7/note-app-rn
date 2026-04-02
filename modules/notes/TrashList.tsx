import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  useColorScheme,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useNoteLists } from '@/hooks/notes/useNoteLists';
import { useRecoverNote, useHardDeleteNote } from '@/hooks/notes/useNoteMutations';

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export default function TrashList() {
  const isDark = useColorScheme() === 'dark';
  const router = useRouter();
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useNoteLists();
  const recoverNote = useRecoverNote();
  const hardDelete = useHardDeleteNote();

  const notes = useMemo(
    () => data?.pages.flatMap((p) => p.notes) ?? [],
    [data]
  );

  const handleRecover = (noteNo: number) => {
    recoverNote.mutate(noteNo);
  };

  const handleHardDelete = (noteNo: number) => {
    Alert.alert('영구 삭제', '이 노트를 영구적으로 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => hardDelete.mutate(noteNo),
      },
    ]);
  };

  const renderItem = useCallback(
    ({ item }: { item: any }) => (
      <View
        style={[
          styles.trashItem,
          { backgroundColor: isDark ? '#1a1a1a' : '#fff', borderBottomColor: isDark ? '#333' : '#f0f0f0' },
        ]}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={[styles.trashTitle, { color: isDark ? '#fff' : '#000' }]}
            numberOfLines={1}
          >
            {item.title || '제목 없음'}
          </Text>
          <Text style={styles.trashDate}>
            삭제일: {item.delDatetime ? formatDate(item.delDatetime) : '-'}
          </Text>
        </View>
        <View style={styles.trashActions}>
          <Pressable onPress={() => handleRecover(item.noteNo)} style={styles.actionBtn} accessibilityLabel="노트 복원" accessibilityRole="button">
            <Ionicons name="refresh-outline" size={20} color="#3b82f6" />
          </Pressable>
          <Pressable onPress={() => handleHardDelete(item.noteNo)} style={styles.actionBtn} accessibilityLabel="영구 삭제" accessibilityRole="button">
            <Ionicons name="trash-outline" size={20} color="#ef4444" />
          </Pressable>
        </View>
      </View>
    ),
    [isDark]
  );

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { backgroundColor: isDark ? '#000' : '#fff', borderBottomColor: isDark ? '#333' : '#eee' },
        ]}
      >
        <Pressable onPress={() => router.back()} style={{ padding: 6 }} accessibilityLabel="뒤로 가기" accessibilityRole="button">
          <Ionicons name="arrow-back" size={24} color={isDark ? '#fff' : '#000'} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: isDark ? '#fff' : '#000' }]} accessibilityRole="header">
          휴지통
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <Text style={styles.hint}>30일 후 자동으로 영구 삭제됩니다</Text>

      <FlatList
        data={notes}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.noteNo)}
        contentContainerStyle={notes.length === 0 ? { flex: 1 } : undefined}
        onEndReached={() => hasNextPage && !isFetchingNextPage && fetchNextPage()}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          <View style={styles.center}>
            <Ionicons name="trash-outline" size={48} color={isDark ? '#555' : '#ccc'} />
            <Text style={[styles.emptyText, { color: isDark ? '#666' : '#999' }]}>
              휴지통이 비어있습니다
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  hint: {
    textAlign: 'center',
    fontSize: 12,
    color: '#999',
    paddingVertical: 8,
  },
  trashItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  trashTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  trashDate: {
    fontSize: 12,
    color: '#999',
  },
  trashActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    padding: 8,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
  },
});
