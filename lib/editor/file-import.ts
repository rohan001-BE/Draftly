import type { DocumentJsonContent } from '@/types/document';
import { EMPTY_TIPTAP_DOCUMENT } from '@/types/document';

export const IMPORTABLE_FILE_EXTENSIONS = ['.txt', '.md'] as const;
export type ImportableFileExtension = (typeof IMPORTABLE_FILE_EXTENSIONS)[number];

export function getFileExtension(filename: string): string {
  const parts = filename.toLowerCase().split('.');
  if (parts.length < 2) {
    return '';
  }

  return `.${parts.pop()}`;
}

export function isImportableFile(file: File): file is File & { name: `${string}${ImportableFileExtension}` } {
  return IMPORTABLE_FILE_EXTENSIONS.includes(getFileExtension(file.name) as ImportableFileExtension);
}

export async function readTextFile(file: File): Promise<string> {
  return file.text();
}

function createParagraph(text: string): DocumentJsonContent {
  if (!text) {
    return { type: 'paragraph' };
  }

  return {
    type: 'paragraph',
    content: [{ type: 'text', text }],
  };
}

function createHeading(level: 1 | 2 | 3, text: string): DocumentJsonContent {
  return {
    type: 'heading',
    attrs: { level },
    content: text ? [{ type: 'text', text }] : [],
  };
}

function createBulletList(items: string[]): DocumentJsonContent {
  return {
    type: 'bulletList',
    content: items.map((item) => ({
      type: 'listItem',
      content: [createParagraph(item)],
    })),
  };
}

export function plainTextToTiptapJson(text: string): DocumentJsonContent {
  const lines = text.replace(/\r\n/g, '\n').split('\n');

  if (lines.length === 0) {
    return EMPTY_TIPTAP_DOCUMENT;
  }

  return {
    type: 'doc',
    content: lines.map((line) => createParagraph(line)),
  };
}

export function markdownToTiptapJson(markdown: string): DocumentJsonContent {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const content: DocumentJsonContent[] = [];
  let listItems: string[] = [];

  const flushList = () => {
    if (listItems.length === 0) {
      return;
    }

    content.push(createBulletList(listItems));
    listItems = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    if (/^[-*]\s+/.test(line)) {
      listItems.push(line.replace(/^[-*]\s+/, ''));
      continue;
    }

    flushList();

    if (!line.trim()) {
      content.push({ type: 'paragraph' });
      continue;
    }

    if (line.startsWith('### ')) {
      content.push(createHeading(3, line.slice(4).trim()));
      continue;
    }

    if (line.startsWith('## ')) {
      content.push(createHeading(2, line.slice(3).trim()));
      continue;
    }

    if (line.startsWith('# ')) {
      content.push(createHeading(1, line.slice(2).trim()));
      continue;
    }

    if (line.startsWith('> ')) {
      content.push({
        type: 'blockquote',
        content: [createParagraph(line.slice(2).trim())],
      });
      continue;
    }

    content.push(createParagraph(line));
  }

  flushList();

  return {
    type: 'doc',
    content: content.length > 0 ? content : [{ type: 'paragraph' }],
  };
}

export async function fileToTiptapJson(file: File): Promise<DocumentJsonContent> {
  const text = await readTextFile(file);
  const extension = getFileExtension(file.name);

  if (extension === '.md') {
    return markdownToTiptapJson(text);
  }

  if (extension === '.txt') {
    return plainTextToTiptapJson(text);
  }

  throw new Error('Unsupported file type. Only .txt and .md files are allowed.');
}
