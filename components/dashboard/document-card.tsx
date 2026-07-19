'use client';

import Link from 'next/link';
import { FileText, MoreVertical, Share2, Clock, ArrowUpRight } from 'lucide-react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Document } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { extractPreview } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { UserAvatar } from '@/components/common/user-avatar';

interface DocumentCardProps {
  document: Document;
  onDelete?: (id: string) => void;
  onShare?: (id: string) => void;
  onRename?: (id: string, currentTitle: string) => void;
}

const ACCENT_THEMES = [
  {
    bar: 'from-blue-500 via-cyan-400 to-sky-500',
    icon: 'from-blue-500/15 via-cyan-400/10 to-sky-500/15',
    iconColor: 'text-blue-600',
    glow: 'group-hover:shadow-[0_24px_60px_-28px_rgba(59,130,246,0.45)]',
    preview: 'from-blue-50/80 via-cyan-50/50 to-white',
  },
  {
    bar: 'from-violet-600 via-fuchsia-500 to-pink-500',
    icon: 'from-violet-500/15 via-fuchsia-500/10 to-pink-500/15',
    iconColor: 'text-violet-600',
    glow: 'group-hover:shadow-[0_24px_60px_-28px_rgba(168,85,247,0.45)]',
    preview: 'from-violet-50/80 via-fuchsia-50/50 to-white',
  },
  {
    bar: 'from-emerald-500 via-teal-400 to-cyan-500',
    icon: 'from-emerald-500/15 via-teal-400/10 to-cyan-500/15',
    iconColor: 'text-emerald-600',
    glow: 'group-hover:shadow-[0_24px_60px_-28px_rgba(16,185,129,0.4)]',
    preview: 'from-emerald-50/80 via-teal-50/50 to-white',
  },
  {
    bar: 'from-amber-500 via-orange-400 to-rose-400',
    icon: 'from-amber-500/15 via-orange-400/10 to-rose-400/15',
    iconColor: 'text-amber-600',
    glow: 'group-hover:shadow-[0_24px_60px_-28px_rgba(245,158,11,0.4)]',
    preview: 'from-amber-50/80 via-orange-50/50 to-white',
  },
];

function getAccentTheme(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return ACCENT_THEMES[Math.abs(hash) % ACCENT_THEMES.length];
}

export function DocumentCard({ document, onDelete, onShare, onRename }: DocumentCardProps) {
  const theme = getAccentTheme(document.id);
  const formattedDate = document.updatedAt.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springConfig = { stiffness: 150, damping: 15 };
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), springConfig);
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), springConfig);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const mouseX = event.clientX - rect.left - rect.width / 2;
    const mouseY = event.clientY - rect.top - rect.height / 2;
    x.set(mouseX / rect.width);
    y.set(mouseY / rect.height);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: 1000,
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      whileHover={{ scale: 1.015, y: -6 }}
      className="h-full"
    >
      <Card
        style={{ backdropFilter: 'none' }}
        className={`group relative flex h-full min-h-[340px] flex-col overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/95 shadow-[0_8px_32px_-12px_rgba(15,23,42,0.12)] transition-all duration-300 hover:border-blue-200/60 ${theme.glow}`}
      >
        <div className={`h-1.5 w-full bg-gradient-to-r ${theme.bar}`} />

        <Link href={`/editor/${document.id}`} className="flex flex-1 flex-col p-6">
          <div className="mb-4 flex items-start justify-between gap-3" style={{ transform: 'translateZ(10px)' }}>
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${theme.icon} shadow-sm transition-transform duration-300 group-hover:scale-105`}
              >
                <FileText className={`h-5 w-5 ${theme.iconColor}`} />
              </div>
              <div className="min-w-0 flex-1 pt-0.5">
                <h3 className="line-clamp-2 break-words text-lg font-semibold leading-snug text-slate-900 transition-colors duration-300 group-hover:text-blue-700">
                  {document.title}
                </h3>
                <div className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                  <Clock className="h-3 w-3" />
                  <span>Updated {formattedDate}</span>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 flex-col items-end gap-2">
              {document.role ? (
                <Badge
                  className={`rounded-full px-2.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-widest shadow-sm ${
                    document.role === 'owner'
                      ? 'border border-blue-200/60 bg-blue-50 text-blue-700'
                      : document.role === 'editor'
                      ? 'border border-violet-200/60 bg-violet-50 text-violet-700'
                      : 'border border-emerald-200/60 bg-emerald-50 text-emerald-700'
                  }`}
                >
                  {document.role}
                </Badge>
              ) : null}
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200/80 bg-slate-50 text-slate-400 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:text-blue-600">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </div>
          </div>

          <div
            className={`mb-5 min-h-[88px] flex-1 rounded-2xl border border-slate-100 bg-gradient-to-br ${theme.preview} p-4 shadow-inner shadow-slate-200/40`}
            style={{ transform: 'translateZ(5px)' }}
          >
            <p className="line-clamp-3 text-sm leading-relaxed text-slate-500">
              {extractPreview(document.content) || 'Open this document to start writing...'}
            </p>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <div className="flex items-center gap-2 min-w-0">
              <UserAvatar user={document.owner} size="xs" />
              <span className="truncate text-xs font-semibold text-slate-600">
                {document.owner?.name ?? 'User'}
              </span>
            </div>
            {document.isShared ? (
              <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-violet-600">
                Shared
              </span>
            ) : (
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Private
              </span>
            )}
          </div>
        </Link>

        {document.role === 'owner' && (onShare || onDelete) ? (
          <div className="flex items-center gap-2 border-t border-slate-100 bg-slate-50/80 px-6 py-4">
            {onShare ? (
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onShare(document.id);
                }}
                className="h-10 flex-1 gap-1.5 rounded-xl border-slate-200/80 bg-white text-xs font-semibold text-slate-700 shadow-sm transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
              >
                <Share2 className="h-3.5 w-3.5" />
                Share
              </Button>
            ) : null}

            {onDelete ? (
              <DropdownMenu>
                <DropdownMenuTrigger
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-foreground shadow-sm transition hover:border-violet-300 hover:bg-violet-50 focus:outline-none"
                >
                  <MoreVertical className="h-4 w-4 text-slate-500" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl border-slate-200/80">
                  {onRename ? (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onRename(document.id, document.title);
                      }}
                      className="cursor-pointer rounded-lg text-xs font-medium"
                    >
                      Rename
                    </DropdownMenuItem>
                  ) : null}
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(document.id);
                    }}
                    className="cursor-pointer rounded-lg text-xs font-semibold text-destructive hover:bg-destructive/5"
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </div>
        ) : null}
      </Card>
    </motion.div>
  );
}
