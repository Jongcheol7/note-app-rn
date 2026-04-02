import React from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  Image,
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { AuthGuard } from '@/components/AuthGuard';
import { useAuth } from '@/lib/AuthContext';
import { fetchConversations, fetchUnreadCount } from '@/lib/services/chatService';

function formatTime(dateStr: string | null) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) {
    return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  }
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export default function ChatListScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const { user } = useAuth();

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => fetchConversations(user!.id),
    enabled: !!user,
    refetchInterval: 5000, // Poll every 5 seconds
  });

  return (
    <AuthGuard showLogin>
      <SafeAreaView style={[styles.outer, { backgroundColor: isDark ? '#000' : '#fff' }]} edges={['top']}>
        <View style={styles.inner}>
        <View style={[styles.header, { borderBottomColor: isDark ? '#333' : '#eee' }]}>
          <Text style={[styles.headerTitle, { color: isDark ? '#fff' : '#000' }]}>채팅</Text>
        </View>

        {isLoading ? (
          <View style={styles.center}><ActivityIndicator size="large" /></View>
        ) : (
          <FlatList
            data={conversations}
            keyExtractor={(item: any) => String(item.convNo)}
            contentContainerStyle={conversations.length === 0 ? { flex: 1 } : undefined}
            ListEmptyComponent={
              <View style={styles.center}>
                <Text style={{ color: '#999', fontSize: 15 }}>대화가 없습니다</Text>
              </View>
            }
            renderItem={({ item }: { item: any }) => {
              const other = item.user1?.id === user?.id ? item.user2 : item.user1;
              const avatarUrl = other?.profileImage || other?.image;

              return (
                <Pressable
                  onPress={() => router.push(`/chat/${item.convNo}` as any)}
                  style={[styles.convItem, { borderBottomColor: isDark ? '#333' : '#f0f0f0' }]}
                >
                  {avatarUrl ? (
                    <Image source={{ uri: avatarUrl }} style={styles.avatar} />
                  ) : (
                    <View style={[styles.avatar, styles.avatarPlaceholder]}>
                      <Text style={styles.avatarText}>
                        {(other?.nickname || other?.name || '?')[0]}
                      </Text>
                    </View>
                  )}
                  <View style={styles.convContent}>
                    <View style={styles.convTop}>
                      <Text style={[styles.convName, { color: isDark ? '#fff' : '#000' }]}>
                        {other?.nickname || other?.name || '익명'}
                      </Text>
                      <Text style={styles.convTime}>
                        {formatTime(item.lastDatetime)}
                      </Text>
                    </View>
                    <Text style={styles.convLastMsg} numberOfLines={1}>
                      {item.lastMessage || ''}
                    </Text>
                  </View>
                </Pressable>
              );
            }}
          />
        )}
        </View>
      </SafeAreaView>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    alignItems: 'center',
  },
  inner: {
    flex: 1,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 1200 : undefined,
  },
  header: {
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 20, fontWeight: '800' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  convItem: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
    paddingVertical: 14, borderBottomWidth: 1, gap: 12,
  },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  avatarPlaceholder: { backgroundColor: '#ddd', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 18, fontWeight: '600', color: '#666' },
  convContent: { flex: 1 },
  convTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  convName: { fontSize: 15, fontWeight: '600' },
  convTime: { fontSize: 12, color: '#999' },
  convLastMsg: { fontSize: 13, color: '#999' },
});
