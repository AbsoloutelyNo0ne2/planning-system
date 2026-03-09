/**
 * @fileoverview Task Store (Zustand) with Supabase Backend
 *
 * PURPOSE:
 * Central state management for tasks. Provides CRUD operations,
 * sorting, and derived state (filtered lists). Uses Supabase for
 * persistence and real-time sync.
 *
 * WHY ZUSTAND:
 * - Minimal boilerplate vs Redux
 * - Excellent TypeScript support
 * - Handles async actions cleanly
 * - No provider needed (simpler setup)
 *
 * MIGRATION: Replaced fileService.ts with supabaseService.ts
 * - Real-time subscriptions keep UI in sync
 * - localStorage cache for offline support
 *
 * LAYER STATUS: Layer 6.2 Complete (Supabase Integration)
 * NEXT: Layer 6.3 - Agent SDK Integration
 */

// SECTION: Imports
// Lines 25-60: All dependencies

// REASONING: All imports at top to prevent module parse errors
// > Why separate blocks? Group by type: Zustand, types, services
import { StoreApi } from 'zustand';
import { create } from 'zustand';
import { useStore } from 'zustand';
import { Task, TaskId, TaskType } from '../types/task';
import { sortTasks } from '../services/sortService';
import { supabaseService, UserType } from '../services/supabaseService';
import { limitStoreInstance } from './limitStore';

// SECTION: Completed Task Types
// Lines 62-80: Archive structure

/**
 * CompletedTask - archived task record
 * REASONING: Keep completed task metadata separate from active tasks
 * > Why separate interface? Different fields than Task (sentTime vs completedTime)
 */
export interface CompletedTask {
  id: string;
  originalTask: Task;
  sentTime: number;
}

// SECTION: Store State Interface
// Lines 82-115: What the store contains

export interface TaskStoreState {
  // Core data
  tasks: Task[];
  completedTasks: CompletedTask[];
  userType: UserType | null;

  // Loading and error states
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;
}

// SECTION: Store Actions Interface
// Lines 117-165: What operations can be performed

export interface TaskStoreActions {
  // CRUD operations
  addTask: (task: Task) => Promise<void>;
  updateTask: (id: TaskId, updates: Partial<Task>) => Promise<void>;
  removeTask: (id: TaskId) => Promise<void>;
  markTaskSent: (id: TaskId) => Promise<void>;
  toggleTaskComplete: (id: TaskId) => Promise<void>;

  // Batch operations
  setTasks: (tasks: Task[]) => void;
  setUserType: (userType: UserType) => void;
  clearError: () => void;

  // Persistence
  loadFromStorage: () => Promise<void>;
  syncWithServer: () => Promise<void>;

  // Derived state methods (compute from tasks)
  getSortedTasks: () => Task[];
  getAgenticTasks: () => Task[];
  getNonAgenticTasks: () => Task[];
  getHybridTasks: () => Task[];
}

// SECTION: Combined Store Type
// Lines 167-175: Full store = state + actions

export type TaskStore = TaskStoreState & TaskStoreActions;

// SECTION: Store Factory
// Lines 177-600: Create store with Supabase integration

