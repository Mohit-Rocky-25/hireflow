// ============================================================
// HireFlow — Interview Prep Tool Store (In-Memory)
// ============================================================

import { create } from 'zustand';

export interface PracticeAttempt {
  id: string;
  questionId: string;
  questionText: string;
  category: 'DSA' | 'SYSTEM_DESIGN_BASICS' | 'CORE_CS' | 'BEHAVIORAL_HR';
  userAnswer: string;
  feedbackNotes?: string;
  confidenceScore: 1 | 2 | 3 | 4 | 5;
  practicedAt: string;
}

export interface InterviewToolState {
  version: number;
  bookmarkedQuestionIds: string[];
  attempts: PracticeAttempt[];
  selectedCategory: 'ALL' | 'DSA' | 'SYSTEM_DESIGN_BASICS' | 'CORE_CS' | 'BEHAVIORAL_HR';

  toggleBookmark: (questionId: string) => void;
  recordAttempt: (attempt: Omit<PracticeAttempt, 'id' | 'practicedAt'>) => void;
  setSelectedCategory: (cat: InterviewToolState['selectedCategory']) => void;
  resetInterviewTool: () => void;
}

const DEFAULT_STATE = {
  version: 3,
  bookmarkedQuestionIds: [] as string[],
  attempts: [] as PracticeAttempt[],
  selectedCategory: 'ALL' as const,
};

export const useInterviewToolStore = create<InterviewToolState>()((set) => ({
  ...DEFAULT_STATE,

  toggleBookmark: (questionId) =>
    set((state) => {
      const exists = state.bookmarkedQuestionIds.includes(questionId);
      return {
        bookmarkedQuestionIds: exists
          ? state.bookmarkedQuestionIds.filter((id) => id !== questionId)
          : [...state.bookmarkedQuestionIds, questionId],
      };
    }),

  recordAttempt: (attempt) =>
    set((state) => ({
      attempts: [
        {
          ...attempt,
          id: 'attempt-' + Date.now().toString(36),
          practicedAt: new Date().toISOString(),
        },
        ...state.attempts,
      ],
    })),

  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),

  resetInterviewTool: () => set({ ...DEFAULT_STATE }),
}));
