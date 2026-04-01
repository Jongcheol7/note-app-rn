import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  useColorScheme,
  Alert,
  Modal,
  Platform,
} from 'react-native';
import { hapticMedium } from '@/lib/utils/haptics';
import { useThemeColors } from '@/lib/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useNoteFormStore } from '@/store/useNoteFormStore';

interface Props {
  onSave: () => void;
  isSaving: boolean;
  isNew: boolean;
  onDelete?: () => void;
  onTogglePublic?: () => void;
  onToggleColor?: () => void;
  onSetAlarm?: () => void;
  isPublic?: boolean;
}

const NOTE_COLORS = [
  '#FEF3C7', '#FDE68A', '#D9F99D', '#BBF7D0',
  '#BAE6FD', '#BFDBFE', '#C4B5FD', '#DDD6FE',
  '#FBCFE8', '#FCA5A5', '#FED7AA', '#E5E7EB',
];

export default function NoteDetailHeader({
  onSave,
  isSaving,
  isNew,
  onDelete,
  onTogglePublic,
  onToggleColor,
  onSetAlarm,
  isPublic,
}: Props) {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const isDirty = useNoteFormStore((s) => s.isDirty);
  const [showMenu, setShowMenu] = useState(false);

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  const handleBack = () => {
    if (isDirty) {
      if (Platform.OS === 'web') {
        if (window.confirm('저장하지 않은 변경사항이 있습니다. 나가시겠습니까?')) {
          goBack();
        }
      } else {
        Alert.alert('저장하지 않은 변경사항', '저장하지 않고 나가시겠습니까?', [
          { text: '취소', style: 'cancel' },
          { text: '나가기', style: 'destructive', onPress: goBack },
        ]);
      }
    } else {
      goBack();
    }
  };

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: isDark ? '#000' : '#fff',
          borderBottomColor: isDark ? '#333' : '#eee',
        },
      ]}
    >
      <Pressable onPress={handleBack} style={styles.iconBtn} accessibilityLabel="뒤로 가기" accessibilityRole="button">
        <Ionicons name="arrow-back" size={24} color={isDark ? '#fff' : '#000'} />
      </Pressable>

      <View style={styles.rightSection}>
        <Pressable
          onPress={onSave}
          disabled={isSaving}
          style={[styles.saveBtn, isSaving && { opacity: 0.5 }]}
          accessibilityLabel={isSaving ? '저장 중' : '노트 저장'}
          accessibilityRole="button"
        >
          <Text style={styles.saveBtnText}>
            {isSaving ? '저장 중...' : '저장'}
          </Text>
        </Pressable>

        {!isNew && (
          <Pressable onPress={() => setShowMenu(true)} style={styles.iconBtn} accessibilityLabel="더보기 메뉴" accessibilityRole="button">
            <Ionicons
              name="ellipsis-vertical"
              size={22}
              color={isDark ? '#ccc' : '#555'}
            />
          </Pressable>
        )}
      </View>

      {/* Action menu modal */}
      <Modal
        visible={showMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowMenu(false)}
        >
          <View
            style={[
              styles.menuContainer,
              { backgroundColor: isDark ? '#1a1a1a' : '#fff' },
            ]}
          >
            <Pressable
              onPress={() => {
                setShowMenu(false);
                onTogglePublic?.();
              }}
              style={styles.menuItem}
              accessibilityLabel={isPublic ? '비공개로 전환' : '공개로 전환'}
              accessibilityRole="button"
            >
              <Ionicons
                name={isPublic ? 'lock-closed-outline' : 'globe-outline'}
                size={20}
                color={isDark ? '#ccc' : '#555'}
              />
              <Text style={[styles.menuText, isDark && { color: '#fff' }]}>
                {isPublic ? '비공개로 전환' : '공개로 전환'}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setShowMenu(false);
                onSetAlarm?.();
              }}
              style={styles.menuItem}
              accessibilityLabel="알람 설정"
              accessibilityRole="button"
            >
              <Ionicons name="alarm-outline" size={20} color={isDark ? '#ccc' : '#555'} />
              <Text style={[styles.menuText, isDark && { color: '#fff' }]}>
                알람 설정
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setShowMenu(false);
                onToggleColor?.();
              }}
              style={styles.menuItem}
              accessibilityLabel="배경색 변경"
              accessibilityRole="button"
            >
              <Ionicons name="color-palette-outline" size={20} color={isDark ? '#ccc' : '#555'} />
              <Text style={[styles.menuText, isDark && { color: '#fff' }]}>
                배경색 변경
              </Text>
            </Pressable>

            <Pressable
              accessibilityLabel="노트 삭제"
              accessibilityRole="button"
              onPress={() => {
                setShowMenu(false);
                Alert.alert('삭제', '이 노트를 삭제하시겠습니까?', [
                  { text: '취소', style: 'cancel' },
                  {
                    text: '삭제',
                    style: 'destructive',
                    onPress: onDelete,
                  },
                ]);
              }}
              style={styles.menuItem}
            >
              <Ionicons name="trash-outline" size={20} color="#ef4444" />
              <Text style={[styles.menuText, { color: '#ef4444' }]}>삭제</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
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
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconBtn: {
    padding: 6,
  },
  saveBtn: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  menuText: {
    fontSize: 15,
    color: '#000',
  },
});
