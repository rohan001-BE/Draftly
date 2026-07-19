import {
  DocumentJsonContent,
  DocumentPermission,
  TiptapJsonContent,
} from '@/types/document';

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface DocumentsTable {
  Row: {
    id: string;
    title: string;
    content: DocumentJsonContent;
    owner_id: string;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    title?: string;
    content?: DocumentJsonContent;
    owner_id: string;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    title?: string;
    content?: DocumentJsonContent;
    updated_at?: string;
  };
  Relationships: [];
}

export interface DocumentSharesTable {
  Row: {
    id: string;
    document_id: string;
    user_id: string;
    permission: DocumentPermission;
    created_at: string;
  };
  Insert: {
    id?: string;
    document_id: string;
    user_id: string;
    permission: DocumentPermission;
    created_at?: string;
  };
  Update: {
    document_id?: string;
    user_id?: string;
    permission?: DocumentPermission;
    created_at?: string;
  };
  Relationships: [];
}

export interface Database {
  public: {
    Tables: {
      documents: DocumentsTable;
      document_shares: DocumentSharesTable;
    };
    Views: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
        };
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type { TiptapJsonContent };
