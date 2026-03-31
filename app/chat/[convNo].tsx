import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  StyleSheet,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AuthGuard } from '@/components/AuthGuard';
import { useAuth } from '@/lib/AuthContext';
import {
  fetchMessages,
  sendMessage,
  markMessagesRead,
} from '@/lib/services/chatService';
import { supabase } from '@/lib/supabase';

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
}

function formatDateHeader(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export default function ChatRoomScreen() {
  const { convNo: convNoStr } = useLocalSearchParams<{ convNo: string }>();
  const convNo = convNoStr ? parseInt(convNoStr, 10) : null;
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const flatListRef = useRef<FlatList>(null);

  const [text, setText] = useState('');

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['messages', convNo],
    queryFn: () => fetchMessages(convNo!),
    enabled: !!convNo,
    // Realtime subscription handles live updates; only refetch on focus as fallback
    refetchOnWindowFocus: true,
  });

  // Mark messages as read
  useEffect(() => {
    if (convNo && user) {
      markMessagesRead(convNo, user.id);
    }
  }, [convNo, user, messages.length]);

  // Supabase Realtime subscription
  useEffect(() => {
    if (!convNo || !supabase) return;
    const channel = supabase
      .channel(`messages:${convNo}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'message', filter: `conv_no=eq.${convNo}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ['messages', convNo] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [convNo]);

  // Auto scroll to bottom
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length]);

  const sendMutation = useMutation({
    mutationFn: (content: string) => sendMessage(convNo!, user!.id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', convNo] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  const handleSend = useCallback(() => {
    const content = text.trim();
    if (!content) return;
    sendMutation.mutate(content);
    setText('');
  }, [text, sendMutation]);

  // Group messages by date
  const messagesWithDates = React.useMemo(() => {
    const result: any[] = [];
    let lastDate = '';
    messages.forEach((msg: any) => {
      const date = new Date(msg.inputDatetime).toDateString();
      if (date !== lastDate) {
        result.push({ type: 'date', date: msg.inputDatetime, id: `date-${date}` });
        lastDate = date;
      }
      result.push({ type: 'message', ...msg, id: String(msg.msgNo) });
    });
    return result;
  }, [messages]);

  return (
    <AuthGuard showLogin>
      <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#000' : '#fff' }}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: isDark ? '#333' : '#eee' }]}>
          <Pressable onPress={() => router.back()} style={{ padding: 6 }}>
            <Ionicons name="arrow-back" size={24} color={isDark ? '#fff' : '#000'} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: isDark ? '#fff' : '#000' }]}>채팅</Text>
          <View style={{ width: 36 }} />
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={0}
        >
          {isLoading ? (
            <View style={styles.center}><ActivityIndicator size="large" /></View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messagesWithDates}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 8 }}
              renderItem={({ item }) => {
                if (item.type === 'date') {
                  return (
                    <View style={styles.dateHeader}>
                      <Text style={styles.dateText}>{formatDateHeader(item.date)}</Text>
                    </View>
                  );
                }
                const isMe = item.senderId === user?.id;
                return (
                  <View style={[styles.msgRow, isMe && styles.msgRowMe]}>
                    <View
                      style={[
                        styles.bubble,
                        isMe ? styles.bubbleMe : styles.bubbleOther,
                        isDark && !isMe && { backgroundColor: '#333' },
                      ]}
                    >
                      <Text style={[styles.msgText, isMe && { color: '#fff' }, isDark && !isMe && { color: '#fff' }]}>
                        {item.content}
                      </Text>
                    </View>
                    <View style={[styles.msgMeta, isMe && { alignItems: 'flex-end' }]}>
                      {!item.isRead && !isMe && (
                        <Text style={styles.unreadBadge}>1</Text>
                      )}
                      <Text style={styles.timeText}>{formatTime(item.inputDatetime)}</Text>
                    </View>
                  </View>
                );
              }}
            />
          )}

          {/* Input bar */}
          <View style={[styles.inputBar, { borderTopColor: isDark ? '#333' : '#eee', backgroundColor: isDark ? '#1a1a1a' : '#fff' }]}>
            <TextInput
              style={[styles.input, { color: isDark ? '#fff' : '#000', backgroundColor: isDark ? '#333' : '#f3f4f6' }]}
              placeholder="메시지 입력..."
              placeholderTextColor="#999"
              value={text}
              onChangeText={setText}
              onSubmitEditing={handleSend}
              returnKeyType="send"
            />
            <Pressable
              onPress={handleSend}
              disabled={!text.trim()}
              style={[styles.sendBtn, !text.trim() && { opacity: 0.4 }]}
            >
              <Ionicons name="send" size={20} color="#fff" />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  dateHeader: { alignItems: 'center', paddingVertical: 8 },
  dateText: { fontSize: 12, color: '#999', backgroundColor: '#f3f4f6', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  msgRow: { marginBottom: 8, alignItems: 'flex-start' },
  msgRowMe: { alignItems: 'flex-end' },
  bubble: { maxWidth: '75%', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 16 },
  bubbleMe: { backgroundColor: '#FF6B6B', borderBottomRightRadius: 4 },
  bubbleOther: { backgroundColor: '#f3f4f6', borderBottomLeftRadius: 4 },
  msgText: { fontSize: 14, lineHeight: 20, color: '#000' },
  msgMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2, paddingHorizontal: 4 },
  unreadBadge: { fontSize: 10, color: '#f59e0b', fontWeight: '700' },
  timeText: { fontSize: 10, color: '#999' },
  inputBar: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12,
    paddingVertical: 8, borderTopWidth: 1, gap: 8,
  },
  input: { flex: 1, fontSize: 14, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20 },
  sendBtn: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: '#FF6B6B',
    justifyContent: 'center', alignItems: 'center',
  },
});
