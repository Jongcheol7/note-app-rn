import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  Text,
  TextInput,
  Modal,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/lib/theme';

const HIGHLIGHT_COLORS = [
  '#fef08a', '#bbf7d0', '#bfdbfe', '#fbcfe8', '#fed7aa', '#e9d5ff',
];
const TEXT_COLORS = [
  '#000000', '#e11d48', '#f97316', '#eab308', '#10b981',
  '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280',
];

interface WebToolbarProps {
  onImagePress?: () => void;
  bgColor?: string;
}

export default function WebToolbar({ onImagePress, bgColor: noteBgColor }: WebToolbarProps) {
  const isDark = useColorScheme() === 'dark';
  const colors = useThemeColors();
  const [expanded, setExpanded] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState<'text' | 'highlight' | null>(null);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  const activeColor = '#3b82f6';
  const iconColor = colors.textSecondary;

  const exec = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
  }, []);

  const formatBlock = useCallback((tag: string) => {
    document.execCommand('formatBlock', false, tag);
  }, []);

  const isActive = useCallback((command: string): boolean => {
    try {
      return document.queryCommandState(command);
    } catch {
      return false;
    }
  }, []);

  const getBlockTag = useCallback((): string => {
    try {
      return document.queryCommandValue('formatBlock').toLowerCase();
    } catch {
      return '';
    }
  }, []);

  const insertHR = useCallback(() => {
    document.execCommand('insertHorizontalRule');
  }, []);

  const insertLink = useCallback((url: string) => {
    if (url.trim()) {
      document.execCommand('createLink', false, url.trim());
    }
  }, []);

  const removeLink = useCallback(() => {
    document.execCommand('unlink');
  }, []);

  const insertCheckbox = useCallback(() => {
    const checkbox = '<input type="checkbox" style="margin-right:6px;vertical-align:middle;" />';
    document.execCommand('insertHTML', false, checkbox);
  }, []);

  const ToolBtn = ({
    icon,
    onPress,
    isActive: active,
    label,
    accessibilityLabel: a11yLabel,
  }: {
    icon?: string;
    onPress: () => void;
    isActive?: boolean;
    label?: string;
    accessibilityLabel?: string;
  }) => (
    <Pressable
      onPress={onPress}
      style={[
        styles.toolBtn,
        active && { backgroundColor: isDark ? '#333' : '#e5e7eb' },
      ]}
      accessibilityLabel={a11yLabel}
      accessibilityRole="button"
    >
      {label ? (
        <Text
          style={[
            styles.toolLabel,
            { color: active ? activeColor : iconColor },
          ]}
        >
          {label}
        </Text>
      ) : (
        <Ionicons
          name={icon as any}
          size={20}
          color={active ? activeColor : iconColor}
        />
      )}
    </Pressable>
  );

  const bgColor = isDark ? '#1a1a1a' : '#fff';

  return (
    <View style={[styles.container, { backgroundColor: noteBgColor || colors.surface, borderTopColor: colors.border }]}>
      {/* Row 1: Main tools */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        <ToolBtn
          icon={expanded ? 'chevron-up' : 'chevron-down'}
          onPress={() => setExpanded(!expanded)}
          accessibilityLabel={expanded ? '툴바 접기' : '툴바 펼치기'}
        />
        <ToolBtn
          icon="arrow-undo"
          onPress={() => exec('undo')}
          accessibilityLabel="실행 취소"
        />
        <ToolBtn
          icon="arrow-redo"
          onPress={() => exec('redo')}
          accessibilityLabel="다시 실행"
        />
        <View style={[styles.separator, { backgroundColor: colors.border }]} />
        <ToolBtn
          label="B"
          onPress={() => exec('bold')}
          isActive={isActive('bold')}
          accessibilityLabel="굵게"
        />
        <ToolBtn
          label="I"
          onPress={() => exec('italic')}
          isActive={isActive('italic')}
          accessibilityLabel="기울임"
        />
        <ToolBtn
          label="U"
          onPress={() => exec('underline')}
          isActive={isActive('underline')}
          accessibilityLabel="밑줄"
        />
        <ToolBtn
          label="S"
          onPress={() => exec('strikeThrough')}
          isActive={isActive('strikeThrough')}
          accessibilityLabel="취소선"
        />
        <View style={[styles.separator, { backgroundColor: colors.border }]} />
        <ToolBtn
          icon="color-fill"
          onPress={() => setShowColorPicker('highlight')}
          accessibilityLabel="형광펜 색상"
        />
        <ToolBtn
          icon="text"
          onPress={() => setShowColorPicker('text')}
          accessibilityLabel="글자 색상"
        />
        {onImagePress && (
          <ToolBtn
            icon="image-outline"
            onPress={onImagePress}
            accessibilityLabel="이미지 삽입"
          />
        )}
      </ScrollView>

      {/* Row 2: Extended tools */}
      {expanded && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
          <ToolBtn
            label="H1"
            onPress={() => formatBlock('h1')}
            isActive={getBlockTag() === 'h1'}
            accessibilityLabel="제목 1"
          />
          <ToolBtn
            label="H2"
            onPress={() => formatBlock('h2')}
            isActive={getBlockTag() === 'h2'}
            accessibilityLabel="제목 2"
          />
          <ToolBtn
            label="H3"
            onPress={() => formatBlock('h3')}
            isActive={getBlockTag() === 'h3'}
            accessibilityLabel="제목 3"
          />
          <View style={[styles.separator, { backgroundColor: colors.border }]} />
          <ToolBtn
            icon="list"
            onPress={() => exec('insertUnorderedList')}
            isActive={isActive('insertUnorderedList')}
            accessibilityLabel="글머리 기호 목록"
          />
          <ToolBtn
            icon="list-outline"
            onPress={() => exec('insertOrderedList')}
            isActive={isActive('insertOrderedList')}
            accessibilityLabel="번호 목록"
          />
          <ToolBtn
            icon="checkbox-outline"
            onPress={insertCheckbox}
            accessibilityLabel="체크박스"
          />
          <View style={[styles.separator, { backgroundColor: colors.border }]} />
          <ToolBtn
            icon="code-slash"
            onPress={() => formatBlock('pre')}
            isActive={getBlockTag() === 'pre'}
            accessibilityLabel="코드 블록"
          />
          <ToolBtn
            icon="reorder-three"
            onPress={() => formatBlock('blockquote')}
            isActive={getBlockTag() === 'blockquote'}
            accessibilityLabel="인용"
          />
          <ToolBtn
            icon="remove-outline"
            onPress={insertHR}
            accessibilityLabel="수평선"
          />
          <ToolBtn
            icon="link-outline"
            onPress={() => {
              setLinkUrl('');
              setShowLinkInput(true);
            }}
            accessibilityLabel="링크 삽입"
          />
        </ScrollView>
      )}

      {/* Color picker modal */}
      <Modal
        visible={showColorPicker !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setShowColorPicker(null)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowColorPicker(null)}
        >
          <View style={[styles.colorPicker, { backgroundColor: bgColor }]}>
            <Text style={[styles.pickerTitle, { color: isDark ? '#fff' : '#000' }]}>
              {showColorPicker === 'highlight' ? '형광펜 색상' : '글자 색상'}
            </Text>
            <View style={styles.colorGrid}>
              {(showColorPicker === 'highlight' ? HIGHLIGHT_COLORS : TEXT_COLORS).map((color) => (
                <Pressable
                  key={color}
                  onPress={() => {
                    if (showColorPicker === 'highlight') {
                      exec('hiliteColor', color);
                    } else {
                      exec('foreColor', color);
                    }
                    setShowColorPicker(null);
                  }}
                  style={[styles.colorSwatch, { backgroundColor: color }]}
                  accessibilityLabel={`색상 ${color}`}
                  accessibilityRole="button"
                />
              ))}
              <Pressable
                onPress={() => {
                  if (showColorPicker === 'highlight') {
                    exec('hiliteColor', 'transparent');
                  } else {
                    exec('foreColor', isDark ? '#ffffff' : '#000000');
                  }
                  setShowColorPicker(null);
                }}
                style={[styles.colorSwatch, styles.clearSwatch]}
                accessibilityLabel="색상 제거"
                accessibilityRole="button"
              >
                <Ionicons name="close" size={16} color="#999" />
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* Link URL input modal */}
      <Modal
        visible={showLinkInput}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLinkInput(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowLinkInput(false)}
        >
          <Pressable
            style={[styles.linkModal, { backgroundColor: bgColor }]}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={[styles.pickerTitle, { color: isDark ? '#fff' : '#000' }]}>
              링크 삽입
            </Text>
            <TextInput
              style={[
                styles.linkInput,
                {
                  color: isDark ? '#fff' : '#000',
                  backgroundColor: isDark ? '#333' : '#f3f4f6',
                  borderColor: isDark ? '#555' : '#ddd',
                },
              ]}
              placeholder="https://"
              placeholderTextColor="#999"
              value={linkUrl}
              onChangeText={setLinkUrl}
              autoFocus
              autoCapitalize="none"
              keyboardType="url"
              onSubmitEditing={() => {
                insertLink(linkUrl);
                setShowLinkInput(false);
              }}
            />
            <View style={styles.linkBtnRow}>
              <Pressable
                onPress={() => {
                  removeLink();
                  setShowLinkInput(false);
                }}
                style={styles.linkRemoveBtn}
                accessibilityLabel="링크 제거"
                accessibilityRole="button"
              >
                <Text style={{ color: '#ef4444', fontSize: 14, fontWeight: '500' }}>
                  링크 제거
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  insertLink(linkUrl);
                  setShowLinkInput(false);
                }}
                style={styles.linkConfirmBtn}
                accessibilityLabel="링크 확인"
                accessibilityRole="button"
              >
                <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>
                  확인
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 4,
    gap: 2,
  },
  toolBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
  },
  toolLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  separator: {
    width: 1,
    height: 20,
    marginHorizontal: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  colorPicker: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorSwatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  clearSwatch: {
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  linkModal: {
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 32,
    marginBottom: 100,
  },
  linkInput: {
    fontSize: 15,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  linkBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  linkRemoveBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  linkConfirmBtn: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
});
