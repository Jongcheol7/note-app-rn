import React, { useRef, useEffect, useCallback } from 'react';
import { useColorScheme } from 'react-native';

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
  .notie-editor h1 { font-size: 28px; font-weight: 700; margin: 0.6em 0 0.3em; }
  .notie-editor h2 { font-size: 22px; font-weight: 700; margin: 0.5em 0 0.3em; }
  .notie-editor h3 { font-size: 18px; font-weight: 700; margin: 0.4em 0 0.2em; }
  .notie-editor blockquote {
    border-left: 3px solid rgba(128,128,128,0.4);
    padding-left: 1rem;
    margin-left: 0;
    color: inherit;
    opacity: 0.85;
  }
  .notie-editor pre {
    background: rgba(128,128,128,0.1);
    border-radius: 6px;
    padding: 12px 16px;
    font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
    font-size: 13px;
    line-height: 1.5;
    overflow-x: auto;
    white-space: pre-wrap;
  }
  .notie-editor code {
    background: rgba(128,128,128,0.12);
    border-radius: 3px;
    padding: 2px 5px;
    font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
    font-size: 13px;
  }
  .notie-editor hr {
    border: none;
    border-top: 2px solid rgba(128,128,128,0.2);
    margin: 1.2em 0;
  }
  .notie-editor a { color: #3b82f6; text-decoration: underline; }
  .notie-editor ul, .notie-editor ol {
    padding-left: 1.5rem;
    margin: 0.4em 0;
  }
  .notie-editor li { margin: 0.15em 0; }
  .notie-editor img {
    max-width: 100%;
    height: auto;
    border-radius: 6px;
    margin: 8px 0;
  }
  .notie-editor input[type="checkbox"] {
    margin-right: 6px;
    vertical-align: middle;
    width: 16px;
    height: 16px;
    cursor: pointer;
  }
  .notie-editor mark {
    border-radius: 2px;
    padding: 1px 2px;
  }
  .notie-editor s, .notie-editor del {
    text-decoration: line-through;
  }

  /* Dark mode overrides */
  .notie-editor.dark blockquote {
    border-left-color: rgba(200,200,200,0.3);
  }
  .notie-editor.dark pre {
    background: rgba(255,255,255,0.08);
  }
  .notie-editor.dark code {
    background: rgba(255,255,255,0.1);
  }
  .notie-editor.dark hr {
    border-top-color: rgba(255,255,255,0.15);
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
      const img = `<p><img src="${url}" /></p>`;
      document.execCommand('insertHTML', false, img);
    }
  }, []);

  return {
    getHTML,
    setContent,
    setImage,
    _isWeb: true,
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

  const setRef = useCallback((el: HTMLDivElement | null) => {
    divRef.current = el;
    if (el && !el.innerHTML) {
      const pending = (editor as any)._pendingContent;
      if (pending) {
        el.innerHTML = pending;
      }
    }
  }, []);

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
      className={`notie-editor${isDark ? ' dark' : ''}`}
      contentEditable={editable}
      suppressContentEditableWarning
      style={{
        color: isDark ? '#e5e5e5' : '#1a1a1a',
        minHeight: 300,
        outline: 'none',
        cursor: editable ? 'text' : 'default',
      }}
    />
  );
}
