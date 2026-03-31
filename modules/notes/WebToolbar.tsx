import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/lib/theme';

interface WebToolbarProps {
  onImagePress?: () => void;
}

export default function WebToolbar({ onImagePress }: WebToolbarProps) {
  const colors = useThemeColors();

  const exec = (command: string, value?: string) => {
    document.execCommand(command, false, value);
  };

  const ToolBtn = ({ icon, onPress, label }: { icon?: string; onPress: () => void; label?: string }) => (
    <Pressable onPress={onPress} style={styles.toolBtn}>
      {label ? (
        <Text style={[styles.toolLabel, { color: colors.textSecondary }]}>{label}</Text>
      ) : (
        <Ionicons name={icon as any} size={20} color={colors.textSecondary} />
      )}
    </Pressable>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
      <ToolBtn label="B" onPress={() => exec('bold')} />
      <ToolBtn label="I" onPress={() => exec('italic')} />
      <ToolBtn label="U" onPress={() => exec('underline')} />
      <ToolBtn label="S" onPress={() => exec('strikeThrough')} />
      <View style={[styles.separator, { backgroundColor: colors.border }]} />
      <ToolBtn icon="list" onPress={() => exec('insertUnorderedList')} />
      <ToolBtn icon="list-outline" onPress={() => exec('insertOrderedList')} />
      <View style={[styles.separator, { backgroundColor: colors.border }]} />
      <ToolBtn icon="arrow-undo" onPress={() => exec('undo')} />
      <ToolBtn icon="arrow-redo" onPress={() => exec('redo')} />
      {onImagePress && (
        <>
          <View style={[styles.separator, { backgroundColor: colors.border }]} />
          <ToolBtn icon="image-outline" onPress={onImagePress} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 6,
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
});
