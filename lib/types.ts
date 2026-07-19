// ============================================================================
// User Types
// ============================================================================

export type UserRole = 'owner' | 'editor' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  createdAt?: string;
}

// ============================================================================
// Document Types
// ============================================================================

export type DocumentPermission = 'viewer' | 'editor' | 'owner';

export interface Document {
  id: string;
  title: string;
  content: string;
  ownerId: string;
  owner: User;
  createdAt: Date;
  updatedAt: Date;
  lastModifiedBy: string;
  isShared: boolean;
  role?: 'owner' | 'editor' | 'viewer';
}

export interface DocumentCreateInput {
  title: string;
  content: string;
}

export interface DocumentUpdateInput {
  title?: string;
  content?: string;
}

// ============================================================================
// Sharing Types
// ============================================================================

export interface SharedUser {
  userId: string;
  user: User;
  permission: DocumentPermission;
  sharedAt: Date;
}

export interface Share {
  documentId: string;
  sharedWith: SharedUser[];
}

export interface ShareInput {
  userId: string;
  permission: DocumentPermission;
}

// ============================================================================
// Dashboard Types
// ============================================================================

export interface DashboardData {
  ownedDocuments: Document[];
  sharedDocuments: Document[];
  currentUser: User;
  shares: Record<string, Share>;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ============================================================================
// Pagination Types
// ============================================================================

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
