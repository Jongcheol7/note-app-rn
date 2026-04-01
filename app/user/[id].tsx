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
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AuthGuard } from '@/components/AuthGuard';
import { useAuth } from '@/lib/AuthContext';
import {
  fetchUserProfile,
  fetchUserPublicNotes,
  blockUser,
  unblockUser,
  isBlocked,
  reportUser,
} from '@/lib/services/userService';

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['userProfile', id],
    queryFn: () => fetchUserProfile(id!),
    enabled: !!id,
  });

  const { data: blocked } = useQuery({
    queryKey: ['isBlocked', id],
    queryFn: () => isBlocked(user!.id, id!),
    enabled: !!user && !!id,
  });

  const {
    data: notesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['userNotes', id],
    queryFn: ({ pageParam }) => fetchUserPublicNotes(id!, pageParam),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (last) => last.nextCursor,
    enabled: !!id,
  });

  const notes = notesData?.pages.flatMap((p) => p.notes) ?? [];

  const blockMutation = useMutation({
    mutationFn: () =>
      blocked ? unblockUser(user!.id, id!) : blockUser(user!.id, id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isBlocked', id] });
      queryClient.invalidateQueries({ queryKey: ['noteLists'] });
    },
  });

  const handleBlock = () => {
    const action = blocked ? '차단 해제' : '차단';
    Alert.alert(action, `이 사용자를 ${action}하시겠습니까?`, [
      { text: '취소', style: 'cancel' },
      { text: action, style: 'destructive', onPress: () => blockMutation.mutate() },
    ]);
  };

  const handleReport = () => {
    const reasons = ['스팸', '욕설/혐오', '부적절한 콘텐츠', '기타'];
    Alert.alert('신고 사유', undefined, [
      ...reasons.map((reason) => ({
        text: reason,
        onPress: () => {
          reportUser(user!.id, id!, null, reason);
          Alert.alert('신고 완료', '신고가 접수되었습니다.');
        },
      })),
      { text: '취소', style: 'cancel' },
    ]);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  const avatarUrl = profile?.profileImage || profile?.image;

  return (
    <AuthGuard showLogin>
      <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#000' : '#fff' }} edges={['top']}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: isDark ? '#333' : '#eee' }]}>
          <Pressable onPress={() => router.back()} style={{ padding: 6 }} accessibilityLabel="뒤로 가기" accessibilityRole="button">
            <Ionicons name="arrow-back" size={24} color={isDark ? '#fff' : '#000'} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: isDark ? '#fff' : '#000' }]} accessibilityRole="header">
            프로필
          </Text>
          <Pressable onPress={handleReport} style={{ padding: 6 }} accessibilityLabel="사용자 신고" accessibilityRole="button">
            <Ionicons name="flag-outline" size={22} color={isDark ? '#ccc' : '#555'} />
          </Pressable>
        </View>

        <FlatList
          data={notes}
          keyExtractor={(item: any) => String(item.noteNo)}
          ListHeaderComponent={
            <View style={styles.profileSection}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Text style={styles.avatarText}>
                    {(profile?.nickname || profile?.name || '?')[0]}
                  </Text>
                </View>
              )}
              <Text style={[styles.name, { color: isDark ? '#fff' : '#000' }]}>
                {profile?.nickname || profile?.name || '익명'}
              </Text>
              {profile?.bio ? (
                <Text style={[styles.bio, { color: isDark ? '#aaa' : '#666' }]}>
                  {profile.bio}
                </Text>
              ) : null}
              <Text style={styles.noteCount}>{notes.length}개 공개 노트</Text>

              <View style={styles.actionRow}>
                <Pressable
                  onPress={() =>
                    router.push(`/chat/${[user!.id, id!].sort().join('_')}` as any)
                  }
                  style={styles.actionBtn}
                  accessibilityLabel="메시지 보내기"
                  accessibilityRole="button"
                >
                  <Ionicons name="chatbubble-outline" size={18} color="#3b82f6" />
                  <Text style={styles.actionText}>메시지</Text>
                </Pressable>
                <Pressable onPress={handleBlock} style={styles.actionBtn} accessibilityLabel={blocked ? '차단 해제' : '사용자 차단'} accessibilityRole="button">
                  <Ionicons
                    name={blocked ? 'person-add-outline' : 'ban-outline'}
                    size={18}
                    color="#ef4444"
                  />
                  <Text style={[styles.actionText, { color: '#ef4444' }]}>
                    {blocked ? '차단 해제' : '차단'}
                  </Text>
                </Pressable>
              </View>
            </View>
          }
          renderItem={({ item }: { item: any }) => (
            <Pressable
              onPress={() => router.push(`/notes/${item.noteNo}` as any)}
              style={[styles.noteItem, { borderBottomColor: isDark ? '#333' : '#f0f0f0' }]}
              accessibilityLabel={`노트: ${item.title || '제목 없음'}`}
              accessibilityRole="button"
            >
              <Text
                style={[styles.noteTitle, { color: isDark ? '#fff' : '#000' }]}
                numberOfLines={1}
              >
                {item.title || '제목 없음'}
              </Text>
              <Text style={styles.notePreview} numberOfLines={2}>
                {item.plainText || ''}
              </Text>
            </Pressable>
          )}
          onEndReached={() => hasNextPage && !isFetchingNextPage && fetchNextPage()}
          onEndReachedThreshold={0.3}
        />
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
  profileSection: { alignItems: 'center', paddingVertical: 24, paddingHorizontal: 16 },
  avatar: { width: 80, height: 80, borderRadius: 40, marginBottom: 12 },
  avatarPlaceholder: { backgroundColor: '#ddd', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 28, fontWeight: '700', color: '#666' },
  name: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  bio: { fontSize: 14, textAlign: 'center', marginBottom: 8 },
  noteCount: { fontSize: 13, color: '#999', marginBottom: 16 },
  actionRow: { flexDirection: 'row', gap: 16 },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: '#ddd',
  },
  actionText: { fontSize: 13, fontWeight: '500', color: '#3b82f6' },
  noteItem: { paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1 },
  noteTitle: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
  notePreview: { fontSize: 13, color: '#999', lineHeight: 18 },
});
