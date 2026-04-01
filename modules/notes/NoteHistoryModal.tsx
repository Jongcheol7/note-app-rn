import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  FlatList,
  ScrollView,
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  useNoteHistory,
  useRestoreHistory,
  useDeleteHistory,
} from '@/hooks/notes/useNoteHistory';
import { useNoteDetail } from '@/hooks/notes/useNoteDetail';
import type { NoteHistoryItem } from '@/lib/services/historyService';

interface NoteHistoryModalProps {
  visible: boolean;
  noteNo: number;
  onRestore: () => void;
  onClose: () => void;
}

function formatDateTime(dateStr: string) {
  const d = new Date(dateStr);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const hours = String(d.getHours()).padStart(2, '0');
  const mins = String(d.getMinutes()).padStart(2, '0');
  return `${d.getFullYear()}.${month}.${day} ${hours}:${mins}`;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return '방금 전';
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  return `${days}일 전`;
}

export default function NoteHistoryModal({
  visible,
  noteNo,
  onRestore,
  onClose,
}: NoteHistoryModalProps) {
  const isDark = useColorScheme() === 'dark';
  const { data: histories = [], isLoading } = useNoteHistory(noteNo);
  const { data: note } = useNoteDetail(noteNo);
  const restoreMutation = useRestoreHistory(noteNo);
  const deleteMutation = useDeleteHistory(noteNo);
  const [previewItem, setPreviewItem] = useState<NoteHistoryItem | null>(null);

  const bgColor = isDark ? '#1a1a1a' : '#fff';
  const textColor = isDark ? '#fff' : '#000';
  const surfaceColor = isDark ? '#2a2a2a' : '#f9fafb';

  const handleRestore = (item: NoteHistoryItem) => {
    const doRestore = () => {
      restoreMutation.mutate(
        {
          historyNo: item.history_no,
          currentTitle: note?.title || '',
          currentContent: note?.content || '',
          currentPlainText: note?.plainText || '',
        },
        {
          onSuccess: () => {
            setPreviewItem(null);
            onRestore();
          },
        }
      );
    };

    if (Platform.OS === 'web') {
      if (window.confirm('이 버전으로 복원하시겠습니까? 현재 내용은 히스토리에 저장됩니다.')) {
        doRestore();
      }
    } else {
      Alert.alert(
        '버전 복원',
        '이 버전으로 복원하시겠습니까?\n현재 내용은 히스토리에 저장됩니다.',
        [
          { text: '취소', style: 'cancel' },
          { text: '복원', onPress: doRestore },
        ]
      );
    }
  };

  const handleDelete = (historyNo: number) => {
    if (Platform.OS === 'web') {
      if (window.confirm('이 히스토리를 삭제하시겠습니까?')) {
        deleteMutation.mutate(historyNo);
      }
    } else {
      Alert.alert('삭제', '이 히스토리를 삭제하시겠습니까?', [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => deleteMutation.mutate(historyNo),
        },
      ]);
    }
  };

  const renderItem = ({ item }: { item: NoteHistoryItem }) => (
    <Pressable
      onPress={() => setPreviewItem(item)}
      style={[styles.historyItem, { backgroundColor: surfaceColor }]}
      accessibilityLabel={`${formatDateTime(item.saved_at)} 버전`}
      accessibilityRole="button"
    >
      <View style={{ flex: 1 }}>
        <Text style={[styles.historyTitle, { color: textColor }]} numberOfLines={1}>
          {item.title || '제목 없음'}
        </Text>
        <Text style={styles.historyPreview} numberOfLines={2}>
          {item.plain_text || '내용 없음'}
        </Text>
        <View style={styles.historyMeta}>
          <Ionicons name="time-outline" size={12} color="#999" />
          <Text style={styles.historyTime}>{timeAgo(item.saved_at)}</Text>
          <Text style={styles.historyDate}>{formatDateTime(item.saved_at)}</Text>
        </View>
      </View>
      <View style={styles.historyActions}>
        <Pressable
          onPress={() => handleRestore(item)}
          style={styles.restoreBtn}
          accessibilityLabel="이 버전으로 복원"
          accessibilityRole="button"
        >
          <Ionicons name="refresh-outline" size={18} color="#3b82f6" />
        </Pressable>
        <Pressable
          onPress={() => handleDelete(item.history_no)}
          hitSlop={8}
          accessibilityLabel="히스토리 삭제"
          accessibilityRole="button"
        >
          <Ionicons name="close" size={16} color="#999" />
        </Pressable>
      </View>
    </Pressable>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: bgColor }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: isDark ? '#333' : '#eee' }]}>
          <Pressable onPress={onClose} style={{ padding: 6 }} accessibilityLabel="닫기" accessibilityRole="button">
            <Ionicons name="close" size={24} color={textColor} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: textColor }]} accessibilityRole="header">
            히스토리
          </Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Preview mode */}
        {previewItem ? (
          <View style={{ flex: 1 }}>
            <View style={[styles.previewHeader, { backgroundColor: surfaceColor }]}>
              <Text style={[styles.previewDate, { color: textColor }]}>
                {formatDateTime(previewItem.saved_at)}
              </Text>
              <View style={styles.previewActions}>
                <Pressable
                  onPress={() => handleRestore(previewItem)}
                  style={styles.previewRestoreBtn}
                  accessibilityLabel="이 버전으로 복원"
                  accessibilityRole="button"
                >
                  <Ionicons name="refresh-outline" size={16} color="#fff" />
                  <Text style={styles.previewRestoreText}>복원</Text>
                </Pressable>
                <Pressable
                  onPress={() => setPreviewItem(null)}
                  accessibilityLabel="목록으로 돌아가기"
                  accessibilityRole="button"
                >
                  <Text style={{ color: '#3b82f6', fontSize: 14, fontWeight: '500' }}>
                    목록
                  </Text>
                </Pressable>
              </View>
            </View>
            <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.previewContent}>
              <Text style={[styles.previewTitle, { color: textColor }]}>
                {previewItem.title || '제목 없음'}
              </Text>
              <Text style={[styles.previewBody, { color: isDark ? '#ccc' : '#333' }]}>
                {previewItem.plain_text || '내용 없음'}
              </Text>
            </ScrollView>
          </View>
        ) : (
          /* List mode */
          <>
            {isLoading ? (
              <View style={styles.center}>
                <ActivityIndicator size="large" />
              </View>
            ) : histories.length === 0 ? (
              <View style={styles.center}>
                <Ionicons name="time-outline" size={48} color={isDark ? '#555' : '#ccc'} />
                <Text style={{ color: '#999', fontSize: 15, marginTop: 12 }}>
                  아직 히스토리가 없습니다
                </Text>
                <Text style={{ color: '#999', fontSize: 13, marginTop: 4 }}>
                  노트를 수정하면 이전 버전이 자동 저장됩니다
                </Text>
              </View>
            ) : (
              <FlatList
                data={histories}
                renderItem={renderItem}
                keyExtractor={(item) => String(item.history_no)}
                contentContainerStyle={styles.listContent}
              />
            )}
          </>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 60,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    gap: 10,
  },
  historyItem: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 12,
    gap: 12,
  },
  historyTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  historyPreview: {
    fontSize: 13,
    color: '#888',
    lineHeight: 18,
    marginBottom: 6,
  },
  historyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  historyTime: {
    fontSize: 11,
    color: '#999',
    fontWeight: '500',
  },
  historyDate: {
    fontSize: 11,
    color: '#bbb',
    marginLeft: 4,
  },
  historyActions: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  restoreBtn: {
    padding: 6,
  },
  // Preview
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  previewDate: {
    fontSize: 14,
    fontWeight: '600',
  },
  previewActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  previewRestoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  previewRestoreText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  previewContent: {
    padding: 20,
  },
  previewTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
  },
  previewBody: {
    fontSize: 15,
    lineHeight: 24,
  },
});
