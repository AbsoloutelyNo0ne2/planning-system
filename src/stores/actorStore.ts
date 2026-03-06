/**
 * @fileoverview Actor Store (Zustand)
 *
 * PURPOSE:
 * Manages the list of actors (competitors) and their names.
 * Actor notes are stored per-task, not here.
 *
 * LAYER STATUS: Layer 4 Complete - Full Implementation
 * Includes: Initial state, all CRUD actions, persistence
 */

// SECTION: Imports
// Lines 16-25: Dependencies and services
import { create } from 'zustand';
import { Actor, ActorId, validateActor } from '../types/actor';
import { actorService } from '../services/actorService';

// SECTION: State
// Lines 28-42: Actor list state interface
export interface ActorStoreState {
  actors: Actor[];
  isLoading: boolean;
  error: string | null;
}

// SECTION: Actions
// Lines 45-72: CRUD and persistence actions
export interface ActorStoreActions {
  addActor: (name: string) => Promise<void>;
  removeActor: (id: ActorId) => Promise<void>;
  updateActor: (id: ActorId, name: string) => Promise<void>;
  setActors: (actors: Actor[]) => void;
  clearError: () => void;

  // Persistence
  loadFromStorage: () => Promise<void>;
  saveToStorage: () => Promise<void>;
}

// SECTION: Combined
// Lines 75-82: Full store type
export type ActorStore = ActorStoreState & ActorStoreActions;

// SECTION: Store Implementation
// Lines 85-180: Zustand store with full implementation

// REASONING:
// We need a Zustand store to manage actor state
// > What does it need?
// > Initial state: empty actors array, not loading, no error
// > Actions: CRUD operations + persistence
// > Why Zustand? > Lightweight, no boilerplate, works with React
// > Therefore: Create store with create() and export the hook
export const useActorStore = create<ActorStore>((set) => ({
  // SECTION: Initial State
  // Lines 95-105: Starting values
  actors: [],
  isLoading: false,
  error: null,

  // SECTION: Actions
  // Lines 108-178: All store actions

  // REASONING:
  // We need to add an actor
  // > How? > Validate input first > Create actor > Add to array > Persist
  // > Why validate first? > Prevent invalid data entering store
  // > Why persist after? > Ensure data is saved
  // > Why async? > saveToStorage is async, must await to prevent unhandled rejections
  // > Therefore: Validate, create, update state immutably, then await save
  addActor: async (name) => {
    const validation = validateActor({ name });
    if (!validation.valid) {
      set({ error: validation.errors.join(', ') });
      return;
    }
    const result = await actorService.createActor(name);
    if (result.success) {
      set((state) => ({
        actors: [...state.actors, result.data],
      }));
    } else {
      set({ error: result.error });
    }
  },

  // REASONING:
  // We need to remove an actor by ID
  // > How? > Filter array to exclude matching ID > Update state > Persist
  // > Why filter? > Immutable removal pattern in JavaScript
  // > Why persist after? > Keep storage in sync with state
  // > Why async? > saveToStorage is async, must await to prevent unhandled rejections
  // > Therefore: Filter out the actor, update state, then await save
  removeActor: async (id) => {
    const result = await actorService.deleteActor(id);
    if (result.success) {
      set((state) => ({
        actors: state.actors.filter((a) => a.id !== id),
      }));
    } else {
      set({ error: result.error });
    }
  },

  // REASONING:
  // We need to update an actor's name
  // > How? > Map over array > Replace matching actor with updated name
  // > Why map? > Immutable update pattern preserves other actors
  // > Why spread? > Keeps other actor properties (createdAt, etc)
  // > Why async? > saveToStorage is async, must await to prevent unhandled rejections
  // > Therefore: Map and replace, update state, then await save
  updateActor: async (id, name) => {
    const result = await actorService.updateActor(id, name);
    if (result.success) {
      set((state) => ({
        actors: state.actors.map((a) =>
          a.id === id ? result.data : a
        ),
      }));
    } else {
      set({ error: result.error });
    }
  },

  // REASONING:
  // We need to replace the entire actors array
  // > How? > Direct state update with new array
  // > Why direct set? > Used for bulk operations like loading from storage
  // > Why no persist? > Caller handles persistence if needed
  // > Therefore: Simple state replacement
  setActors: (actors) => set({ actors }),

  // REASONING:
  // We need to clear error state
  // > How? > Set error to null
  // > Why separate action? > UI components need to dismiss errors
  // > Why not auto-clear? > Errors should persist until acknowledged
  // > Therefore: Explicit clear action
  clearError: () => set({ error: null }),

  // REASONING:
  // We need to load actors from persistent storage
  // > How? > Set loading > Call actorService > Update state with result
  // > Why loading flag? > UI can show spinner during file operations
  // > What if fails? > Set error message, preserve empty actors
  // > Why check result?.success? > Defensive coding for test mocks that may return undefined
  // > Therefore: Async operation with loading state and error handling
  loadFromStorage: async () => {
    set({ isLoading: true });
    try {
      const result = await actorService.getActors();
      // Defensive: handle undefined result (mock issues in tests)
      if (result?.success) {
        if (result.data.length === 0) {
          // Create default "Yesterday me" actor via actorService
          const createResult = await actorService.createActor('Yesterday me');
          if (createResult.success) {
            set({ actors: [createResult.data], isLoading: false });
          } else {
            set({ actors: [], isLoading: false, error: createResult.error });
          }
        } else {
          set({ actors: result.data, isLoading: false });
        }
      } else {
        // On error or undefined result, show empty state
        set({ actors: [], isLoading: false, error: result?.error || 'Failed to load actors' });
      }
    } catch (error) {
      // On exception, clear loading and set error
      set({
        actors: [],
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load actors'
      });
    }
  },

  // REASONING:
  // Save is handled automatically by actorService real-time sync
  // > Why no-op? > Supabase real-time sync persists changes on create/update/delete
  // > This method is kept for API compatibility with existing code
  // > Therefore: No-op, real-time sync handles persistence
  saveToStorage: async () => {
    // Real-time sync handles persistence automatically
    // No manual save needed with Supabase
  },
}));

// SECTION: Real-time Subscription
// Lines 200-205: Subscribe to real-time actor changes
const unsubscribe = actorService.subscribeToActors((actors) => {
  useActorStore.setState({ actors });
});
(useActorStore as unknown as { unsubscribe: () => void }).unsubscribe = unsubscribe;

// SECTION MAP:
// Lines 1-15: File header
// Lines 16-25: Imports section
// Lines 28-42: State interface
// Lines 45-72: Actions interface
// Lines 75-82: Combined type
// Lines 85-90: Store creation reasoning
// Lines 95-105: Initial state
// Lines 108-140: addActor implementation
// Lines 143-150: removeActor implementation
// Lines 153-163: updateActor implementation
// Lines 166-170: setActors implementation
// Lines 173-177: clearError implementation
// Lines 180-191: loadFromStorage implementation
// Lines 194-204: saveToStorage implementation
// Lines 207-220: Section map
