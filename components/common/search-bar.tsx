'use client';

import { Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export function SearchBar({
  placeholder = 'Search documents...',
  value,
  onChange,
}: SearchBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="group relative w-full"
    >
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 via-cyan-400/10 to-violet-500/10 opacity-0 blur-sm transition-opacity duration-300 group-focus-within:opacity-100" />
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-black transition-colors" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="relative h-11 rounded-2xl border border-slate-200/80 bg-white/80 pl-11 text-sm text-slate-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_8px_24px_-16px_rgba(59,130,246,0.25)] backdrop-blur-sm transition-all duration-300 placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
      />
    </motion.div>
  );
}
