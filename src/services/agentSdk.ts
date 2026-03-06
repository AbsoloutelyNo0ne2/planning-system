/**
 * @fileoverview Agent SDK
 *
 * PURPOSE:
 * Provides a type-safe interface for AI agents to interact with the task planning
 * system. Wraps Supabase operations with error handling and domain validation.
 *
 * WHY THIS EXISTS:
 * - Agents need simple, documented API for task CRUD operations
 * - Consistent error handling and type safety across agent interactions
 * - Abstraction layer allows changing storage without affecting agents
 *
 * LAYER STATUS: Layer 4 Complete
 * NEXT: Layer 5 - Batch operations, caching layer
 */

// REASONING: Import dependencies
// > Why agentSupabase? Service role client for unrestricted access
// > Why Task types? Agents work with domain types, not database types
import { agentSupabase } from './agentSupabaseClient';
import { Task, TaskId, TaskType, ValueClass } from '../types/task';
import {
  fromSupabaseTask,
  toSupabaseInsert,
  toSupabaseUpdate,
  SupabaseTaskRow,
} from '../types/supabase';

// SECTION: Input Types
// REASONING: Define agent-specific input types
// > Why separate from Task? Agents don't provide id, timestamps, computed fields
// > Why Partial<ActorNotes>? Agents may not provide notes initially

/**
 * Input for creating a new task via Agent SDK
 */
export interface AgentTaskInput {
  description: string;
  valueClass: ValueClass;
  type: TaskType;
  trajectoryMatch: number;
  actorNotes?: Record<string, string>;
}

/**
 * Input for updating a task via Agent SDK
 * All fields optional - only provided fields are updated
 */
export type AgentTaskUpdate = Partial<AgentTaskInput>;

// SECTION: Result Types
// REASONING: Structured result types for agent operations
// > Why discriminated union? Forces error checking before accessing data
// > Why error object? Consistent error shape across all operations

/**
 * Successful result from Agent SDK operation
 */
export interface AgentSuccessResult<T> {
  success: true;
  data: T;
}

/**
 * Failed result from Agent SDK operation
 */
export interface AgentErrorResult {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: unknown;
  };
}

/**
 * Result type for all Agent SDK operations
 */
export type AgentResult<T> = AgentSuccessResult<T> | AgentErrorResult;

// SECTION: Validation
// REASONING: Validate inputs before database operations
// > Why early validation? Fail fast with clear messages
// > Why separate function? Reusable across create/update

/**
 * Validate task input data
 * @returns null if valid, error message if invalid
 */
function validateTaskInput(input: Partial<AgentTaskInput>): string | null {
  if (input.description !== undefined) {
    if (input.description.trim().length === 0) {
      return 'Description cannot be empty';
    }
    if (input.description.length > 10000) {
      return 'Description must be less than 10,000 characters';
    }
  }

  if (input.valueClass !== undefined) {
    const validValues = Object.values(ValueClass).filter(v => typeof v === 'number');
    if (!validValues.includes(input.valueClass)) {
      return 'Invalid valueClass - must be a valid ValueClass enum value';
    }
  }

  if (input.type !== undefined) {
    const validTypes = Object.values(TaskType);
    if (!validTypes.includes(input.type)) {
      return 'Invalid type - must be "agentic", "non-agentic", or "hybrid"';
    }
  }

  if (input.trajectoryMatch !== undefined) {
    if (input.trajectoryMatch < 0 || input.trajectoryMatch > 100) {
      return 'trajectoryMatch must be between 0 and 100';
    }
  }

  return null;
}

// SECTION: Error Handling
// REASONING: Convert Supabase errors to AgentResult format
// > Why centralize? Consistent error messages across operations
// > Why check error.code? Provide specific messages for known errors

