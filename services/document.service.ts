import { Document, DocumentCreateInput, DocumentUpdateInput, Share, ApiResponse } from '@/lib/types';

export class DocumentService {
  static async getDocument(id: string): Promise<ApiResponse<Document>> {
    try {
      const res = await fetch(`/api/documents/${id}`);
      const json = await res.json();
      if (!res.ok || !json?.success) return { success: false, error: json?.error ?? 'Document not found' };
      return { success: true, data: json.data };
    } catch (error: any) {
      return { success: false, error: error?.message ?? 'Failed to fetch document' };
    }
  }

  static async getAllDocuments(): Promise<ApiResponse<Document[]>> {
    try {
      const res = await fetch('/api/documents');
      const json = await res.json();
      if (!res.ok || !json?.success) return { success: false, error: json?.error ?? 'Failed to fetch documents' };
      const { owned = [], shared = [] } = json.data;
      return { success: true, data: [...owned, ...shared.map((s: any) => s.document)] };
    } catch (error: any) {
      return { success: false, error: error?.message ?? 'Failed to fetch documents' };
    }
  }

  static async getOwnedDocuments(): Promise<ApiResponse<Document[]>> {
    try {
      const res = await fetch('/api/documents');
      const json = await res.json();
      if (!res.ok || !json?.success) return { success: false, error: json?.error ?? 'Failed to fetch owned documents' };
      return { success: true, data: json.data.owned ?? [] };
    } catch (error: any) {
      return { success: false, error: error?.message ?? 'Failed to fetch owned documents' };
    }
  }

  static async getSharedDocuments(): Promise<ApiResponse<Document[]>> {
    try {
      const res = await fetch('/api/documents');
      const json = await res.json();
      if (!res.ok || !json?.success) return { success: false, error: json?.error ?? 'Failed to fetch shared documents' };
      return { success: true, data: (json.data.shared ?? []).map((s: any) => s.document) };
    } catch (error: any) {
      return { success: false, error: error?.message ?? 'Failed to fetch shared documents' };
    }
  }

  static async createDocument(input: DocumentCreateInput): Promise<ApiResponse<Document>> {
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: input.title, content: input.content }),
      });
      const json = await res.json();
      if (!res.ok || !json?.success) return { success: false, error: json?.error ?? 'Failed to create document' };
      return { success: true, data: json.data };
    } catch (error: any) {
      return { success: false, error: error?.message ?? 'Failed to create document' };
    }
  }

  static async updateDocument(id: string, input: DocumentUpdateInput): Promise<ApiResponse<Document>> {
    try {
      const res = await fetch(`/api/documents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const json = await res.json();
      if (!res.ok || !json?.success) return { success: false, error: json?.error ?? 'Failed to update document' };
      return { success: true, data: json.data };
    } catch (error: any) {
      return { success: false, error: error?.message ?? 'Failed to update document' };
    }
  }

  static async deleteDocument(id: string): Promise<ApiResponse<void>> {
    try {
      const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok || !json?.success) return { success: false, error: json?.error ?? 'Failed to delete document' };
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error?.message ?? 'Failed to delete document' };
    }
  }

  static async getDocumentShares(documentId: string): Promise<ApiResponse<Share>> {
    try {
      const res = await fetch(`/api/documents/${documentId}/share`);
      const json = await res.json();
      if (!res.ok || !json?.success) return { success: false, error: json?.error ?? 'Failed to fetch shares' };
      return { success: true, data: json.data };
    } catch (error: any) {
      return { success: false, error: error?.message ?? 'Failed to fetch shares' };
    }
  }

  static async shareDocument(documentId: string, userIdOrEmail: string, permission: 'viewer' | 'editor'): Promise<ApiResponse<Share>> {
    try {
      const res = await fetch(`/api/documents/${documentId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userIdOrEmail, permission }),
      });
      const json = await res.json();
      if (!res.ok || !json?.success) return { success: false, error: json?.error ?? 'Failed to share document' };
      return { success: true, data: json.data };
    } catch (error: any) {
      return { success: false, error: error?.message ?? 'Failed to share document' };
    }
  }
}
