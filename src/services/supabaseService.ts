/**
 * @fileoverview Supabase Service
 *
 * PURPOSE:
 * Provides CRUD operations and real-time subscriptions for tasks using Supabase.
 * Replaces fileService.ts with cloud-backed persistence.
 *
 * WHY THIS EXISTS:
 * - Enables AI agents to access task data via Supabase API
 * - Provides real-time sync across devices
 * - Handles offline caching with localStorage fallback
 *
 * REPLACEMENT: fileService.ts is deprecated - use this instead
 *
 * LAYER STATUS: Layer 4 Complete
 * NEXT: Layer 5 - Error telemetry, retry logic
 */

// REASONING: Import Supabase client and types
// > Why @supabase/supabase-js? Official client with TypeScript support
// > Why createClient? Initializes connection with URL and key
import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import {
  Task,
  TaskId,
} from '../types/task';
import {
  SupabaseTaskRow,
  SupabaseTaskInsert,
  fromSupabaseTask,
  toSupabaseInsert,
  toSupabaseUpdate,
  SupabaseResult,
} from '../types/supabase';

// SECTION: Configuration
// Lines 35-60: Environment variables and constants

// REASONING: Get credentials from environment
// > Why VITE_ prefix? Vite exposes env vars with this prefix to client
// > Why fallback? Prevents crash if env not loaded (dev/prod parity)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://rstjrsnwmajdmhhmbwmm.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzdGpyc253bWFqZG1oaG1id21tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1OTU1NDgsImV4cCI6MjA4NzE3MTU0OH0.zL0hZhcAhteAkwynZcScYITzvTYiIMc5JNb-mFicHSc';

// REASONING: UUID constants for each user type (task isolation)
// > Why two UUIDs? Separates tasks between personal and showcase accounts
// > Why hardcode? No auth UI, simple passphrase-based system
// > Personal: tasks created in personal account
// > Showcase: tasks created in showcase account
export const USER_IDS = {
  personal: '00000000-0000-0000-0000-000000000001',
  showcase: '00000000-0000-0000-0000-000000000002',
} as const;

export type UserType = keyof typeof USER_IDS;

// REASONING: LocalStorage keys for offline cache
// > Why namespace? Avoid collisions with other app data
const CACHE_KEY = 'planning-system:tasks-cache';
const CACHE_TIMESTAMP_KEY = 'planning-system:cache-timestamp';
const CACHE_MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours

// SECTION: Supabase Client
// Lines 65-80: Initialize client singleton

// REASONING: Singleton client instance
// > Why single instance? Reuse connection, avoid multiple clients
let supabaseInstance: SupabaseClient | null = null;

// REASONING: Lazy initialization with memoization
// > Why function? Ensures client is created when first needed
// > Why check null? Prevents re-initialization
function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      // REASONING: Realtime configuration
      // > Why these settings? Enable realtime subscriptions for tasks table
      realtime: {
        params: {
          eventsPerSecond: 10, // Rate limit for realtime events
        },
      },
      // REASONING: Auth persistence
      // > Why localStorage? Persist session across app restarts
      auth: {
        storage: localStorage,
        autoRefreshToken: true,
        persistSession: true,
      },
    });
  }
  return supabaseInstance;
}

// SECTION: Cache Utilities
// Lines 85-140: LocalStorage cache for offline support

/**
 * Save tasks to localStorage cache
 * REASONING: Provide offline persistence and fast initial load
 * > Why JSON? Simple serialization for complex objects
 */
function saveToCache(tasks: Task[]): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(tasks));
    localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
  } catch (error) {
    // REASONING: Silent fail on cache errors
    // > Why? Cache is optimization, shouldn't break app
    console.warn('Failed to save to cache:', error);
  }
}

/**
 * Load tasks from localStorage cache
 * REASONING: Provide fast initial load while fetching from Supabase
 * > Why check age? Prevent using stale data
 * > Returns null if no cache or expired
 */
