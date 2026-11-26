// ============================================================
// HireFlow — In-Memory Private Cloud Documents Store
// Populated from public.user_documents on cloud hydration.
// ============================================================

import { create } from 'zustand';
import type { UserDocumentRecord } from '@/sync/mappers';

export interface CloudDocumentsState {
  documents: UserDocumentRecord[];
  setDocuments: (docs: UserDocumentRecord[]) => void;
  addDocument: (doc: UserDocumentRecord) => void;
  removeDocument: (id: string) => void;
  reset: () => void;
}

export const useCloudDocumentsStore = create<CloudDocumentsState>((set) => ({
  documents: [],
  setDocuments: (documents) => set({ documents }),
  addDocument: (doc) =>
    set((state) => ({
      documents: [doc, ...state.documents.filter((d) => d.id !== doc.id)],
    })),
  removeDocument: (id) =>
    set((state) => ({
      documents: state.documents.filter((d) => d.id !== id),
    })),
  reset: () => set({ documents: [] }),
}));
