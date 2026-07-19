'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabaseClient';
import { createBrowserClientFromConfig } from '@/lib/supabase/browser';
import { Button } from '@/components/ui/button';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState('Verifying your email...');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verify = async () => {
      const parseParams = (search: string) => {
        return new URLSearchParams(search.replace(/^#/, ''));
      };

      const queryParams = parseParams(window.location.search);
      const hashParams = parseParams(window.location.hash);

      const accessToken = queryParams.get('access_token') || hashParams.get('access_token');
      const refreshToken = queryParams.get('refresh_token') || hashParams.get('refresh_token');
      const errorDescription = queryParams.get('error_description') || hashParams.get('error_description');

      if (errorDescription) {
        setError(errorDescription);
        setMessage('Verification failed');
        setIsLoading(false);
        return;
      }

      if (!accessToken || !refreshToken) {
        setMessage('Missing authentication tokens.');
        setError('Verification data is incomplete.');
        setIsLoading(false);
        return;
      }

      let client = getSupabase();
      if (!client && typeof window !== 'undefined') {
        try {
          const res = await fetch('/api/runtime-config');
          if (res.ok) {
            const { url, anonKey } = await res.json();
            if (url && anonKey) client = createBrowserClientFromConfig(url, anonKey);
          }
        } catch {
          // ignore
        }
      }

      if (!client) {
        setError('Supabase not configured');
        setMessage('Verification failed');
        setIsLoading(false);
        return;
      }

      const { error: authError } = await client.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (authError) {
        setError(authError.message);
        setMessage('Unable to verify your account.');
      } else {
        setMessage('Email verified successfully! Redirecting to dashboard...');
        window.setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      }

      setIsLoading(false);
    };

    verify();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg rounded-3xl border border-border/20 bg-card/95 p-10 text-center shadow-xl shadow-primary/10">
        <h1 className="text-3xl font-bold text-foreground">Verify your email</h1>
        <p className="mt-4 text-sm text-muted-foreground">{message}</p>
        {error ? (
          <p className="mt-4 rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        ) : null}
        <div className="mt-8">
          <Button
            variant="outline"
            onClick={() => router.push('/login')}
            disabled={isLoading}
          >
            Back to login
          </Button>
        </div>
      </div>
    </div>
  );
}
