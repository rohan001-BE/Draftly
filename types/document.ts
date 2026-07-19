export type DocumentPermission = 'viewer' | 'editor';

export type TiptapJsonContent = {
  type: string;
  content?: TiptapJsonContent[];
  attrs?: Record<string, unknown>;
  marks?: Array<Record<string, unknown>>;
  text?: string;
  [key: string]: unknown;
};

export type DocumentJsonContent = TiptapJsonContent | Record<string, unknown>;

export interface DocumentRow {
  id: string;
  title: string;
  content: DocumentJsonContent;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentCreateInput {
  title?: string;
  content?: DocumentJsonContent;
}

export interface DocumentUpdateTitleInput {
  documentId: string;
  title: string;
}

export interface DocumentUpdateContentInput {
  documentId: string;
  content: DocumentJsonContent;
}

export const EMPTY_TIPTAP_DOCUMENT: TiptapJsonContent = {
  type: 'doc',
  content: [],
};

export function createDefaultDocumentContent(
  content?: DocumentJsonContent,
): DocumentJsonContent {
  if (content && typeof content === 'object' && Object.keys(content).length > 0) {
    return content;
  }

  return EMPTY_TIPTAP_DOCUMENT;
}

export function normalizeDocumentContent(
  content: DocumentJsonContent | string,
): DocumentJsonContent {
  if (typeof content === 'string') {
    const trimmed = content.trim();

    if (!trimmed) {
      return EMPTY_TIPTAP_DOCUMENT;
    }

    try {
      const parsed = JSON.parse(trimmed) as DocumentJsonContent;
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    } catch {
      return {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: trimmed }],
          },
        ],
      };
    }
  }

  return createDefaultDocumentContent(content);
}

export function serializeDocumentContent(content: DocumentJsonContent): string {
  return JSON.stringify(content, null, 2);
}

export type ActionResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export class DocumentServiceError extends Error {
  constructor(
    message: string,
    public readonly code: 'UNAUTHORIZED' | 'NOT_FOUND' | 'FORBIDDEN' | 'VALIDATION' | 'UNKNOWN' = 'UNKNOWN',
  ) {
    super(message);
    this.name = 'DocumentServiceError';
  }
}
