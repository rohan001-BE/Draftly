'use client';

import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { EditorContent, useEditor, type Editor } from '@tiptap/react';
import { motion } from 'framer-motion';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import { EditorToolbar } from './editor-toolbar';
import type { DocumentJsonContent } from '@/types/document';
import { EMPTY_TIPTAP_DOCUMENT } from '@/types/document';
import type { EditorAction } from './types';

export interface RichTextEditorHandle {
  getJSON: () => DocumentJsonContent;
  getHTML: () => string;
  setContent: (content: DocumentJsonContent) => void;
  importContent: (content: DocumentJsonContent) => void;
  focus: () => void;
}

interface RichTextEditorProps {
  content: DocumentJsonContent;
  onChange?: (content: DocumentJsonContent) => void;
  placeholder?: string;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  className?: string;
}

const PAGE_HEIGHT = 1123;
const PAGE_GAP = 32;

function runToolbarAction(editor: Editor, action: EditorAction) {
  const chain = editor.chain().focus();

  switch (action) {
    case 'bold':
      chain.toggleBold().run();
      break;
    case 'italic':
      chain.toggleItalic().run();
      break;
    case 'underline':
      chain.toggleUnderline().run();
      break;
    case 'strikethrough':
      chain.toggleStrike().run();
      break;
    case 'heading1':
      chain.toggleHeading({ level: 1 }).run();
      break;
    case 'heading2':
      chain.toggleHeading({ level: 2 }).run();
      break;
    case 'bullet':
      chain.toggleBulletList().run();
      break;
    case 'numbered':
      chain.toggleOrderedList().run();
      break;
    case 'quote':
      chain.toggleBlockquote().run();
      break;
    case 'code':
      chain.toggleCodeBlock().run();
      break;
    case 'undo':
      editor.commands.undo();
      break;
    case 'redo':
      editor.commands.redo();
      break;
    default:
      break;
  }
}

function estimatePageCount(contentHeight: number) {
  if (contentHeight <= PAGE_HEIGHT) return 1;
  return Math.ceil((contentHeight + PAGE_GAP) / (PAGE_HEIGHT + PAGE_GAP));
}

export const RichTextEditor = forwardRef<RichTextEditorHandle, RichTextEditorProps>(
  function RichTextEditor(
    {
      content,
      onChange,
      placeholder = 'Start writing...',
      isDisabled = false,
      isReadOnly = false,
      className = '',
    },
    ref,
  ) {
    const [wordCount, setWordCount] = useState(0);
    const [pageCount, setPageCount] = useState(1);

    const editor = useEditor({
      extensions: [
        StarterKit,
        Underline,
        Placeholder.configure({
          placeholder,
          emptyEditorClass: 'is-editor-empty',
        }),
      ],
      content: content ?? EMPTY_TIPTAP_DOCUMENT,
      editable: !isDisabled && !isReadOnly,
      immediatelyRender: false,
      onUpdate: ({ editor: currentEditor }) => {
        onChange?.(currentEditor.getJSON() as DocumentJsonContent);
        updateStats(currentEditor);
      },
      onCreate: ({ editor: currentEditor }) => {
        updateStats(currentEditor);
      },
      editorProps: {
        attributes: {
          class: 'editor-prosemirror focus:outline-none',
        },
      },
    });

    const updateStats = (currentEditor: Editor) => {
      const text = currentEditor.getText().trim();
      const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
      setWordCount(words);

      const proseEl = currentEditor.view.dom;
      const contentHeight = proseEl.scrollHeight;
      setPageCount(estimatePageCount(contentHeight));
    };

    useEffect(() => {
      if (!editor) return;
      editor.setEditable(!isDisabled && !isReadOnly);
    }, [editor, isDisabled, isReadOnly]);

    useEffect(() => {
      if (!editor) return;

      const observer = new ResizeObserver(() => updateStats(editor));
      observer.observe(editor.view.dom);
      return () => observer.disconnect();
    }, [editor]);

    useImperativeHandle(
      ref,
      () => ({
        getJSON: () => (editor?.getJSON() as DocumentJsonContent) ?? EMPTY_TIPTAP_DOCUMENT,
        setContent: (nextContent) => {
          editor?.commands.setContent(nextContent ?? EMPTY_TIPTAP_DOCUMENT, { emitUpdate: false });
          if (editor) updateStats(editor);
        },
        importContent: (nextContent) => {
          editor?.commands.setContent(nextContent ?? EMPTY_TIPTAP_DOCUMENT, { emitUpdate: true });
          if (editor) updateStats(editor);
        },
        getHTML: () => editor?.getHTML() ?? '',
        focus: () => {
          editor?.commands.focus('end');
        },
      }),
      [editor],
    );

    return (
      <div className={`flex min-h-0 flex-1 flex-col bg-[#dfe3ea] ${className}`}>
        <EditorToolbar
          editor={editor}
          isDisabled={isDisabled || isReadOnly || !editor}
          className="sticky top-0 z-30 shrink-0"
          onAction={(action) => {
            if (editor) runToolbarAction(editor, action);
          }}
        />

        <div className="editor-workspace relative min-h-0 flex-1 overflow-y-auto">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(59,130,246,0.06),transparent_30%),radial-gradient(circle_at_80%_90%,rgba(168,85,247,0.05),transparent_35%)]" />

          <div className="relative mx-auto w-full max-w-[860px] px-4 py-8 sm:px-6 sm:py-10">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="editor-ruler mb-3 hidden sm:block"
              aria-hidden
            >
              <div className="editor-ruler-track" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="editor-page-stack"
            >
              <div className="editor-page-canvas">
                <div className="editor-page-content">
                  <EditorContent editor={editor} />
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="editor-status-bar shrink-0 border-t border-slate-300/80 bg-white/90 px-4 py-2 backdrop-blur-md sm:px-6">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 text-[11px] font-semibold text-slate-500">
            <div className="flex items-center gap-4">
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-blue-700">
                Page {pageCount}
              </span>
              <span className="hidden sm:inline">A4 · Portrait</span>
            </div>
            <div className="flex items-center gap-4">
              <span>{wordCount} {wordCount === 1 ? 'word' : 'words'}</span>
              {isReadOnly ? (
                <span className="rounded-full bg-amber-50 px-2.5 py-1 text-amber-700">Read only</span>
              ) : (
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700">Editing</span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  },
);
