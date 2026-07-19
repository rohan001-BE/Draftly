'use client';

import { motion } from 'framer-motion';

interface AnimatedBackgroundProps {
  variant?: 'dashboard' | 'subtle';
}

export function AnimatedBackground({ variant = 'dashboard' }: AnimatedBackgroundProps) {
  const isDashboard = variant === 'dashboard';

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(59,130,246,0.14),transparent_38%),radial-gradient(circle_at_90%_80%,rgba(232,121,249,0.12),transparent_42%),radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.06),transparent_50%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.35),transparent_55%)]" />

      <motion.div
        animate={{ x: [0, 30, -20, 0], y: [0, -25, 15, 0], scale: [1, 1.08, 0.95, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        className={`absolute -left-20 top-10 rounded-full blur-3xl ${
          isDashboard ? 'h-72 w-72 bg-blue-400/25' : 'h-56 w-56 bg-blue-400/15'
        }`}
      />
      <motion.div
        animate={{ x: [0, -35, 25, 0], y: [0, 20, -30, 0], scale: [1, 0.92, 1.1, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className={`absolute -right-16 top-1/3 rounded-full blur-3xl ${
          isDashboard ? 'h-80 w-80 bg-fuchsia-400/20' : 'h-64 w-64 bg-fuchsia-400/12'
        }`}
      />
      <motion.div
        animate={{ x: [0, 20, -15, 0], y: [0, -15, 25, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
        className={`absolute bottom-10 left-1/3 rounded-full blur-3xl ${
          isDashboard ? 'h-64 w-64 bg-cyan-400/18' : 'h-48 w-48 bg-cyan-400/10'
        }`}
      />

      {isDashboard ? (
        <>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
            className="absolute right-1/4 top-1/4 h-32 w-32 rounded-full border border-white/10 bg-gradient-to-br from-blue-500/5 to-violet-500/5 backdrop-blur-sm"
          />
          <motion.div
            animate={{ rotate: -360, y: [0, -12, 0] }}
            transition={{ rotate: { duration: 45, repeat: Infinity, ease: 'linear' }, y: { duration: 6, repeat: Infinity, ease: 'easeInOut' } }}
            className="absolute left-1/4 bottom-1/4 h-24 w-24 rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-500/8 to-blue-500/8 backdrop-blur-sm"
            style={{ transformStyle: 'preserve-3d' }}
          />
          <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(15,23,42,0.4)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.4)_1px,transparent_1px)] bg-[size:48px_48px]" />
        </>
      ) : null}
    </div>
  );
}
