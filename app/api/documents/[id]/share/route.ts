import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabaseServer';
import { DocumentService } from '@/lib/document-service';

export async function POST(request: Request, context: { params: { id: string } | Promise<{ id: string }> }) {
  const params = await (context.params as any);
  const body = await request.json().catch(() => ({}));
  const { email, permission } = body as { email?: string; permission?: string };

  if (!email || !permission) {
    return NextResponse.json({ success: false, error: 'Email and permission are required' }, { status: 400 });
  }

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
    const documentId = String(params.id);
    const document = await service.getDocumentById(userId, documentId);
    if (!document) {
      return NextResponse.json({ success: false, error: 'Document not found or unauthorized' }, { status: 404 });
    }

    if (document.permission !== 'owner') {
      return NextResponse.json({ success: false, error: 'Only the owner can share this document' }, { status: 403 });
    }

    // find target user
    const { data: targetUser, error: targetError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', String(email).trim().toLowerCase())
      .maybeSingle();

    if (targetError || !targetUser) {
      return NextResponse.json({ success: false, error: 'User not found with this email address' }, { status: 404 });
    }

    if (targetUser.id === userId) {
      return NextResponse.json({ success: false, error: 'You cannot share with yourself' }, { status: 400 });
    }

    const { data: existingShare } = await supabase
      .from('document_shares')
      .select('id')
      .eq('document_id', documentId)
      .eq('user_id', targetUser.id)
      .maybeSingle();

    if (existingShare) {
      return NextResponse.json({ success: false, error: 'Document already shared with this user' }, { status: 400 });
    }

    const { data: newShare, error: insertError } = await supabase
      .from('document_shares')
      .insert({ document_id: documentId, user_id: targetUser.id, permission })
      .select('*')
      .single();

    if (insertError || !newShare) {
      return NextResponse.json({ success: false, error: insertError?.message ?? 'Failed to share document' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: newShare });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message ?? 'Failed to share document' }, { status: 500 });
  }
}

export async function GET(request: Request, context: { params: { id: string } | Promise<{ id: string }> }) {
  const params = await (context.params as any);
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session || !session.user) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }

  try {
    const { data: shares, error: sharesError } = await supabase
      .from('document_shares')
      .select('id, user_id, permission, created_at')
      .eq('document_id', String(params.id));

    if (sharesError) {
      return NextResponse.json({ success: false, error: sharesError.message }, { status: 500 });
    }

    if (!shares || shares.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    const userIds = shares.map((s) => s.user_id);
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, name')
      .in('id', userIds);

    const usersMap = new Map(users?.map((u) => [u.id, u]) ?? []);
    
    const sharesWithUsers = shares.map((s) => ({
      ...s,
      users: usersMap.get(s.user_id) ?? { id: s.user_id, email: '', name: 'Unknown User' },
    }));

    return NextResponse.json({ success: true, data: sharesWithUsers });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message ?? 'Failed to fetch shares' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: { id: string } | Promise<{ id: string }> }) {
  const params = await (context.params as any);
  const { searchParams } = new URL(request.url);
  const userIdToRemove = searchParams.get('userId');

  if (!userIdToRemove) {
    return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
  }

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
    const documentId = String(params.id);
    const document = await service.getDocumentById(userId, documentId);
    if (!document) {
      return NextResponse.json({ success: false, error: 'Document not found or unauthorized' }, { status: 404 });
    }

    if (document.permission !== 'owner') {
      return NextResponse.json({ success: false, error: 'Only the owner can manage document shares' }, { status: 403 });
    }

    const { error: deleteError } = await supabase
      .from('document_shares')
      .delete()
      .eq('document_id', documentId)
      .eq('user_id', userIdToRemove);

    if (deleteError) {
      return NextResponse.json({ success: false, error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message ?? 'Failed to delete share' }, { status: 500 });
  }
}
