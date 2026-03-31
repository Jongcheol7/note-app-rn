import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  TextInput,
  StyleSheet,
  useColorScheme,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AlarmModalProps {
  visible: boolean;
  currentAlarm: string | null;
  onSet: (datetime: string) => void;
  onClear: () => void;
  onClose: () => void;
}

function formatDateForInput(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${d}T${h}:${min}`;
}

function formatDisplay(datetime: string | null): string {
  if (!datetime) return '알람 없음';
  const d = new Date(datetime);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function AlarmModal({
  visible,
  currentAlarm,
  onSet,
  onClear,
  onClose,
}: AlarmModalProps) {
  const isDark = useColorScheme() === 'dark';
  const defaultDate = currentAlarm
    ? formatDateForInput(new Date(currentAlarm))
    : formatDateForInput(new Date());
  const [dateStr, setDateStr] = useState(defaultDate);

  const handleConfirm = () => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return;
    onSet(date.toISOString());
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[
            styles.container,
            { backgroundColor: isDark ? '#1a1a1a' : '#fff' },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]}>
            알람 설정
          </Text>

          {currentAlarm && (
            <Text style={styles.currentAlarm}>
              현재: {formatDisplay(currentAlarm)}
            </Text>
          )}

          <TextInput
            style={[
              styles.dateInput,
              {
                color: isDark ? '#fff' : '#000',
                backgroundColor: isDark ? '#333' : '#f3f4f6',
                borderColor: isDark ? '#555' : '#ddd',
              },
            ]}
            value={dateStr}
            onChangeText={setDateStr}
            placeholder="YYYY-MM-DDTHH:MM"
            placeholderTextColor="#999"
          />

          <View style={styles.btnRow}>
            {currentAlarm && (
              <Pressable
                onPress={() => {
                  onClear();
                  onClose();
                }}
                style={styles.clearBtn}
              >
                <Ionicons name="trash-outline" size={18} color="#ef4444" />
                <Text style={styles.clearText}>알람 해제</Text>
              </Pressable>
            )}
            <Pressable onPress={handleConfirm} style={styles.confirmBtn}>
              <Text style={styles.confirmText}>설정</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  container: {
    borderRadius: 16,
    padding: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  currentAlarm: {
    fontSize: 13,
    color: '#999',
    marginBottom: 12,
  },
  dateInput: {
    fontSize: 15,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  clearText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '500',
  },
  confirmBtn: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  confirmText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
