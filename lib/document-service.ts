import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import {
  createDefaultDocumentContent,
  DocumentCreateInput,
  DocumentRow,
  DocumentServiceError,
  DocumentUpdateContentInput,
  DocumentUpdateTitleInput,
} from '@/types/document';

type DocumentShareRow = Database['public']['Tables']['document_shares']['Row'];

export class DocumentService {
  constructor(private supabase: SupabaseClient<Database>) {}

  async createDocument(userId: string, input: DocumentCreateInput = {}): Promise<DocumentRow> {
    const title = input.title?.trim() || 'Untitled Document';
    const content = createDefaultDocumentContent(input.content);

    const { data, error } = await this.supabase
      .from('documents')
      .insert({
        title,
        content,
        owner_id: userId,
      })
      .select('*')
      .single();

    if (error) {
      throw new DocumentServiceError(error.message, 'UNKNOWN');
    }

    if (!data) {
      throw new DocumentServiceError('Failed to create document', 'UNKNOWN');
    }

    return data;
  }

  async getOwnedDocuments(userId: string): Promise<DocumentRow[]> {
    const { data, error } = await this.supabase
      .from('documents')
      .select('*')
      .eq('owner_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      throw new DocumentServiceError(error.message, 'UNKNOWN');
    }

    return data ?? [];
  }

  async getSharedDocuments(userId: string): Promise<(DocumentRow & { owner: { id: string; name: string; email: string }; permission: string })[]> {
    const { data, error } = await this.supabase
      .from('document_shares')
      .select(`
        permission,
        document:documents (
          id,
          title,
          content,
          owner_id,
          created_at,
          updated_at
        )
      `)
      .eq('user_id', userId);

    if (error) {
      throw new DocumentServiceError(error.message, 'UNKNOWN');
    }

    const shares = (data ?? []).filter((s: any) => s.document !== null);
    if (shares.length === 0) return [];

    const ownerIds = [...new Set(shares.map((s: any) => s.document.owner_id))];
    const { data: owners, error: ownersError } = await this.supabase
      .from('users')
      .select('id, email, name')
      .in('id', ownerIds);

    const ownersMap = new Map(
      (owners ?? []).map((o) => [o.id, o])
    );

    return shares.map((s: any) => {
      const owner = ownersMap.get(s.document.owner_id) ?? {
        id: s.document.owner_id,
        name: 'Unknown User',
        email: '',
      };
      return {
        ...s.document,
        permission: s.permission,
        owner,
      };
    });
  }

  async getDocumentById(userId: string, documentId: string): Promise<(DocumentRow & { permission?: 'viewer' | 'editor' | 'owner' }) | null> {
    const { data, error } = await this.supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .maybeSingle();

    if (error) {
      throw new DocumentServiceError(error.message, 'UNKNOWN');
    }

    if (!data) {
      return null;
    }

    if (data.owner_id === userId) {
      return { ...data, permission: 'owner' };
    }

    const share = await this.getShare(documentId, userId);
    if (!share) {
      return null;
    }

    return { ...data, permission: share.permission as 'viewer' | 'editor' };
  }

  async renameDocument(userId: string, input: DocumentUpdateTitleInput): Promise<DocumentRow> {
    const title = input.title.trim();

    if (!title) {
      throw new DocumentServiceError('Title cannot be empty', 'VALIDATION');
    }

    const existing = await this.getOwnedDocumentRecord(input.documentId);

    if (!existing) {
      throw new DocumentServiceError('Document not found', 'NOT_FOUND');
    }

    if (existing.owner_id !== userId) {
      throw new DocumentServiceError('Only the owner can rename this document', 'FORBIDDEN');
    }

    const { data, error } = await this.supabase
      .from('documents')
      .update({ title })
      .eq('id', input.documentId)
      .select('*')
      .single();

    if (error || !data) {
      throw new DocumentServiceError(error?.message ?? 'Unable to rename document', 'UNKNOWN');
    }

    return data;
  }

  async updateDocumentContent(
    userId: string,
    input: DocumentUpdateContentInput,
  ): Promise<DocumentRow> {
    const existing = await this.getOwnedDocumentRecord(input.documentId);

    if (!existing) {
      throw new DocumentServiceError('Document not found', 'NOT_FOUND');
    }

    const isOwner = existing.owner_id === userId;

    if (!isOwner) {
      const share = await this.getShare(input.documentId, userId);

      if (!share) {
        throw new DocumentServiceError('Unauthorized access', 'UNAUTHORIZED');
      }

      if (share.permission !== 'editor') {
        throw new DocumentServiceError('You do not have permission to edit this document', 'FORBIDDEN');
      }
    }

    const { data, error } = await this.supabase
      .from('documents')
      .update({
        content: createDefaultDocumentContent(input.content),
      })
      .eq('id', input.documentId)
      .select('*')
      .single();

    if (error || !data) {
      throw new DocumentServiceError(error?.message ?? 'Unable to update document content', 'UNKNOWN');
    }

    return data;
  }

  async deleteDocument(userId: string, documentId: string): Promise<void> {
    const existing = await this.getOwnedDocumentRecord(documentId);

    if (!existing) {
      throw new DocumentServiceError('Document not found', 'NOT_FOUND');
    }

    if (existing.owner_id !== userId) {
      throw new DocumentServiceError('Only the owner can delete this document', 'FORBIDDEN');
    }

    const { error } = await this.supabase.from('documents').delete().eq('id', documentId);

    if (error) {
      throw new DocumentServiceError(error.message, 'UNKNOWN');
    }
  }

  private async getOwnedDocumentRecord(documentId: string) {
    const { data, error } = await this.supabase
      .from('documents')
      .select('id, owner_id')
      .eq('id', documentId)
      .maybeSingle();

    if (error) {
      throw new DocumentServiceError(error.message, 'UNKNOWN');
    }

    return data;
  }

  private async getShare(documentId: string, userId: string): Promise<DocumentShareRow | null> {
    const { data, error } = await this.supabase
      .from('document_shares')
      .select('*')
      .eq('document_id', documentId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      throw new DocumentServiceError(error.message, 'UNKNOWN');
    }

    return data;
  }
}