function loadFromCache(): Task[] | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);

    if (!cached || !timestamp) {
      return null;
    }

    // REASONING: Check cache freshness
    // > Why max age? Prevent serving stale data after long offline period
    const age = Date.now() - parseInt(timestamp, 10);
    if (age > CACHE_MAX_AGE) {
      return null;
    }

    return JSON.parse(cached) as Task[];
  } catch (error) {
    console.warn('Failed to load from cache:', error);
    return null;
  }
}

/**
 * Clear localStorage cache
 * REASONING: Clean up after successful sync
 */
function clearCache(): void {
  try {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(CACHE_TIMESTAMP_KEY);
  } catch (error) {
    console.warn('Failed to clear cache:', error);
  }
}

// SECTION: CRUD Operations
// Lines 145-350: Core database operations

/**
 * Create a new task in Supabase
 * REASONING: Insert new task and return the created record
 * > Why .select()? Returns the inserted row with server-generated ID
 * > Why single()? Expects exactly one row
 */
async function createTaskInDb(task: Omit<Task, 'id' | 'creationTime'>, userType: UserType): Promise<SupabaseResult<Task>> {
  const supabase = getSupabase();
  const userId = USER_IDS[userType];

  try {
    const insertData: SupabaseTaskInsert = toSupabaseInsert(task, userId);
    console.log('[SupabaseService] Creating task:', insertData);

    const { data, error } = await supabase
      .from('tasks')
      .insert(insertData)
      .select()
      .single<SupabaseTaskRow>();

    if (error) {
      console.error('[SupabaseService] Create task error:', error);
      return { success: false, error: error.message };
    }

    if (!data) {
      return { success: false, error: 'No data returned from insert' };
    }

    const createdTask = fromSupabaseTask(data);

    // REASONING: Update cache after successful create
    // > Why? Keep local cache in sync with server
    const cached = loadFromCache() || [];
    saveToCache([...cached, createdTask]);

    return { success: true, data: createdTask };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create task',
    };
  }
}

/**
 * Get all tasks for the current user
 * REASONING: Fetch user's tasks with optional cache fallback
 * > Why .eq()? RLS requires filtering by user_id
 * > Why order? Consistent ordering by creation time
 */
async function getTasksFromDb(userType: UserType): Promise<SupabaseResult<Task[]>> {
  const supabase = getSupabase();
  const userId = USER_IDS[userType];
  console.log('[SupabaseService] Fetching tasks for user:', userId);

  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[SupabaseService] Fetch tasks error:', error);
      // REASONING: Try cache on network error
      // > Why? Provide offline support
      const cached = loadFromCache();
      if (cached) {
        console.warn('Network error, using cached tasks:', error.message);
        return { success: true, data: cached };
      }
      return { success: false, error: error.message };
    }

    console.log('[SupabaseService] Fetched', data?.length || 0, 'tasks');

    const tasks = (data || []).map(fromSupabaseTask);

    // REASONING: Update cache with fresh data
    saveToCache(tasks);

    return { success: true, data: tasks };
  } catch (error) {
    const cached = loadFromCache();
    if (cached) {
      return { success: true, data: cached };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch tasks',
    };
  }
}

/**
 * Update a task in Supabase
 * REASONING: Update specific fields by task ID
 * > Why .eq()? Ensures we only update the specific task
 * > Why user_id? Extra safety for RLS
 */
async function updateTaskInDb(
  id: TaskId,
  updates: Partial<Task>,
  userType: UserType
): Promise<SupabaseResult<Task>> {
  const supabase = getSupabase();
  const userId = USER_IDS[userType];

  try {
    const updateData = toSupabaseUpdate(updates);

    const { data, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single<SupabaseTaskRow>();

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data) {
      return { success: false, error: 'Task not found' };
    }

    const updatedTask = fromSupabaseTask(data);

    // REASONING: Update cache after successful update
    const cached = loadFromCache() || [];
    const updatedCache = cached.map(t => (t.id === id ? updatedTask : t));
    saveToCache(updatedCache);

    return { success: true, data: updatedTask };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update task',
    };
  }
}

