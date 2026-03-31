import React, { memo } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  useColorScheme,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFromStore } from '@/store/useFromStore';
import type { Note } from '@/types';

interface NoteCardProps {
  note: Note;
  currentUserId?: string;
  onTogglePin?: (noteNo: number, isPinned: boolean) => void;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  return `${month}/${day}`;
}

function NoteCard({ note, currentUserId, onTogglePin }: NoteCardProps) {
  const router = useRouter();
  const menuFrom = useFromStore((s) => s.menuFrom);
  const isDark = useColorScheme() === 'dark';

  const isCommunity = menuFrom === 'community';
  const likeCount = note.like?.length ?? 0;
  const commentCount = note.comment?.length ?? 0;
  const bgColor = note.color || (isDark ? '#1a1a1a' : '#fff');

  const handlePress = () => {
    router.push(`/notes/${note.noteNo}` as any);
  };

  const handlePin = () => {
    onTogglePin?.(note.noteNo, !note.isPinned);
  };

  // Community mode card (Instagram style)
  if (isCommunity) {
    const author = note.user;
    const avatarUrl = author?.profileImage || author?.image;

    return (
      <Pressable onPress={handlePress} style={styles.communityCard}>
        {/* Author header */}
        <View style={styles.authorRow}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarText}>
                {(author?.nickname || author?.name || '?')[0]}
              </Text>
            </View>
          )}
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={[styles.authorName, isDark && styles.textLight]}>
              {author?.nickname || author?.name || '익명'}
            </Text>
            <Text style={styles.dateText}>
              {formatDate(note.inputDatetime)}
            </Text>
          </View>
        </View>

        {/* Content */}
        {note.title ? (
          <Text
            style={[styles.cardTitle, isDark && styles.textLight]}
            numberOfLines={2}
          >
            {note.title}
          </Text>
        ) : null}
        <Text
          style={[styles.cardContent, isDark && styles.textMuted]}
          numberOfLines={3}
        >
          {note.plainText || ''}
        </Text>

        {/* Footer */}
        <View style={styles.cardFooter}>
          <View style={styles.statRow}>
            <Ionicons name="heart" size={14} color="#ef4444" />
            <Text style={styles.statText}>{likeCount}</Text>
          </View>
          <View style={styles.statRow}>
            <Ionicons name="chatbubble-outline" size={14} color="#999" />
            <Text style={styles.statText}>{commentCount}</Text>
          </View>
        </View>
      </Pressable>
    );
  }

  // Home / Trash mode card
  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.noteCard,
        { backgroundColor: bgColor, opacity: pressed ? 0.9 : 1 },
      ]}
    >
      {/* Pin badge */}
      {note.isPinned && (
        <View style={styles.pinBadge}>
          <Ionicons name="pin" size={12} color="#f59e0b" />
        </View>
      )}

      {/* Title */}
      {note.title ? (
        <Text
          style={[styles.cardTitle, { color: isDark ? '#fff' : '#000' }]}
          numberOfLines={2}
        >
          {note.title}
        </Text>
      ) : null}

      {/* Plain text preview */}
      <Text
        style={[styles.cardContent, { color: isDark ? '#ccc' : '#555' }]}
        numberOfLines={4}
      >
        {note.plainText || ''}
      </Text>

      {/* Footer */}
      <View style={styles.cardFooter}>
        <Text style={styles.dateText}>
          {formatDate(note.modDatetime || note.inputDatetime)}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {likeCount > 0 && (
            <View style={styles.statRow}>
              <Ionicons name="heart" size={12} color="#ef4444" />
              <Text style={styles.statText}>{likeCount}</Text>
            </View>
          )}
          {/* Pin button (home only, not pinned) */}
          {menuFrom === '' && !note.isPinned && (
            <Pressable onPress={handlePin} hitSlop={8}>
              <Ionicons name="pin-outline" size={16} color="#999" />
            </Pressable>
          )}
        </View>
      </View>
    </Pressable>
  );
}

export default memo(NoteCard);

const styles = StyleSheet.create({
  // Community card
  communityCard: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  avatarPlaceholder: {
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },

  // Note card
  noteCard: {
    flex: 1,
    margin: 4,
    padding: 14,
    borderRadius: 12,
    minHeight: 120,
    justifyContent: 'space-between',
  },
  pinBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },

  // Shared
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
    color: '#000',
  },
  cardContent: {
    fontSize: 13,
    lineHeight: 18,
    color: '#555',
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  dateText: {
    fontSize: 11,
    color: '#999',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  statText: {
    fontSize: 12,
    color: '#999',
  },
  textLight: {
    color: '#fff',
  },
  textMuted: {
    color: '#aaa',
  },
});
