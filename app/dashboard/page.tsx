'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plus, Calendar, Briefcase, Code, Sparkles, Zap, ShieldCheck, Users, FolderOpen, TrendingUp, PenLine, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TopNavbar } from '@/components/common/top-navbar';
import { Sidebar } from '@/components/common/sidebar';
import { AnimatedBackground } from '@/components/common/animated-background';
import { DocumentGrid } from '@/components/dashboard/document-grid';
import { ShareDialog } from '@/components/modals/share-dialog';
import { useDialogState, useAuth } from '@/hooks';
import {
  DocumentRow,
  normalizeDocumentContent,
  serializeDocumentContent,
} from '@/types/document';
import type { Document, User, Share } from '@/lib/types';
import { showSuccessToast, showErrorToast } from '@/lib/toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

const TEMPLATES = [
  {
    id: 'blank',
    name: 'Blank Document',
    title: 'Untitled Document',
    desc: 'Start clean, from scratch',
    icon: Plus,
    gradient: 'from-slate-700 via-blue-600 to-cyan-500',
    bg: 'from-blue-50/80 via-white to-cyan-50/50',
    color: 'text-blue-600',
    content: { type: 'doc', content: [] },
  },
  {
    id: 'meeting',
    name: 'Meeting Notes',
    title: 'Meeting Notes - ' + new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    desc: 'Agenda, attendees & notes',
    icon: Calendar,
    gradient: 'from-blue-600 via-sky-500 to-cyan-400',
    bg: 'from-blue-50/80 via-white to-sky-50/50',
    color: 'text-blue-600',
    content: {
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Meeting Notes' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'Date: ' + new Date().toLocaleDateString() + ' | Time: 10:00 AM' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Attendees' }] },
        {
          type: 'bulletList',
          content: [
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Attendee 1' }] }] },
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Attendee 2' }] }] }
          ]
        },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Agenda' }] },
        { type: 'paragraph', content: [{ type: 'text', text: '1. Project kick-off and goals review' }] },
        { type: 'paragraph', content: [{ type: 'text', text: '2. Task assignments and timeline definition' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Notes' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'Write down key discussion points here...' }] }
      ]
    },
  },
  {
    id: 'project',
    name: 'Project Proposal',
    title: 'Project Proposal - New Launch',
    desc: 'Pitch objectives & timeline',
    icon: Briefcase,
    gradient: 'from-violet-600 via-purple-500 to-fuchsia-500',
    bg: 'from-violet-50/80 via-white to-fuchsia-50/50',
    color: 'text-violet-600',
    content: {
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Project Proposal' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '1. Executive Summary' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'Provide a brief overview of the project, goals, and intended impact.' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '2. Problem Statement' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'Describe the main challenges that this project aims to solve.' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '3. Scope & Requirements' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'Outline the deliverables, scope boundaries, and target user persona.' }] }
      ]
    },
  },
  {
    id: 'spec',
    name: 'Software Spec',
    title: 'Software Spec - System Design',
    desc: 'Abstract, schema & design',
    icon: Code,
    gradient: 'from-amber-500 via-orange-500 to-rose-400',
    bg: 'from-amber-50/80 via-white to-orange-50/50',
    color: 'text-amber-600',
    content: {
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Software Architecture Specification' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Abstract' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'Brief overview of the technical module being constructed.' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'System Diagram' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'Details of APIs, clients, message queues, and storage engines.' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Data Schema' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'Define the SQL schemas, index keys, and database triggers.' }] }
      ]
    },
  },
];

