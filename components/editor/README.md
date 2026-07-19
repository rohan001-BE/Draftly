# Editor Components

The editor system is designed to be fully compatible with Tiptap while remaining framework-agnostic. All components are ready for Tiptap integration without any breaking changes.

## Architecture

```
Editor System
├── types.ts                      # Type definitions (EditorInstance, EditorAction, etc.)
├── editor-toolbar.tsx            # Reusable toolbar component
├── tiptap-editor-container.tsx   # Tiptap-ready container
├── rich-text-editor.tsx          # Public API component
├── document-info-panel.tsx       # Side panel (unchanged)
└── README.md                     # This file
```

## Component Hierarchy

```
RichTextEditor (Public API)
└── TiptapEditorContainer (Tiptap-ready)
    ├── EditorToolbar (Reusable)
    └── EditorContentArea (Tiptap integration point)
```

## Components

### RichTextEditor

**Public API component** that maintains backward compatibility.

```typescript
<RichTextEditor
  value={content}
  onChange={setContent}
  placeholder="Start typing..."
  isDisabled={false}
  isReadOnly={false}
/>
```

**Features:**
- Backward compatible with existing code
- Integrates with `useTiptapEditor` hook
- No changes to props interface needed after Tiptap integration
- Automatically passes editor instance to container

### TiptapEditorContainer

**Tiptap-ready container** that handles editor lifecycle and toolbar integration.

```typescript
<TiptapEditorContainer
  editor={editor}              // Tiptap editor instance
  value={content}
  onChange={setContent}
  placeholder="Start typing..."
  isDisabled={false}
  isReadOnly={false}
  autoFocus={false}
  extensions={[]}              // Optional: custom Tiptap extensions
/>
```

**Features:**
- Manages editor-toolbar integration
- Handles content changes and toolbar actions
- Ready for Tiptap's `EditorContent` component
- Supports disabled and read-only states
- Extensible with custom Tiptap extensions

**Integration Points:**
- Replace placeholder textarea with Tiptap's `EditorContent`
- Update `handleToolbarAction` to call `editor.chain()` methods

### EditorToolbar

**Reusable toolbar component** that works with any editor instance.

```typescript
<EditorToolbar
  editor={editor}           // Tiptap editor instance
  onAction={handleAction}   // (action: EditorAction) => void
  isDisabled={false}
  customGroups={undefined}  // Override toolbar buttons
  className=""
/>
```

**Features:**
- Organized button groups (text, headings, lists, blocks, history)
- Active state tracking (ready for Tiptap)
- Customizable button groups
- Keyboard shortcut hints
- Disabled state support

**Supported Actions:**
```typescript
type EditorAction =
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
```

**Customizing Toolbar:**
```typescript
const customGroups: ToolbarGroup[] = [
  {
    group: 'custom',
    buttons: [
      { id: 'bold', icon: Bold, label: 'Bold' },
      { id: 'italic', icon: Italic, label: 'Italic' },
    ],
  },
];

<EditorToolbar editor={editor} customGroups={customGroups} />
```

## Type System

All types are defined in `types.ts` and designed to match Tiptap's interfaces:

