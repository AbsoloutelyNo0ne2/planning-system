/**
 * @fileoverview Daily Task Limit Service - Per-Task-Type Limits
 * 
 * PURPOSE:
 * Manages daily task completion limits per task type:
 * - Hybrid: 4/day
 * - Non-Agentic: 3/day
 * - Agentic: Unlimited
 * 
 * LAYER STATUS: Layer 1-4 Complete
 * NEXT: Layer 5 - Add section map (optional for this size)
 */

import {
  HYBRID_DAILY_LIMIT,
  NON_AGENTIC_DAILY_LIMIT,
  DAILY_TASK_LIMIT
} from '../constants/config';
import { TaskType } from '../types/task';

// Re-export constants for consumers
export { HYBRID_DAILY_LIMIT, NON_AGENTIC_DAILY_LIMIT, DAILY_TASK_LIMIT };

// SECTION: Types
// Lines 28-60: Limit state interface with per-type counters
/**
 * LimitState - tracks daily completion status per task type
 * 
 * RATIONALE for per-type tracking:
 * - Each task type has its own limit (hybrid/non-agentic) or unlimited (agentic)
 * - Counters reset independently on new day
 * - Allows fine-grained control over task completion
 */
export interface LimitState {
  // Per-type completion counters
  agenticCompletedToday: number;
  hybridCompletedToday: number;
  nonAgenticCompletedToday: number;
  
  // Last reset date (shared across all types)
  lastResetDate: string; // YYYY-MM-DD format
  
  // Per-type limit reached flags (for persistence)
  hybridLimitReached: boolean;
  nonAgenticLimitReached: boolean;
}

// SECTION: State Factory
// Lines 63-85: Create initial state with per-type counters
export function createInitialLimitState(): LimitState {
  // REASONING:
  // Factory creates initial state with all counters at zero
  // Each task type has its own counter for accurate tracking
  return {
    agenticCompletedToday: 0,
    hybridCompletedToday: 0,
    nonAgenticCompletedToday: 0,
    lastResetDate: formatDateKey(new Date()),
    hybridLimitReached: false,
    nonAgenticLimitReached: false,
  };
}

// SECTION: Limit Checking
// Lines 88-130: Per-type limit checking
/**
 * checkHybridLimitReached - determines if hybrid daily limit is reached
 */
export function checkHybridLimitReached(state: LimitState, currentDate: Date): boolean {
  const freshState = resetIfNeeded(state, currentDate);
  return freshState.hybridCompletedToday >= HYBRID_DAILY_LIMIT;
}

/**
 * checkNonAgenticLimitReached - determines if non-agentic daily limit is reached
 */
export function checkNonAgenticLimitReached(state: LimitState, currentDate: Date): boolean {
  const freshState = resetIfNeeded(state, currentDate);
  return freshState.nonAgenticCompletedToday >= NON_AGENTIC_DAILY_LIMIT;
}

/**
 * checkAgenticLimitReached - always returns false (unlimited)
 */
export function checkAgenticLimitReached(_state: LimitState, _currentDate: Date): boolean {
  // Agentic tasks are unlimited
  return false;
}

/**
 * checkLimitReachedForType - checks limit for specific task type
 */
export function checkLimitReachedForType(state: LimitState, currentDate: Date, type: TaskType): boolean {
  switch (type) {
    case TaskType.HYBRID:
      return checkHybridLimitReached(state, currentDate);
    case TaskType.NON_AGENTIC:
      return checkNonAgenticLimitReached(state, currentDate);
    case TaskType.AGENTIC:
      return checkAgenticLimitReached(state, currentDate);
    default:
      return false;
  }
}

// SECTION: Remaining Tasks
// Lines 133-165: Get remaining count per type
/**
 * getHybridRemaining - returns count of hybrid tasks remaining today
 */
export function getHybridRemaining(state: LimitState, currentDate: Date): number {
  const freshState = resetIfNeeded(state, currentDate);
  const remaining = HYBRID_DAILY_LIMIT - freshState.hybridCompletedToday;
  return Math.max(0, remaining);
}

/**
 * getNonAgenticRemaining - returns count of non-agentic tasks remaining today
 */
export function getNonAgenticRemaining(state: LimitState, currentDate: Date): number {
  const freshState = resetIfNeeded(state, currentDate);
  const remaining = NON_AGENTIC_DAILY_LIMIT - freshState.nonAgenticCompletedToday;
  return Math.max(0, remaining);
}

/**
 * getAgenticRemaining - returns Infinity (unlimited)
 */
export function getAgenticRemaining(_state: LimitState, _currentDate: Date): number {
  return Infinity;
}

/**
 * getRemainingForType - returns remaining count for specific task type
 */
