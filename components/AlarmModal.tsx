import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  StyleSheet,
  useColorScheme,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Native-only: DateTimePicker
let DateTimePicker: any = null;
if (Platform.OS !== 'web') {
  try {
    DateTimePicker = require('@react-native-community/datetimepicker').default;
  } catch {}
}

interface AlarmModalProps {
  visible: boolean;
  currentAlarm: string | null;
  onSet: (datetime: string) => void;
  onClear: () => void;
  onClose: () => void;
}

function formatDisplay(datetime: string | null): string {
  if (!datetime) return '알람 없음';
  const d = new Date(datetime);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function toDatetimeLocalValue(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${d}T${h}:${min}`;
}

export default function AlarmModal({
  visible,
  currentAlarm,
  onSet,
  onClear,
  onClose,
}: AlarmModalProps) {
  const isDark = useColorScheme() === 'dark';
  const [selectedDate, setSelectedDate] = useState(
    currentAlarm ? new Date(currentAlarm) : new Date()
  );
  const [showNativePicker, setShowNativePicker] = useState<'date' | 'time' | null>(null);

  useEffect(() => {
    if (visible) {
      setSelectedDate(currentAlarm ? new Date(currentAlarm) : new Date());
      if (Platform.OS === 'android') {
        setShowNativePicker(null);
      }
    }
  }, [visible, currentAlarm]);

  const handleConfirm = () => {
    onSet(selectedDate.toISOString());
    onClose();
  };

  const handleNativeChange = (_event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      // Android: picker closes on select, chain date → time
      if (!date) {
        setShowNativePicker(null);
        return;
      }
      if (showNativePicker === 'date') {
        setSelectedDate(date);
        setShowNativePicker('time');
      } else {
        setSelectedDate(date);
        setShowNativePicker(null);
      }
    } else if (date) {
      setSelectedDate(date);
    }
  };

  const bgColor = isDark ? '#1a1a1a' : '#fff';
  const surfaceColor = isDark ? '#333' : '#f3f4f6';
  const textColor = isDark ? '#fff' : '#000';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[styles.container, { backgroundColor: bgColor }]}
          onPress={(e) => e.stopPropagation()}
        >
          <Text
            style={[styles.title, { color: textColor }]}
            accessibilityRole="header"
          >
            알람 설정
          </Text>

          {currentAlarm && (
            <Text style={styles.currentAlarm}>
              현재: {formatDisplay(currentAlarm)}
            </Text>
          )}

          {/* Web: native datetime-local input */}
          {Platform.OS === 'web' && (
            <input
              type="datetime-local"
              value={toDatetimeLocalValue(selectedDate)}
              onChange={(e: any) => {
                const d = new Date(e.target.value);
                if (!isNaN(d.getTime())) setSelectedDate(d);
              }}
              style={{
                fontSize: 16,
                padding: 12,
                borderRadius: 8,
                border: `1px solid ${isDark ? '#555' : '#ddd'}`,
                backgroundColor: surfaceColor,
                color: textColor,
                marginBottom: 16,
                width: '100%',
                outline: 'none',
              }}
            />
          )}

          {/* iOS: inline DateTimePicker */}
          {Platform.OS === 'ios' && DateTimePicker && (
            <View style={{ marginBottom: 16 }}>
              <DateTimePicker
                value={selectedDate}
                mode="datetime"
                display="spinner"
                onChange={handleNativeChange}
                locale="ko"
                themeVariant={isDark ? 'dark' : 'light'}
              />
            </View>
          )}

          {/* Android: button to open picker */}
          {Platform.OS === 'android' && (
            <View style={{ marginBottom: 16 }}>
              <Pressable
                onPress={() => setShowNativePicker('date')}
                style={[styles.dateButton, { backgroundColor: surfaceColor }]}
                accessibilityLabel="날짜 및 시간 선택"
                accessibilityRole="button"
              >
                <Ionicons name="calendar-outline" size={20} color={textColor} />
                <Text style={[styles.dateButtonText, { color: textColor }]}>
                  {formatDisplay(selectedDate.toISOString())}
                </Text>
                <Ionicons name="chevron-forward" size={16} color={isDark ? '#999' : '#666'} />
              </Pressable>

              {showNativePicker && DateTimePicker && (
                <DateTimePicker
                  value={selectedDate}
                  mode={showNativePicker}
                  display="default"
                  onChange={handleNativeChange}
                  is24Hour
                />
              )}
            </View>
          )}

          {/* Selected date display */}
          <View style={[styles.previewRow, { backgroundColor: surfaceColor }]}>
            <Ionicons name="alarm-outline" size={18} color="#FF6B6B" />
            <Text style={[styles.previewText, { color: textColor }]}>
              {formatDisplay(selectedDate.toISOString())}
            </Text>
          </View>

          <View style={styles.btnRow}>
            {currentAlarm && (
              <Pressable
                onPress={() => {
                  onClear();
                  onClose();
                }}
                style={styles.clearBtn}
                accessibilityLabel="알람 해제"
                accessibilityRole="button"
              >
                <Ionicons name="trash-outline" size={18} color="#ef4444" />
                <Text style={styles.clearText}>알람 해제</Text>
              </Pressable>
            )}
            <Pressable
              onPress={handleConfirm}
              style={styles.confirmBtn}
              accessibilityLabel="알람 설정 확인"
              accessibilityRole="button"
            >
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
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
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
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 10,
  },
  dateButtonText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  previewText: {
    fontSize: 14,
    fontWeight: '500',
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
