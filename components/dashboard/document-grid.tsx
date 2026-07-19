'use client';

import { FileText, FolderOpen, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Document } from '@/lib/types';
import { DocumentCard } from './document-card';
import { DocumentCardSkeleton } from './document-card-skeleton';

interface DocumentGridProps {
  title: string;
  documents: Document[];
  onDelete?: (id: string) => void;
  onShare?: (id: string) => void;
  onRename?: (id: string, currentTitle: string) => void;
  isLoading?: boolean;
  variant?: 'owned' | 'shared';
}

const SECTION_THEMES = {
  owned: {
    icon: FolderOpen,
    gradient: 'from-blue-600 via-cyan-500 to-violet-500',
    badge: 'bg-blue-50 text-blue-700 border-blue-200/60',
    glow: 'shadow-[0_28px_90px_-36px_rgba(59,130,246,0.18)]',
    ring: 'ring-blue-100/80',
  },
  shared: {
    icon: Users,
    gradient: 'from-violet-600 via-fuchsia-500 to-pink-500',
    badge: 'bg-violet-50 text-violet-700 border-violet-200/60',
    glow: 'shadow-[0_28px_90px_-36px_rgba(168,85,247,0.18)]',
    ring: 'ring-violet-100/80',
  },
};

export function DocumentGrid({
  title,
  documents,
  onDelete,
  onShare,
  onRename,
  isLoading,
  variant = 'owned',
}: DocumentGridProps) {
  const theme = SECTION_THEMES[variant];
  const Icon = theme.icon;

  return (
    <section
      className={`mb-10 overflow-hidden rounded-[2rem] border border-white/80 bg-white/75 p-6 ring-1 sm:p-8 ${theme.glow} ${theme.ring} backdrop-blur-xl`}
    >
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${theme.gradient} shadow-lg shadow-blue-500/20`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-slate-400">
              Workspace
            </p>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h2>
            <p className="mt-1 text-sm text-slate-500">
              {documents.length} {documents.length === 1 ? 'document' : 'documents'} in this section
            </p>
          </div>
        </div>

        <div className={`inline-flex items-center gap-2 self-start rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wider ${theme.badge}`}>
          <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-current opacity-70" />
          {documents.length === 0 ? 'Empty' : `${documents.length} Items`}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <DocumentCardSkeleton key={i} accentIndex={i} />
          ))}
        </div>
      ) : documents.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[1.75rem] border border-dashed border-slate-200 bg-gradient-to-br from-slate-50 via-white to-blue-50/40 p-14 text-center"
        >
          <div className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${theme.gradient} shadow-lg`}>
            <FileText className="h-7 w-7 text-white" />
          </div>
          <p className="mb-2 text-lg font-bold text-slate-900">No documents yet</p>
          <p className="mx-auto max-w-sm text-sm leading-relaxed text-slate-500">
            Get started by selecting a template above or creating a blank document with one click.
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {documents.map((doc, index) => (
              <motion.div
                key={doc.id}
                layout
                initial={{ opacity: 0, scale: 0.92, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.2 } }}
                transition={{ type: 'spring', stiffness: 260, damping: 25, delay: index * 0.04 }}
                className="h-full"
              >
                <DocumentCard
                  document={doc}
                  onDelete={onDelete}
                  onShare={onShare}
                  onRename={onRename}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
}
