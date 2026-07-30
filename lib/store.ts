/**
 * lib/store.ts — Zustand Persistent State Store
 * Persists: code drafts, completed problem history, execution metrics
 * Strategy: zustand/middleware `persist` with localStorage adapter
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DraftEntry {
  code: string;
  lastSaved: number; // Unix timestamp (ms)
}

export interface MetricEntry {
  problemId: string;
  problemTitle: string;
  secondsSpent: number;
  score: number;
  status: 'PASS' | 'PARTIAL' | 'FAIL';
  completedAt: number; // Unix timestamp (ms)
}

interface AppState {
  // Code drafts — keyed by problemId
  drafts: Record<string, DraftEntry>;

  // Completed sessions
  completedProblems: string[];

  // Performance metrics per session
  metrics: MetricEntry[];

  // Actions
  setDraft: (problemId: string, code: string) => void;
  clearDraft: (problemId: string) => void;
  markComplete: (entry: Omit<MetricEntry, 'completedAt'>) => void;
  clearAllData: () => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      drafts: {},
      completedProblems: [],
      metrics: [],

      setDraft: (problemId, code) =>
        set((state) => ({
          drafts: {
            ...state.drafts,
            [problemId]: { code, lastSaved: Date.now() },
          },
        })),

      clearDraft: (problemId) =>
        set((state) => {
          const next = { ...state.drafts };
          delete next[problemId];
          return { drafts: next };
        }),

      markComplete: (entry) =>
        set((state) => ({
          completedProblems: Array.from(
            new Set([...state.completedProblems, entry.problemId])
          ),
          metrics: [
            ...state.metrics.filter((m) => m.problemId !== entry.problemId),
            { ...entry, completedAt: Date.now() },
          ],
        })),

      clearAllData: () =>
        set({ drafts: {}, completedProblems: [], metrics: [] }),
    }),
    {
      name: 'livecode-trainer-state', // localStorage key
      storage: createJSONStorage(() => {
        // Guard: return no-op storage during SSR
        if (typeof window === 'undefined') {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
        return window.localStorage;
      }),
      // Only persist these keys (exclude transient UI state if added later)
      partialize: (state) => ({
        drafts: state.drafts,
        completedProblems: state.completedProblems,
        metrics: state.metrics,
      }),
    }
  )
);

// ─── Selector Helpers ─────────────────────────────────────────────────────────

/** Returns the saved draft code for a problem, or undefined */
export const selectDraft = (problemId: string) => (state: AppState) =>
  state.drafts[problemId]?.code;

/** Completion rate as a 0-1 ratio */
export const selectCompletionRate =
  (totalProblems: number) => (state: AppState) =>
    totalProblems > 0 ? state.completedProblems.length / totalProblems : 0;

/** Average score across completed sessions */
export const selectAvgScore = (state: AppState): number => {
  if (state.metrics.length === 0) return 0;
  const sum = state.metrics.reduce((acc, m) => acc + m.score, 0);
  return Math.round(sum / state.metrics.length);
};

/** Average time per session in seconds */
export const selectAvgTime = (state: AppState): number => {
  if (state.metrics.length === 0) return 0;
  const sum = state.metrics.reduce((acc, m) => acc + m.secondsSpent, 0);
  return Math.round(sum / state.metrics.length);
};
