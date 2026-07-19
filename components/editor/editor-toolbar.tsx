'use client';

import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Code,
  Undo2,
  Redo2,
  Type,
} from 'lucide-react';
import type { Editor } from '@tiptap/react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { EditorAction, EditorToolbarProps, ToolbarGroup } from './types';

const DEFAULT_TOOLBAR_GROUPS: ToolbarGroup[] = [
  {
    group: 'history',
    buttons: [
      { id: 'undo', icon: Undo2, label: 'Undo', shortcut: 'Ctrl+Z' },
      { id: 'redo', icon: Redo2, label: 'Redo', shortcut: 'Ctrl+Y' },
    ],
  },
  {
    group: 'text',
    buttons: [
      { id: 'bold', icon: Bold, label: 'Bold', shortcut: 'Ctrl+B' },
      { id: 'italic', icon: Italic, label: 'Italic', shortcut: 'Ctrl+I' },
      { id: 'underline', icon: Underline, label: 'Underline', shortcut: 'Ctrl+U' },
      { id: 'strikethrough', icon: Strikethrough, label: 'Strikethrough', shortcut: 'Ctrl+Shift+X' },
    ],
  },
  {
    group: 'headings',
    buttons: [
      { id: 'heading1', icon: Heading1, label: 'Heading 1' },
      { id: 'heading2', icon: Heading2, label: 'Heading 2' },
    ],
  },
  {
    group: 'lists',
    buttons: [
      { id: 'bullet', icon: List, label: 'Bullet List' },
      { id: 'numbered', icon: ListOrdered, label: 'Numbered List' },
    ],
  },
  {
    group: 'blocks',
    buttons: [
      { id: 'quote', icon: Quote, label: 'Quote' },
      { id: 'code', icon: Code, label: 'Code' },
    ],
  },
];

const ACTIVE_STATE_MAP: Partial<Record<EditorAction, { name: string; attrs?: Record<string, unknown> }>> = {
  bold: { name: 'bold' },
  italic: { name: 'italic' },
  underline: { name: 'underline' },
  strikethrough: { name: 'strike' },
  heading1: { name: 'heading', attrs: { level: 1 } },
  heading2: { name: 'heading', attrs: { level: 2 } },
  bullet: { name: 'bulletList' },
  numbered: { name: 'orderedList' },
  quote: { name: 'blockquote' },
  code: { name: 'codeBlock' },
};

export function EditorToolbar({
  editor,
  onAction,
  isDisabled,
  customGroups,
  className,
}: EditorToolbarProps) {
  const toolbarGroups = customGroups || DEFAULT_TOOLBAR_GROUPS;

  const isButtonActive = (action: EditorAction): boolean => {
    if (!editor) return false;
    const activeState = ACTIVE_STATE_MAP[action];
    if (!activeState) return false;
    return editor.isActive(activeState.name, activeState.attrs);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`relative border border-slate-200/80 bg-white/95 shadow-[0_18px_40px_-24px_rgba(59,130,246,0.18)] backdrop-blur-3xl ${className || ''}`}
    >
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

      <div className="mx-auto flex max-w-7xl justify-center flex-wrap items-center gap-3 overflow-x-auto px-4 py-3 sm:px-6">
        <div className="mr-2 hidden items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50/80 px-3 py-1.5 sm:flex">
          <Type className="h-3.5 w-3.5 text-blue-600" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Format</span>
        </div>

        {toolbarGroups.map((group, groupIndex) => (
          <div key={group.group} className="flex flex-nowrap items-center gap-1">
            {group.buttons.map((button) => {
              const Icon = button.icon;
              const isActive = isButtonActive(button.id as EditorAction);
              const isButtonDisabled = isDisabled || button.isDisabled;

              return (
                <Button
                  key={button.id}
                  size="sm"
                  variant="ghost"
                  onClick={() => onAction?.(button.id as EditorAction)}
                  disabled={isButtonDisabled}
                  title={`${button.label}${button.shortcut ? ` (${button.shortcut})` : ''}`}
                  className={`h-11 w-11 rounded-2xl p-0 transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-br from-primary to-secondary text-white shadow-xl shadow-primary/20 hover:opacity-95'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  } ${isButtonDisabled ? 'cursor-not-allowed opacity-40' : ''}`}
                >
                  <Icon className="h-5 w-5" />
                </Button>
              );
            })}
            {groupIndex < toolbarGroups.length - 1 ? (
              <Separator orientation="vertical" className="hidden sm:block mx-1.5 h-6 bg-slate-200/80" />
            ) : null}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