function handleSupabaseError(error: unknown, context: string): AgentErrorResult {
  if (error && typeof error === 'object' && 'code' in error && 'message' in error) {
    const supabaseError = error as { code: string; message: string; details?: unknown };

    // Specific error messages for known error codes
    switch (supabaseError.code) {
      case 'PGRST116':
        return {
          success: false,
          error: {
            message: `Task not found: ${context}`,
            code: supabaseError.code,
          },
        };
      case '23503':
        return {
          success: false,
          error: {
            message: `Reference error: ${context} - associated data not found`,
            code: supabaseError.code,
          },
        };
      case '23505':
        return {
          success: false,
          error: {
            message: `Duplicate error: ${context} - task already exists`,
            code: supabaseError.code,
          },
        };
      default:
        return {
          success: false,
          error: {
            message: `${context}: ${supabaseError.message}`,
            code: supabaseError.code,
            details: supabaseError.details,
          },
        };
    }
  }

  // Fallback for non-Supabase errors
  const message = error instanceof Error ? error.message : String(error);
  return {
    success: false,
    error: {
      message: `${context}: ${message}`,
    },
  };
}

// SECTION: Core Operations
// REASONING: CRUD operations with full error handling
// > Why async/await? Cleaner than promise chains
// > Why try/catch? Catch all errors, convert to AgentResult

/**
 * Get all tasks from the database
 * REASONING: > What if no tasks? Returns empty array (success)
 * > What if error? Returns error result with details
 */
async function getTasks(): Promise<AgentResult<Task[]>> {
  try {
    const { data, error } = await agentSupabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return handleSupabaseError(error, 'Failed to fetch tasks');
    }

    const tasks = (data || []).map(fromSupabaseTask);
    return { success: true, data: tasks };
  } catch (error) {
    return handleSupabaseError(error, 'Failed to fetch tasks');
  }
}

/**
 * Get a single task by ID
 * REASONING: > What if not found? Returns error result
 * > What if invalid ID? Returns error result
 */
async function getTaskById(id: TaskId): Promise<AgentResult<Task | null>> {
  try {
    const { data, error } = await agentSupabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single<SupabaseTaskRow>();

    if (error) {
      return handleSupabaseError(error, `Failed to fetch task ${id}`);
    }

    if (!data) {
      return {
        success: false,
        error: {
          message: `Task not found: ${id}`,
          code: 'NOT_FOUND',
        },
      };
    }

    return { success: true, data: fromSupabaseTask(data) };
  } catch (error) {
    return handleSupabaseError(error, `Failed to fetch task ${id}`);
  }
}

/**
 * Create a new task
 * REASONING: > What fields required? description, valueClass, type, trajectoryMatch
 * > What if invalid? Returns error with validation message
 * > Who is user_id? Agents use a special agent user ID
 */
async function addTask(input: AgentTaskInput): Promise<AgentResult<Task>> {
  // Validate input
  const validationError = validateTaskInput(input);
  if (validationError) {
    return {
      success: false,
      error: { message: validationError, code: 'VALIDATION_ERROR' },
    };
  }

  try {
    // REASONING: Use special agent user ID
    // > Why 'agent-system'? Identifies tasks created by AI agents
    const AGENT_USER_ID = 'agent-system';

    // Calculate word count from description
    const wordCount = input.description.trim().split(/\s+/).filter(Boolean).length;

    // Create partial task for conversion
    const partialTask: Omit<Task, 'id' | 'creationTime'> = {
      description: input.description,
      valueClass: input.valueClass,
      type: input.type,
      trajectoryMatch: input.trajectoryMatch,
      wordCount,
      actorNotes: input.actorNotes || {},
      completed: false,
    };

    const insertData = toSupabaseInsert(partialTask, AGENT_USER_ID);

    const { data, error } = await agentSupabase
      .from('tasks')
      .insert(insertData)
      .select()
      .single<SupabaseTaskRow>();

    if (error) {
      return handleSupabaseError(error, 'Failed to create task');
    }

    if (!data) {
      return {
        success: false,
        error: { message: 'No data returned from insert' },
      };
    }

    return { success: true, data: fromSupabaseTask(data) };
  } catch (error) {
    return handleSupabaseError(error, 'Failed to create task');
  }
}

