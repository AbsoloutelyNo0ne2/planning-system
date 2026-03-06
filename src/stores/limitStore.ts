/**
 * @fileoverview Limit Store (Zustand) - Per-Task-Type Limits
 * 
 * PURPOSE:
 * Tracks daily task completion counts per task type.
 * Provides type-specific limit checking and UI state.
 * 
 * LIMITS:
 * - Hybrid: 7/day
 * - Non-Agentic: 7/day
 * - Agentic: Unlimited
 * 
 * LAYER STATUS: Layer 1-3 Complete
 * NEXT: Layer 4 - Implement with date checking
 */

import { create, StoreApi } from 'zustand';
import { useStore } from 'zustand';
import {
  LimitState,
  createInitialLimitState,
  checkHybridLimitReached,
  checkNonAgenticLimitReached,
  checkAgenticLimitReached,
  checkLimitReachedForType,
  getHybridRemaining,
  getNonAgenticRemaining,
  getAgenticRemaining,
  getRemainingForType,
  incrementTaskCount,
  resetIfNeeded,
  shouldShowBlurForType,
  shouldDisableButtonsForType,
} from '../services/limitService';
import { TaskType } from '../types/task';

// SECTION: State
// Lines 16-50: Extended from LimitState with per-type UI state
export interface LimitStoreState extends LimitState {
  // Per-type UI state
  isHybridLimitReached: boolean;
  isNonAgenticLimitReached: boolean;
  isAgenticLimitReached: boolean; // Always false
  
  // Per-type remaining counts
  hybridRemaining: number;
  nonAgenticRemaining: number;
  agenticRemaining: number; // Always Infinity
  
  // Per-type blur states
  shouldBlurHybrid: boolean;
  shouldBlurNonAgentic: boolean;
  shouldBlurAgentic: boolean;
  
  // Per-type button disable states
  shouldDisableHybridButtons: boolean;
  shouldDisableNonAgenticButtons: boolean;
  shouldDisableAgenticButtons: boolean;
  
  // Legacy compatibility (for gradual migration)
  isLimitReached: boolean;
  remainingTasks: number;
  shouldBlur: boolean;
  shouldDisableButtons: boolean;
  
  // Loading
  isLoading: boolean;
  error: string | null;
}

// SECTION: Actions
// Lines 53-95: Per-type limit operations
export interface LimitStoreActions {
  // Core operations
  checkAndUpdateStatus: () => void;
  incrementCompletedCount: (type: TaskType) => Promise<void>;
  
  // Per-type queries
  canCompleteHybrid: () => boolean;
  canCompleteNonAgentic: () => boolean;
  canCompleteAgentic: () => boolean;
  canCompleteTask: (type: TaskType) => boolean;
  
  // Get remaining for type
  getRemainingForType: (type: TaskType) => number;
  
  // Notifications
  showLimitNotification: () => void;
  
  // Persistence
  loadFromStorage: () => Promise<void>;
  saveToStorage: () => Promise<void>;
  resetIfNewDay: () => void;
}

// SECTION: Combined
// Lines 98-105: Full store
export type LimitStore = LimitStoreState & LimitStoreActions;

// SECTION: Helper - Calculate all derived state
function calculateDerivedState(
  state: LimitState,
  currentDate: Date
): Pick<
  LimitStoreState,
  | 'isHybridLimitReached'
  | 'isNonAgenticLimitReached'
  | 'isAgenticLimitReached'
  | 'hybridRemaining'
  | 'nonAgenticRemaining'
  | 'agenticRemaining'
  | 'shouldBlurHybrid'
  | 'shouldBlurNonAgentic'
  | 'shouldBlurAgentic'
  | 'shouldDisableHybridButtons'
  | 'shouldDisableNonAgenticButtons'
  | 'shouldDisableAgenticButtons'
  | 'isLimitReached'
  | 'remainingTasks'
  | 'shouldBlur'
  | 'shouldDisableButtons'
> {
  return {
    isHybridLimitReached: checkHybridLimitReached(state, currentDate),
    isNonAgenticLimitReached: checkNonAgenticLimitReached(state, currentDate),
    isAgenticLimitReached: checkAgenticLimitReached(state, currentDate),
    hybridRemaining: getHybridRemaining(state, currentDate),
    nonAgenticRemaining: getNonAgenticRemaining(state, currentDate),
    agenticRemaining: getAgenticRemaining(state, currentDate),
    shouldBlurHybrid: shouldShowBlurForType(state, currentDate, TaskType.HYBRID),
    shouldBlurNonAgentic: shouldShowBlurForType(state, currentDate, TaskType.NON_AGENTIC),
    shouldBlurAgentic: shouldShowBlurForType(state, currentDate, TaskType.AGENTIC),
    shouldDisableHybridButtons: shouldDisableButtonsForType(state, currentDate, TaskType.HYBRID),
    shouldDisableNonAgenticButtons: shouldDisableButtonsForType(state, currentDate, TaskType.NON_AGENTIC),
    shouldDisableAgenticButtons: shouldDisableButtonsForType(state, currentDate, TaskType.AGENTIC),
    isLimitReached: checkHybridLimitReached(state, currentDate) || checkNonAgenticLimitReached(state, currentDate),
    remainingTasks: Math.min(
      getHybridRemaining(state, currentDate),
      getNonAgenticRemaining(state, currentDate)
    ),
    shouldBlur: checkHybridLimitReached(state, currentDate) || checkNonAgenticLimitReached(state, currentDate),
    shouldDisableButtons: checkHybridLimitReached(state, currentDate) || checkNonAgenticLimitReached(state, currentDate),
  };
}

