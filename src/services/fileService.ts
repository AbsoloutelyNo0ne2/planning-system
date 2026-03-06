/**
 * @fileoverview File Persistence Service - DEPRECATED
 *
 * ⚠️ DEPRECATION WARNING:
 * This service is deprecated and will be removed in a future version.
 * Use supabaseService.ts instead for all persistence operations.
 *
 * MIGRATION GUIDE:
 * - loadTasks() → supabaseService.getTasks()
 * - saveTasks() → supabaseService.createTask() / supabaseService.updateTask()
 * - loadCompleted() → (filter tasks by completed status)
 * - saveCompleted() → supabaseService.updateTask(id, { completed: true })
 *
 * REASONING:
 * File-based persistence has been replaced by Supabase for:
 * - Real-time sync across devices
 * - AI agent access via API
 * - Cloud backup and offline support
 *
 * LAYER STATUS: DEPRECATED
 * NEXT: Remove in Phase 7
 */

import { Task } from '../types/task';
import { Actor } from '../types/actor';
import { Trajectory } from '../types/trajectory';
import { LimitState } from './limitService';

// Result type for backwards compatibility
type FileResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Completed task archive entry
 * @deprecated Use Supabase completed status instead
 */
export interface CompletedTask {
  id: string;
  originalTask: Task;
  sentTime: number;
}

// REASONING: All functions now throw or return error
// > Why not delete? Preserve API for gradual migration
// > Why errors? Forces migration to Supabase service

/**
 * @deprecated Use supabaseService.getTasks() instead
 */
export async function loadTasks(): Promise<FileResult<Task[]>> {
  console.error('DEPRECATED: loadTasks() is removed. Use supabaseService.getTasks()');
  return {
    success: false,
    error: 'File persistence is deprecated. Migrate to supabaseService.getTasks()',
  };
}

/**
 * @deprecated Use supabaseService.createTask() instead
 */
export async function saveTasks(_tasks: Task[]): Promise<FileResult<void>> {
  console.error('DEPRECATED: saveTasks() is removed. Use supabaseService.createTask()');
  return {
    success: false,
    error: 'File persistence is deprecated. Migrate to supabaseService.createTask()',
  };
}

/**
 * @deprecated Use Supabase completed status instead
 */
export async function loadCompleted(): Promise<FileResult<CompletedTask[]>> {
  console.error('DEPRECATED: loadCompleted() is removed. Use supabaseService.getTasks() with filter');
  return {
    success: false,
    error: 'File persistence is deprecated. Use supabaseService.getTasks()',
  };
}

/**
 * @deprecated Use supabaseService.updateTask() with completed flag instead
 */
export async function saveCompleted(_tasks: CompletedTask[]): Promise<FileResult<void>> {
  console.error('DEPRECATED: saveCompleted() is removed. Use supabaseService.updateTask()');
  return {
    success: false,
    error: 'File persistence is deprecated. Migrate to supabaseService.updateTask()',
  };
}

/**
 * @deprecated Use Supabase instead
 */
export async function loadTrajectory(): Promise<FileResult<Trajectory>> {
  console.error('DEPRECATED: loadTrajectory() is removed. Use Supabase');
  return {
    success: false,
    error: 'File persistence is deprecated. Use Supabase for persistence.',
  };
}

/**
 * @deprecated Use Supabase instead
 */
export async function saveTrajectory(_trajectory: Trajectory): Promise<FileResult<void>> {
  console.error('DEPRECATED: saveTrajectory() is removed. Use Supabase');
  return {
    success: false,
    error: 'File persistence is deprecated. Use Supabase for persistence.',
  };
}

/**
 * @deprecated Use Supabase instead
 */
export async function loadActors(): Promise<FileResult<Actor[]>> {
  console.error('DEPRECATED: loadActors() is removed. Use Supabase');
  return {
    success: false,
    error: 'File persistence is deprecated. Use Supabase for persistence.',
  };
}

/**
 * @deprecated Use Supabase instead
 */
export async function saveActors(_actors: Actor[]): Promise<FileResult<void>> {
  console.error('DEPRECATED: saveActors() is removed. Use Supabase');
  return {
    success: false,
    error: 'File persistence is deprecated. Use Supabase for persistence.',
  };
}

/**
 * @deprecated Use Supabase instead
 */
export async function loadLimitState(): Promise<FileResult<LimitState>> {
  console.error('DEPRECATED: loadLimitState() is removed. Use Supabase');
  return {
    success: false,
    error: 'File persistence is deprecated. Use Supabase for persistence.',
  };
}

/**
 * @deprecated Use Supabase instead
 */
export async function saveLimitState(_state: LimitState): Promise<FileResult<void>> {
  console.error('DEPRECATED: saveLimitState() is removed. Use Supabase');
  return {
    success: false,
    error: 'File persistence is deprecated. Use Supabase for persistence.',
  };
}

/**
 * @deprecated Not needed with Supabase
 */
export async function getDataFilePath(_filename: string): Promise<string> {
  console.error('DEPRECATED: getDataFilePath() is removed. Use Supabase');
  return '';
}

/**
 * @deprecated Not needed with Supabase
 */
export async function ensureDataDir(): Promise<FileResult<void>> {
  console.error('DEPRECATED: ensureDataDir() is removed. Use Supabase');
  return { success: true, data: undefined };
}

// SECTION MAP:
// Lines 1-25: Deprecation warning
// Lines 27-50: Imports and types
// Lines 55+: Deprecated functions
// LAYER STATUS: DEPRECATED (End of file)