export function getRemainingForType(state: LimitState, currentDate: Date, type: TaskType): number {
  switch (type) {
    case TaskType.HYBRID:
      return getHybridRemaining(state, currentDate);
    case TaskType.NON_AGENTIC:
      return getNonAgenticRemaining(state, currentDate);
    case TaskType.AGENTIC:
      return getAgenticRemaining(state, currentDate);
    default:
      return 0;
  }
}

// SECTION: State Updates
// Lines 168-210: Per-type increment functions
/**
 * incrementTaskCount - adds one to today's completed count for specific type
 */
export function incrementTaskCount(state: LimitState, currentDate: Date, type: TaskType): LimitState {
  const freshState = resetIfNeeded(state, currentDate);
  
  switch (type) {
    case TaskType.HYBRID: {
      const newCount = freshState.hybridCompletedToday + 1;
      return {
        ...freshState,
        hybridCompletedToday: newCount,
        hybridLimitReached: newCount >= HYBRID_DAILY_LIMIT,
      };
    }
    case TaskType.NON_AGENTIC: {
      const newCount = freshState.nonAgenticCompletedToday + 1;
      return {
        ...freshState,
        nonAgenticCompletedToday: newCount,
        nonAgenticLimitReached: newCount >= NON_AGENTIC_DAILY_LIMIT,
      };
    }
    case TaskType.AGENTIC:
      // Agentic is unlimited, just increment counter for tracking
      return {
        ...freshState,
        agenticCompletedToday: freshState.agenticCompletedToday + 1,
      };
    default:
      return freshState;
  }
}

// SECTION: Reset Logic
// Lines 213-240: Date-based reset
/**
 * resetIfNeeded - checks date and resets counters if it's a new day
 */
export function resetIfNeeded(state: LimitState, currentDate: Date): LimitState {
  const currentDateKey = formatDateKey(currentDate);
  if (currentDateKey !== state.lastResetDate) {
    return {
      ...createInitialLimitState(),
      lastResetDate: currentDateKey,
    };
  }
  return state;
}

// SECTION: Date Utilities
// Lines 243-265: Date formatting for comparison
export function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return formatDateKey(date1) === formatDateKey(date2);
}

// SECTION: Effect Triggers
// Lines 268-310: UI state determination per type
/**
 * shouldShowBlurForType - returns true when limit reached for specific type
 * Used by TaskList component to apply CSS blur per section
 */
export function shouldShowBlurForType(state: LimitState, currentDate: Date, type: TaskType): boolean {
  return checkLimitReachedForType(state, currentDate, type);
}

/**
 * shouldDisableButtonsForType - returns true when limit reached for specific type
 * Used by TaskItem component to disable Copy/Send buttons
 */
export function shouldDisableButtonsForType(state: LimitState, currentDate: Date, type: TaskType): boolean {
  return checkLimitReachedForType(state, currentDate, type);
}

// SECTION: Legacy Compatibility
// Lines 313-350: Backward-compatible functions (for non-typed usage)
/**
 * @deprecated Use per-type functions instead
 * checkLimitReached - old global limit check (defaults to hybrid limit for compatibility)
 */
export function checkLimitReached(state: LimitState, currentDate: Date): boolean {
  // For backward compatibility, check if either limited type is at limit
  return checkHybridLimitReached(state, currentDate) || checkNonAgenticLimitReached(state, currentDate);
}

/**
 * @deprecated Use per-type functions instead
 * getRemainingTasks - old global remaining count (returns minimum of limited types)
 */
export function getRemainingTasks(state: LimitState, currentDate: Date): number {
  const hybridRemaining = getHybridRemaining(state, currentDate);
  const nonAgenticRemaining = getNonAgenticRemaining(state, currentDate);
  return Math.min(hybridRemaining, nonAgenticRemaining);
}

/**
 * @deprecated Use per-type functions instead
 * shouldShowBlur - old global blur check
 */
export function shouldShowBlur(state: LimitState, currentDate: Date): boolean {
  return checkLimitReached(state, currentDate);
}

/**
 * @deprecated Use per-type functions instead
 * shouldDisableButtons - old global button disable check
 */
export function shouldDisableButtons(state: LimitState, currentDate: Date): boolean {
  return checkLimitReached(state, currentDate);
}

// SECTION MAP:
// Lines 1-27: File header
// Lines 28-60: LimitState type (per-type counters)
// Lines 63-85: Factory function
// Lines 88-130: Per-type limit checking
// Lines 133-165: Per-type remaining count
// Lines 168-210: Per-type state updates
// Lines 213-240: Reset logic
// Lines 243-265: Date utilities
// Lines 268-310: Effect triggers (per-type)
// Lines 313-350: Legacy compatibility functions
