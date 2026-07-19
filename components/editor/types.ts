/**
 * Editor Type Definitions
 * 
 * These types are designed to be compatible with Tiptap while remaining
 * framework-agnostic. They define the interface between the editor UI
 * and the underlying rich text engine (Tiptap or alternative).
 */

// ============================================================================
// Toolbar Types
// ============================================================================

export type EditorAction =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strikethrough'
  | 'heading1'
  | 'heading2'
  | 'bullet'
  | 'numbered'
  | 'quote'
  | 'code'
  | 'undo'
  | 'redo';

export interface ToolbarButton {
  id: EditorAction;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  shortcut?: string;
  isActive?: boolean;
  isDisabled?: boolean;
}

export interface ToolbarGroup {
  group: string;
  buttons: ToolbarButton[];
}

// ============================================================================
// Editor Instance Types
// ============================================================================

/**
 * EditorInstance represents the editor state and methods
 * This will be implemented by Tiptap's Editor instance
 */
export interface EditorInstance {
  // Content management
  getHTML(): string;
  getJSON(): Record<string, any>;
  setContent(content: string | Record<string, any>): void;
  clearContent(): void;

  // Text content
  getText(): string;
  getTextSelection(): string;

  // Editor state
  isActive(name: string, attributes?: Record<string, any>): boolean;
  can(): EditorCommands;
  isFocused: boolean;

  // Events
  on(event: string, callback: (...args: any[]) => void): void;
  off(event: string, callback?: (...args: any[]) => void): void;

  // Lifecycle
  destroy(): void;
}

/**
 * EditorCommands represents available commands in the editor
 * This will be implemented by Tiptap's command chain
 */
export interface EditorCommands {
  toggleBold(): boolean;
  toggleItalic(): boolean;
  toggleUnderline(): boolean;
  toggleStrikethrough(): boolean;
  toggleHeading(level: 1 | 2): boolean;
  toggleBulletList(): boolean;
  toggleOrderedList(): boolean;
  toggleBlockquote(): boolean;
  toggleCodeBlock(): boolean;
  undo(): boolean;
  redo(): boolean;
  setContent(content: string | Record<string, any>): boolean;
  clearContent(): boolean;
}

// ============================================================================
// Editor Props
// ============================================================================

export interface EditorContainerProps {
  /**
   * The editor instance (Tiptap Editor)
   * Will be available after Tiptap integration
   */
  editor: EditorInstance | null;

  /**
   * Current content value
   */
  value: string;

  /**
   * Callback when content changes
   */
  onChange?: (value: string) => void;

  /**
   * Placeholder text
   */
  placeholder?: string;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Disabled state
   */
  isDisabled?: boolean;

  /**
   * Read-only state
   */
  isReadOnly?: boolean;

  /**
   * Auto-focus on mount
   */
  autoFocus?: 'start' | 'end' | 'all' | number | boolean;

  /**
   * Editor extensions/features (for Tiptap)
   */
  extensions?: any[];
}

import type { Editor } from '@tiptap/react';

export interface EditorToolbarProps {
  /**
   * The Tiptap editor instance for checking active states.
   */
  editor: Editor | null;

  /**
   * Callback when a toolbar action is clicked
   */
  onAction?: (action: EditorAction) => void;

  /**
   * Whether the toolbar is disabled
   */
  isDisabled?: boolean;

  /**
   * Custom toolbar groups (optional override)
   */
  customGroups?: ToolbarGroup[];

  /**
   * Additional CSS classes
   */
  className?: string;
}

// ============================================================================
// Tiptap Placeholder Props
// ============================================================================

/**
 * Props structure for Tiptap placeholder extension
 * Useful for reference during integration
 */
export interface TiptapPlaceholderOptions {
  placeholder: string | Record<string, string>;
  showOnlyCurrent?: boolean;
  showOnlyWhenEditable?: boolean;
  emptyNodeClass?: string;
  emptyEditorClass?: string;
}

// ============================================================================
// Content Formats
// ============================================================================

export type ContentFormat = 'html' | 'json' | 'text';

export interface ContentFormats {
  html: string;
  json: Record<string, any>;
  text: string;
}

// ============================================================================
// Editor Events
// ============================================================================

export type EditorEvent = 'update' | 'focus' | 'blur' | 'content-change';

export interface EditorEventMap {
  update: { editor: EditorInstance };
  focus: { editor: EditorInstance };
  blur: { editor: EditorInstance };
  'content-change': { editor: EditorInstance; newContent: string };
}

export type EditorEventListener<E extends EditorEvent> = (
  event: EditorEventMap[E]
) => void;
