'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function VerifySentPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg rounded-3xl border border-border/20 bg-card/95 p-10 text-center shadow-xl shadow-primary/10">
        <h1 className="text-3xl font-bold text-foreground">Check your email</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          A verification email has been sent. Click the link in your inbox to confirm your account.
        </p>
        <p className="mt-4 text-sm text-muted-foreground">
          After verification, you will be redirected to the dashboard automatically.
        </p>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/login"
            className="inline-flex h-11 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-primary via-secondary to-accent text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:opacity-95 hover:shadow-xl sm:w-auto sm:px-6"
          >
            Back to login
          </Link>
          <Link
            href="/signup"
            className="inline-flex h-11 w-full items-center justify-center rounded-2xl border border-primary/25 bg-transparent text-primary hover:bg-primary/10 hover:text-primary-foreground transition-all sm:w-auto sm:px-6"
          >
            Try again
          </Link>
        </div>
      </div>
    </div>
  );
}
