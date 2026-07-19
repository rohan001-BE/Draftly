import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabaseServer';
import { DocumentService } from '@/lib/document-service';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session || !session.user) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }

  const userId = session.user.id;
  const service = new DocumentService(supabase as any);

  try {
    const doc = await service.createDocument(userId, {
      title: (body.title as string) || 'Untitled Document',
      content: body.content ?? {},
    });

    return NextResponse.json({ success: true, data: doc });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message ?? 'Failed to create document' }, { status: 500 });
  }
}

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session || !session.user) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }

  const userId = session.user.id;
  const service = new DocumentService(supabase as any);

  try {
    const owned = await service.getOwnedDocuments(userId);
    const sharedDocs = await service.getSharedDocuments(userId);

    const shared = sharedDocs.map((doc: any) => ({
      document: {
        id: doc.id,
        title: doc.title,
        content: doc.content,
        owner_id: doc.owner_id,
        created_at: doc.created_at,
        updated_at: doc.updated_at,
      },
      permission: doc.permission,
      owner_name: doc.owner?.name ?? 'Unknown User',
      owner_email: doc.owner?.email ?? '',
    }));

    return NextResponse.json({ success: true, data: { owned: owned ?? [], shared } });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message ?? 'Failed to fetch documents' }, { status: 500 });
  }
}