// SECTION: Factory
// Lines 108-115: Create store with full implementation
export function createLimitStore(): StoreApi<LimitStore> {
  return create<LimitStore>((set, get) => {
    const initialState = createInitialLimitState();
    const currentDate = new Date();
    const derivedState = calculateDerivedState(initialState, currentDate);
    
    return {
      // Initial State
      ...initialState,
      ...derivedState,
      isLoading: false,
      error: null,

      // Actions
      checkAndUpdateStatus: () => {
        const currentState = get();
        const updatedState = resetIfNeeded(currentState, new Date());
        const derived = calculateDerivedState(updatedState, new Date());
        
        set({
          ...updatedState,
          ...derived,
        });
      },

      incrementCompletedCount: async (type: TaskType) => {
        const currentState = get();
        
        // Check if limit reached for this type
        if (!get().canCompleteTask(type)) {
          return;
        }

        const updatedState = incrementTaskCount(currentState, new Date(), type);
        const derived = calculateDerivedState(updatedState, new Date());
        
        set({
          ...updatedState,
          ...derived,
        });

        await get().saveToStorage();
      },

      canCompleteHybrid: () => {
        return !checkHybridLimitReached(get(), new Date());
      },

      canCompleteNonAgentic: () => {
        return !checkNonAgenticLimitReached(get(), new Date());
      },

      canCompleteAgentic: () => {
        return true; // Always unlimited
      },

      canCompleteTask: (type: TaskType) => {
        return !checkLimitReachedForType(get(), new Date(), type);
      },

      getRemainingForType: (type: TaskType) => {
        return getRemainingForType(get(), new Date(), type);
      },

      showLimitNotification: () => {
        // UI layer handles notifications
      },

      loadFromStorage: async () => {
        set({ isLoading: true, error: null });

        try {
          // Use localStorage directly since fileService is deprecated
          const stored = localStorage.getItem('planning-system:limit-state');
          const savedState = stored ? JSON.parse(stored) as LimitState : null;
          const mergedState = { ...createInitialLimitState(), ...savedState };
          const finalState = resetIfNeeded(mergedState, new Date());
          const derived = calculateDerivedState(finalState, new Date());

          set({
            ...finalState,
            ...derived,
            isLoading: false,
          });
        } catch (error) {
          console.error('Failed to load limit state:', error);
          const initial = createInitialLimitState();
          const derived = calculateDerivedState(initial, new Date());
          set({
            ...initial,
            ...derived,
            isLoading: false,
            error: 'Failed to load saved progress',
          });
        }
      },

      saveToStorage: async () => {
        try {
          const currentState = get();
          const stateToSave: LimitState = {
            agenticCompletedToday: currentState.agenticCompletedToday,
            hybridCompletedToday: currentState.hybridCompletedToday,
            nonAgenticCompletedToday: currentState.nonAgenticCompletedToday,
            lastResetDate: currentState.lastResetDate,
            hybridLimitReached: currentState.hybridLimitReached,
            nonAgenticLimitReached: currentState.nonAgenticLimitReached,
          };
          // Use localStorage directly since fileService is deprecated
          localStorage.setItem('planning-system:limit-state', JSON.stringify(stateToSave));
        } catch (error) {
          console.error('Failed to save limit state:', error);
          set({ error: 'Failed to save progress' });
        }
      },

      resetIfNewDay: () => {
        const currentState = get();
        const resetState = resetIfNeeded(currentState, new Date());

        if (resetState !== currentState) {
          const derived = calculateDerivedState(resetState, new Date());
          set({
            ...resetState,
            ...derived,
          });
        }
      },
    };
  });
}

// SECTION: Hook
// Lines 298-305: React hook - create singleton instance
const storeInstance = createLimitStore();

export function useLimitStore(): LimitStore;
export function useLimitStore<T>(selector: (state: LimitStore) => T): T;
export function useLimitStore<T>(selector?: (state: LimitStore) => T): LimitStore | T {
  return useStore(storeInstance, selector ?? ((state: LimitStore) => state as unknown as T));
}

export const limitStoreInstance = storeInstance;

// SECTION MAP:
// Lines 1-15: File header
// Lines 16-50: State interface (per-type)
// Lines 53-95: Actions interface (per-type)
// Lines 98-105: Combined type
// Lines 108-115: Factory function
// Lines 118-295: Store implementation
// Lines 298-305: Hook export