### EditorInstance
Represents the editor state and methods (matches Tiptap's `Editor`).

```typescript
interface EditorInstance {
  getHTML(): string;
  getJSON(): Record<string, any>;
  setContent(content: string | Record<string, any>): void;
  isActive(name: string, attributes?: Record<string, any>): boolean;
  can(): EditorCommands;
  isFocused: boolean;
  on(event: string, callback: (...args: any[]) => void): void;
  destroy(): void;
}
```

### EditorCommands
Available editor commands (matches Tiptap's command chain).

```typescript
interface EditorCommands {
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
```

### EditorContainerProps
Props for `TiptapEditorContainer`.

```typescript
interface EditorContainerProps {
  editor: EditorInstance | null;
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  autoFocus?: 'start' | 'end' | 'all' | number | boolean;
  extensions?: any[];
}
```

## Hooks

Editor management hooks are located in `hooks/` directory:

### useTiptapEditor
Manages editor instance lifecycle.

```typescript
const { editor, isReady, isLoading, error } = useTiptapEditor({
  initialContent: '<p>Hello</p>',
  placeholder: 'Start typing...',
  onUpdate: (content) => console.log(content),
  autoFocus: true,
});
```

### useEditorCommands
Provides typed command access.

```typescript
const commands = useEditorCommands(editor);
commands.toggleBold();
commands.undo();
```

### useEditorState
Tracks editor state.

```typescript
const { isFocused, isEmpty, canUndo, canRedo } = useEditorState(editor);
```

## Usage Patterns

### Basic Rich Text Editing

```typescript
import { useState } from 'react';
import { RichTextEditor } from '@/components/editor';

export function EditPage() {
  const [content, setContent] = useState('');

  return (
    <RichTextEditor
      value={content}
      onChange={setContent}
      placeholder="Write your document..."
    />
  );
}
```

### With Custom Toolbar

```typescript
import { useTiptapEditor } from '@/hooks';
import { TiptapEditorContainer } from '@/components/editor';

export function CustomEditor() {
  const { editor } = useTiptapEditor();
  const [content, setContent] = useState('');

  return (
    <TiptapEditorContainer
      editor={editor}
      value={content}
      onChange={setContent}
      extensions={[/* custom extensions */]}
    />
  );
}
```

### With State Management

```typescript
import { useCallback } from 'react';
import { useDocument } from '@/hooks';
import { RichTextEditor } from '@/components/editor';

export function DocumentEditor({ docId }) {
  const { document, updateContent, save, isSaved } = useDocument(docId);

  const handleChange = useCallback(
    (content: string) => {
      updateContent(content);
    },
    [updateContent]
  );

  return (
    <>
      <RichTextEditor
        value={document?.content || ''}
        onChange={handleChange}
      />
      <button onClick={save} disabled={isSaved}>
        {isSaved ? 'Saved' : 'Save'}
      </button>
    </>
  );
}
```

## Tiptap Integration Checklist

- [ ] Install `@tiptap/react` and `@tiptap/starter-kit`
- [ ] Update `useTiptapEditor` hook with Tiptap implementation
- [ ] Update `TiptapEditorContainer` to use `EditorContent`
- [ ] Implement `handleToolbarAction` with `editor.chain()` calls
- [ ] Update `EditorToolbar.isButtonActive()` to use `editor.isActive()`
- [ ] Test all toolbar actions
- [ ] Test keyboard shortcuts
- [ ] Test content persistence
- [ ] Add custom Tiptap extensions as needed
- [ ] Style editor with Tailwind CSS prose classes

See `TIPTAP_INTEGRATION_GUIDE.md` for detailed integration instructions.

## Testing

### Unit Tests
```typescript
import { render, screen } from '@testing-library/react';
import { RichTextEditor } from '@/components/editor';

test('renders editor with placeholder', () => {
  render(
    <RichTextEditor
      value=""
      onChange={jest.fn()}
      placeholder="Test placeholder"
    />
  );
  expect(screen.getByPlaceholderText('Test placeholder')).toBeInTheDocument();
});

test('calls onChange when content is updated', () => {
  const onChange = jest.fn();
  render(<RichTextEditor value="" onChange={onChange} />);

  const textarea = screen.getByRole('textbox');
  fireEvent.change(textarea, { target: { value: 'New content' } });

  expect(onChange).toHaveBeenCalledWith('New content');
});
```

### Integration Tests
```typescript
test('toolbar button click triggers action', () => {
  const onAction = jest.fn();
  render(<EditorToolbar editor={null} onAction={onAction} />);

  fireEvent.click(screen.getByTitle(/bold/i));

  expect(onAction).toHaveBeenCalledWith('bold');
});
```

## Styling

The editor uses Tailwind CSS classes and is styled to match the application design:

- **Container:** `border border-border/30 rounded-xl overflow-hidden shadow-sm hover:shadow-md`
- **Toolbar:** `flex flex-wrap items-center gap-2 p-4 border-b border-border/30 bg-card rounded-t-lg`
- **Content:** `w-full min-h-96 p-6 font-sans text-sm leading-relaxed`

Customize by modifying className props or editing component styles.

## Performance Considerations

1. **Memoization:** Toolbar props are memoized to prevent unnecessary re-renders
2. **Lazy Loading:** Consider lazy-loading the editor for off-screen documents
3. **Debouncing:** Debounce content updates if saving frequently
4. **Extensions:** Only load needed Tiptap extensions

## Accessibility

- Toolbar buttons have proper `title` attributes with keyboard shortcuts
- Editor content area has placeholder text
- Disabled state is properly handled
- Focus management is supported with `autoFocus` prop

## Troubleshooting

**Editor not showing:**
- Check that `TiptapEditorContainer` receives non-null props
- Verify CSS classes are applied
- Check browser console for errors

**Toolbar actions not working:**
- Ensure editor instance is not null
- Verify action handlers are connected
- Check that Tiptap extensions are properly installed

**Content not persisting:**
- Verify `onChange` callback is being called
- Check that content is being saved to parent state
- Ensure document hook is properly handling updates

## Future Enhancements

- [ ] Collaborative editing with Yjs
- [ ] Comment threads
- [ ] Version history
- [ ] AI-assisted writing
- [ ] Content templates
- [ ] Real-time sync
- [ ] Mobile editor support

## Related Documentation

- See `TIPTAP_INTEGRATION_GUIDE.md` for integration steps
- See `hooks/use-tiptap-editor.ts` for hook implementation
- See `components/editor/types.ts` for type definitions
- See `../../REFACTORING.md` for architecture overview
