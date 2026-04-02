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
import WebToolbar from '@/modules/notes/WebToolbar';

let NoteToolbar: any = () => null;
if (Platform.OS !== 'web') {
  NoteToolbar = require('@/modules/notes/NoteToolbar').default;
}
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

  const performSave = useCallback(async () => {
    const content = await editor.getHTML();
    const plainText = htmlToPlainText(content);

    if (!store.title.trim() && !plainText.trim()) return false;

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
      return true;
    } catch (e) {
      console.error('Save failed:', e);
      return false;
    }
  }, [editor, store, saveNoteMutation]);

  const handleSave = useCallback(async () => {
    const saved = await performSave();
    if (saved) router.back();
  }, [performSave, router]);

  // 뒤로가기: 내용이 있으면 자동 저장
  const handleBack = useCallback(async () => {
    await performSave();
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  }, [performSave, router]);

  const bgColor = store.selectedColor || (isDark ? '#000' : '#fff');
  const isWeb = Platform.OS === 'web';

  return (
    <AuthGuard showLogin>
      <SafeAreaView style={[styles.container, { backgroundColor: bgColor, alignItems: 'center' }]}>
        <View style={styles.outerWrap}>
        <NoteDetailHeader
          onSave={handleSave}
          onBack={handleBack}
          isSaving={saveNoteMutation.isPending}
          isNew
          bgColor={bgColor}
        />

        <View style={isWeb ? styles.webContent : undefined}>
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
        </View>

        {Platform.OS === 'web' ? (
          <WebToolbar onImagePress={handleImageInsert} bgColor={bgColor} />
        ) : (
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.toolbarWrapper}
          >
            <NoteToolbar editor={editor} onImagePress={handleImageInsert} />
          </KeyboardAvoidingView>
        )}
        </View>
      </SafeAreaView>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  outerWrap: {
    flex: 1,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 1200 : undefined,
  },
  webContent: {
    flex: 1,
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
  } as any,
  titleInput: {
    fontSize: 22,
    fontWeight: '700',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  editorContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  toolbarWrapper: {
    position: 'absolute',
    width: '100%',
    bottom: 0,
  },
});
