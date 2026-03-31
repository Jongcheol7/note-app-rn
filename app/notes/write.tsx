import React, { useEffect, useCallback } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { AuthGuard } from '@/components/AuthGuard';
import { useNoteFormStore } from '@/store/useNoteFormStore';
import { useAuth } from '@/lib/AuthContext';
import { useSaveNote } from '@/hooks/notes/useNoteMutations';
import { pickImage, uploadImage } from '@/lib/services/imageService';
import { htmlToPlainText } from '@/lib/utils/htmlToPlainText';
import NoteDetailHeader from '@/modules/notes/NoteDetailHeader';
import NoteEditorView, { useNoteEditor } from '@/modules/notes/NoteEditor';
import NoteToolbar from '@/modules/notes/NoteToolbar';
import CategorySelector from '@/components/CategorySelector';

export default function NoteWriteScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const store = useNoteFormStore();
  const { user, profile } = useAuth();
  const saveNoteMutation = useSaveNote();

  const editor = useNoteEditor({ editable: true });

  useEffect(() => {
    store.reset();
    return () => store.reset();
  }, []);

  // Mark dirty when image is inserted or editor content changes
  const markDirty = useCallback(() => {
    if (!store.isDirty) store.setIsDirty(true);
  }, [store]);

  const handleImageInsert = useCallback(async () => {
    if (!user) return;
    const uri = await pickImage();
    if (!uri) return;

    try {
      const result = await uploadImage(uri, user.id, profile?.plan);
      if (result?.url) {
        editor.setImage(result.url);
        markDirty();
      }
    } catch (e: any) {
      console.error('Image upload failed:', e.message);
    }
  }, [user, profile, editor]);

  const handleSave = useCallback(async () => {
    const content = await editor.getHTML();
    const plainText = htmlToPlainText(content);

    if (!store.title.trim() && !plainText.trim()) return;

    try {
      await saveNoteMutation.mutateAsync({
        title: store.title,
        content,
        plainText,
        categoryNo: store.selectedCategoryNo,
        color: store.selectedColor,
        isPublic: store.isPublic,
        alarmDatetime: store.alarmDatetime,
      });
      store.reset();
      router.back();
    } catch (e) {
      console.error('Save failed:', e);
    }
  }, [editor, store, saveNoteMutation, router]);

  const bgColor = store.selectedColor || (isDark ? '#000' : '#fff');

  return (
    <AuthGuard showLogin>
      <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
        <NoteDetailHeader
          onSave={handleSave}
          isSaving={saveNoteMutation.isPending}
          isNew
        />

        <CategorySelector />

        <TextInput
          style={[styles.titleInput, { color: isDark ? '#fff' : '#000' }]}
          placeholder="제목"
          placeholderTextColor="#999"
          value={store.title}
          onChangeText={store.setTitle}
          multiline
          maxLength={200}
        />

        <View style={styles.editorContainer}>
          <NoteEditorView editor={editor} showToolbar={false} />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.toolbarWrapper}
        >
          <NoteToolbar editor={editor} onImagePress={handleImageInsert} />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleInput: {
    fontSize: 22,
    fontWeight: '700',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  editorContainer: {
    flex: 1,
    paddingHorizontal: 12,
  },
  toolbarWrapper: {
    position: 'absolute',
    width: '100%',
    bottom: 0,
  },
});
