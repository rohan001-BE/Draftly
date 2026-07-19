'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { DocumentService } from '@/lib/document-service';
import type {
  ActionResponse,
  DocumentCreateInput,
  DocumentRow,
  DocumentUpdateContentInput,
  DocumentUpdateTitleInput,
} from '@/types/document';
import {
  DocumentServiceError,
  normalizeDocumentContent,
} from '@/types/document';

async function getAuthenticatedUserId(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new DocumentServiceError('Authentication required', 'UNAUTHORIZED');
  }

  return user.id;
}

function mapServiceError(error: unknown): ActionResponse<never> {
  if (error instanceof DocumentServiceError) {
    return { success: false, error: error.message };
  }

  if (error instanceof Error) {
    return { success: false, error: error.message };
  }

  return { success: false, error: 'Unexpected server error' };
}

export async function createDocument(
  input: DocumentCreateInput = {},
): Promise<ActionResponse<DocumentRow>> {
  try {
    const userId = await getAuthenticatedUserId();
    const supabase = await createClient();
    const service = new DocumentService(supabase);
    const data = await service.createDocument(userId, input);

    revalidatePath('/dashboard');
    return { success: true, data };
  } catch (error) {
    return mapServiceError(error);
  }
}

export async function getOwnedDocuments(): Promise<ActionResponse<DocumentRow[]>> {
  try {
    const userId = await getAuthenticatedUserId();
    const supabase = await createClient();
    const service = new DocumentService(supabase);
    const data = await service.getOwnedDocuments(userId);

    return { success: true, data };
  } catch (error) {
    return mapServiceError(error);
  }
}

export async function getDocumentById(
  documentId: string,
): Promise<ActionResponse<DocumentRow & { permission?: 'viewer' | 'editor' | 'owner' }>> {
  try {
    const userId = await getAuthenticatedUserId();
    const supabase = await createClient();
    const service = new DocumentService(supabase);
    const data = await service.getDocumentById(userId, documentId);

    if (!data) {
      return { success: false, error: 'Document not found or unauthorized' };
    }

    return { success: true, data };
  } catch (error) {
    return mapServiceError(error);
  }
}

export async function renameDocument(
  input: DocumentUpdateTitleInput,
): Promise<ActionResponse<DocumentRow>> {
  try {
    const userId = await getAuthenticatedUserId();
    const supabase = await createClient();
    const service = new DocumentService(supabase);
    const data = await service.renameDocument(userId, input);

    revalidatePath('/dashboard');
    revalidatePath(`/editor/${input.documentId}`);
    return { success: true, data };
  } catch (error) {
    return mapServiceError(error);
  }
}

export async function updateDocument(
  input: DocumentUpdateContentInput,
): Promise<ActionResponse<DocumentRow>> {
  try {
    const userId = await getAuthenticatedUserId();
    const supabase = await createClient();
    const service = new DocumentService(supabase);
    const data = await service.updateDocumentContent(userId, {
      documentId: input.documentId,
      content: normalizeDocumentContent(input.content),
    });

    revalidatePath('/dashboard');
    revalidatePath(`/editor/${input.documentId}`);
    return { success: true, data };
  } catch (error) {
    return mapServiceError(error);
  }
}

export async function deleteDocument(
  documentId: string,
): Promise<ActionResponse<null>> {
  try {
    const userId = await getAuthenticatedUserId();
    const supabase = await createClient();
    const service = new DocumentService(supabase);
    await service.deleteDocument(userId, documentId);

    revalidatePath('/dashboard');
    return { success: true, data: null };
  } catch (error) {
    return mapServiceError(error);
  }
}

export async function shareDocument(
  documentId: string,
  email: string,
  permission: 'viewer' | 'editor',
): Promise<ActionResponse<any>> {
  try {
    const userId = await getAuthenticatedUserId();
    const supabase = await createClient();
    const service = new DocumentService(supabase);

    // 1. Verify ownership of the document
    const document = await service.getDocumentById(userId, documentId);
    if (!document) {
      return { success: false, error: 'Document not found or unauthorized' };
    }
    if (document.permission !== 'owner') {
      return { success: false, error: 'Only the owner can share this document' };
    }

    // 2. Find target user by email
    const { data: targetUser, error: targetError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email.trim().toLowerCase())
      .maybeSingle();

    if (targetError || !targetUser) {
      return { success: false, error: 'User not found with this email address' };
    }

    // 3. Prevent sharing with yourself
    if (targetUser.id === userId) {
      return { success: false, error: 'You cannot share a document with yourself' };
    }

    // 4. Prevent duplicate shares
    const { data: existingShare, error: shareCheckError } = await supabase
      .from('document_shares')
      .select('id')
      .eq('document_id', documentId)
      .eq('user_id', targetUser.id)
      .maybeSingle();

    if (existingShare) {
      return { success: false, error: 'This document is already shared with this user' };
    }

    // 5. Insert share row
    const { data: newShare, error: insertError } = await supabase
      .from('document_shares')
      .insert({
        document_id: documentId,
        user_id: targetUser.id,
        permission,
      })
      .select('*')
      .single();

    if (insertError || !newShare) {
      return { success: false, error: insertError?.message ?? 'Failed to share document' };
    }

    return { success: true, data: newShare };
  } catch (error) {
    return mapServiceError(error);
  }
}

export async function getSharedDocuments(): Promise<ActionResponse<any[]>> {
  try {
    const userId = await getAuthenticatedUserId();
    const supabase = await createClient();
    const service = new DocumentService(supabase);
    const data = await service.getSharedDocuments(userId);
    return { success: true, data };
  } catch (error) {
    return mapServiceError(error);
  }
}
