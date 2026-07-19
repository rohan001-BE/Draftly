# Supabase Setup

This project uses Supabase for authentication and document storage.

## Required environment variables

Create a local `.env.local` file with these variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
SUPABASE_DATABASE_PASSWORD=<database-password>
```

## Database migration

If you use the Supabase CLI, run:

```bash
supabase db push --schema supabase/migrations/001_init.sql
```

Or use SQL editor in Supabase:
1. Open Supabase project.
2. Navigate to `SQL Editor`.
3. Paste the contents of `supabase/migrations/001_init.sql`.
4. Run the query.

## Tables created

- `public.documents`
- `public.document_shares`

The migration also adds a trigger to update `updated_at` on document updates.
