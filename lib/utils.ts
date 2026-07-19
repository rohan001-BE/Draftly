import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Safely extract readable text from TipTap / ProseMirror JSON or plain strings.
export function extractPreview(content: unknown, maxLength = 140): string {
  try {
    let doc: any = content;
    if (typeof content === 'string') {
      // Try parsing JSON, otherwise treat as plain text
      try {
        doc = JSON.parse(content);
      } catch {
        const s = content.trim();
        return s.length > maxLength ? s.slice(0, maxLength).trimEnd() + '…' : s;
      }
    }

    const texts: string[] = [];

    const walk = (node: any) => {
      if (!node || texts.join(' ').length > maxLength) return;
      if (typeof node === 'string') {
        texts.push(node);
        return;
      }
      if (Array.isArray(node)) {
        node.forEach(walk);
        return;
      }
      if (node.text && typeof node.text === 'string') {
        texts.push(node.text);
      }
      // common nested props
      if (node.content) walk(node.content);
      if (node.content && Array.isArray(node.content)) node.content.forEach(walk);
      if (node.attrs) walk(node.attrs);
      if (node.type && node.type === 'text' && node.text) texts.push(node.text);
    };

    walk(doc);

    const joined = texts.join(' ').replace(/\s+/g, ' ').trim();
    return joined.length > maxLength ? joined.slice(0, maxLength).trimEnd() + '…' : joined;
  } catch (err) {
    return '';
  }
}
