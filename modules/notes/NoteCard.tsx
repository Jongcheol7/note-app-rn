import React, { memo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFromStore } from '@/store/useFromStore';
import { useThemeColors, shadows, radius, spacing } from '@/lib/theme';
import Avatar from '@/components/Avatar';
import type { Note } from '@/types';

interface NoteCardProps {
  note: Note;
  currentUserId?: string;
  onTogglePin?: (noteNo: number, isPinned: boolean) => void;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return `${y}.${m}.${day}`;
}

function NoteCard({ note, currentUserId, onTogglePin }: NoteCardProps) {
  const router = useRouter();
  const menuFrom = useFromStore((s) => s.menuFrom);
  const colors = useThemeColors();

  // Entrance animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: false,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 350,
        useNativeDriver: false,
      }),
    ]).start();
  }, []);

  const isCommunity = menuFrom === 'community';
  const likeCount = note.like?.length ?? 0;
  const commentCount = note.comment?.length ?? 0;
  const bgColor = note.color || colors.card;

  const handlePress = () => {
    router.push(`/notes/${note.noteNo}` as any);
  };

  const handlePin = () => {
    onTogglePin?.(note.noteNo, !note.isPinned);
  };

  // Community mode card
  if (isCommunity) {
    const author = note.user;
    const avatarUrl = author?.profileImage || author?.image;

    return (
      <Pressable
        onPress={handlePress}
        style={[styles.communityCard, { borderBottomColor: colors.borderLight }]}
        accessibilityRole="button"
        accessibilityLabel={`${author?.nickname || author?.name || '익명'}의 노트: ${note.title || ''}`}
      >
        <View style={styles.authorRow}>
          <Avatar uri={avatarUrl} name={author?.nickname || author?.name} size={36} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={[styles.authorName, { color: colors.text }]}>
              {author?.nickname || author?.name || '익명'}
            </Text>
            <Text style={[styles.metaText, { color: colors.textTertiary }]}>
              {formatDate(note.inputDatetime)}
            </Text>
          </View>
        </View>

        {note.title ? (
          <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>
            {note.title}
          </Text>
        ) : null}
        <Text style={[styles.cardBody, { color: colors.textSecondary }]} numberOfLines={3}>
          {note.plainText || ''}
        </Text>

        <View style={styles.communityFooter}>
          <View style={styles.statRow}>
            <Ionicons name="heart" size={14} color="#ef4444" />
            <Text style={[styles.statText, { color: colors.textTertiary }]}>{likeCount}</Text>
          </View>
          <View style={styles.statRow}>
            <Ionicons name="chatbubble-outline" size={14} color={colors.textTertiary} />
            <Text style={[styles.statText, { color: colors.textTertiary }]}>{commentCount}</Text>
          </View>
        </View>
      </Pressable>
    );
  }

  // Home / Trash mode card
  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.noteCard,
        shadows.card,
        {
          backgroundColor: bgColor,
          borderColor: colors.cardBorder,
          borderWidth: 1,
          opacity: pressed ? 0.92 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`노트: ${note.title || '제목 없음'}`}
    >
      {/* Pin badge */}
      {note.isPinned && (
        <View style={styles.pinBadge}>
          <Ionicons name="pin" size={12} color={colors.warning} />
        </View>
      )}

      {/* Content area */}
      <View style={styles.cardContentArea}>
        {note.title ? (
          <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>
            {note.title}
          </Text>
        ) : null}
        <Text style={[styles.cardBody, { color: colors.textSecondary }]} numberOfLines={6}>
          {note.plainText || ''}
        </Text>
      </View>

      {/* Footer - compact */}
      <View style={styles.cardFooter}>
        <Text style={[styles.metaText, { color: colors.textTertiary }]}>
          {formatDate(note.modDatetime || note.inputDatetime)}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          {likeCount > 0 && (
            <View style={styles.statRow}>
              <Ionicons name="heart" size={11} color="#ef4444" />
              <Text style={[styles.statText, { color: colors.textTertiary }]}>{likeCount}</Text>
            </View>
          )}
          {menuFrom === '' && !note.isPinned && (
            <Pressable onPress={handlePin} hitSlop={8}>
              <Ionicons name="pin-outline" size={14} color={colors.textTertiary} />
            </Pressable>
          )}
        </View>
      </View>
    </Pressable>
    </Animated.View>
  );
}

export default memo(NoteCard);

const styles = StyleSheet.create({
  // Community card
  communityCard: {
    padding: spacing.lg,
    borderBottomWidth: 1,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
  },
  communityFooter: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
  },

  // Note card
  noteCard: {
    flex: 1,
    margin: 6,
    padding: 14,
    borderRadius: radius.md,
    height: 190,
  },
  pinBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  cardContentArea: {
    flex: 1,
    overflow: 'hidden',
  },

  // Shared
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
    lineHeight: 20,
  },
  cardBody: {
    fontSize: 12,
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  metaText: {
    fontSize: 11,
    fontWeight: '500',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  statText: {
    fontSize: 11,
  },
});
