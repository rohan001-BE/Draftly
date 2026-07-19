import { User, ApiResponse } from '@/lib/types';
import { supabase } from '@/lib/supabaseClient';

export class AuthService {
  static async login(email: string, password: string): Promise<ApiResponse<User>> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { success: false, error: error.message };
      const user = data.user;
      if (!user) return { success: false, error: 'No user returned' };
      return {
        success: true,
        data: {
          id: user.id,
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          email: user.email || '',
          role: (user.user_metadata?.role as any) || 'owner',
          createdAt: user.created_at ?? undefined,
        },
      };
    } catch (err: any) {
      return { success: false, error: err?.message ?? 'Login failed' };
    }
  }

  static async logout(): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message ?? 'Logout failed' };
    }
  }

  static async getCurrentUser(): Promise<ApiResponse<User>> {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user ?? null;
      if (!user) return { success: false, error: 'No active session' };
      return {
        success: true,
        data: {
          id: user.id,
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          email: user.email || '',
          role: (user.user_metadata?.role as any) || 'owner',
          createdAt: user.created_at ?? undefined,
        },
      };
    } catch (err: any) {
      return { success: false, error: err?.message ?? 'Failed to fetch user' };
    }
  }

  static async updateProfile(name: string, email: string): Promise<ApiResponse<User>> {
    try {
      const { data, error } = await supabase.auth.updateUser({ data: { full_name: name } });
      if (error) return { success: false, error: error.message };
      const user = data.user;
      if (!user) return { success: false, error: 'No user returned' };
      return {
        success: true,
        data: {
          id: user.id,
          name: user.user_metadata?.full_name || name,
          email: user.email || email,
          role: (user.user_metadata?.role as any) || 'owner',
          createdAt: user.created_at ?? undefined,
        },
      };
    } catch (err: any) {
      return { success: false, error: err?.message ?? 'Failed to update profile' };
    }
  }
}
