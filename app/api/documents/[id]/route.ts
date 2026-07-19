import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabaseServer';
import { DocumentService } from '@/lib/document-service';

export async function GET(request: Request, context: { params: { id: string } | Promise<{ id: string }> }) {
  const params = await (context.params as any);
  const isValidUUID = (v: any) => typeof v === 'string' && /^[0-9a-fA-F-]{36}$/.test(v);
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
    if (!isValidUUID(params.id)) {
      return NextResponse.json({ success: false, error: 'Invalid document id' }, { status: 400 });
    }
    const documentId = String(params.id);
    const data = await service.getDocumentById(userId, documentId);
    if (!data) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message ?? 'Failed to fetch document' }, { status: 500 });
  }
}

export async function PUT(request: Request, context: { params: { id: string } | Promise<{ id: string }> }) {
  const params = await (context.params as any);
  const isValidUUID = (v: any) => typeof v === 'string' && /^[0-9a-fA-F-]{36}$/.test(v);
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
    if (!isValidUUID(params.id)) {
      return NextResponse.json({ success: false, error: 'Invalid document id' }, { status: 400 });
    }
    const documentId = String(params.id);
    if (body.title !== undefined) {
      const updated = await service.renameDocument(userId, { documentId, title: String(body.title) });
      return NextResponse.json({ success: true, data: updated });
    }

    if (body.content !== undefined) {
      const updated = await service.updateDocumentContent(userId, { documentId, content: body.content });
      return NextResponse.json({ success: true, data: updated });
    }

    return NextResponse.json({ success: false, error: 'No valid fields to update' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message ?? 'Failed to update document' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: { id: string } | Promise<{ id: string }> }) {
  const params = await (context.params as any);
  const isValidUUID = (v: any) => typeof v === 'string' && /^[0-9a-fA-F-]{36}$/.test(v);
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
    if (!isValidUUID(params.id)) {
      return NextResponse.json({ success: false, error: 'Invalid document id' }, { status: 400 });
    }
    const documentId = String(params.id);
    await service.deleteDocument(userId, documentId);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message ?? 'Failed to delete document' }, { status: 500 });
  }
}
