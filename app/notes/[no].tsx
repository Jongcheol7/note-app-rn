import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  TextInput,
  Text,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AuthGuard } from '@/components/AuthGuard';
import { useAuth } from '@/lib/AuthContext';
import { useNoteDetail } from '@/hooks/notes/useNoteDetail';
import { useNoteFormStore } from '@/store/useNoteFormStore';
import { useColorStore } from '@/store/useColorStore';
import { useFromStore } from '@/store/useFromStore';
import {
  useSaveNote,
  useSoftDeleteNote,
  useTogglePublic,
  useChangeColor,
} from '@/hooks/notes/useNoteMutations';
import { pickImage, uploadImage } from '@/lib/services/imageService';
import { htmlToPlainText } from '@/lib/utils/htmlToPlainText';
import NoteDetailHeader from '@/modules/notes/NoteDetailHeader';
import NoteEditorView, { useNoteEditor } from '@/modules/notes/NoteEditor';
import NoteToolbar from '@/modules/notes/NoteToolbar';
import CommentSection from '@/modules/notes/CommentSection';
import ColorPickerModal from '@/components/ColorPickerModal';
import AlarmModal from '@/components/AlarmModal';

export default function NoteDetailScreen() {
  const { no } = useLocalSearchParams<{ no: string }>();
  const noteNo = no ? parseInt(no, 10) : null;
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const { user, profile } = useAuth();
  const menuFrom = useFromStore((s) => s.menuFrom);

  const store = useNoteFormStore();
  const { setColor } = useColorStore();
  const { data: note, isLoading } = useNoteDetail(noteNo);

  const saveNote = useSaveNote();
  const softDelete = useSoftDeleteNote();
  const togglePublic = useTogglePublic();
  const changeColor = useChangeColor();

  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showAlarmModal, setShowAlarmModal] = useState(false);

  const isCommunity = menuFrom === 'community';
  const isOwner = note?.userId === user?.id;
  const editable = isOwner && !isCommunity;

  const editor = useNoteEditor({
    initialContent: note?.content || '',
    editable,
  });

  // Populate form from loaded note
  useEffect(() => {
    if (note) {
      store.setNoteNo(note.noteNo);
      store.setTitle(note.title || '');
      store.setSelectedColor(note.color || '#FEF3C7');
      store.setIsPublic(note.isPublic);
      store.setAlarmDatetime(note.alarmDatetime);
      store.setIsDirty(false);
      setColor(note.color || '');

      if (note.content) {
        editor.setContent(note.content);
      }
    }
    return () => {
      store.reset();
      setColor('');
    };
  }, [note?.noteNo]);

  const handleImageInsert = useCallback(async () => {
    if (!user) return;
    const uri = await pickImage();
    if (!uri) return;
    try {
      const result = await uploadImage(uri, user.id, profile?.plan);
      if (result?.url) {
        editor.setImage(result.url);
      }
    } catch (e: any) {
      console.error('Image upload failed:', e.message);
    }
  }, [user, profile, editor]);

  const handleSave = useCallback(async () => {
    if (!noteNo) return;
    try {
      const content = await editor.getHTML();
      const plainText = htmlToPlainText(content);
      await saveNote.mutateAsync({
        noteNo,
        title: store.title,
        content,
        plainText,
        categoryNo: store.selectedCategoryNo,
        color: store.selectedColor,
        isPublic: store.isPublic,
        alarmDatetime: store.alarmDatetime,
      });
      store.setIsDirty(false);
    } catch (e) {
      console.error('Save failed:', e);
    }
  }, [noteNo, editor, store, saveNote]);

  const handleDelete = async () => {
    if (!noteNo) return;
    await softDelete.mutateAsync(noteNo);
    router.back();
  };

  const handleTogglePublic = () => {
    if (!noteNo) return;
    const newVal = !store.isPublic;
    store.setIsPublic(newVal);
    togglePublic.mutate({ noteNo, isPublic: newVal });
  };

  const handleColorSelect = (color: string) => {
    if (!noteNo) return;
    store.setSelectedColor(color);
    setColor(color);
    changeColor.mutate({ noteNo, color });
  };

  const handleAlarmSet = (datetime: string) => {
    store.setAlarmDatetime(datetime);
    store.setIsDirty(true);
  };

  const handleAlarmClear = () => {
    store.setAlarmDatetime(null);
    store.setIsDirty(true);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  if (!note) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>노트를 찾을 수 없습니다</Text>
      </SafeAreaView>
    );
  }

  const bgColor = store.selectedColor || (isDark ? '#000' : '#fff');

  return (
    <AuthGuard showLogin>
      <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
        {editable ? (
          <NoteDetailHeader
            onSave={handleSave}
            isSaving={saveNote.isPending}
            isNew={false}
            onDelete={handleDelete}
            onTogglePublic={handleTogglePublic}
            onToggleColor={() => setShowColorPicker(true)}
            onSetAlarm={() => setShowAlarmModal(true)}
            isPublic={store.isPublic}
          />
        ) : (
          <NoteDetailHeader
            onSave={() => {}}
            isSaving={false}
            isNew={false}
          />
        )}

        <ScrollView style={styles.content} keyboardDismissMode="interactive">
          {editable ? (
            <TextInput
              style={[styles.titleInput, { color: isDark ? '#fff' : '#000' }]}
              placeholder="제목"
              placeholderTextColor="#999"
              value={store.title}
              onChangeText={store.setTitle}
              multiline
              maxLength={200}
            />
          ) : (
            <Text style={[styles.titleText, { color: isDark ? '#fff' : '#000' }]}>
              {note.title}
            </Text>
          )}

          <View style={styles.editorContainer}>
            <NoteEditorView editor={editor} showToolbar={false} />
          </View>

          {/* Comment section for public notes */}
          {(isCommunity || note.isPublic) && noteNo && (
            <CommentSection noteNo={noteNo} />
          )}
        </ScrollView>

        {editable && (
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.toolbarWrapper}
          >
            <NoteToolbar editor={editor} onImagePress={handleImageInsert} />
          </KeyboardAvoidingView>
        )}

        {/* Color picker modal */}
        <ColorPickerModal
          visible={showColorPicker}
          currentColor={store.selectedColor}
          onSelect={handleColorSelect}
          onClose={() => setShowColorPicker(false)}
        />

        {/* Alarm modal */}
        <AlarmModal
          visible={showAlarmModal}
          currentAlarm={store.alarmDatetime}
          onSet={handleAlarmSet}
          onClear={handleAlarmClear}
          onClose={() => setShowAlarmModal(false)}
        />
      </SafeAreaView>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  titleInput: {
    fontSize: 22,
    fontWeight: '700',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  titleText: {
    fontSize: 22,
    fontWeight: '700',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  editorContainer: {
    flex: 1,
    paddingHorizontal: 12,
    minHeight: 300,
  },
  toolbarWrapper: {
    position: 'absolute',
    width: '100%',
    bottom: 0,
  },
});
