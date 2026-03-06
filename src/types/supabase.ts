/**
 * @fileoverview Supabase Type Definitions
 *
 * PURPOSE:
 * TypeScript types for Supabase database schema. Maps database columns
 * to TypeScript types with proper camelCase conversions.
 *
 * WHY THIS EXISTS:
 * - Provides type safety for Supabase operations
 * - Documents database schema in code
 * - Handles snake_case to camelCase mapping
 *
 * LAYER STATUS: Layer 4 Complete
 * NEXT: Layer 5 - Sync with migrations
 */

// REASONING: Import Task types to ensure compatibility
// > Why import from task.ts? Reuse existing Task type definitions
// > What needs to match? All Task fields must map to database columns
import { Task, TaskType, ValueClass } from './task';

// SECTION: Database Schema Types
// Lines 25-70: Database column types (snake_case)

/**
 * SupabaseTaskRow - represents a raw row from the tasks table
 * Uses snake_case to match database column names
 */
export interface SupabaseTaskRow {
  id: string; // uuid
  user_id: string; // uuid
  description: string;
  value_class: number; // 1-6
  type: 'agentic' | 'non-agentic' | 'hybrid';
  trajectory_match: number; // 0-100
  word_count: number;
  actor_notes: Record<string, string>; // jsonb
  completed: boolean;
  created_at: string; // ISO timestamp
  completed_at: string | null; // ISO timestamp
}

/**
 * SupabaseTaskInsert - required fields for inserting a new task
 */
export interface SupabaseTaskInsert {
  user_id: string;
  description: string;
  value_class: number;
  type: 'agentic' | 'non-agentic' | 'hybrid';
  trajectory_match: number;
  word_count: number;
  actor_notes?: Record<string, string>;
  completed?: boolean;
  completed_at?: string | null;
}

/**
 * SupabaseTaskUpdate - partial fields for updating a task
 */
export interface SupabaseTaskUpdate {
  description?: string;
  value_class?: number;
  type?: 'agentic' | 'non-agentic' | 'hybrid';
  trajectory_match?: number;
  word_count?: number;
  actor_notes?: Record<string, string>;
  completed?: boolean;
  completed_at?: string | null;
}

// SECTION: Type Conversion Functions
// Lines 75-150: Map between database and app types

/**
 * Convert Supabase row to Task
 * REASONING: Database uses snake_case and ISO strings, app uses camelCase and numbers
 * > Why number timestamps? Easier comparison and manipulation in JS
 * > Why camelCase? JavaScript/TypeScript convention
 */
export function fromSupabaseTask(row: SupabaseTaskRow): Task {
  // REASONING: Map database string type to TaskType enum
  // > Why explicit mapping? Ensures correct enum value regardless of input format
  let taskType: TaskType;
  switch (row.type) {
    case 'agentic':
      taskType = TaskType.AGENTIC;
      break;
    case 'non-agentic':
      taskType = TaskType.NON_AGENTIC;
      break;
    case 'hybrid':
      taskType = TaskType.HYBRID;
      break;
    default:
      console.warn('[fromSupabaseTask] Unknown task type:', row.type, '- defaulting to NON_AGENTIC');
      taskType = TaskType.NON_AGENTIC;
  }

  const task: Task = {
    id: row.id,
    description: row.description,
    valueClass: row.value_class as ValueClass,
    type: taskType,
    trajectoryMatch: row.trajectory_match,
    wordCount: row.word_count,
    // REASONING: Convert ISO timestamp to milliseconds for app
    // > Why Date.parse()? Converts ISO 8601 string to Unix timestamp in ms
    creationTime: Date.parse(row.created_at),
    actorNotes: row.actor_notes || {},
    completed: row.completed || false,
    // REASONING: Optional completedTime only set when completed
    // > Why check? completed_at can be null for incomplete tasks
    completedTime: row.completed_at ? Date.parse(row.completed_at) : undefined,
  };
  return task;
}

/**
 * Convert Task to Supabase insert format
 * REASONING: Prepare app Task for database insertion
 * > Why separate insert/update? Insert needs user_id, update doesn't
 * > Why Omit? Ensure we don't try to set server-generated fields
 */
export function toSupabaseInsert(
  task: Omit<Task, 'id' | 'creationTime'>,
  userId: string
): SupabaseTaskInsert {
  // REASONING: TaskType enum values are already the correct strings
  // > Why not switch? Enum values match database format directly
  return {
    user_id: userId,
    description: task.description,
    value_class: task.valueClass,
    type: task.type as 'agentic' | 'non-agentic' | 'hybrid',
    trajectory_match: task.trajectoryMatch,
    word_count: task.wordCount,
    actor_notes: task.actorNotes || {},
    completed: task.completed || false,
    // REASONING: Convert timestamp to ISO string for database
    // > Why toISOString()? Supabase expects ISO 8601 format for timestamps
    completed_at: task.completedTime ? new Date(task.completedTime).toISOString() : null,
  };
}

/**
 * Convert partial Task updates to Supabase update format
 * REASONING: Only send changed fields to database
 * > Why Partial? Updates are optional, only changed fields sent
 * > Why null for undefined? Database needs explicit null for clearing
 */
export function toSupabaseUpdate(updates: Partial<Task>): SupabaseTaskUpdate {
  const result: SupabaseTaskUpdate = {};

  // REASONING: Only map defined fields to avoid overwriting with undefined
  // > Why check !== undefined? Allows setting to null/empty values
  if (updates.description !== undefined) {
    result.description = updates.description;
  }
  if (updates.valueClass !== undefined) {
    result.value_class = updates.valueClass;
  }
  if (updates.type !== undefined) {
    result.type = updates.type;
  }
  if (updates.trajectoryMatch !== undefined) {
    result.trajectory_match = updates.trajectoryMatch;
  }
  if (updates.wordCount !== undefined) {
    result.word_count = updates.wordCount;
  }
  if (updates.actorNotes !== undefined) {
    result.actor_notes = updates.actorNotes;
  }
  if (updates.completed !== undefined) {
    result.completed = updates.completed;
  }
  if (updates.completedTime !== undefined) {
    result.completed_at = updates.completedTime ? new Date(updates.completedTime).toISOString() : null;
  }

  return result;
}

// SECTION: Real-time Types
// Lines 155-200: Subscription event types

/**
 * Supabase realtime event types
 * REASONING: Match Supabase realtime payload structure
 * > Why these types? Supabase realtime sends INSERT/UPDATE/DELETE events
 */
export type RealtimeEventType = 'INSERT' | 'UPDATE' | 'DELETE';

export interface RealtimeTaskPayload {
  eventType: RealtimeEventType;
  new: SupabaseTaskRow | null;
  old: { id: string } | null;
}

// SECTION: Service Response Types
// Lines 205-240: Operation result types

/**
 * Operation result for Supabase calls
 * REASONING: Consistent error handling pattern across service
 * > Why discriminated union? Forces callers to check success before accessing data
 */
export type SupabaseResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Sync state for offline/online handling
 * REASONING: Track sync status for UI feedback
 * > Why enum? Clear states for UI to display appropriate messages
 */
export enum SyncState {
  IDLE = 'idle',
  SYNCING = 'syncing',
  SYNCED = 'synced',
  ERROR = 'error',
  OFFLINE = 'offline',
}

// SECTION MAP:
// Lines 1-23: File header
// Lines 25-68: Database schema types
// Lines 75-150: Type conversion functions
// Lines 155-200: Real-time types
// Lines 205-240: Service response types
