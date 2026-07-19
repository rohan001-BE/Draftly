import { Document, User, Share, DashboardData } from '@/lib/types';

// Current authenticated user
export const currentUser: User = {
  id: 'user-1',
  name: 'Alex Johnson',
  email: 'alex@example.com',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
  role: 'owner',
};

// Other users for sharing
const collaborator1: User = {
  id: 'user-2',
  name: 'Emma Wilson',
  email: 'emma@example.com',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
  role: 'editor',
};

const collaborator2: User = {
  id: 'user-3',
  name: 'Jordan Lee',
  email: 'jordan@example.com',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan',
  role: 'viewer',
};

const collaborator3: User = {
  id: 'user-4',
  name: 'Casey Smith',
  email: 'casey@example.com',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Casey',
  role: 'editor',
};

// Mock owned documents
const ownedDocuments: Document[] = [
  {
    id: 'doc-1',
    title: 'Q4 Marketing Strategy',
    content:
      'Our Q4 marketing strategy will focus on social media campaigns and content marketing. Key initiatives include launching a new blog series, expanding our YouTube presence, and running targeted ads across platforms.',
    ownerId: currentUser.id,
    owner: currentUser,
    createdAt: new Date('2024-11-15'),
    updatedAt: new Date('2024-12-10'),
    lastModifiedBy: currentUser.name,
    isShared: true,
  },
  {
    id: 'doc-2',
    title: 'Product Roadmap 2025',
    content:
      'Q1: Focus on performance optimization and user interface improvements.\nQ2: Launch new collaboration features and real-time editing.\nQ3: Implement advanced analytics and reporting.\nQ4: Mobile app beta launch.',
    ownerId: currentUser.id,
    owner: currentUser,
    createdAt: new Date('2024-10-22'),
    updatedAt: new Date('2024-12-08'),
    lastModifiedBy: currentUser.name,
    isShared: true,
  },
  {
    id: 'doc-3',
    title: 'Design System Guidelines',
    content:
      'This document outlines our design system standards. All components should follow the established color palette, typography guidelines, and spacing rules. Accessibility is a priority for all new designs.',
    ownerId: currentUser.id,
    owner: currentUser,
    createdAt: new Date('2024-09-10'),
    updatedAt: new Date('2024-12-05'),
    lastModifiedBy: currentUser.name,
    isShared: false,
  },
  {
    id: 'doc-4',
    title: 'Meeting Notes - December 2024',
    content:
      'Topics discussed:\n- Progress on current sprint\n- Upcoming feature releases\n- Team feedback and suggestions\n- Next steps and action items',
    ownerId: currentUser.id,
    owner: currentUser,
    createdAt: new Date('2024-12-01'),
    updatedAt: new Date('2024-12-09'),
    lastModifiedBy: currentUser.name,
    isShared: false,
  },
  {
    id: 'doc-5',
    title: 'Customer Feedback Summary',
    content:
      'Collected feedback from 50+ customers this month. Main themes: improved search functionality, better collaboration tools, and more customization options. Detailed feedback compiled in separate sheets.',
    ownerId: currentUser.id,
    owner: currentUser,
    createdAt: new Date('2024-11-05'),
    updatedAt: new Date('2024-12-03'),
    lastModifiedBy: currentUser.name,
    isShared: true,
  },
  {
    id: 'doc-6',
    title: 'Technical Architecture',
    content:
      'Our system uses a modern microservices architecture with Next.js frontend and Node.js backend. Data is stored in PostgreSQL with real-time sync via WebSockets. All services are containerized with Docker.',
    ownerId: currentUser.id,
    owner: currentUser,
    createdAt: new Date('2024-08-20'),
    updatedAt: new Date('2024-12-02'),
    lastModifiedBy: currentUser.name,
    isShared: false,
  },
];

// Mock shared documents (documents shared WITH the current user)
const sharedDocuments: Document[] = [
  {
    id: 'doc-shared-1',
    title: 'Budget Planning 2025',
    content: 'Annual budget allocation across departments. Q1 focus on engineering and marketing. Reserved contingency fund for unexpected expenses.',
    ownerId: 'user-2',
    owner: collaborator1,
    createdAt: new Date('2024-10-01'),
    updatedAt: new Date('2024-12-07'),
    lastModifiedBy: collaborator1.name,
    isShared: true,
  },
  {
    id: 'doc-shared-2',
    title: 'Team OKRs Q4',
    content:
      'Our quarterly objectives focus on user satisfaction, system performance, and team growth. Key results tracked weekly with monthly reviews.',
    ownerId: 'user-3',
    owner: collaborator2,
    createdAt: new Date('2024-09-15'),
    updatedAt: new Date('2024-12-06'),
    lastModifiedBy: collaborator2.name,
    isShared: true,
  },
  {
    id: 'doc-shared-3',
    title: 'API Documentation',
    content:
      'Complete API reference with endpoint documentation, authentication details, rate limits, and code examples. Updated monthly to reflect latest changes.',
    ownerId: 'user-4',
    owner: collaborator3,
    createdAt: new Date('2024-07-10'),
    updatedAt: new Date('2024-12-01'),
    lastModifiedBy: collaborator3.name,
    isShared: true,
  },
];

