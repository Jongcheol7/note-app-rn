import React from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const NOTE_COLORS = [
  '#FEF3C7', '#FDE68A', '#D9F99D', '#BBF7D0',
  '#BAE6FD', '#BFDBFE', '#C4B5FD', '#DDD6FE',
  '#FBCFE8', '#FCA5A5', '#FED7AA', '#E5E7EB',
];

interface ColorPickerModalProps {
  visible: boolean;
  currentColor: string;
  onSelect: (color: string) => void;
  onClose: () => void;
}

export default function ColorPickerModal({
  visible,
  currentColor,
  onSelect,
  onClose,
}: ColorPickerModalProps) {
  const isDark = useColorScheme() === 'dark';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View
          style={[
            styles.container,
            { backgroundColor: isDark ? '#1a1a1a' : '#fff' },
          ]}
        >
          <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]}>
            배경색 선택
          </Text>
          <View style={styles.grid}>
            {NOTE_COLORS.map((color) => (
              <Pressable
                key={color}
                onPress={() => {
                  onSelect(color);
                  onClose();
                }}
                style={[
                  styles.swatch,
                  { backgroundColor: color },
                  currentColor === color && styles.swatchActive,
                ]}
                accessibilityLabel={`배경색 ${color}`}
                accessibilityRole="button"
                accessibilityState={{ selected: currentColor === color }}
              >
                {currentColor === color && (
                  <Ionicons name="checkmark" size={18} color="#000" />
                )}
              </Pressable>
            ))}
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    paddingBottom: 20,
  },
  swatch: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  swatchActive: {
    borderWidth: 3,
    borderColor: '#000',
  },
});
