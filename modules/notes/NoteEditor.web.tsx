import React, { useRef, useEffect, useCallback } from 'react';
import { useColorScheme } from 'react-native';

// CSS for the web editor
const editorCSS = `
  .notie-editor {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    padding: 0 4px;
    line-height: 1.7;
    min-height: 300px;
    outline: none;
    font-size: 15px;
  }
  .notie-editor p { margin: 0.5em 0; }
  .notie-editor h1 { font-size: 28px; font-weight: 700; }
  .notie-editor h2 { font-size: 22px; font-weight: 700; }
  .notie-editor h3 { font-size: 18px; font-weight: 700; }
  .notie-editor blockquote {
    border-left: 3px solid rgba(0,0,0,0.25);
    padding-left: 1rem;
    margin-left: 0;
  }
  .notie-editor hr {
    border: none;
    border-top: 2px solid rgba(0,0,0,0.12);
    margin: 1em 0;
  }
  .notie-editor a { color: #3b82f6; text-decoration: underline; }
  .notie-editor ul, .notie-editor ol { padding-left: 1.5rem; }
  .notie-editor img {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
  }
`;

let cssInjected = false;
function injectCSS() {
  if (cssInjected || typeof document === 'undefined') return;
  const style = document.createElement('style');
  style.textContent = editorCSS;
  document.head.appendChild(style);
  cssInjected = true;
}

interface EditorHandle {
  getHTML: () => Promise<string>;
  setContent: (html: string) => void;
  setImage: (url: string) => void;
  _isWeb: true;
}

interface UseNoteEditorOptions {
  initialContent?: string;
  editable?: boolean;
}

export function useNoteEditor({
  initialContent = '',
  editable = true,
}: UseNoteEditorOptions = {}): EditorHandle {
  const isDark = useColorScheme() === 'dark';
  const divRef = useRef<HTMLDivElement | null>(null);
  const initialContentRef = useRef(initialContent);

  const getHTML = useCallback(async () => {
    return divRef.current?.innerHTML || initialContentRef.current;
  }, []);

  const setContent = useCallback((html: string) => {
    initialContentRef.current = html;
    if (divRef.current) {
      divRef.current.innerHTML = html;
    }
  }, []);

  const setImage = useCallback((url: string) => {
    if (divRef.current) {
      divRef.current.innerHTML += `<img src="${url}" />`;
    }
  }, []);

  return {
    getHTML,
    setContent,
    setImage,
    _isWeb: true,
    // Store refs for the view component to access
    _divRef: divRef,
    _editable: editable,
    _isDark: isDark,
  } as any;
}

interface EditorViewProps {
  editor: any;
  showToolbar?: boolean;
}

export default function NoteEditorView({ editor }: EditorViewProps) {
  injectCSS();

  const divRef = editor._divRef;
  const editable = editor._editable;
  const isDark = editor._isDark;

  // Set initial content when div mounts
  const setRef = useCallback((el: HTMLDivElement | null) => {
    divRef.current = el;
    if (el && !el.innerHTML) {
      // Load any content that was set before mount
      const pending = (editor as any)._pendingContent;
      if (pending) {
        el.innerHTML = pending;
      }
    }
  }, []);

  // Listen for setContent calls that happen after mount
  useEffect(() => {
    const original = editor.setContent;
    editor.setContent = (html: string) => {
      (editor as any)._pendingContent = html;
      if (divRef.current) {
        divRef.current.innerHTML = html;
      }
    };
    return () => {
      editor.setContent = original;
    };
  }, []);

  return (
    <div
      ref={setRef}
      className="notie-editor"
      contentEditable={editable}
      suppressContentEditableWarning
      style={{
        color: isDark ? '#fff' : '#1a1a1a',
        minHeight: 300,
        outline: 'none',
        cursor: editable ? 'text' : 'default',
      }}
    />
  );
}
