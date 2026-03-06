/**
 * @fileoverview Application Configuration Constants
 * 
 * PURPOSE:
 * Central location for all configurable constants in the application.
 * User requirement: Per-task-type daily limits
 * 
 * WHY THIS EXISTS:
 * Having a single file for constants makes the app self-documenting.
 * Users can find and modify these values without hunting through code.
 * 
 * LAYER STATUS: Layer 1-3 Complete
 * NEXT: Layer 4 - Add runtime config loading if needed
 */

// SECTION: Daily Task Limits (Per-Type)
// Lines 15-45: Per-task-type daily limits
/**
 * HYBRID_DAILY_LIMIT - Maximum hybrid tasks per day
 * 
 * Hybrid tasks combine agentic and human execution.
 * Default: 7 tasks per day
 */
export const HYBRID_DAILY_LIMIT: number = 4;

/**
 * NON_AGENTIC_DAILY_LIMIT - Maximum non-agentic tasks per day
 * 
 * Non-agentic tasks require full human execution.
 * Default: 7 tasks per day
 */
export const NON_AGENTIC_DAILY_LIMIT: number = 3;

/**
 * AGENTIC_DAILY_LIMIT - Agentic tasks are unlimited
 * 
 * Agentic tasks can be delegated to AI agents.
 * Value: Infinity (no limit)
 */
export const AGENTIC_DAILY_LIMIT: number = Infinity;

/**
 * @deprecated Use per-type limits (HYBRID_DAILY_LIMIT, NON_AGENTIC_DAILY_LIMIT)
 * DAILY_TASK_LIMIT - Old global limit (defaults to hybrid limit for compatibility)
 */
export const DAILY_TASK_LIMIT: number = HYBRID_DAILY_LIMIT;

// SECTION: Data Storage
// Lines 48-60: File paths for local storage
export const DATA_DIR: string = 'data';
export const TASKS_FILE: string = 'tasks.json';
export const COMPLETED_FILE: string = 'completed.json';
export const TRAJECTORY_FILE: string = 'trajectory.json';
export const ACTORS_FILE: string = 'actors.json';
export const LIMIT_FILE: string = 'limit.json';

// SECTION: UI Constants
// Lines 63-75: Display and behavior constants
export const MAX_ACTORS_DISPLAY: number = 5; // Before scroll
export const DIG_SUGGESTION_THRESHOLD: number = 250; // Word count for /DIG nudge
export const TRAJECTORY_MATCH_MAX: number = 100;
export const TRAJECTORY_MATCH_MIN: number = 0;

// SECTION: Date Constants
// Lines 78-85: Date formatting
export const DATE_FORMAT: string = 'YYYY-MM-DD';

// SECTION MAP:
// Lines 1-14: File header
// Lines 15-45: Per-type daily limits
// Lines 48-60: Data storage paths
// Lines 63-75: UI constants
// Lines 78-85: Date constants
