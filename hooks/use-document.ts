'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  DocumentJsonContent,
  DocumentRow,
  EMPTY_TIPTAP_DOCUMENT,
  normalizeDocumentContent,
} from '@/types/document';
import { showErrorToast, showSuccessToast } from '@/lib/toast';

interface UseDocumentReturn {
  title: string;
  initialContent: DocumentJsonContent | null;
  lastSavedAt: Date | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  isDirty: boolean;
  permission: 'viewer' | 'editor' | 'owner';
  isReadOnly: boolean;
  setTitle: (title: string) => void;
  setCurrentContent: (content: DocumentJsonContent) => void;
  save: (content: DocumentJsonContent) => Promise<boolean>;
}

function serializeContent(content: DocumentJsonContent): string {
  return JSON.stringify(normalizeDocumentContent(content));
}

function mapDocumentRow(row: DocumentRow) {
  const content = normalizeDocumentContent(row.content);

  return {
    title: row.title,
    content,
    lastSavedAt: new Date(row.updated_at),
    savedTitle: row.title.trim(),
    savedContentKey: serializeContent(content),
  };
}

export function useDocument(docId: string): UseDocumentReturn {
  const [title, setTitle] = useState('');
  const [savedTitle, setSavedTitle] = useState('');
  const [initialContent, setInitialContent] = useState<DocumentJsonContent | null>(null);
  const [savedContentKey, setSavedContentKey] = useState('');
  const [currentContentKey, setCurrentContentKey] = useState('');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permission, setPermission] = useState<'viewer' | 'editor' | 'owner'>('owner');

  const isReadOnly = useMemo(() => permission === 'viewer', [permission]);

  useEffect(() => {
    let active = true;

    async function loadDocument() {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/documents/${docId}`);
        const json = await res.json();

        if (!active) return;

        if (res.ok && json?.success && json.data) {
          const mapped = mapDocumentRow(json.data as DocumentRow);
          setTitle(mapped.title);
          setSavedTitle(mapped.savedTitle);
          setInitialContent(mapped.content);
          setSavedContentKey(mapped.savedContentKey);
          setCurrentContentKey(mapped.savedContentKey);
          setLastSavedAt(mapped.lastSavedAt);
          setPermission(json.data.permission || 'owner');
        } else {
          setError(json?.error ?? 'Document not found');
        }
      } catch (err: any) {
        setError(err?.message ?? 'Network error');
      }

      setIsLoading(false);
    }

    void loadDocument();

    return () => {
      active = false;
    };
  }, [docId]);

  const isDirty = useMemo(() => {
    return title.trim() !== savedTitle || currentContentKey !== savedContentKey;
  }, [title, savedTitle, currentContentKey, savedContentKey]);

  const setCurrentContent = useCallback((content: DocumentJsonContent) => {
    setCurrentContentKey(serializeContent(content));
  }, []);

  const save = useCallback(
    async (content: DocumentJsonContent): Promise<boolean> => {
      const normalizedContent = normalizeDocumentContent(content);
      const nextContentKey = serializeContent(normalizedContent);
      const nextTitle = title.trim();
      const titleChanged = nextTitle !== savedTitle;
      const contentChanged = nextContentKey !== savedContentKey;

      if (!titleChanged && !contentChanged) {
        return false;
      }

      setIsSaving(true);
      setError(null);

      try {
        let latestUpdatedAt = lastSavedAt;

        if (titleChanged) {
          const res = await fetch(`/api/documents/${docId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: nextTitle }),
          });
          const json = await res.json();
          if (!res.ok || !json?.success || !json.data) throw new Error(json?.error ?? 'Unable to rename document');
          setSavedTitle(nextTitle);
          latestUpdatedAt = new Date(json.data.updated_at);
        }

        if (contentChanged) {
          const res = await fetch(`/api/documents/${docId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: normalizedContent }),
          });
          const json = await res.json();
          if (!res.ok || !json?.success || !json.data) throw new Error(json?.error ?? 'Unable to update document content');
          setSavedContentKey(nextContentKey);
          setCurrentContentKey(nextContentKey);
          latestUpdatedAt = new Date(json.data.updated_at);
        }

        setLastSavedAt(latestUpdatedAt);
        showSuccessToast('Document saved');
        return true;
      } catch (saveError) {
        const message = saveError instanceof Error ? saveError.message : 'Unable to save document';
        setError(message);
        showErrorToast(message);
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [docId, lastSavedAt, savedContentKey, savedTitle, title],
  );

  return {
    title,
    initialContent,
    lastSavedAt,
    isLoading,
    isSaving,
    error,
    isDirty,
    permission,
    isReadOnly,
    setTitle,
    setCurrentContent,
    save,
  };
}
