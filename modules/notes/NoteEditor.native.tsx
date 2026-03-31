import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import {
  RichText,
  Toolbar,
  useEditorBridge,
  TenTapStartKit,
  PlaceholderBridge,
  ImageBridge,
  TaskListBridge,
  ColorBridge,
  HighlightBridge,
  UnderlineBridge,
  LinkBridge,
  darkEditorTheme,
  darkEditorCss,
} from '@10play/tentap-editor';

const customCSS = `
  * { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
  .ProseMirror { padding: 0 4px; line-height: 1.7; min-height: 300px; }
  .ProseMirror p { margin: 0.5em 0; }
  .ProseMirror h1 { font-size: 28px; font-weight: 700; }
  .ProseMirror h2 { font-size: 22px; font-weight: 700; }
  .ProseMirror h3 { font-size: 18px; font-weight: 700; }
  .ProseMirror blockquote { border-left: 3px solid rgba(0,0,0,0.25); padding-left: 1rem; margin-left: 0; }
  .ProseMirror hr { border: none; border-top: 2px solid rgba(0,0,0,0.12); margin: 1em 0; }
  .ProseMirror a { color: #3b82f6; text-decoration: underline; }
  .ProseMirror ul, .ProseMirror ol { padding-left: 1.5rem; }
  .ProseMirror img { max-width: 100%; height: auto; border-radius: 4px; }
`;

interface UseNoteEditorOptions {
  initialContent?: string;
  editable?: boolean;
}

export function useNoteEditor({
  initialContent = '',
  editable = true,
}: UseNoteEditorOptions = {}) {
  const isDark = useColorScheme() === 'dark';

  const editor = useEditorBridge({
    autofocus: false,
    avoidIosKeyboard: true,
    initialContent,
    editable,
    bridgeExtensions: [
      ...TenTapStartKit,
      PlaceholderBridge.configureExtension({
        placeholder: '여기에 메모를 입력하세요...',
      }),
      ImageBridge,
      TaskListBridge,
      ColorBridge,
      HighlightBridge.configureExtension({ multicolor: true }),
      UnderlineBridge,
      LinkBridge,
    ],
    theme: isDark ? darkEditorTheme : undefined,
    customCSS: isDark ? darkEditorCss + customCSS : customCSS,
  });

  return editor;
}

interface EditorViewProps {
  editor: ReturnType<typeof useEditorBridge>;
  showToolbar?: boolean;
}

export default function NoteEditorView({
  editor,
  showToolbar = true,
}: EditorViewProps) {
  return (
    <>
      <RichText editor={editor} style={styles.richText} />
      {showToolbar && (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.toolbarContainer}
        >
          <Toolbar editor={editor} />
        </KeyboardAvoidingView>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  richText: {
    flex: 1,
  },
  toolbarContainer: {
    position: 'absolute',
    width: '100%',
    bottom: 0,
  },
});
