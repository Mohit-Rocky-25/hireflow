// ============================================================
// HireFlow v3 — Salary Tool Store
// Indian Fresher CTC breakdown, Tier-based benchmarks, offer comparisons.
// Versioned schema with auto-migration.
// ============================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SalaryBreakdown {
  id: string;
  companyName: string;
  role: string;
  tier: 'TIER_1_PBC' | 'TIER_2_SERVICE' | 'GCC' | 'STARTUP';
  fixedBaseLpa: number;
  variableBonusLpa: number;
  stocksEsopsLpa: number;
  retentionBonusLpa: number;
  inHandMonthlyInr: number;
  deductionsPfMonthlyInr: number;
  notes?: string;
  receivedDate?: string;
}

export interface SalaryToolState {
  version: number;
  savedOffers: SalaryBreakdown[];
  targetLpa: number;
  selectedTier: 'TIER_1_PBC' | 'TIER_2_SERVICE' | 'GCC' | 'STARTUP';
  
  // Actions
  addOffer: (offer: Omit<SalaryBreakdown, 'id'>) => void;
  removeOffer: (id: string) => void;
  setTargetLpa: (lpa: number) => void;
  setSelectedTier: (tier: SalaryBreakdown['tier']) => void;
  resetSalaryTool: () => void;
}

const DEFAULT_STATE = {
  version: 3,
  savedOffers: [] as SalaryBreakdown[],
  targetLpa: 12,
  selectedTier: 'TIER_1_PBC' as const,
};

export const useSalaryToolStore = create<SalaryToolState>()(
  persist(
    (set) => ({
      ...DEFAULT_STATE,

      addOffer: (offer) =>
        set((state) => ({
          savedOffers: [
            ...state.savedOffers,
            {
              ...offer,
              id: 'offer-' + Date.now().toString(36),
            },
          ],
        })),

      removeOffer: (id) =>
        set((state) => ({
          savedOffers: state.savedOffers.filter((o) => o.id !== id),
        })),

      setTargetLpa: (targetLpa) => set({ targetLpa }),

      setSelectedTier: (selectedTier) => set({ selectedTier }),

      resetSalaryTool: () => set({ ...DEFAULT_STATE }),
    }),
    {
      name: 'hireflow_tool_salary_v3',
      version: 3,
      migrate: (persisted: any) => {
        if (!persisted) return DEFAULT_STATE;
        return {
          ...DEFAULT_STATE,
          ...persisted,
          version: 3,
        };
      },
    }
  )
);
