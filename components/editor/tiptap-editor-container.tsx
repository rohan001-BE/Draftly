'use client';

import { useCallback, useMemo } from 'react';
import { EditorToolbar } from './editor-toolbar';
import { EditorAction, EditorContainerProps, EditorInstance } from './types';

/**
 * TiptapEditorContainer Component
 *
 * A wrapper component that provides the editor UI structure for Tiptap integration.
 *
 * After Tiptap installation, this component will:
 * 1. Initialize the Tiptap editor instance
 * 2. Handle editor events (update, focus, blur)
 * 3. Manage toolbar actions (bold, italic, etc.)
 * 4. Expose content in multiple formats (HTML, JSON, plain text)
 *
 * Current State (Pre-Tiptap):
 * - Component structure is ready
 * - Placeholder rendering for demonstration
 * - All props and interfaces are prepared
 * - Toolbar is fully functional and reusable
 *
 * @example
 * ```tsx
 * // Simple usage (currently using placeholder)
 * <TiptapEditorContainer
 *   editor={null}  // Will be editor instance after integration
 *   value={content}
 *   onChange={setContent}
 *   placeholder="Start typing..."
 * />
 *
 * // After Tiptap integration:
 * const editor = useEditor({
 *   extensions: [...],
 *   content: initialContent,
 * });
 *
 * <TiptapEditorContainer
 *   editor={editor}
 *   value={content}
 *   onChange={setContent}
 * />
 * ```
 */
export function TiptapEditorContainer({
  editor,
  value,
  onChange,
  placeholder = 'Start typing...',
  className = '',
  isDisabled = false,
  isReadOnly = false,
  autoFocus = false,
  extensions = [],
}: EditorContainerProps) {
  /**
   * Handles toolbar actions
   * In Tiptap mode, this will call editor.chain().focus().{action}()
   */
  const handleToolbarAction = useCallback(
    (action: EditorAction) => {
      if (!editor) {
        console.warn('Editor instance not available');
        return;
      }

      // After Tiptap integration, implement like:
      // editor.chain().focus().toggleBold().run();

      console.log('[Editor] Action triggered:', action);
    },
    [editor]
  );

  /**
   * Handles editor content changes
   * In Tiptap mode, this will be triggered by editor.on('update')
   */
  const handleContentChange = useCallback(
    (newContent: string) => {
      onChange?.(newContent);
    },
    [onChange]
  );

  /**
   * Memoized toolbar props to prevent unnecessary re-renders
   */
  const toolbarProps = useMemo(
    () => ({
      editor,
      onAction: handleToolbarAction,
      isDisabled: isDisabled || isReadOnly,
    }),
    [editor, handleToolbarAction, isDisabled, isReadOnly]
  );

  return (
    <div
      className={`border border-border/30 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow ${className}`}
    >
      {/* Toolbar - Reusable across different editor implementations */}
      <EditorToolbar {...toolbarProps} />

      {/* Editor Content Area - Placeholder until Tiptap integration */}
      <EditorContentArea
        editor={editor}
        value={value}
        onChange={handleContentChange}
        placeholder={placeholder}
        isDisabled={isDisabled}
        isReadOnly={isReadOnly}
        autoFocus={autoFocus}
      />
    </div>
  );
}

/**
 * EditorContentArea Component
 *
 * Renders the actual editor content area.
 * This is a separate component to make it easy to swap implementations.
 *
 * Current Implementation (Placeholder):
 * - Renders a textarea for basic text editing
 * - Ready to be replaced with Tiptap's EditorContent
 *
 * After Tiptap Integration:
 * ```tsx
 * import { EditorContent } from '@tiptap/react';
 *
 * // Replace the textarea with:
 * <EditorContent editor={editor} className="..." />
 * ```
 */
interface EditorContentAreaProps {
  editor: EditorInstance | null;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  autoFocus?: boolean | 'start' | 'end' | 'all' | number;
}

function EditorContentArea({
  editor,
  value,
  onChange,
  placeholder,
  isDisabled = false,
  isReadOnly = false,
  autoFocus = false,
}: EditorContentAreaProps) {
  return (
    <div
      className="relative w-full bg-background"
      data-testid="editor-content-area"
    >
      {/* Placeholder Text (visible when empty) */}
      {!value && (
        <div className="absolute inset-0 pointer-events-none p-6 text-sm text-muted-foreground/50">
          {placeholder}
        </div>
      )}

      {/* Editor Content */}
      {/* 
        TIPTAP INTEGRATION POINT:
        Replace this textarea with EditorContent from Tiptap:
        
        import { EditorContent } from '@tiptap/react';
        
        <EditorContent
          editor={editor}
          className="w-full min-h-96 p-6 focus:outline-none bg-background placeholder-muted-foreground/50 leading-relaxed"
        />
      */}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={isDisabled}
        readOnly={isReadOnly}
        autoFocus={autoFocus === true}
        placeholder={placeholder}
        className="w-full min-h-96 p-6 font-sans text-sm resize-none focus:outline-none bg-background placeholder-muted-foreground/50 leading-relaxed disabled:opacity-50 disabled:cursor-not-allowed"
        data-testid="editor-textarea"
      />

      {/* Editor Instance Indicator (for development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="sr-only">
          {editor
            ? 'Tiptap editor instance connected'
            : 'Using placeholder textarea - awaiting Tiptap integration'}
        </div>
      )}
    </div>
  );
}