function mapDocumentRow(row: DocumentRow, owner: User): Document {
  return {
    id: row.id,
    title: row.title,
    content: serializeDocumentContent(normalizeDocumentContent(row.content)),
    ownerId: row.owner_id,
    owner,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    lastModifiedBy: owner.name,
    isShared: false,
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [sharedDocuments, setSharedDocuments] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const shareDialog = useDialogState();
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [selectedDocShare, setSelectedDocShare] = useState<Share | undefined>(undefined);
  const [isSharingSubmitting, setIsSharingSubmitting] = useState(false);

  const fetchShares = useCallback(async (docId: string) => {
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
  }, []);

  useEffect(() => {
    if (selectedDocId && shareDialog.isOpen) {
      void fetchShares(selectedDocId);
    } else {
      setSelectedDocShare(undefined);
    }
  }, [selectedDocId, shareDialog.isOpen, fetchShares]);
  
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameDocId, setRenameDocId] = useState<string | null>(null);
  const [renameTitle, setRenameTitle] = useState('');

  const currentOwner: User = user ?? {
    id: '',
    name: 'You',
    email: '',
    role: 'owner',
  };

  useEffect(() => {
    async function loadDocuments() {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch('/api/documents');
        const json = await res.json();
        if (res.ok && json?.success) {
          const { owned = [], shared = [] } = json.data;
          setDocuments(
            owned.map((row: DocumentRow) => ({
              ...mapDocumentRow(row, currentOwner),
              role: 'owner',
            }))
          );

          setSharedDocuments(
            shared.map((s: any) => {
              const row = s.document;
              const ownerUser: User = {
                id: row.owner_id,
                name: s.owner_name || 'Unknown',
                email: s.owner_email || '',
                role: 'owner',
              };
              return {
                id: row.id,
                title: row.title,
                content: serializeDocumentContent(normalizeDocumentContent(row.content)),
                ownerId: row.owner_id,
                owner: ownerUser,
                createdAt: new Date(row.created_at),
                updatedAt: new Date(row.updated_at),
                lastModifiedBy: ownerUser.name,
                isShared: true,
                role: s.permission as 'editor' | 'viewer',
              };
            })
          );
        } else {
          setError(json?.error ?? 'Unable to load documents');
        }
      } catch (err: any) {
        setError(err?.message ?? 'Network error');
      }

      setIsLoading(false);
    }

    loadDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const filteredOwned = useMemo(
    () =>
      documents.filter((doc) =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [documents, searchQuery]
  );

  const filteredShared = useMemo(
    () =>
      sharedDocuments.filter((doc) =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [sharedDocuments, searchQuery]
  );

  const stats = useMemo(
    () => [
      {
        label: 'My Documents',
        value: documents.length,
        icon: FolderOpen,
        gradient: 'from-blue-500 to-cyan-500',
        bg: 'from-blue-50 to-cyan-50/50',
      },
      {
        label: 'Shared With Me',
        value: sharedDocuments.length,
        icon: Users,
        gradient: 'from-violet-500 to-fuchsia-500',
        bg: 'from-violet-50 to-fuchsia-50/50',
      },
      {
        label: 'Total Workspace',
        value: documents.length + sharedDocuments.length,
        icon: TrendingUp,
        gradient: 'from-emerald-500 to-teal-500',
        bg: 'from-emerald-50 to-teal-50/50',
      },
    ],
    [documents.length, sharedDocuments.length]
  );

  const featureCards = [
    {
      tag: 'Quick Start',
      title: 'Create with one click',
      desc: 'Launch a blank document or choose a polished template to start writing instantly.',
      icon: Zap,
      gradient: 'from-blue-600 via-cyan-500 to-sky-500',
      surface: 'from-blue-50/90 via-white to-cyan-50/40',
    },
    {
      tag: 'Collaboration',
      title: 'Share and work together',
      desc: 'Invite teammates with a single click and manage access from your document panel.',
      icon: Users,
      gradient: 'from-violet-600 via-fuchsia-500 to-pink-500',
      surface: 'from-violet-50/90 via-white to-fuchsia-50/40',
    },
    {
      tag: 'Security',
      title: 'Private by default',
      desc: 'Your documents stay secure and accessible only to people you explicitly choose.',
      icon: ShieldCheck,
      gradient: 'from-emerald-600 via-teal-500 to-cyan-500',
      surface: 'from-emerald-50/90 via-white to-teal-50/40',
    },
  ];

  const handleShare = (docId: string) => {
    setSelectedDocId(docId);
    shareDialog.open();
  };

  const handleRename = useCallback((docId: string, currentTitle: string) => {
    setRenameDocId(docId);
    setRenameTitle(currentTitle);
    setRenameOpen(true);
  }, []);

  const handleRenameSubmit = async () => {
    if (!renameDocId || !renameTitle.trim()) return;

    setIsLoading(true);
    let response: any = null;
    try {
      const res = await fetch(`/api/documents/${renameDocId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: renameTitle.trim() }),
      });
      response = await res.json();
    } catch (err: any) {
      response = { success: false, error: err?.message };
    }
    setIsLoading(false);

    if (response && response.success) {
      showSuccessToast('Document renamed successfully');
      setDocuments((docs) =>
        docs.map((doc) =>
          doc.id === renameDocId ? { ...doc, title: renameTitle.trim() } : doc
        )
      );
      setRenameOpen(false);
      router.refresh();
    } else {
      showErrorToast(response?.error ?? 'Failed to rename document');
    }
  };

  const handleDelete = useCallback(
    async (docId: string) => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/documents/${docId}`, { method: 'DELETE' });
        const json = await res.json();
        if (res.ok && json?.success) {
          setDocuments((docs) => docs.filter((doc) => doc.id !== docId));
          setError(null);
          router.refresh();
        } else {
          setError(json?.error ?? 'Failed to delete document');
        }
      } catch (err: any) {
        setError(err?.message ?? 'Network error');
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  const handleCreateDocument = useCallback(async (title: string = 'Untitled Document', content: any = {}) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      });
      const json = await res.json();
      if (res.ok && json?.success && json.data) {
        router.refresh();
        router.push(`/editor/${json.data.id}`);
        return;
      }
      setError(json?.error ?? 'Unable to create document');
    } catch (err: any) {
      setError(err?.message ?? 'Network error');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const handleLogout = useCallback(async () => {
    await logout();
    router.push('/login');
  }, [logout, router]);

  return (
    <div className="relative min-h-screen flex flex-col overflow-y-auto bg-background sm:flex-row">
      <div className="hidden sm:block">
        <Sidebar onLogout={handleLogout} showLogo={false} user={user} />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <TopNavbar
          user={user}
          showSearch={true}
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          onLogout={handleLogout}
        />

        <main className="relative flex-1 overflow-auto">
          <AnimatedBackground variant="dashboard" />

          <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-8 sm:py-10">
            {user ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="relative mb-10 overflow-hidden rounded-[2rem] border border-white/20 bg-gradient-to-br from-slate-950 via-blue-900 to-fuchsia-800 p-8 shadow-[0_24px_80px_-24px_rgba(15,23,42,0.35)] sm:p-10"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.12),transparent_35%)]" />
                <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.08),transparent_60%)]" />

                <div className="relative grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-center">
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                      Welcome back{user.name ? `, ${user.name.split(' ')[0]}` : ''}
                    </h1>
                    <p className="mt-4 max-w-xl text-base leading-7 text-slate-200/90">
                      Create, edit, and share polished documents in one secure workspace designed for modern teams.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3">
                      <Button
                        onClick={() => handleCreateDocument('Untitled Document', TEMPLATES[0].content)}
                        className="h-11 rounded-2xl bg-gradient-to-r from-blue-500 via-cyan-400 to-violet-500 px-6 font-semibold text-white shadow-lg shadow-blue-500/25 hover:opacity-95"
                      >
                        <PenLine className="mr-2 h-4 w-4" />
                        New Document
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          const searchInput = document.querySelector<HTMLInputElement>('input[placeholder*="Search"]');
                          searchInput?.focus();
                        }}
                        className="h-11 rounded-2xl border-white/25 bg-white/10 px-6 font-semibold text-white backdrop-blur-sm hover:bg-white/15"
                      >
                        Search Documents
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                    {stats.map((stat, index) => {
                      const StatIcon = stat.icon;
                      return (
                        <motion.div
                          key={stat.label}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 + index * 0.08 }}
                          whileHover={{ y: -4, scale: 1.02, rotateY: 4 }}
                          style={{ transformStyle: 'preserve-3d' }}
                          className="rounded-[1.5rem] border border-white/15 bg-white/10 p-5 backdrop-blur-md"
                        >
                          <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                            <StatIcon className="h-5 w-5 text-white" />
                          </div>
                          <p className="text-3xl font-bold text-white">{stat.value}</p>
                          <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-300/90">
                            {stat.label}
                          </p>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            ) : null}

            {user ? (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="mb-10 rounded-[2rem] border border-white/80 bg-white/80 p-6 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.12)] backdrop-blur-2xl sm:p-8"
              >
                <div className="mb-6">
                  <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-slate-400">Why Draftly</p>
                  <h2 className="mt-2 text-2xl font-bold text-slate-900">Everything you need to write better</h2>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {featureCards.map((feature, index) => {
                    const FeatureIcon = feature.icon;
                    return (
                      <motion.div
                        key={feature.tag}
                        initial={{ opacity: 0, y: 20, rotateX: 8 }}
                        animate={{ opacity: 1, y: 0, rotateX: 0 }}
                        transition={{ delay: 0.15 + index * 0.08, duration: 0.5 }}
                        whileHover={{ y: -6, rotateY: 4, scale: 1.01 }}
                        style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
                        className={`group relative overflow-hidden rounded-[1.75rem] border border-white/80 bg-gradient-to-br ${feature.surface} p-6 shadow-sm transition-shadow duration-300 hover:shadow-[0_24px_60px_-24px_rgba(15,23,42,0.18)]`}
                      >
                        <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.gradient} shadow-lg transition-transform duration-300 group-hover:scale-105`}>
                          <FeatureIcon className="h-5 w-5 text-white" />
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-slate-400">{feature.tag}</p>
                        <h3 className="mt-2 text-xl font-bold text-slate-900">{feature.title}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-slate-500">{feature.desc}</p>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            ) : null}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-10 overflow-hidden rounded-[2rem] border border-white/80 bg-white/85 p-6 shadow-[0_28px_90px_-36px_rgba(15,23,42,0.14)] backdrop-blur-xl sm:p-8"
            >
              <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-cyan-500 to-violet-500 shadow-lg shadow-blue-500/20">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-slate-400">Templates</p>
                    <h3 className="text-2xl font-bold text-slate-900">Start your next document</h3>
                    <p className="mt-1 text-sm text-slate-500">Pick a polished template or begin with a blank canvas.</p>
                  </div>
                </div>
                <Button
                  onClick={() => handleCreateDocument('Untitled Document', TEMPLATES[0].content)}
                  className="self-start rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-500 to-violet-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 hover:opacity-95"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New Document
                </Button>
              </div>

              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {TEMPLATES.map((tmpl, index) => (
                  <motion.button
                    key={tmpl.id}
                    onClick={() => handleCreateDocument(tmpl.name === 'Blank Document' ? 'Untitled Document' : tmpl.title, tmpl.content)}
                    disabled={isLoading}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12 + index * 0.06 }}
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    className={`group relative flex min-h-[190px] flex-col gap-4 overflow-hidden rounded-[1.75rem] border border-slate-200/70 bg-gradient-to-br ${tmpl.bg} p-6 text-left shadow-[0_18px_40px_-18px_rgba(15,23,42,0.1)] transition-all duration-300 hover:border-blue-200/60 hover:shadow-[0_24px_50px_-20px_rgba(59,130,246,0.2)]`}
                  >
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${tmpl.gradient} shadow-lg transition-transform duration-300 group-hover:scale-110`}>
                      <tmpl.icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="mt-auto">
                      <h4 className="mb-1 text-base font-bold text-slate-900">{tmpl.name}</h4>
                      <p className="text-sm leading-relaxed text-slate-500">{tmpl.desc}</p>
                    </div>
                    <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${tmpl.gradient} opacity-10 blur-2xl transition-opacity duration-300 group-hover:opacity-20`} />
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {error ? (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600">
                {error}
              </div>
            ) : null}

            <div className="space-y-2">
              <DocumentGrid
                title="My Documents"
                documents={filteredOwned}
                onDelete={handleDelete}
                onShare={handleShare}
                onRename={handleRename}
                isLoading={isLoading}
                variant="owned"
              />

              <DocumentGrid
                title="Shared With Me"
                documents={filteredShared}
                isLoading={isLoading}
                variant="shared"
              />
            </div>
          </div>
        </main>
      </div>

      {selectedDocId && (
        <ShareDialog
          open={shareDialog.isOpen}
          onOpenChange={(open) => (open ? shareDialog.open() : shareDialog.close())}
          share={selectedDocShare}
          isSubmitting={isSharingSubmitting}
          onShare={async (email, permission) => {
            setIsSharingSubmitting(true);
            try {
              const res = await fetch(`/api/documents/${selectedDocId}/share`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, permission }),
              });
              const json = await res.json();
              if (res.ok && json?.success) {
                showSuccessToast(`Successfully shared document with ${email}`);
                await fetchShares(selectedDocId);
                router.refresh();
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
              const res = await fetch(`/api/documents/${selectedDocId}/share?userId=${userId}`, {
                method: 'DELETE',
              });
              const json = await res.json();
              if (res.ok && json?.success) {
                showSuccessToast('Access revoked successfully');
                await fetchShares(selectedDocId);
                router.refresh();
              } else {
                showErrorToast(json?.error ?? 'Failed to revoke access');
              }
            } catch (err: any) {
              showErrorToast(err?.message ?? 'Network error');
            }
          }}
        />
      )}

      {renameOpen && (
        <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
          <DialogContent className="max-w-md rounded-[2rem] border border-border/20 bg-card/95 p-6 shadow-2xl backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Rename Document</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">New document title</label>
                <Input
                  value={renameTitle}
                  onChange={(e) => setRenameTitle(e.target.value)}
                  placeholder="Enter document title"
                  className="rounded-xl bg-muted/50 border-border/10 focus:border-primary/50 text-sm h-11"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      void handleRenameSubmit();
                    }
                  }}
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setRenameOpen(false)} className="rounded-xl h-10 px-5 text-sm">
                  Cancel
                </Button>
                <Button onClick={() => void handleRenameSubmit()} disabled={!renameTitle.trim()} className="rounded-xl h-10 px-5 text-sm font-semibold">
                  Rename
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <button
        type="button"
        onClick={() => router.push('/chat')}
        className="fixed bottom-5 right-5 z-50 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-600 via-pink-500 to-orange-400 text-white shadow-[0_18px_40px_-12px_rgba(236,72,153,0.75)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_50px_-16px_rgba(236,72,153,0.85)] focus:outline-none focus:ring-4 focus:ring-fuchsia-300/40 sm:h-14 sm:w-14"
        aria-label="Open Draftly assistant"
      >
        <MessageCircle className="h-7 w-7" />
      </button>
    </div>
  );
}
