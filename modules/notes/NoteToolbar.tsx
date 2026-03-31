import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  Text,
  StyleSheet,
  useColorScheme,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBridgeState } from '@10play/tentap-editor';
import type { useEditorBridge } from '@10play/tentap-editor';

type Editor = ReturnType<typeof useEditorBridge>;

// Highlight colors (same as original)
const HIGHLIGHT_COLORS = [
  '#fef08a', '#bbf7d0', '#bfdbfe', '#fbcfe8', '#fed7aa', '#e9d5ff',
];
// Text colors (same as original)
const TEXT_COLORS = [
  '#000000', '#e11d48', '#f97316', '#eab308', '#10b981',
  '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280',
];

interface NoteToolbarProps {
  editor: Editor;
  onImagePress?: () => void;
}

export default function NoteToolbar({ editor, onImagePress }: NoteToolbarProps) {
  const isDark = useColorScheme() === 'dark';
  const editorState = useBridgeState(editor);
  const [expanded, setExpanded] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState<'text' | 'highlight' | null>(null);

  const bgColor = isDark ? '#1a1a1a' : '#fff';
  const borderColor = isDark ? '#333' : '#e5e5e5';
  const iconColor = isDark ? '#ccc' : '#555';
  const activeColor = '#3b82f6';

  const ToolBtn = ({
    icon,
    onPress,
    isActive,
    label,
  }: {
    icon: string;
    onPress: () => void;
    isActive?: boolean;
    label?: string;
  }) => (
    <Pressable
      onPress={onPress}
      style={[
        styles.toolBtn,
        isActive && { backgroundColor: isDark ? '#333' : '#e5e7eb' },
      ]}
    >
      {label ? (
        <Text
          style={[
            styles.toolLabel,
            { color: isActive ? activeColor : iconColor },
          ]}
        >
          {label}
        </Text>
      ) : (
        <Ionicons
          name={icon as any}
          size={20}
          color={isActive ? activeColor : iconColor}
        />
      )}
    </Pressable>
  );

  return (
    <View style={[styles.container, { backgroundColor: bgColor, borderTopColor: borderColor }]}>
      {/* Row 1: Main tools */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        <ToolBtn
          icon={expanded ? 'chevron-up' : 'chevron-down'}
          onPress={() => setExpanded(!expanded)}
        />
        <ToolBtn
          icon="arrow-undo"
          onPress={() => editor.undo()}
        />
        <ToolBtn
          icon="arrow-redo"
          onPress={() => editor.redo()}
        />
        <View style={styles.separator} />
        <ToolBtn
          label="B"
          onPress={() => editor.toggleBold()}
          isActive={editorState.isBoldActive}
        />
        <ToolBtn
          label="I"
          onPress={() => editor.toggleItalic()}
          isActive={editorState.isItalicActive}
        />
        <ToolBtn
          label="U"
          onPress={() => editor.toggleUnderline()}
          isActive={editorState.isUnderlineActive}
        />
        <ToolBtn
          label="S"
          onPress={() => editor.toggleStrike()}
          isActive={editorState.isStrikeActive}
        />
        <View style={styles.separator} />
        <ToolBtn
          icon="color-fill"
          onPress={() => setShowColorPicker('highlight')}
        />
        <ToolBtn
          icon="text"
          onPress={() => setShowColorPicker('text')}
        />
        {onImagePress && (
          <ToolBtn icon="image-outline" onPress={onImagePress} />
        )}
      </ScrollView>

      {/* Row 2: Extended tools (collapsible) */}
      {expanded && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
          <ToolBtn
            label="H1"
            onPress={() => editor.toggleHeading(1)}
            isActive={editorState.headingLevel === 1}
          />
          <ToolBtn
            label="H2"
            onPress={() => editor.toggleHeading(2)}
            isActive={editorState.headingLevel === 2}
          />
          <ToolBtn
            label="H3"
            onPress={() => editor.toggleHeading(3)}
            isActive={editorState.headingLevel === 3}
          />
          <View style={styles.separator} />
          <ToolBtn
            icon="list"
            onPress={() => editor.toggleBulletList()}
            isActive={editorState.isBulletListActive}
          />
          <ToolBtn
            icon="list-outline"
            onPress={() => editor.toggleOrderedList()}
            isActive={editorState.isOrderedListActive}
          />
          <ToolBtn
            icon="checkbox-outline"
            onPress={() => editor.toggleTaskList()}
            isActive={editorState.isTaskListActive}
          />
          <View style={styles.separator} />
          <ToolBtn
            icon="code-slash"
            onPress={() => editor.toggleCode()}
            isActive={editorState.isCodeActive}
          />
          <ToolBtn
            icon="reorder-three"
            onPress={() => editor.toggleBlockquote()}
            isActive={editorState.isBlockquoteActive}
          />
          <ToolBtn
            icon="remove-outline"
            onPress={() => editor.setHorizontalRule()}
          />
          <ToolBtn
            icon="link-outline"
            onPress={() => editor.setLink({ href: '' })}
            isActive={editorState.isLinkActive}
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
          style={styles.colorModalOverlay}
          onPress={() => setShowColorPicker(null)}
        >
          <View style={[styles.colorPicker, { backgroundColor: bgColor }]}>
            <Text style={[styles.colorPickerTitle, { color: isDark ? '#fff' : '#000' }]}>
              {showColorPicker === 'highlight' ? '형광펜 색상' : '글자 색상'}
            </Text>
            <View style={styles.colorGrid}>
              {(showColorPicker === 'highlight' ? HIGHLIGHT_COLORS : TEXT_COLORS).map((color) => (
                <Pressable
                  key={color}
                  onPress={() => {
                    if (showColorPicker === 'highlight') {
                      editor.toggleHighlight({ color });
                    } else {
                      editor.setColor(color);
                    }
                    setShowColorPicker(null);
                  }}
                  style={[styles.colorSwatch, { backgroundColor: color }]}
                />
              ))}
              {/* Clear button */}
              <Pressable
                onPress={() => {
                  if (showColorPicker === 'highlight') {
                    editor.toggleHighlight();
                  } else {
                    editor.setColor('#000000');
                  }
                  setShowColorPicker(null);
                }}
                style={[styles.colorSwatch, styles.clearSwatch]}
              >
                <Ionicons name="close" size={16} color="#999" />
              </Pressable>
            </View>
          </View>
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
    backgroundColor: '#ddd',
    marginHorizontal: 4,
  },
  colorModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  colorPicker: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
  },
  colorPickerTitle: {
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
});
