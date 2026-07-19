'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Document, Share } from '@/lib/types';
import { getDashboardData, getSharesForDocument } from '@/data/mock';

interface UseDashboardReturn {
  ownedDocuments: Document[];
  sharedDocuments: Document[];
  filteredOwned: Document[];
  filteredShared: Document[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  getSharesForDoc: (docId: string) => Share | undefined;
  isLoading: boolean;
}

export function useDashboard(): UseDashboardReturn {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(getDashboardData());

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setData(getDashboardData());
      setIsLoading(false);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const filteredOwned = useMemo(
    () =>
      data.ownedDocuments.filter((doc) =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [data.ownedDocuments, searchQuery]
  );

  const filteredShared = useMemo(
    () =>
      data.sharedDocuments.filter((doc) =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [data.sharedDocuments, searchQuery]
  );

  const getSharesForDoc = useCallback((docId: string) => {
    return getSharesForDocument(docId);
  }, []);

  return {
    ownedDocuments: data.ownedDocuments,
    sharedDocuments: data.sharedDocuments,
    filteredOwned,
    filteredShared,
    searchQuery,
    setSearchQuery,
    getSharesForDoc,
    isLoading,
  };
}
