import { createClient } from '@/lib/supabase/client';

/**
 * Lazily create and return a browser Supabase client.
 * Returns `null` when environment variables are not available (e.g. during build-time prerender).
 */
export function getSupabase() {
	try {
		return createClient();
	} catch {
		return null;
	}
}