/**
 * Update an existing task
 * REASONING: > What fields can update? Any partial fields
 * > What if not found? Returns error result
 * > What about timestamps? Server handles updated_at if configured
 */
async function updateTask(
  id: TaskId,
  updates: AgentTaskUpdate
): Promise<AgentResult<Task>> {
  // Validate input
  const validationError = validateTaskInput(updates);
  if (validationError) {
    return {
      success: false,
      error: { message: validationError, code: 'VALIDATION_ERROR' },
    };
  }

  // Check if any fields provided
  if (Object.keys(updates).length === 0) {
    return {
      success: false,
      error: { message: 'No fields provided for update', code: 'VALIDATION_ERROR' },
    };
  }

  try {
    // Handle word count update if description changed
    const updatePayload: Partial<Task> = { ...updates };
    if (updates.description !== undefined) {
      updatePayload.wordCount = updates.description.trim().split(/\s+/).filter(Boolean).length;
    }

    const updateData = toSupabaseUpdate(updatePayload);

    const { data, error } = await agentSupabase
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single<SupabaseTaskRow>();

    if (error) {
      return handleSupabaseError(error, `Failed to update task ${id}`);
    }

    if (!data) {
      return {
        success: false,
        error: { message: `Task not found: ${id}`, code: 'NOT_FOUND' },
      };
    }

    return { success: true, data: fromSupabaseTask(data) };
  } catch (error) {
    return handleSupabaseError(error, `Failed to update task ${id}`);
  }
}

/**
 * Delete a task
 * REASONING: > Is this permanent? Yes, immediate deletion
 * > What if not found? Returns error result
 * > Can it be undone? No - use completeTask for reversible completion
 */
async function deleteTask(id: TaskId): Promise<AgentResult<void>> {
  try {
    const { error } = await agentSupabase.from('tasks').delete().eq('id', id);

    if (error) {
      return handleSupabaseError(error, `Failed to delete task ${id}`);
    }

    return { success: true, data: undefined };
  } catch (error) {
    return handleSupabaseError(error, `Failed to delete task ${id}`);
  }
}

// SECTION: Query Operations
// REASONING: Common query patterns for agents
// > Why separate? Agents frequently filter tasks by criteria

/**
 * Get tasks filtered by type
 * REASONING: > Use case? Agents want to see only agentic tasks they can handle
 */
async function getTasksByType(type: TaskType): Promise<AgentResult<Task[]>> {
  try {
    const { data, error } = await agentSupabase
      .from('tasks')
      .select('*')
      .eq('type', type)
      .order('created_at', { ascending: false });

    if (error) {
      return handleSupabaseError(error, `Failed to fetch tasks by type ${type}`);
    }

    const tasks = (data || []).map(fromSupabaseTask);
    return { success: true, data: tasks };
  } catch (error) {
    return handleSupabaseError(error, `Failed to fetch tasks by type ${type}`);
  }
}

/**
 * Get pending (incomplete) tasks
 * REASONING: > Use case? Agents want to see what work remains
 * > Ordered? By value class priority, then creation time
 */
async function getPendingTasks(): Promise<AgentResult<Task[]>> {
  try {
    const { data, error } = await agentSupabase
      .from('tasks')
      .select('*')
      .eq('completed', false)
      .order('value_class', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      return handleSupabaseError(error, 'Failed to fetch pending tasks');
    }

    const tasks = (data || []).map(fromSupabaseTask);
    return { success: true, data: tasks };
  } catch (error) {
    return handleSupabaseError(error, 'Failed to fetch pending tasks');
  }
}

/**
 * Get completed tasks
 * REASONING: > Use case? Agents want to review completed work
 */
