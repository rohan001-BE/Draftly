'use client';

import { motion } from 'framer-motion';
import { Avatar, AvatarImage, AvatarFallback, AvatarBadge } from '@/components/ui/avatar';
import { User } from '@/lib/types';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  user?: User | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showRing?: boolean;
  showStatus?: boolean;
  interactive?: boolean;
  className?: string;
}

const sizeClasses = {
  xs: 'h-6 w-6 text-[9px]',
  sm: 'h-9 w-9 text-[10px]',
  md: 'h-10 w-10 text-xs',
  lg: 'h-12 w-12 text-sm',
  xl: 'h-16 w-16 text-base',
};

const ringPadding = {
  xs: 'p-[2px]',
  sm: 'p-[2.5px]',
  md: 'p-[3px]',
  lg: 'p-[3px]',
  xl: 'p-[3.5px]',
};

const GRADIENTS = [
  'from-blue-500 via-cyan-400 to-violet-500',
  'from-violet-600 via-fuchsia-500 to-pink-500',
  'from-emerald-500 via-teal-400 to-cyan-500',
  'from-amber-500 via-orange-400 to-rose-400',
];

function getUserGradient(idOrName: string) {
  let hash = 0;
  for (let i = 0; i < idOrName.length; i++) {
    hash = idOrName.charCodeAt(i) + ((hash << 5) - hash);
  }
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}

export function UserAvatar({
  user,
  size = 'md',
  showRing = false,
  showStatus = false,
  interactive = false,
  className,
}: UserAvatarProps) {
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'U';

  const gradient = getUserGradient(user?.id || user?.email || user?.name || 'guest');

  const avatar = (
    <Avatar
      className={cn(
        sizeClasses[size],
        'relative overflow-hidden border-2 border-white shadow-md',
        className
      )}
    >
      {user?.avatar ? <AvatarImage src={user.avatar} alt={user.name} /> : null}
      <AvatarFallback
        className={cn(
          'bg-gradient-to-br font-bold text-white',
          gradient
        )}
      >
        {initials}
      </AvatarFallback>
      {showStatus ? (
        <AvatarBadge className="size-2.5 border-2 border-white bg-emerald-500 ring-0" />
      ) : null}
    </Avatar>
  );

  const content = showRing ? (
    <div
      className={cn(
        'relative inline-flex rounded-full bg-gradient-to-br shadow-lg',
        gradient,
        ringPadding[size]
      )}
    >
      {avatar}
    </div>
  ) : (
    avatar
  );

  if (interactive) {
    return (
      <motion.div
        whileHover={{ scale: 1.06, rotateY: 8 }}
        whileTap={{ scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 320, damping: 20 }}
        style={{ transformStyle: 'preserve-3d', perspective: 800 }}
        className="inline-flex"
      >
        {content}
      </motion.div>
    );
  }

  return content;
}
