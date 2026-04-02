import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  ScrollView,
  StyleSheet,
  useColorScheme,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AuthGuard } from '@/components/AuthGuard';
import { useAuth } from '@/lib/AuthContext';
import {
  fetchNoteCount,
  fetchStorageUsage,
  updateProfile,
} from '@/lib/services/userService';
import { pickImage, uploadImage } from '@/lib/services/imageService';
import { supabase } from '@/lib/supabase';

const STORAGE_LIMITS: Record<string, number> = {
  free: 30 * 1024 * 1024,
  plus: 1024 * 1024 * 1024,
  pro: 3 * 1024 * 1024 * 1024,
  unlimited: Number.MAX_SAFE_INTEGER,
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

export default function ProfileScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const { user, profile, signOut } = useAuth();
  const queryClient = useQueryClient();

  const [nickname, setNickname] = useState(profile?.nickname || profile?.name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [editingNickname, setEditingNickname] = useState(false);
  const [editingBio, setEditingBio] = useState(false);

  useEffect(() => {
    if (profile) {
      setNickname(profile.nickname || profile.name || '');
      setBio(profile.bio || '');
    }
  }, [profile]);

  const { data: noteCount = 0 } = useQuery({
    queryKey: ['noteCount'],
    queryFn: () => fetchNoteCount(user!.id),
    enabled: !!user,
  });

  const { data: storageUsage = 0 } = useQuery({
    queryKey: ['storageUsage'],
    queryFn: () => fetchStorageUsage(user!.id),
    enabled: !!user,
  });

  const updateMutation = useMutation({
    mutationFn: (updates: { nickname?: string; bio?: string; profile_image?: string }) =>
      updateProfile(user!.id, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['userProfile'] }),
  });

  const handleSaveNickname = () => {
    const trimmed = nickname.trim();
    if (trimmed.length < 2 || trimmed.length > 20) {
      Alert.alert('오류', '닉네임은 2~20자여야 합니다.');
      return;
    }
    updateMutation.mutate({ nickname: trimmed });
    setEditingNickname(false);
  };

  const handleSaveBio = () => {
    if (bio.length > 150) {
      Alert.alert('오류', '소개는 150자 이내여야 합니다.');
      return;
    }
    updateMutation.mutate({ bio });
    setEditingBio(false);
  };

  const handleAvatarChange = async () => {
    if (!user) return;
    const uri = await pickImage();
    if (!uri) return;
    try {
      // Upload to profiles bucket
      const response = await fetch(uri);
      const blob = await response.arrayBuffer();
      const fileName = `${user.id}/avatar_${Date.now()}.jpg`;
      const { data } = await supabase.storage
        .from('profiles')
        .upload(fileName, blob, { contentType: 'image/jpeg', upsert: true });
      if (data) {
        const { data: urlData } = supabase.storage.from('profiles').getPublicUrl(data.path);
        updateMutation.mutate({ profile_image: urlData.publicUrl });
      }
    } catch (e) {
      console.error('Avatar upload failed:', e);
    }
  };

  const plan = profile?.plan || 'free';
  const limit = STORAGE_LIMITS[plan] ?? STORAGE_LIMITS.free;
  const usagePercent = Math.min((storageUsage / limit) * 100, 100);
  const avatarUrl = profile?.profileImage || profile?.image;

  return (
    <AuthGuard showLogin>
      <SafeAreaView style={[styles.outer, { backgroundColor: isDark ? '#000' : '#fff' }]} edges={['top']}>
        <View style={styles.inner}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: isDark ? '#333' : '#eee' }]}>
          <Pressable onPress={() => router.back()} style={{ padding: 6 }} accessibilityLabel="뒤로 가기" accessibilityRole="button">
            <Ionicons name="arrow-back" size={24} color={isDark ? '#fff' : '#000'} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: isDark ? '#fff' : '#000' }]} accessibilityRole="header">프로필</Text>
          <Pressable onPress={() => router.push('/settings' as any)} style={{ padding: 6 }} accessibilityLabel="설정" accessibilityRole="button">
            <Ionicons name="settings-outline" size={22} color={isDark ? '#ccc' : '#555'} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {/* Avatar */}
          <Pressable onPress={handleAvatarChange} style={styles.avatarSection} accessibilityLabel="프로필 사진 변경" accessibilityRole="button">
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarText}>{(nickname || '?')[0]}</Text>
              </View>
            )}
            <View style={styles.cameraIcon}>
              <Ionicons name="camera" size={14} color="#fff" />
            </View>
          </Pressable>

          {/* Nickname */}
          <View style={styles.fieldRow}>
            {editingNickname ? (
              <View style={styles.editRow}>
                <TextInput
                  style={[styles.editInput, { color: isDark ? '#fff' : '#000', borderColor: isDark ? '#555' : '#ddd' }]}
                  value={nickname}
                  onChangeText={setNickname}
                  autoFocus
                  maxLength={20}
                />
                <Pressable onPress={handleSaveNickname} accessibilityLabel="닉네임 저장" accessibilityRole="button">
                  <Ionicons name="checkmark" size={22} color="#3b82f6" />
                </Pressable>
              </View>
            ) : (
              <Pressable onPress={() => setEditingNickname(true)} style={styles.editRow} accessibilityLabel="닉네임 수정" accessibilityRole="button">
                <Text style={[styles.nickname, { color: isDark ? '#fff' : '#000' }]}>{nickname}</Text>
                <Ionicons name="pencil-outline" size={16} color="#999" />
              </Pressable>
            )}
          </View>

          {/* Bio */}
          <View style={styles.fieldRow}>
            {editingBio ? (
              <View>
                <TextInput
                  style={[styles.bioInput, { color: isDark ? '#fff' : '#000', borderColor: isDark ? '#555' : '#ddd' }]}
                  value={bio}
                  onChangeText={setBio}
                  multiline
                  maxLength={150}
                  autoFocus
                />
                <Pressable onPress={handleSaveBio} style={{ alignSelf: 'flex-end' }} accessibilityLabel="소개 저장" accessibilityRole="button">
                  <Text style={{ color: '#3b82f6', fontWeight: '600' }}>저장</Text>
                </Pressable>
              </View>
            ) : (
              <Pressable onPress={() => setEditingBio(true)} accessibilityLabel="소개 수정" accessibilityRole="button">
                <Text style={{ color: isDark ? '#aaa' : '#666', fontSize: 14 }}>
                  {bio || '소개를 입력하세요'}
                </Text>
              </Pressable>
            )}
          </View>

          {/* Stats */}
          <Text style={[styles.stat, { color: isDark ? '#ccc' : '#555' }]}>
            노트 {noteCount}개
          </Text>

          {/* Storage */}
          <View style={[styles.storageCard, { backgroundColor: isDark ? '#1a1a1a' : '#f9fafb' }]}>
            <Text style={[styles.storageTitle, { color: isDark ? '#fff' : '#000' }]}>
              저장 공간 ({plan.toUpperCase()})
            </Text>
            <View style={styles.storageBar}>
              <View style={[styles.storageBarFill, { width: `${usagePercent}%` }]} />
            </View>
            <Text style={styles.storageText}>
              {formatBytes(storageUsage)} / {formatBytes(limit)}
            </Text>
            <Pressable onPress={() => router.push('/plan' as any)} style={styles.planBtn} accessibilityLabel="플랜 변경" accessibilityRole="button">
              <Text style={styles.planBtnText}>플랜 변경</Text>
            </Pressable>
          </View>
        </ScrollView>
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
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  content: { paddingHorizontal: 16, paddingVertical: 24, alignItems: 'center' },
  avatarSection: { position: 'relative', marginBottom: 16 },
  avatar: { width: 90, height: 90, borderRadius: 45 },
  avatarPlaceholder: { backgroundColor: '#ddd', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 32, fontWeight: '700', color: '#666' },
  cameraIcon: {
    position: 'absolute', bottom: 0, right: 0, width: 28, height: 28,
    borderRadius: 14, backgroundColor: '#FF6B6B', justifyContent: 'center', alignItems: 'center',
  },
  fieldRow: { width: '100%', marginBottom: 16 },
  editRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  editInput: { fontSize: 18, fontWeight: '600', borderBottomWidth: 1, paddingVertical: 4, minWidth: 120, textAlign: 'center' },
  nickname: { fontSize: 20, fontWeight: '700', textAlign: 'center' },
  bioInput: { fontSize: 14, borderWidth: 1, borderRadius: 8, padding: 10, minHeight: 60, textAlignVertical: 'top' },
  stat: { fontSize: 14, marginBottom: 20 },
  storageCard: { width: '100%', padding: 16, borderRadius: 12 },
  storageTitle: { fontSize: 15, fontWeight: '600', marginBottom: 8 },
  storageBar: { height: 8, backgroundColor: '#e5e7eb', borderRadius: 4, marginBottom: 6 },
  storageBarFill: { height: '100%', backgroundColor: '#3b82f6', borderRadius: 4 },
  storageText: { fontSize: 12, color: '#999', marginBottom: 12 },
  planBtn: { backgroundColor: '#FF6B6B', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  planBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