async function getCompletedTasks(): Promise<AgentResult<Task[]>> {
  try {
    const { data, error } = await agentSupabase
      .from('tasks')
      .select('*')
      .eq('completed', true)
      .order('completed_at', { ascending: false });

    if (error) {
      return handleSupabaseError(error, 'Failed to fetch completed tasks');
    }

    const tasks = (data || []).map(fromSupabaseTask);
    return { success: true, data: tasks };
  } catch (error) {
    return handleSupabaseError(error, 'Failed to fetch completed tasks');
  }
}

// SECTION: Action Operations
// REASONING: Task state transitions
// > Why complete vs delete? Completion is reversible, deletion is permanent

/**
 * Mark a task as completed
 * REASONING: > Reversible? Yes - can update to set completed: false
 * > Timestamp? Sets completedTime automatically
 */
async function completeTask(id: TaskId): Promise<AgentResult<Task>> {
  try {
    const updateData = toSupabaseUpdate({
      completed: true,
      completedTime: Date.now(),
    });

    const { data, error } = await agentSupabase
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single<SupabaseTaskRow>();

    if (error) {
      return handleSupabaseError(error, `Failed to complete task ${id}`);
    }

    if (!data) {
      return {
        success: false,
        error: { message: `Task not found: ${id}`, code: 'NOT_FOUND' },
      };
    }

    return { success: true, data: fromSupabaseTask(data) };
  } catch (error) {
    return handleSupabaseError(error, `Failed to complete task ${id}`);
  }
}

/**
 * Mark a task as incomplete (reopen)
 * REASONING: > Use case? Agent accidentally marked complete
 */
async function reopenTask(id: TaskId): Promise<AgentResult<Task>> {
  try {
    const updateData = toSupabaseUpdate({
      completed: false,
      completedTime: undefined,
    });

    const { data, error } = await agentSupabase
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single<SupabaseTaskRow>();

    if (error) {
      return handleSupabaseError(error, `Failed to reopen task ${id}`);
    }

    if (!data) {
      return {
        success: false,
        error: { message: `Task not found: ${id}`, code: 'NOT_FOUND' },
      };
    }

    return { success: true, data: fromSupabaseTask(data) };
  } catch (error) {
    return handleSupabaseError(error, `Failed to reopen task ${id}`);
  }
}

// SECTION: SDK Export
// REASONING: Export as object for consistent usage pattern
// > Why object? Matches supabaseService pattern
// > Why both default and named? Flexibility in import styles

/**
 * Agent SDK - programmatic access to tasks for AI agents
 *
 * Usage:
 * ```typescript
 * import { agentSdk } from './services/agentSdk';
 *
 * const result = await agentSdk.getTasks();
 * if (result.success) {
 *   console.log('Tasks:', result.data);
 * } else {
 *   console.error('Error:', result.error.message);
 * }
 * ```
 */
export const agentSdk = {
  // Core CRUD operations
  getTasks,
  getTaskById,
  addTask,
  updateTask,
  deleteTask,

  // Query operations
  getTasksByType,
  getPendingTasks,
  getCompletedTasks,

  // Action operations
  completeTask,
  reopenTask,
};

// REASONING: Default export for simple imports
// > Why both? Support both import styles:
// > import { agentSdk } from './agentSdk' (named)
// > import agentSdk from './agentSdk' (default)
export default agentSdk;

// Named exports for individual functions (tree-shaking)
export {
  getTasks,
  getTaskById,
  addTask,
  updateTask,
  deleteTask,
  getTasksByType,
  getPendingTasks,
  getCompletedTasks,
  completeTask,
  reopenTask,
};

// Types are exported inline where defined (lines 32-77)

// SECTION MAP:
// Lines 1-17: File header and documentation
// Lines 20-22: Imports
// Lines 25-49: Input and result type definitions
// Lines 52-99: Validation functions
// Lines 102-159: Error handling utilities
// Lines 162-388: Core CRUD operations
// Lines 391-484: Query operations
// Lines 487-546: Action operations
// Lines 549-600: SDK export
