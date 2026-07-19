'use client';

import { useCallback, useEffect, useState } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { getSupabase } from '@/lib/supabaseClient';
import { User, UserRole } from '@/lib/types';

interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const mapSupabaseUser = (supabaseUser: SupabaseUser | null): User | null => {
  if (!supabaseUser) return null;

  return {
    id: supabaseUser.id,
    name:
      supabaseUser.user_metadata?.full_name ||
      supabaseUser.user_metadata?.name ||
      supabaseUser.email?.split('@')[0] ||
      'User',
    email: supabaseUser.email || '',
    avatar: supabaseUser.user_metadata?.avatar || undefined,
    role: (supabaseUser.user_metadata?.role as UserRole) || 'owner',
    createdAt: supabaseUser.created_at ?? undefined,
  };
};

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSession = useCallback(async () => {
    const client = getSupabase();
    if (!client) {
      setLoading(false);
      return;
    }

    const {
      data: { session },
    } = await client.auth.getSession();

    setUser(mapSupabaseUser(session?.user || null));
    setLoading(false);
  }, []);

  useEffect(() => {
    loadSession();

    const setupListener = async () => {
      const client = getSupabase();
      if (!client) return;

      const { data: authListener } = client.auth.onAuthStateChange((_event, session) => {
        setUser(mapSupabaseUser(session?.user || null));
        setLoading(false);
      });

      return () => authListener?.subscription?.unsubscribe();
    };

    let cleanup: void | (() => void);
    setupListener().then((fn) => {
      cleanup = fn as any;
    });
    return () => {
      if (cleanup) cleanup();
    };
  }, [loadSession]);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    const client = getSupabase();
    if (!client) {
      setLoading(false);
      throw new Error('Supabase not configured');
    }

    const { error } = await client.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      throw error;
    }
  }, []);

  const signup = useCallback(async (email: string, password: string) => {
    setLoading(true);
    const response = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const json = await response.json();
    setLoading(false);

    if (!response.ok || json?.error) {
      throw new Error(json?.error || 'Sign up failed. Please try again.');
    }
    setLoading(false);

    if (error) {
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    const client = getSupabase();
    if (!client) return;

    await client.auth.signOut();
    setUser(null);
  }, []);

  return {
    user,
    isAuthenticated: Boolean(user),
    login,
    signup,
    logout,
    loading,
  };
}