// Mock sharing data
export const mockShares: Record<string, Share> = {
  'doc-1': {
    documentId: 'doc-1',
    sharedWith: [
      {
        userId: 'user-2',
        user: collaborator1,
        permission: 'editor',
        sharedAt: new Date('2024-12-01'),
      },
      {
        userId: 'user-3',
        user: collaborator2,
        permission: 'viewer',
        sharedAt: new Date('2024-12-02'),
      },
    ],
  },
  'doc-2': {
    documentId: 'doc-2',
    sharedWith: [
      {
        userId: 'user-4',
        user: collaborator3,
        permission: 'editor',
        sharedAt: new Date('2024-11-15'),
      },
    ],
  },
  'doc-5': {
    documentId: 'doc-5',
    sharedWith: [
      {
        userId: 'user-2',
        user: collaborator1,
        permission: 'viewer',
        sharedAt: new Date('2024-11-20'),
      },
      {
        userId: 'user-4',
        user: collaborator3,
        permission: 'editor',
        sharedAt: new Date('2024-11-25'),
      },
    ],
  },
};

// Create a map of all documents by ID for easy lookup
const documentMap = new Map<string, Document>();
ownedDocuments.forEach((doc) => documentMap.set(doc.id, doc));
sharedDocuments.forEach((doc) => documentMap.set(doc.id, doc));

export function getDocumentById(id: string): Document | undefined {
  return documentMap.get(id);
}

export function getAllDocuments(): Document[] {
  return [...ownedDocuments, ...sharedDocuments];
}

export function getOwnedDocuments(): Document[] {
  return ownedDocuments;
}

export function getSharedDocuments(): Document[] {
  return sharedDocuments;
}

export function getSharesForDocument(documentId: string): Share | undefined {
  return mockShares[documentId];
}

export function getDashboardData(): DashboardData {
  return {
    ownedDocuments,
    sharedDocuments,
    currentUser,
    shares: mockShares,
  };
}

// Mock update function - ready to be replaced with API call
export function updateDocumentMock(
  documentId: string,
  updates: { title?: string; content?: string }
): Document | undefined {
  const doc = documentMap.get(documentId);
  if (doc) {
    if (updates.title) {
      doc.title = updates.title;
    }
    if (updates.content) {
      doc.content = updates.content;
    }
    doc.updatedAt = new Date();
    return doc;
  }
  return undefined;
}

// Mock delete function - ready to be replaced with API call
export function deleteDocumentMock(documentId: string): boolean {
  const index = ownedDocuments.findIndex((doc) => doc.id === documentId);
  if (index > -1) {
    ownedDocuments.splice(index, 1);
    documentMap.delete(documentId);
    delete mockShares[documentId];
    return true;
  }
  return false;
}

// Mock create function - ready to be replaced with API call
export function createDocumentMock(
  title: string,
  content: string,
  ownerId: string = currentUser.id
): Document {
  const newDoc: Document = {
    id: `doc-${Date.now()}`,
    title,
    content,
    ownerId,
    owner: currentUser,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastModifiedBy: currentUser.name,
    isShared: false,
  };
  ownedDocuments.push(newDoc);
  documentMap.set(newDoc.id, newDoc);
  return newDoc;
}

// Mock share function - ready to be replaced with API call
export function shareDocumentMock(
  documentId: string,
  userId: string,
  permission: 'viewer' | 'editor'
): Share | undefined {
  if (!mockShares[documentId]) {
    mockShares[documentId] = {
      documentId,
      sharedWith: [],
    };
  }

  const share = mockShares[documentId];
  const existingShare = share.sharedWith.find((s) => s.userId === userId);

  if (!existingShare) {
    // In production, fetch the actual user
    const user: User = {
      id: userId,
      name: `User ${userId}`,
      email: `user${userId}@example.com`,
      role: 'editor',
    };

    share.sharedWith.push({
      userId,
      user,
      permission,
      sharedAt: new Date(),
    });
  }

  return share;
}
