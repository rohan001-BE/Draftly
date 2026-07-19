'use client';

import { useEffect, useState } from 'react';

function formatRelativeTime(date: Date, now: Date): string {
  const seconds = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 1000));

  if (seconds < 60) {
    return `${seconds} second${seconds === 1 ? '' : 's'} ago`;
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  }

  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

export function useRelativeTime(date: Date | null | undefined, intervalMs = 1000): string {
  const [label, setLabel] = useState('');

  useEffect(() => {
    if (!date) {
      setLabel('never');
      return;
    }

    const update = () => {
      setLabel(formatRelativeTime(date, new Date()));
    };

    update();
    const timer = window.setInterval(update, intervalMs);
    return () => window.clearInterval(timer);
  }, [date, intervalMs]);

  return label;
}
