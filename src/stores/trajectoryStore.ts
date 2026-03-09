/**
 * @fileoverview Trajectory Store (Zustand)
 *
 * PURPOSE:
 * Manages the current trajectory (north star goal) displayed at top of app.
 *
 * LAYER STATUS: Layer 4 Complete - Full implementation
 */

import { create } from 'zustand';
import { Trajectory, createTrajectory } from '../types/trajectory';
import { trajectoryService, UserType } from '../services/trajectoryService';

// SECTION: State
// Lines 15-30: Trajectory data
export interface TrajectoryStoreState {
  trajectory: Trajectory | null;
  userType: UserType | null;
  isLoading: boolean;
  error: string | null;
}

// SECTION: Actions
// Lines 33-55: CRUD
export interface TrajectoryStoreActions {
  setTrajectory: (text: string) => Promise<void>;
  updateTrajectory: (text: string) => Promise<void>;
  clearError: () => void;
  setUserType: (userType: UserType) => void;

  // Persistence
  loadFromStorage: () => Promise<void>;
  saveToStorage: () => Promise<void>;
}

// SECTION: Combined
// Lines 58-65: Full store
export type TrajectoryStore = TrajectoryStoreState & TrajectoryStoreActions;

// REASONING: Track realtime subscription for cleanup
let unsubscribeRealtime: (() => void) | null = null;

// REASONING: We need a Zustand store to manage trajectory state
// > What state do we need? Trajectory data, loading status, error messages
// > What actions? CRUD operations and persistence
// > How to persist? Use fileService to load/save trajectory
// > Therefore: Create store with create() from zustand, implement all actions
export const useTrajectoryStore = create<TrajectoryStore>((set, get) => ({
// Initial state
trajectory: null,
userType: null,
isLoading: false,
error: null,

  // REASONING: We need to set a new trajectory
  // > What does that mean? Create a completely new trajectory with fresh ID
  // > How? Use createTrajectory factory to generate object with ID and timestamp
  // > Then what? Update state with new trajectory
  // > And persist? Yes, save to storage immediately
  // > FIX: Must await saveToStorage to ensure persistence completes
  // > Therefore: Make async, await the save operation
  setTrajectory: async (text) => {
    const trajectory = createTrajectory(text);
    set({ trajectory });
    await get().saveToStorage();
  },

  // REASONING: We need to update existing trajectory text
  // > What must we preserve? The same trajectory ID (it's the same goal, new description)
  // > What must change? The text content and lastUpdated timestamp
  // > How? Spread existing trajectory, override text and lastUpdated
  // > Edge case? If no trajectory exists, do nothing (null check)
  // > And persist? Yes, save to storage after update
  // > FIX: Must await saveToStorage to ensure persistence completes
  // > Therefore: Make async, await the save operation
  updateTrajectory: async (text) => {
    set((state) => ({
      trajectory: state.trajectory
        ? { ...state.trajectory, text, lastUpdated: Date.now() }
        : null
    }));
    await get().saveToStorage();
  },

  // REASONING: User needs to dismiss error message
  // > What should happen? Clear the error state
  // > Side effects? None - purely UI state update
  // > Therefore: Simple state update to null
  clearError: () => set({ error: null }),

  // REASONING: Set user type and re-subscribe to realtime
  // > Why re-subscribe? Filter needs to match new user type
  setUserType: (userType: UserType) => {
    const currentType = get().userType;
    if (currentType === userType) return;

    // REASONING: Unsubscribe from old subscription
    if (unsubscribeRealtime) {
      unsubscribeRealtime();
      unsubscribeRealtime = null;
    }

    // REASONING: Clear trajectory when switching user type
    set({ userType, trajectory: null });

    // REASONING: Subscribe to new user type's trajectory
    unsubscribeRealtime = trajectoryService.subscribeToTrajectory((trajectory) => {
      useTrajectoryStore.setState({ trajectory });
    }, userType);
  },

  // REASONING: App needs to load trajectory on startup
  // > What state during load? Set isLoading true to show spinner/block UI
  // > What if success? Set trajectory data, clear loading
  // > What if failure? Set error message, clear loading, trajectory stays null
  // > Async? Yes, use Promise to handle async file operation
  // > Therefore: Set loading, await fileService, handle result with error boundary
  loadFromStorage: async () => {
    const { userType } = get();
    if (!userType) {
      // REASONING: No user type set yet, will load when setUserType is called
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const result = await trajectoryService.getTrajectory(userType);
      if (result.success) {
        set({ trajectory: result.data, isLoading: false });
      } else {
        set({ error: result.error, isLoading: false });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load trajectory',
        isLoading: false
      });
    }
  },

  // REASONING: Trajectory needs to persist after changes
  // > When to save? After setTrajectory and updateTrajectory
  // > What to save? Current trajectory from state
  // > Guard clause? Only save if trajectory exists (not null)
  // > Error handling? If save fails, set error state so user knows
  // > Async? Yes, file operations are async
  // > Therefore: Get current trajectory, check existence, await save, handle errors
  saveToStorage: async () => {
    const { trajectory, userType } = get();
    if (!trajectory) return;
    if (!userType) {
      set({ error: 'No user type set' });
      return;
    }

    try {
      const result = await trajectoryService.updateTrajectory(trajectory.text, userType);
      if (!result.success) {
        set({ error: result.error });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to save trajectory'
      });
    }
  }
}));

// SECTION MAP:
// Lines 1-14: File header and imports
// Lines 15-20: State interface
// Lines 23-32: Actions interface
// Lines 35-37: Combined type
// Lines 40-109: Store implementation with useTrajectoryStore
// Lines 40-45: Initial state
// Lines 48-53: setTrajectory action
// Lines 63-71: updateTrajectory action
// Lines 74-77: clearError action
// Lines 80-91: loadFromStorage action
// Lines 94-104: saveToStorage action
