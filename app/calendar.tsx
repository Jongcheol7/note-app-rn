import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  FlatList,
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { AuthGuard } from '@/components/AuthGuard';
import { useAuth } from '@/lib/AuthContext';
import { fetchMonthlyAlarms } from '@/lib/services/calendarService';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export default function CalendarScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const { user } = useAuth();

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());

  const { data: alarms = [], isLoading } = useQuery({
    queryKey: ['monthlyAlarms', year, month],
    queryFn: () => fetchMonthlyAlarms(user!.id, year, month),
    enabled: !!user,
  });

  // Days with alarms
  const alarmDays = useMemo(() => {
    const days = new Set<number>();
    alarms.forEach((a: any) => {
      const d = new Date(a.alarmDatetime);
      days.add(d.getDate());
    });
    return days;
  }, [alarms]);

  // Selected day's notes
  const selectedNotes = useMemo(() => {
    if (!selectedDay) return [];
    return alarms.filter((a: any) => {
      const d = new Date(a.alarmDatetime);
      return d.getDate() === selectedDay;
    });
  }, [alarms, selectedDay]);

  // Calendar grid
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month - 1, 1).getDay();
    const daysInMonth = new Date(year, month, 0).getDate();
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  }, [year, month]);

  const isToday = (day: number) =>
    day === today.getDate() &&
    month === today.getMonth() + 1 &&
    year === today.getFullYear();

  const prevMonth = () => {
    if (month === 1) { setYear(year - 1); setMonth(12); }
    else setMonth(month - 1);
    setSelectedDay(null);
  };

  const nextMonth = () => {
    if (month === 12) { setYear(year + 1); setMonth(1); }
    else setMonth(month + 1);
    setSelectedDay(null);
  };

  return (
    <AuthGuard showLogin>
      <SafeAreaView
        style={{ flex: 1, backgroundColor: isDark ? '#000' : '#fff' }}
        edges={['top']}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: isDark ? '#333' : '#eee' }]}>
          <Pressable onPress={() => router.back()} style={{ padding: 6 }}>
            <Ionicons name="arrow-back" size={24} color={isDark ? '#fff' : '#000'} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: isDark ? '#fff' : '#000' }]}>
            캘린더
          </Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Month navigation */}
        <View style={styles.monthNav}>
          <Pressable onPress={prevMonth}><Ionicons name="chevron-back" size={24} color={isDark ? '#ccc' : '#555'} /></Pressable>
          <Text style={[styles.monthText, { color: isDark ? '#fff' : '#000' }]}>
            {year}년 {month}월
          </Text>
          <Pressable onPress={nextMonth}><Ionicons name="chevron-forward" size={24} color={isDark ? '#ccc' : '#555'} /></Pressable>
        </View>

        {/* Weekday headers */}
        <View style={styles.weekRow}>
          {WEEKDAYS.map((d, i) => (
            <Text
              key={d}
              style={[
                styles.weekday,
                i === 0 && { color: '#ef4444' },
                i === 6 && { color: '#3b82f6' },
                i > 0 && i < 6 && { color: isDark ? '#aaa' : '#666' },
              ]}
            >
              {d}
            </Text>
          ))}
        </View>

        {/* Calendar grid */}
        {isLoading ? (
          <ActivityIndicator style={{ marginTop: 20 }} />
        ) : (
          <View style={styles.grid}>
            {calendarDays.map((day, idx) => {
              const dayOfWeek = idx % 7;
              return (
                <Pressable
                  key={idx}
                  onPress={() => day && setSelectedDay(day)}
                  style={styles.dayCell}
                >
                  {day && (
                    <View
                      style={[
                        styles.dayInner,
                        selectedDay === day && styles.daySelected,
                        isToday(day) && !selectedDay && styles.dayToday,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          dayOfWeek === 0 && { color: '#ef4444' },
                          dayOfWeek === 6 && { color: '#3b82f6' },
                          dayOfWeek > 0 && dayOfWeek < 6 && { color: isDark ? '#ddd' : '#333' },
                          selectedDay === day && { color: '#fff' },
                        ]}
                      >
                        {day}
                      </Text>
                      {alarmDays.has(day) && (
                        <View style={styles.dot} />
                      )}
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        )}

        {/* Selected day's alarm notes */}
        {selectedDay && (
          <View style={styles.noteSection}>
            <Text style={[styles.noteSectionTitle, { color: isDark ? '#ccc' : '#555' }]}>
              {month}월 {selectedDay}일 알람
            </Text>
            {selectedNotes.length === 0 ? (
              <Text style={{ color: '#999', textAlign: 'center', paddingVertical: 12 }}>
                알람이 없습니다
              </Text>
            ) : (
              <FlatList
                data={selectedNotes}
                keyExtractor={(item: any) => String(item.noteNo)}
                renderItem={({ item }: { item: any }) => (
                  <Pressable
                    onPress={() => router.push(`/notes/${item.noteNo}` as any)}
                    style={[styles.noteItem, { borderBottomColor: isDark ? '#333' : '#f0f0f0' }]}
                  >
                    <Ionicons name="alarm-outline" size={16} color="#f59e0b" />
                    <Text
                      style={[styles.noteTitle, { color: isDark ? '#fff' : '#000' }]}
                      numberOfLines={1}
                    >
                      {item.title || '제목 없음'}
                    </Text>
                    <Text style={styles.noteTime}>
                      {new Date(item.alarmDatetime).toLocaleTimeString('ko-KR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </Pressable>
                )}
              />
            )}
          </View>
        )}
      </SafeAreaView>
    </AuthGuard>
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
  headerTitle: { fontSize: 18, fontWeight: '700' },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 20,
  },
  monthText: { fontSize: 17, fontWeight: '700' },
  weekRow: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    marginBottom: 4,
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
  },
  dayCell: {
    width: '14.28%',
    alignItems: 'center',
    paddingVertical: 4,
  },
  dayInner: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
  },
  daySelected: { backgroundColor: '#FF6B6B' },
  dayToday: { backgroundColor: '#e5e7eb' },
  dayText: { fontSize: 14 },
  dot: {
    position: 'absolute',
    bottom: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#3b82f6',
  },
  noteSection: { flex: 1, paddingHorizontal: 16, paddingTop: 8 },
  noteSectionTitle: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 8,
  },
  noteTitle: { flex: 1, fontSize: 14, fontWeight: '500' },
  noteTime: { fontSize: 12, color: '#999' },
});