/**
 * Delete a task from Supabase
 * REASONING: Remove task by ID
 * > Why no select? DELETE doesn't return the row
 */
async function deleteTaskFromDb(id: TaskId, userType: UserType): Promise<SupabaseResult<void>> {
  const supabase = getSupabase();
  const userId = USER_IDS[userType];

  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    // REASONING: Update cache after successful delete
    const cached = loadFromCache() || [];
    saveToCache(cached.filter(t => t.id !== id));

    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete task',
    };
  }
}

// SECTION: Real-time Subscriptions
// Lines 355-450: Subscribe to database changes

/**
 * Subscribe to real-time task changes
 * REASONING: Keep UI in sync with database changes
 * > Why channel? Supabase realtime uses channel-based subscriptions
 * > Why '*:*'? Listen to all events (INSERT, UPDATE, DELETE)
 *
 * @param callback - Called whenever tasks change with new task list
 * @param userType - Filter subscription to specific user type
 * @returns Unsubscribe function to clean up subscription
 */
function subscribeToTasks(callback: (tasks: Task[]) => void, userType: UserType): () => void {
  const supabase = getSupabase();
  const userId = USER_IDS[userType];

  // REASONING: Create a channel for this subscription
  // > Why 'tasks'? Channel name, can be anything but descriptive is better
  const channel: RealtimeChannel = supabase
    .channel('tasks-changes')
    .on(
      'postgres_changes',
      {
        event: '*', // Listen to INSERT, UPDATE, DELETE
        schema: 'public',
        table: 'tasks',
        filter: `user_id=eq.${userId}`,
      },
      async () => {
        // REASONING: Fetch fresh data on any change
        // > Why not use payload directly? Simpler to re-fetch and ensure consistency
        // > Trade-off: Extra API call vs data consistency
        const result = await getTasksFromDb(userType);
        if (result.success) {
          callback(result.data);
        }
      }
    )
    .subscribe((status) => {
      // REASONING: Log subscription status for debugging
      // > Why? Helps debug realtime issues
      if (status === 'SUBSCRIBED') {
        console.log('Realtime subscription active');
      } else if (status === 'CLOSED') {
        console.log('Realtime subscription closed');
      } else if (status === 'CHANNEL_ERROR') {
        console.error('Realtime subscription error');
      }
    });

  // REASONING: Return cleanup function
  // > Why? React components need to unsubscribe on unmount
  return () => {
    channel.unsubscribe();
    supabase.removeChannel(channel);
  };
}

// SECTION: Sync Status
// Lines 455-500: Track online/offline state

/**
 * Check if Supabase is reachable
 * REASONING: Health check for connection status
 * > Why simple query? Minimal overhead to test connectivity
 */
async function isOnline(): Promise<boolean> {
  const supabase = getSupabase();
  try {
    const { error } = await supabase.from('tasks').select('id').limit(1);
    return !error;
  } catch {
    return false;
  }
}

/**
 * Force sync cache with server
 * REASONING: Manual sync trigger for offline scenarios
 * > Why? User might want to trigger sync when back online
 */
async function syncCache(userType: UserType): Promise<SupabaseResult<Task[]>> {
  const online = await isOnline();
  if (!online) {
    return { success: false, error: 'Offline - cannot sync' };
  }

  // REASONING: Simple re-fetch clears cache and gets fresh data
  const result = await getTasksFromDb(userType);
  return result;
}

// SECTION: Public Service API
// Lines 505-600: Exported service object

/**
 * Supabase Service - task persistence with real-time sync
 *
 * REASONING: Export as object for consistent service pattern
 * > Why object? Matches fileService.ts pattern for easy replacement
 * > Why async functions? All DB operations are async
 */
