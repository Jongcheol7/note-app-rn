import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  Image,
  StyleSheet,
  useColorScheme,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/lib/AuthContext';
import {
  useComments,
  useCreateComment,
  useDeleteComment,
} from '@/hooks/notes/useComments';

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const hours = String(d.getHours()).padStart(2, '0');
  const mins = String(d.getMinutes()).padStart(2, '0');
  return `${month}/${day} ${hours}:${mins}`;
}

interface CommentSectionProps {
  noteNo: number;
}

export default function CommentSection({ noteNo }: CommentSectionProps) {
  const isDark = useColorScheme() === 'dark';
  const { user } = useAuth();
  const { data: comments = [] } = useComments(noteNo);
  const createComment = useCreateComment(noteNo);
  const deleteComment = useDeleteComment(noteNo);
  const [text, setText] = useState('');

  const handleSend = useCallback(() => {
    const content = text.trim();
    if (!content) return;
    createComment.mutate(content);
    setText('');
  }, [text, createComment]);

  const handleDelete = useCallback(
    (commentNo: number) => {
      Alert.alert('삭제', '댓글을 삭제하시겠습니까?', [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => deleteComment.mutate(commentNo),
        },
      ]);
    },
    [deleteComment]
  );

  return (
    <View style={[styles.container, { borderTopColor: isDark ? '#333' : '#eee' }]}>
      <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]}>
        댓글 {comments.length}
      </Text>

      {comments.map((comment: any) => {
        const author = comment.user;
        const avatarUrl = author?.profileImage || author?.image;
        const isOwn = comment.userId === user?.id;

        return (
          <View
            key={comment.commentNo}
            style={[styles.commentItem, { borderBottomColor: isDark ? '#333' : '#f0f0f0' }]}
          >
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarText}>
                  {(author?.nickname || author?.name || '?')[0]}
                </Text>
              </View>
            )}
            <View style={styles.commentBody}>
              <View style={styles.commentHeader}>
                <Text style={[styles.authorName, { color: isDark ? '#fff' : '#000' }]}>
                  {author?.nickname || author?.name || '익명'}
                </Text>
                <Text style={styles.commentDate}>
                  {formatDate(comment.inputDatetime)}
                </Text>
              </View>
              <Text style={[styles.commentText, { color: isDark ? '#ccc' : '#333' }]}>
                {comment.content}
              </Text>
            </View>
            {isOwn && (
              <Pressable onPress={() => handleDelete(comment.commentNo)} hitSlop={8} accessibilityLabel="댓글 삭제" accessibilityRole="button">
                <Ionicons name="close" size={16} color="#999" />
              </Pressable>
            )}
          </View>
        );
      })}

      {/* Input */}
      <View style={[styles.inputRow, { borderTopColor: isDark ? '#333' : '#eee' }]}>
        <TextInput
          style={[
            styles.input,
            {
              color: isDark ? '#fff' : '#000',
              backgroundColor: isDark ? '#333' : '#f3f4f6',
            },
          ]}
          placeholder="댓글 입력..."
          placeholderTextColor="#999"
          accessibilityLabel="댓글 입력"
          value={text}
          onChangeText={setText}
          onSubmitEditing={handleSend}
          returnKeyType="send"
        />
        <Pressable
          onPress={handleSend}
          disabled={!text.trim()}
          style={[styles.sendBtn, !text.trim() && { opacity: 0.4 }]}
          accessibilityLabel="댓글 전송"
          accessibilityRole="button"
        >
          <Ionicons name="send" size={18} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    paddingTop: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  commentItem: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 10,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  avatarPlaceholder: {
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  commentBody: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  authorName: {
    fontSize: 13,
    fontWeight: '600',
  },
  commentDate: {
    fontSize: 11,
    color: '#999',
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  sendBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