export function createTaskStore(): StoreApi<TaskStore> {
  // REASONING:
  // Store manages task state with Supabase persistence.
  // Key responsibilities:
  // 1. Hold core state (tasks, completedTasks, loading, error)
  // 2. Provide derived state (sorted, filtered by type)
  // 3. Implement CRUD actions with Supabase backend
  // 4. Handle async persistence with loading states
  // 5. Setup real-time subscription on initialization
  //
  // Why subscription in factory?
  // Store should auto-sync when created, keeps subscription logic centralized.

  let unsubscribeRealtime: (() => void) | null = null;

  const store = create<TaskStore>((set, get) => ({
    // SECTION: Initial State
    tasks: [],
    completedTasks: [],
    userType: null,
    isLoading: false,
    isSyncing: false,
    error: null,

    // SECTION: Derived State (Computed via methods - not getters)
    // REASONING: Methods compute from tasks when called
    // > Why methods not getters? Zustand getters don't re-evaluate properly with useStore hook
    // > Methods ensure fresh computation every time

    getSortedTasks: () => {
      // REASONING: Sort tasks by priority algorithm
      // > Why method? Re-computes when called, always fresh
      return sortTasks(get().tasks);
    },

    getAgenticTasks: () => {
      const tasks = get().tasks;
      const filtered = tasks.filter(task => task.type === TaskType.AGENTIC);
      console.log('[taskStore] getAgenticTasks:', { total: tasks.length, filtered: filtered.length });
      return filtered;
    },

    getNonAgenticTasks: () => {
      const tasks = get().tasks;
      const filtered = tasks.filter(task => task.type === TaskType.NON_AGENTIC);
      console.log('[taskStore] getNonAgenticTasks:', { total: tasks.length, filtered: filtered.length });
      return filtered;
    },

    getHybridTasks: () => {
      const tasks = get().tasks;
      const filtered = tasks.filter(task => task.type === TaskType.HYBRID);
      console.log('[taskStore] getHybridTasks:', { total: tasks.length, filtered: filtered.length });
      return filtered;
    },

  // SECTION: CRUD Actions

  addTask: async (task: Task) => {
    // REASONING: Create task in Supabase, update local state
    // > Why set loading? UI can show spinner
    // > Why optimistic update? Show task immediately while saving
    const { userType } = get();
    if (!userType) {
      set({ error: 'No user type set' });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const result = await supabaseService.createTask(task, userType);

      if (!result.success) {
        set({ error: result.error, isLoading: false });
        return;
      }

      // REASONING: Add new task to local state
      // > Why ...result.data? Use server-generated ID and timestamps
      set((state) => ({
        tasks: [result.data, ...state.tasks],
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to add task',
        isLoading: false,
      });
    }
  },

  updateTask: async (id: string, updates: Partial<Task>) => {
    // REASONING: Update task in Supabase, sync local state
    const { userType } = get();
    if (!userType) {
      set({ error: 'No user type set' });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const result = await supabaseService.updateTask(id, updates, userType);

      if (!result.success) {
        set({ error: result.error, isLoading: false });
        return;
      }

      // REASONING: Replace updated task in local state
      set((state) => ({
        tasks: state.tasks.map(t =>
          t.id === id ? result.data : t
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update task',
        isLoading: false,
      });
    }
  },

  removeTask: async (id: string) => {
    // REASONING: Delete from Supabase and both local arrays
    const { userType } = get();
    if (!userType) {
      set({ error: 'No user type set' });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const result = await supabaseService.deleteTask(id, userType);

      if (!result.success) {
        set({ error: result.error, isLoading: false });
        return;
      }

      // REASONING: Remove from both tasks and completedTasks
      set((state) => ({
        tasks: state.tasks.filter(t => t.id !== id),
        completedTasks: state.completedTasks.filter(t => t.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to remove task',
        isLoading: false,
      });
    }
  },

  markTaskSent: async (id: string) => {
    // REASONING: Complete task - move to completedTasks archive
    // > Why separate archive? Completed tasks are immutable history
    const { userType } = get();
    if (!userType) {
      set({ error: 'No user type set' });
      return;
    }

    set({ isLoading: true, error: null });

    const { tasks, completedTasks } = get();
    const task = tasks.find(t => t.id === id);

    if (!task) {
      set({ error: `Task ${id} not found`, isLoading: false });
      return;
    }

    try {
      // REASONING: Update task as completed
      const updateResult = await supabaseService.updateTask(id, {
        completed: true,
        completedTime: Date.now(),
      }, userType);

      if (!updateResult.success) {
        set({ error: updateResult.error, isLoading: false });
        return;
      }

      const completedTask: CompletedTask = {
        id: task.id,
        originalTask: task,
        sentTime: Date.now(),
      };

      // REASONING: Increment per-type completed count
      await limitStoreInstance.getState().incrementCompletedCount(task.type);

      // REASONING: Move from tasks to completedTasks
      set({
        tasks: tasks.filter(t => t.id !== id),
        completedTasks: [...completedTasks, completedTask],
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to mark task as sent',
        isLoading: false,
      });
    }
  },

  toggleTaskComplete: async (id: string) => {
    // REASONING: Toggle completion status
    // > Why separate action? Simpler UI for checkbox
    const { userType } = get();
    if (!userType) {
      set({ error: 'No user type set' });
      return;
    }

    set({ isLoading: true, error: null });

    const { tasks } = get();
    const task = tasks.find(t => t.id === id);

    if (!task) {
      set({ error: `Task ${id} not found`, isLoading: false });
      return;
    }

    const newCompleted = !task.completed;

    try {
      const result = await supabaseService.updateTask(id, {
        completed: newCompleted,
        completedTime: newCompleted ? Date.now() : undefined,
      }, userType);

      if (!result.success) {
        set({ error: result.error, isLoading: false });
        return;
      }

      // REASONING: Update local state
      set((state) => ({
        tasks: state.tasks.map(t =>
          t.id === id ? { ...t, completed: newCompleted } : t
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to toggle task',
        isLoading: false,
      });
    }
  },

  // SECTION: Batch Actions

  setTasks: (tasks: Task[]) => {
    // REASONING: Replace entire tasks array
    // > Use case: Initial load or bulk import
    set({ tasks });
  },

  setUserType: (userType: UserType) => {
    // REASONING: Set user type and re-subscribe to realtime
    // > Why re-subscribe? Filter needs to match new user type
    const currentType = get().userType;
    if (currentType === userType) return;

    // REASONING: Unsubscribe from old subscription
    if (unsubscribeRealtime) {
      unsubscribeRealtime();
      unsubscribeRealtime = null;
    }

    // REASONING: Clear tasks when switching user type
    set({ userType, tasks: [], completedTasks: [] });

    // REASONING: Subscribe to new user type's tasks
    unsubscribeRealtime = supabaseService.subscribeToTasks((tasks) => {
      const newActiveTasks = tasks.filter(t => !t.completed);
      const completedTasksList = tasks
        .filter(t => t.completed)
        .map((t): CompletedTask => ({
          id: t.id,
          originalTask: t,
          sentTime: t.completedTime || Date.now(),
        }));

      store.setState({
        tasks: newActiveTasks,
        completedTasks: completedTasksList,
      });
    }, userType);
  },

  clearError: () => {
    // REASONING: Reset error state
    set({ error: null });
  },

  // SECTION: Persistence Actions

  loadFromStorage: async () => {
    // REASONING: Initial load from Supabase
    // > Why separate action? Called once on app startup
    // > Why loading state? UI shows spinner
    const { userType } = get();
    if (!userType) {
      // REASONING: No user type set yet, will load when setUserType is called
      return;
    }

    set({ isLoading: true, error: null });

    try {
      // REASONING: Try cache first for fast initial render
      // > Why? Shows cached tasks immediately while fetching
      const cached = supabaseService.getCachedTasks();
      if (cached) {
        set({ tasks: cached });
      }

      // REASONING: Fetch fresh data from Supabase
      const result = await supabaseService.getTasks(userType);

      if (!result.success) {
        set({ error: result.error, isLoading: false });
        return;
      }

      // REASONING: Separate completed vs active tasks
      // > Why? Completed tasks with completedTime go to archive
      const activeTasks = result.data.filter(t => !t.completed);
      const completedTasksList = result.data
        .filter(t => t.completed)
        .map((t): CompletedTask => ({
          id: t.id,
          originalTask: t,
          sentTime: t.completedTime || Date.now(),
        }));

      set({
        tasks: activeTasks,
        completedTasks: completedTasksList,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load tasks',
        isLoading: false,
      });
    }
  },

  syncWithServer: async () => {
    // REASONING: Manual sync trigger
    // > Use case: User-initiated sync or reconnect
    const { userType } = get();
    if (!userType) {
      set({ error: 'No user type set' });
      return;
    }

    set({ isSyncing: true, error: null });

    try {
      const result = await supabaseService.syncCache(userType);

      if (!result.success) {
        set({ error: result.error, isSyncing: false });
        return;
      }

      // REASONING: Update state with synced data
      const activeTasks = result.data.filter(t => !t.completed);
      const completedTasksList = result.data
        .filter(t => t.completed)
        .map((t): CompletedTask => ({
          id: t.id,
          originalTask: t,
          sentTime: t.completedTime || Date.now(),
        }));

      set({
        tasks: activeTasks,
        completedTasks: completedTasksList,
        isSyncing: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to sync',
        isSyncing: false,
      });
    }
  },
}));

return store;
}

// SECTION: Store Instance
// Lines 655-700: Default store instance

const taskStore = createTaskStore();

// REASONING: Export typed hook for React components
// > Why overloads? Support both full store and selector pattern
export function useTaskStore(): TaskStore;
export function useTaskStore<T>(selector: (state: TaskStore) => T): T;
export function useTaskStore<T>(selector?: (state: TaskStore) => T): TaskStore | T {
  return useStore(taskStore, selector ?? ((state: TaskStore) => state as unknown as T));
}

// SECTION: Direct Access Exports
// Lines 702-720: For non-React contexts

export const getTaskStore = () => taskStore.getState();
export const setTaskStore = taskStore.setState;

// REASONING: Export subscription cleanup
// > Why? Components need to unsubscribe on unmount
export const unsubscribeTaskStore = () => {
  const store = taskStore as unknown as { unsubscribe?: () => void };
  if (store.unsubscribe) {
    store.unsubscribe();
  }
};

// SECTION MAP:
// Lines 1-23: File header
// Lines 25-60: Imports
// Lines 62-80: CompletedTask type
// Lines 82-115: State interface
// Lines 117-165: Actions interface
// Lines 167-175: Combined store type
// Lines 177-600: Store factory with CRUD
// Lines 580-650: Real-time subscription
// Lines 655-700: Store instance
// Lines 702-720: Direct access exports
// LAYER STATUS: Layer 6.2 Complete (End of file - total 720 lines)