export const supabaseService = {
  // REASONING: CRUD operations mirror fileService.ts API
  // > Why same signature? Easier migration, familiar pattern

  /**
   * Create a new task
   * REASONING: > What if offline? Returns error - implement queue if needed
   * # Currently requires online, future: offline queue
   */
  async createTask(task: Omit<Task, 'id' | 'creationTime'>, userType: UserType): Promise<SupabaseResult<Task>> {
    return createTaskInDb(task, userType);
  },

  /**
   * Get all tasks
   * REASONING: > What if offline? Returns cached data with success
   * # Cache provides offline fallback automatically
   */
  async getTasks(userType: UserType): Promise<SupabaseResult<Task[]>> {
    return getTasksFromDb(userType);
  },

  /**
   * Bulk save tasks (deprecated - use individual operations)
   * @deprecated Use createTask/updateTask instead
   */
  async saveTasks(_tasks: Task[]): Promise<SupabaseResult<void>> {
    console.warn('saveTasks is deprecated - use individual operations');
    return { success: true, data: undefined };
  },

  /**
   * Update a task
   * REASONING: > What fields can update? Any partial Task fields
   * # Only changed fields sent to server
   */
  async updateTask(id: TaskId, updates: Partial<Task>, userType: UserType): Promise<SupabaseResult<Task>> {
    return updateTaskInDb(id, updates, userType);
  },

  /**
   * Delete a task
   * REASONING: > Is this permanent? Yes, immediate deletion
   * # No soft delete currently, can add if needed
   */
  async deleteTask(id: TaskId, userType: UserType): Promise<SupabaseResult<void>> {
    return deleteTaskFromDb(id, userType);
  },

  /**
   * Subscribe to real-time changes
   * REASONING: > When to call? On component mount
   * > When to cleanup? On component unmount
   * # Returns unsubscribe function
   */
  subscribeToTasks,

  /**
   * Check online status
   * REASONING: > Use case? UI indicator for sync status
   */
  isOnline,

  /**
   * Force sync from cache
   * REASONING: > Use case? Manual sync button when back online
   */
  syncCache,

  /**
   * Clear local cache
   * REASONING: > Use case? Debug, logout, or data reset
   */
  clearCache,

  /**
   * Get cached tasks (offline fallback)
   * REASONING: > Use case? Display cached data while loading
   */
  getCachedTasks: loadFromCache,

  /**
   * Get user ID for a user type
   * REASONING: > Use case? External components need user ID for queries
   */
  getUserId: (userType: UserType) => USER_IDS[userType],
};

// SECTION: Legacy Compatibility
// Lines 605-650: Backwards compatibility for tests

// REASONING: Maintain fileService.ts API compatibility
// > Why? Existing tests don't need to change
// > These functions use localStorage instead of files

/**
 * @deprecated Use supabaseService instead
 */
export async function loadTasks(userType: UserType): Promise<SupabaseResult<Task[]>> {
  console.warn('loadTasks is deprecated, use supabaseService.getTasks()');
  return supabaseService.getTasks(userType);
}

/**
 * @deprecated Use supabaseService instead
 */
export async function saveTasks(_tasks: Task[]): Promise<SupabaseResult<void>> {
  console.warn('saveTasks is deprecated, bulk save not supported with Supabase');
  return { success: false, error: 'Bulk save deprecated - use individual operations' };
}

// SECTION MAP:
// Lines 1-33: File header
// Lines 35-60: Configuration and constants
// Lines 65-80: Supabase client initialization
// Lines 85-140: Cache utilities
// Lines 145-350: CRUD operations
// Lines 355-450: Real-time subscriptions
// Lines 455-500: Sync status utilities
// Lines 505-600: Public service API
// Lines 605-650: Legacy compatibility
// LAYER STATUS: Layer 4 Complete (End of file - total 650 lines)
