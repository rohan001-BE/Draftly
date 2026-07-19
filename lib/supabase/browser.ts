import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

export function createBrowserClientFromConfig(url: string, anonKey: string) {
  return createBrowserClient<Database>(url, anonKey);
}
