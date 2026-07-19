'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { TopNavbar } from '@/components/common/top-navbar';
import { AnimatedBackground } from '@/components/common/animated-background';
import { RichTextEditor, type RichTextEditorHandle } from '@/components/editor/rich-text-editor';
import { DocumentFileImport } from '@/components/editor/document-file-import';
import { DocumentInfoPanel } from '@/components/editor/document-info-panel';
import { ShareDialog } from '@/components/modals/share-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useDocument, useDialogState, useAuth, useRelativeTime } from '@/hooks';
import { EMPTY_TIPTAP_DOCUMENT } from '@/types/document';
import type { Document, Share } from '@/lib/types';
import { showSuccessToast, showErrorToast } from '@/lib/toast';

export default function EditorPage() {
  const router = useRouter();
  const params = useParams();
  const docId = params.id as string;
  const editorRef = useRef<RichTextEditorHandle>(null);

  const { user } = useAuth();
  const {
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
  } = useDocument(docId);

  const shareDialog = useDialogState();
  const importDialog = useDialogState();
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);

  const [selectedDocShare, setSelectedDocShare] = useState<Share | undefined>(undefined);
  const [isSharingSubmitting, setIsSharingSubmitting] = useState(false);

  const fetchShares = useCallback(async () => {
    try {
      const res = await fetch(`/api/documents/${docId}/share`);
      const json = await res.json();
      if (res.ok && json?.success && json.data) {
        const mappedShare: Share = {
          documentId: docId,
          sharedWith: json.data.map((s: any) => ({
            userId: s.user_id,
            user: {
              id: s.users?.id || s.user_id,
              name: s.users?.name || 'Unknown',
              email: s.users?.email || '',
              role: s.permission,
            },
            permission: s.permission,
            sharedAt: new Date(s.created_at),
          })),
        };
        setSelectedDocShare(mappedShare);
      } else {
        setSelectedDocShare(undefined);
      }
    } catch (err) {
      console.error('Failed to fetch shares', err);
      setSelectedDocShare(undefined);
    }
  }, [docId]);

  useEffect(() => {
    if (docId) void fetchShares();
  }, [docId, fetchShares]);

  const handleSave = useCallback(async () => {
    if (!editorRef.current) return;
    await save(editorRef.current.getJSON());
  }, [save]);

  const handleDownload = useCallback(() => {
    if (!editorRef.current) return;

    const htmlContent = editorRef.current.getHTML();
    const fullHtml = `<!DOCTYPE html><html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><title>${title || 'document'}</title></head><body>${htmlContent}</body></html>`;
    const blob = new Blob([fullHtml], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${title?.replace(/[^a-z0-9\- ]/gi, '_') || 'document'}.doc`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }, [title]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const handleBack = useCallback(() => {
    if (isDirty) {
      setLeaveDialogOpen(true);
    } else {
      router.push('/dashboard');
    }
  }, [isDirty, router]);

  const handleLeaveWithoutSaving = useCallback(() => {
    setLeaveDialogOpen(false);
    router.push('/dashboard');
  }, [router]);

  const documentForPanel: Document | null =
    initialContent && lastSavedAt
      ? {
          id: docId,
          title,
          content: '',
          ownerId: user?.id ?? '',
          owner: user ?? { id: '', name: 'You', email: '', role: 'owner' },
          createdAt: lastSavedAt,
          updatedAt: lastSavedAt,
          lastModifiedBy: user?.name ?? 'You',
          isShared: false,
        }
      : null;

  const collaborators = selectedDocShare?.sharedWith?.map((sw) => sw.user) ?? [];

  if (error && !initialContent) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-y-auto">
        <AnimatedBackground variant="subtle" />
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative rounded-[1.75rem] border border-red-200 bg-white/90 px-8 py-6 shadow-xl"
        >
          <p className="font-semibold text-red-600">{error}</p>
        </motion.div>
      </div>
    );
  }

  if (isLoading || !initialContent) {
    return (
      <div className="relative flex min-h-screen flex-col overflow-y-auto">
        <AnimatedBackground variant="subtle" />
        <div className="relative flex flex-1 flex-col items-center justify-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
            className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-500 shadow-lg"
          >
            <Loader2 className="h-7 w-7 text-white" />
          </motion.div>
          <div className="text-center">
            <p className="text-lg font-bold text-slate-900">Opening document</p>
            <p className="mt-1 text-sm text-slate-500">Preparing your workspace...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col overflow-y-auto bg-[#dfe3ea] pb-5">
      <TopNavbar
        user={user ?? undefined}
        isEditor
        docTitle={title}
        isReadOnly={isReadOnly}
        onTitleChange={setTitle}
        onTitleBlur={() => void handleSave()}
        isSaving={isSaving}
        isDirty={isDirty}
        onImport={!isReadOnly ? importDialog.open : undefined}
        onShare={permission === 'owner' ? shareDialog.open : undefined}
        onDownload={!isReadOnly ? handleDownload : undefined}
        onSave={handleSave}
        onBack={handleBack}
        collaborators={collaborators}
        documentInfo={
          documentForPanel ? (
            <DocumentInfoPanel document={documentForPanel} share={selectedDocShare} />
          ) : undefined
        }
      />

      <main className="relative flex min-h-0 flex-1 flex-col pt-4">
        <RichTextEditor
          ref={editorRef}
          content={initialContent ?? EMPTY_TIPTAP_DOCUMENT}
          onChange={setCurrentContent}
          placeholder="Start writing your document..."
          isReadOnly={isReadOnly}
          isDisabled={isReadOnly}
          className="min-h-0 flex-1"
        />
      </main>

      <ShareDialog
        open={shareDialog.isOpen}
        onOpenChange={(open) => (open ? shareDialog.open() : shareDialog.close())}
        share={selectedDocShare}
        isSubmitting={isSharingSubmitting}
        onShare={async (email, permission) => {
          setIsSharingSubmitting(true);
          try {
            const res = await fetch(`/api/documents/${docId}/share`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, permission }),
            });
            const json = await res.json();
            if (res.ok && json?.success) {
              showSuccessToast(`Successfully shared document with ${email}`);
              await fetchShares();
            } else {
              showErrorToast(json?.error ?? 'Failed to share document');
            }
          } catch (err: any) {
            showErrorToast(err?.message ?? 'Network error');
          } finally {
            setIsSharingSubmitting(false);
          }
        }}
        onRevoke={async (userId) => {
          try {
            const res = await fetch(`/api/documents/${docId}/share?userId=${userId}`, {
              method: 'DELETE',
            });
            const json = await res.json();
            if (res.ok && json?.success) {
              showSuccessToast('Access revoked successfully');
              await fetchShares();
            } else {
              showErrorToast(json?.error ?? 'Failed to revoke access');
            }
          } catch (err: any) {
            showErrorToast(err?.message ?? 'Network error');
          }
        }}
      />

      <DocumentFileImport
        open={importDialog.isOpen}
        onOpenChange={(open) => (open ? importDialog.open() : importDialog.close())}
        onImport={(content) => {
          editorRef.current?.importContent(content);
          setCurrentContent(content);
        }}
      />

      <Dialog open={leaveDialogOpen} onOpenChange={setLeaveDialogOpen}>
        <DialogContent className="max-w-md rounded-[2rem] border border-border/20 bg-card/95 p-6 shadow-2xl backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle>Unsaved changes</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm text-slate-600">
            <p>You have unsaved changes in your document.</p>
            <p className="text-slate-500">If you leave now, your latest edits will not be saved.</p>
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={() => setLeaveDialogOpen(false)}
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Keep editing
            </button>
            <button
              type="button"
              onClick={handleLeaveWithoutSaving}
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 px-4 text-sm font-semibold text-white shadow-lg shadow-rose-500/20 transition hover:opacity-95"
            >
              Leave without saving
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
