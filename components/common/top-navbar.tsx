'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Download,
  FileText,
  Menu,
  Share2,
  Upload,
  Save,
  LogOut,
  Settings,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { User } from '@/lib/types';
import { UserAvatar } from './user-avatar';
import { SearchBar } from './search-bar';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';
import { Sidebar } from './sidebar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TopNavbarProps {
  user?: User | null;
  showSearch?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  showLogo?: boolean;
  onLogout?: () => void;
  isEditor?: boolean;
  docTitle?: string;
  isReadOnly?: boolean;
  onTitleChange?: (title: string) => void;
  onTitleBlur?: () => void;
  isSaving?: boolean;
  isDirty?: boolean;
  onImport?: () => void;
  onShare?: () => void;
  documentInfo?: React.ReactNode;
  collaborators?: User[];
  onDownload?: () => void;
  onSave?: () => void;
  onBack?: () => void;
}

export function TopNavbar({
  user,
  showSearch = false,
  searchValue,
  onSearchChange,
  showLogo = true,
  onLogout,
  isEditor = false,
  docTitle = '',
  isReadOnly = false,
  onTitleChange,
  onTitleBlur,
  isSaving = false,
  isDirty = false,
  onImport,
  onShare,
  onDownload,
  documentInfo,
  collaborators = [],
  onSave,
  onBack,
}: TopNavbarProps) {
  const router = useRouter();

  return (
    <motion.nav
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-0 z-40 border-b border-white/60 bg-white/70 shadow-[0_8px_32px_-16px_rgba(59,130,246,0.15)] backdrop-blur-2xl"
    >
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent" />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6 sm:py-0">
        <div className="flex w-full items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            {!isEditor ? (
              <div className="sm:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200/80 bg-white/80 text-slate-700 shadow-sm backdrop-blur-sm"
                    >
                      <Menu className="h-4 w-4" />
                    </motion.button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-full max-w-[95vw] border-0 bg-transparent p-0 sm:w-72">
                    <Sidebar onLogout={onLogout} isMobile showLogo={false} user={user} />
                  </SheetContent>
                </Sheet>
              </div>
            ) : null}

            {isEditor ? (
              onBack ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onBack}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200/80 bg-white/80 text-slate-700 shadow-sm"
                  title="Back to Dashboard"
                >
                  <ArrowLeft className="h-4 w-4" />
                </motion.button>
              ) : (
                <Link
                  href="/dashboard"
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200/80 bg-white/80 text-slate-700 shadow-sm transition hover:scale-105"
                  title="Back to Dashboard"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              )
            ) : null}

            {isEditor ? (
              <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-500 shadow-lg shadow-blue-500/20">
                  <FileText className="h-4 w-4 text-white" />
                </div>
                <input
                  type="text"
                  value={docTitle}
                  onChange={(e) => onTitleChange?.(e.target.value)}
                  onBlur={onTitleBlur}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') e.currentTarget.blur();
                  }}
                  disabled={isReadOnly}
                  className="w-full truncate rounded-xl border-0 bg-transparent px-2 py-1 text-base font-bold tracking-tight text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:bg-white/70 sm:max-w-xs"
                  placeholder="Untitled document"
                />
              </div>
            ) : showLogo ? (
              <Link href="/dashboard" className="group flex items-center gap-3">
                <motion.div
                  whileHover={{ scale: 1.03, rotateY: 10 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  style={{ transformStyle: 'preserve-3d' }}
                  className="rounded-2xl border border-white/80 bg-white p-1.5 shadow-[0_10px_30px_-16px_rgba(59,130,246,0.35)] sm:hidden"
                >
                  <img src="/LOGO.png" alt="Draftly logo" className="h-8 w-auto object-contain" />
                </motion.div>
                <motion.img
                  whileHover={{ scale: 1.02 }}
                  src="/LOGO.png"
                  alt="Draftly logo"
                  className="hidden h-11 w-auto object-contain sm:block sm:h-12"
                />
              </Link>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            {!isEditor && showSearch ? (
              <div className="hidden sm:block">
                <SearchBar value={searchValue} onChange={onSearchChange} />
              </div>
            ) : null}

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <motion.div
                    role="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="group flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white/80 py-1 pl-1 pr-2.5 shadow-sm backdrop-blur-sm transition-all hover:border-blue-200 hover:shadow-[0_8px_24px_-12px_rgba(59,130,246,0.3)] focus:outline-none"
                  >
                    <UserAvatar user={user} size="xs" showRing showStatus />
                    <div className="hidden min-w-0 text-left sm:block">
                      <p className="truncate text-[11px] font-bold text-slate-900 leading-tight">{user.name}</p>
                      <p className="truncate text-[9px] font-medium text-slate-400 leading-none">Online</p>
                    </div>
                    <ChevronDown className="hidden h-3 w-3 text-slate-400 transition-transform group-data-[state=open]:rotate-180 sm:block" />
                  </motion.div>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  sideOffset={10}
                  className="w-72 overflow-hidden rounded-[1.25rem] border border-slate-200/80 bg-white/95 p-0 shadow-[0_24px_60px_-24px_rgba(15,23,42,0.25)] backdrop-blur-xl"
                >
                  <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-900 to-fuchsia-800 px-4 py-5">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.15),transparent_35%)]" />
                    <div className="relative flex items-center gap-3">
                      <UserAvatar user={user} size="lg" showRing />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-white">{user.name}</p>
                        <p className="truncate text-xs text-slate-300">{user.email}</p>
                        <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-200">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          Active now
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-2">
                    <DropdownMenuItem
                      onClick={() => router.push('/settings')}
                      className="cursor-pointer rounded-xl px-3 py-2.5 text-sm font-medium"
                    >
                      <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                        <Settings className="h-4 w-4" />
                      </div>
                      Profile Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => router.push('/dashboard')}
                      className="cursor-pointer rounded-xl px-3 py-2.5 text-sm font-medium"
                    >
                      <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      My Documents
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="my-2 bg-slate-100" />
                    <DropdownMenuItem
                      onClick={onLogout}
                      className="cursor-pointer rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 focus:text-red-600"
                    >
                      <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-xl bg-red-50 text-red-500">
                        <LogOut className="h-4 w-4" />
                      </div>
                      Logout
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </div>
        </div>

        {!isEditor && showSearch ? (
          <div className="w-full sm:hidden">
            <SearchBar value={searchValue} onChange={onSearchChange} />
          </div>
        ) : null}

        {isEditor ? (
          <div className="flex w-full flex-wrap items-center gap-2 justify-between sm:w-auto">
            {collaborators.length > 0 ? (
              <div className="mr-2 hidden flex-wrap items-center gap-2 sm:flex -space-x-2.5 overflow-hidden">
                {collaborators.map((collab) => (
                  <motion.div
                    key={collab.id}
                    whileHover={{ scale: 1.1, zIndex: 10 }}
                    className="inline-block overflow-hidden rounded-full ring-2 ring-white"
                    title={`${collab.name} (${collab.email}) - ${collab.role}`}
                  >
                    <UserAvatar user={collab} size="sm" showRing />
                  </motion.div>
                ))}
              </div>
            ) : null}

            {!isReadOnly && onImport ? (
              <Button variant="outline" size="sm" onClick={onImport} className="h-9 gap-1.5 rounded-xl px-2.5 text-xs sm:px-3">
                <Upload className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Import</span>
              </Button>
            ) : null}

            {!isReadOnly && onDownload ? (
              <Button variant="outline" size="sm" onClick={onDownload} className="h-9 gap-1.5 rounded-xl px-2.5 text-xs sm:px-3">
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Download</span>
              </Button>
            ) : null}

            {!isReadOnly && onSave ? (
              <Button
                size="sm"
                onClick={onSave}
                disabled={isSaving || !isDirty}
                className="h-9 cursor-pointer gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-3 text-xs font-semibold text-white shadow-sm hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Save</span>
              </Button>
            ) : null}

            {onShare ? (
              <Button
                size="sm"
                onClick={onShare}
                className="h-9 gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-violet-500 px-3 text-xs font-semibold text-white shadow-sm hover:opacity-90"
              >
                <Share2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Share</span>
              </Button>
            ) : null}

            {documentInfo ? <div className="block">{documentInfo}</div> : null}
          </div>
        ) : null}
      </div>
    </motion.nav>
  );
}
