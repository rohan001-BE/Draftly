import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const ACCENT_BARS = [
  'from-blue-500 via-cyan-400 to-sky-500',
  'from-violet-600 via-fuchsia-500 to-pink-500',
  'from-emerald-500 via-teal-400 to-cyan-500',
];

interface DocumentCardSkeletonProps {
  accentIndex?: number;
}

export function DocumentCardSkeleton({ accentIndex = 0 }: DocumentCardSkeletonProps) {
  const bar = ACCENT_BARS[accentIndex % ACCENT_BARS.length];

  return (
    <Card className="flex min-h-[340px] flex-col overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/95 shadow-[0_8px_32px_-12px_rgba(15,23,42,0.1)]">
      <div className={`h-1.5 w-full bg-gradient-to-r ${bar} opacity-60`} />
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-4 flex items-start gap-3">
          <Skeleton className="h-12 w-12 shrink-0 rounded-2xl" />
          <div className="flex-1 space-y-2 pt-1">
            <Skeleton className="h-5 w-4/5 rounded-lg" />
            <Skeleton className="h-3 w-28 rounded-full" />
          </div>
        </div>

        <Skeleton className="mb-5 min-h-[88px] flex-1 rounded-2xl" />

        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-7 w-7 rounded-full" />
            <Skeleton className="h-3 w-20 rounded-full" />
          </div>
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-slate-100 bg-slate-50/80 px-6 py-4">
        <Skeleton className="h-10 flex-1 rounded-xl" />
        <Skeleton className="h-10 w-10 rounded-xl" />
      </div>
    </Card>
  );
}
