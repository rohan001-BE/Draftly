'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, Settings, LogOut, ChevronLeft, ChevronRight, Sparkles, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from '@/lib/types';
import { UserAvatar } from './user-avatar';

interface SidebarProps {
  onLogout?: () => void;
  isMobile?: boolean;
  showLogo?: boolean;
  user?: User | null;
}

const navItems = [
  {
    href: '/dashboard',
    label: 'Documents',
    icon: FileText,
    gradient: 'from-blue-600 via-cyan-500 to-sky-500',
    glow: 'shadow-blue-500/25',
  },
  {
    href: '/chat',
    label: 'AI Assistant',
    icon: MessageCircle,
    gradient: 'from-sky-500 via-cyan-500 to-fuchsia-500',
    glow: 'shadow-cyan-500/25',
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: Settings,
    gradient: 'from-violet-600 via-fuchsia-500 to-pink-500',
    glow: 'shadow-violet-500/25',
  },
];

export function Sidebar({ onLogout, isMobile = false, showLogo = true, user }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const showLabels = !collapsed || isMobile;

  const sidebarContent = (
    <div className="relative flex h-full w-full flex-col justify-between">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.08),transparent_45%),radial-gradient(circle_at_bottom,rgba(168,85,247,0.06),transparent_40%)]" />

      <div className="relative flex flex-col">
        <div
          className={cn(
            'flex w-full border-b border-white/60',
            collapsed && !isMobile ? 'flex-col items-center gap-2 p-3' : 'items-center justify-between p-4'
          )}
        >
          {!isMobile ? (
            <AnimatePresence mode="wait">
              {showLogo && showLabels ? (
                <motion.div
                  key="logo-expanded"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  className="flex min-w-0 items-center gap-3"
                >
                  <motion.div
                    whileHover={{ scale: 1.04, rotateY: 8 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    style={{ transformStyle: 'preserve-3d' }}
                    className="rounded-2xl border border-white/80 bg-white p-2 shadow-[0_12px_40px_-20px_rgba(59,130,246,0.35)]"
                  >
                    <img src="/LOGO.png" alt="Draftly" className="h-8 w-auto object-contain" />
                  </motion.div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900">Draftly</p>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">Workspace</p>
                  </div>
                </motion.div>
              ) : showLogo && !showLabels ? (
                <motion.div
                  key="logo-collapsed"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="mx-auto"
                >
                  <div className="rounded-2xl border border-white/80 bg-white p-2 shadow-lg">
                    <img src="/LOGO.png" alt="Draftly" className="h-8 w-8 object-contain" />
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          ) : null}

          {!isMobile ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              onClick={() => setCollapsed((s) => !s)}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200/80 bg-white/80 text-slate-600 shadow-sm backdrop-blur-sm transition-colors hover:border-blue-200 hover:text-blue-600"
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </motion.button>
          ) : null}
        </div>

        {showLabels ? (
          <div className="px-5 pt-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50/80 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-blue-600">
              <Sparkles className="h-3 w-3" />
              Menu
            </div>
          </div>
        ) : null}

        <nav className="relative mt-4 w-full space-y-2 p-3">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08 }}
              >
                <Link
                  href={item.href}
                  title={item.label}
                  className={cn(
                    'group relative flex items-center gap-3 overflow-hidden rounded-2xl px-3 py-3 transition-all duration-300',
                    collapsed && !isMobile ? 'justify-center px-2' : '',
                    isActive
                      ? 'text-white shadow-lg'
                      : 'text-slate-500 hover:bg-white/70 hover:text-slate-900 hover:shadow-sm'
                  )}
                >
                  {isActive ? (
                    <motion.div
                      layoutId="activeNav"
                      className={cn('absolute inset-0 rounded-2xl bg-gradient-to-r shadow-lg', item.gradient, item.glow)}
                      transition={{ type: 'spring', stiffness: 220, damping: 22 }}
                    />
                  ) : (
                    <div className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-hover:bg-white/50" />
                  )}

                  <motion.div
                    whileHover={{ rotateY: 12, scale: 1.06 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                    style={{ transformStyle: 'preserve-3d' }}
                    className={cn(
                      'relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-300',
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100/80 text-slate-600 group-hover:bg-white group-hover:text-blue-600'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </motion.div>

                  {showLabels ? (
                    <div className="relative z-10 min-w-0 flex-1">
                      <span className="block text-[11px] font-bold uppercase tracking-[0.18em]">{item.label}</span>
                      <span className={cn('mt-0.5 block text-[10px] font-medium', isActive ? 'text-white/75' : 'text-slate-400')}>
                        {item.href === '/dashboard' ? 'All your files' : 'Account & prefs'}
                      </span>
                    </div>
                  ) : null}

                  {isActive && showLabels ? (
                    <motion.span
                      layoutId="activeNavDot"
                      className="relative z-10 h-2 w-2 rounded-full bg-white shadow-sm"
                    />
                  ) : null}
                </Link>
              </motion.div>
            );
          })}
        </nav>
      </div>

      <div className="relative space-y-3 border-t border-white/60 p-3">
        {user && showLabels ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-white/80 bg-white/75 p-3 shadow-sm backdrop-blur-sm"
          >
            <div className="flex items-center gap-3">
              <UserAvatar user={user} size="sm" showRing showStatus />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
                <p className="truncate text-[11px] text-slate-500">{user.email}</p>
              </div>
            </div>
          </motion.div>
        ) : user && collapsed && !isMobile ? (
          <div className="flex justify-center">
            <UserAvatar user={user} size="sm" showRing showStatus />
          </div>
        ) : null}

        <motion.button
          whileHover={{ scale: 1.01, y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={onLogout}
          className={cn(
            'flex w-full items-center gap-3 rounded-2xl border border-red-100/80 bg-gradient-to-r from-red-50/80 to-rose-50/60 px-3.5 py-3 text-xs font-semibold text-red-600 shadow-sm transition-all hover:border-red-200 hover:from-red-50 hover:to-rose-100 hover:shadow-md',
            collapsed && !isMobile ? 'justify-center px-2' : ''
          )}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/80 text-red-500 shadow-sm">
            <LogOut className="h-4 w-4" />
          </div>
          {showLabels ? <span className="tracking-wider uppercase text-[10px]">Logout</span> : null}
        </motion.button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <aside className="flex h-full w-full border-0 bg-gradient-to-b from-slate-50/95 via-white/95 to-blue-50/40">
        {sidebarContent}
      </aside>
    );
  }

  return (
    <motion.aside
      animate={{ width: collapsed ? 76 : 268 }}
      transition={{ type: 'spring', stiffness: 200, damping: 26 }}
      className="relative hidden h-screen flex-shrink-0 overflow-hidden border-r border-white/70 bg-white/55 shadow-[4px_0_40px_-20px_rgba(59,130,246,0.12)] backdrop-blur-2xl sm:flex sticky top-0 z-20"
    >
      {sidebarContent}
    </motion.aside>
  );
}
