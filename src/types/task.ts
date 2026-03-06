/**
 * @fileoverview Task Type Definitions
 * 
 * PURPOSE:
 * This file defines the core data structures for tasks in the planning system.
 * It establishes the TypeScript contracts that all task-related code must follow.
 * 
 * WHY THIS EXISTS:
 * Type safety prevents runtime errors and documents the data model explicitly.
 * Centralizing types ensures consistency across components, stores, and services.
 * 
 * LAYER STATUS: Layer 4 Complete (Reasoning + Implementation)
 * NEXT: Layer 5 - Section maps and final polish
 */

// SECTION: Primitive Types
// Lines 15-25: ID and timestamp type aliases
import type { ActorId } from './actor';
export type TaskId = string;
export type Timestamp = number;

// SECTION: Enums
// Lines 28-60: Value class enum with ordering
/**
 * ValueClass enum - ordered from highest to lowest priority
 * Order matters for sorting: lower number = higher priority
 */
export enum ValueClass {
  FUN_USEFUL = 1,
  USEFUL = 2,
  HAS_TO_BE_DONE = 3,
  HAS_TO_BE_DONE_BORING = 4,
  FUN_USELESS = 5,
  BORING_USELESS = 6
}

/**
 * TaskType - determines if task can be delegated to AI agents
 */
export enum TaskType {
  AGENTIC = 'agentic',
  NON_AGENTIC = 'non-agentic',
  HYBRID = 'hybrid'
}

// SECTION: Interfaces
// Lines 63-95: Core Task interface
/**
 * Task - central data structure for the planning system
 * 
 * Field rationale:
 * - id: Unique identifier for React keys and data operations
 * - wordCount: Cached on creation to avoid re-calculating during sort
 * - creationTime: Used for age-based tiebreaker in sorting
 * - actorNotes: Map of actor ID to their progress note for this task
 * - completed/sentTime: Archival tracking when task is marked sent
 */
export interface Task {
  id: TaskId;
  description: string;
  valueClass: ValueClass;
  type: TaskType;
  trajectoryMatch: number; // 0-100 percentage
  wordCount: number;
  creationTime: Timestamp;
  actorNotes: Record<ActorId, string>;
  completed: boolean;
  completedTime?: Timestamp;
}

// SECTION: Factory Function Signature
// Lines 98-110: Task creation factory
/**
 * createTask - factory function for creating new tasks
 * 
 * RATIONALE for factory pattern:
 * - Ensures wordCount is calculated consistently
 * - Guarantees id and creationTime are set automatically
 * - Provides default values for optional fields
 * 
 * @param description - Task description text
 * @param valueClass - User-selected value classification
 * @param type - Agentic or non-agentic
 * @param trajectoryMatch - 0-100 alignment with current trajectory
 * @param actorNotes - Map of actor IDs to their comparison notes
 * @returns Fully formed Task object
 */
// REASONING: We need a factory to ensure Task objects are created consistently
// > Why not just use object literals?
// # Object literals allow missing fields or wrong types
// > What guarantees should the factory provide?
// # Valid ID generation, timestamp setting, wordCount calculation
// > How to generate unique IDs?
// # Use timestamp + random suffix for simplicity (sufficient for this scope)
// > When should creationTime be set?
// # At instantiation - captures when task was created
// > What about wordCount?
// # Calculate from description to avoid re-computation during sorting
export function createTask(
  description: string,
  valueClass: ValueClass,
  type: TaskType,
  trajectoryMatch: number,
  actorNotes: Record<ActorId, string>
): Task {
  const wordCount = description.trim().split(/\s+/).filter(Boolean).length;
  const id = `task-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const creationTime = Date.now();

  return {
    id,
    description,
    valueClass,
    type,
    trajectoryMatch,
    wordCount,
    creationTime,
    actorNotes,
    completed: false
  };
}

// SECTION: Validation
// Lines 113-125: Validation result type and function signature
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * validateTask - validates a partial task object
 * 
 * Checks:
 * - description is non-empty and under 10,000 chars
 * - valueClass is valid enum value
 * - trajectoryMatch is 0-100
 * - type is valid enum value
 */
// REASONING: Validation prevents invalid data from entering the system
// > What constitutes a valid description?
// # Non-empty, reasonable length (<10k chars to prevent abuse)
// > How to validate enum values?
// # Check if value exists in the enum (handles both string and numeric enums)
// > What range for trajectoryMatch?
// # 0-100 percentage, clamped or validated
// > Should we collect all errors or fail fast?
// # Collect all errors - better UX for showing validation feedback
// > What error messages to return?
// # Clear, specific messages for each failed validation
export function validateTask(task: Partial<Task>): ValidationResult {
  const errors: string[] = [];

  if (!task.description || task.description.trim().length === 0) {
    errors.push('Description is required and cannot be empty');
  } else if (task.description.length > 10000) {
    errors.push('Description must be less than 10,000 characters');
  }

  if (task.valueClass === undefined || !Object.values(ValueClass).includes(task.valueClass)) {
    errors.push('Value class must be a valid ValueClass enum value');
  }

  if (task.type === undefined || !Object.values(TaskType).includes(task.type)) {
    errors.push('Task type must be "agentic", "non-agentic", or "hybrid"');
  }

  if (task.trajectoryMatch === undefined || task.trajectoryMatch < 0 || task.trajectoryMatch > 100) {
    errors.push('Trajectory match must be between 0 and 100');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// SECTION: Type Guards
// Lines 128-140: Type predicate functions
/**
 * isAgentic - type guard to check if task is agentic
 * Rationale: Clean filtering without repeating enum comparison
 */
// REASONING: Type guards enable TypeScript narrowing for conditional logic
// > Why a type guard instead of direct comparison?
// # TypeScript narrows the type within guarded blocks, enabling property access
// > What does this guard prove?
// # That task.type specifically equals TaskType.AGENTIC
// > When is this useful?
// # Filtering arrays, conditional rendering, or branching logic by task type
// > Could we use task.type === 'agentic' directly?
// # Yes, but we lose type narrowing and must repeat the comparison everywhere
export function isAgentic(task: Task): task is Task & { type: TaskType.AGENTIC } {
  return task.type === TaskType.AGENTIC;
}

/**
 * isHybrid - type guard to check if task is hybrid
 * Rationale: Clean filtering for hybrid tasks
 */
export function isHybrid(task: Task): task is Task & { type: TaskType.HYBRID } {
  return task.type === TaskType.HYBRID;
}

/**
 * getValueClassPriority - returns numeric priority for sorting
 * Lower number = higher priority
 */
// REASONING: Priority lookup centralizes the sorting logic
// > Why a function instead of accessing enum value directly?
// # Encapsulates the priority calculation rule (may change in future)
// > What if we add dynamic priority adjustments?
// # Function can be extended without changing call sites
// > Is the enum value sufficient?
// # Yes - ValueClass is explicitly ordered 1-6 (lower = higher priority)
// > Why not just use valueClass directly in sort?
// # Function call documents intent: "get priority" not "access enum"
export function getValueClassPriority(valueClass: ValueClass): number {
  return valueClass;
}

// SECTION MAP:
// Lines 1-14: File header and documentation
// Lines 15-25: Primitive type aliases (TaskId, ActorId, Timestamp)
// Lines 28-43: Enum definitions (ValueClass, TaskType)
// Lines 46-68: Task interface definition
// Lines 71-104: Factory function with implementation (createTask)
// Lines 107-146: Validation types and function (validateTask)
// Lines 149-161: Type guard with implementation (isAgentic)
// Lines 164-179: Priority lookup function (getValueClassPriority)
// Lines 181+: Section map
