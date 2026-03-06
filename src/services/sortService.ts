/**
 * @fileoverview Task Sorting Service
 * 
 * PURPOSE:
 * Implements the deterministic cascade sort algorithm for ordering tasks.
 * This is a core business logic file - the sort order IS the product's intelligence.
 * 
 * WHY THIS EXISTS:
 * Separating sort logic into a service allows:
 * - Comprehensive unit testing without UI dependencies
 * - Reuse across different views (if needed)
 * - Clear documentation of the sorting rules
 * 
 * SORT ALGORITHM (from spec):
 * 1. Agentic tasks first, Non-agentic second
 * 2. Within each group: By ValueClass (FUN_USEFUL=1 first, BORING_USELESS=6 last)
 * 3. Within each ValueClass: By trajectoryMatch DESC (highest % first)
 * 4. Within ties: By wordCount DESC (more detail first)
 * 5. Within ties: By creationTime ASC (older first)
 * 
 * LAYER STATUS: Layer 1-3 Complete (Headers, Structure, Intent)
 * NEXT: Layer 4 - Implement comparison functions
 */

import { Task, ValueClass, TaskType } from '../types/task';

// SECTION: Main Sort Function
// Lines 35-50: Primary export
/**
 * sortTasks - applies the deterministic cascade sort
 * 
 * RATIONALE for cascade approach:
 * - Each tier is a tie-breaker for the previous
 * - Deterministic = same input always produces same output
 * - No weighted scoring = easier to reason about
 * 
 * @param tasks - Array of tasks to sort (not mutated)
 * @returns New array with tasks in sorted order
 */
export function sortTasks(tasks: Task[]): Task[] {
  // REASONING:
  // We need to sort tasks by the cascade algorithm
  // > Why not use Array.prototype.sort() directly?
  // > Array.sort() mutates the original array
  // > Requirement: "Functions must be immutable (return new arrays, don't mutate input)"
  // > Therefore: Spread into new array first, then sort the copy
  //
  // What if tasks array is empty?
  // > Spreading empty array still works: [...[]] = []
  // > Sorting empty array returns empty array
  // > No special handling needed
  //
  // What if tasks array is large?
  // > V8 uses Timsort with O(n log n) complexity
  // > 10k tasks would be fine, 100k+ might need optimization
  // > For now, standard sort is acceptable per spec

  return [...tasks].sort(compareTasks);
}

// SECTION: Comparison Functions
// Lines 53-95: Step-by-step comparison logic
/**
 * compareTasks - main comparison function for the cascade
 * 
 * INTENT: Returns negative if a comes before b, positive if b before a, 0 if equal
 * This follows standard comparator contract for Array.prototype.sort()
 */
export function compareTasks(a: Task, b: Task): number {
  // REASONING:
  // We need to compare two tasks using the cascade algorithm
  // > Why cascade?
  // > Spec defines 5 levels: Type > ValueClass > TrajectoryMatch > WordCount > CreationTime
  // > Each level only resolves if previous levels are equal (return 0)
  // > Therefore: Check levels sequentially, return first non-zero result
  //
  // What if all 5 levels return 0?
  // > Then tasks are truly equal by all criteria
  // > Return 0 to indicate equality (stable sort will preserve original order)
  // > This is acceptable per comparator contract
  //
  // Why this order specifically?
  // > From spec: "Agentic first" is highest priority
  // > Then value class (FUN_USEFUL=1 first)
  // > Then trajectory match DESC (highest %)
  // > Then wordCount DESC (more detail)
  // > Then creationTime ASC (older first)
  // > This order was designed by domain experts, we follow it exactly

  const typeCompare = compareByType(a, b);
  if (typeCompare !== 0) return typeCompare;

  const valueClassCompare = compareByValueClass(a, b);
  if (valueClassCompare !== 0) return valueClassCompare;

  const trajectoryCompare = compareByTrajectoryMatch(a, b);
  if (trajectoryCompare !== 0) return trajectoryCompare;

  const wordCountCompare = compareByWordCount(a, b);
  if (wordCountCompare !== 0) return wordCountCompare;

  return compareByCreationTime(a, b);
}

/**
 * compareByType - Level 1: Agentic > Hybrid > Non-agentic
 * Returns: negative if a comes before b in sort order
 * Sort order: Agentic (0) > Hybrid (1) > Non-agentic (2)
 */
export function compareByType(a: Task, b: Task): number {
  // REASONING:
  // We need to determine task type priority for sorting
  // > What is the sort order?
  // > Per spec: "Agentic first, Hybrid second, Non-agentic third"
  // > This is a business rule - agentic tasks have highest value,
  //   hybrid tasks have mixed delegation potential, non-agentic require full human oversight
  // > Therefore: Assign numeric ranks: Agentic=0, Hybrid=1, Non-agentic=2
  //
  // What are the possible combinations?
  // > Both same type: equal (0)
  // > a has lower rank (higher priority): a comes first (-1)
  // > b has lower rank (higher priority): b comes first (1)
  //
  // Why numeric ranking instead of boolean checks?
  // > With 3+ types, boolean checks become complex and error-prone
  // > Numeric ranking scales to any number of types
  // > Simple subtraction gives correct comparator result

  const typeRank = (task: Task): number => {
    if (isAgentic(task)) return 0;
    if (isHybrid(task)) return 1;
    return 2; // Non-agentic
  };

  return typeRank(a) - typeRank(b);
}

/**
 * compareByValueClass - Level 2: Value class priority
 * FUN_USEFUL=1 has highest priority (comes first)
 */
export function compareByValueClass(a: Task, b: Task): number {
  // REASONING:
  // We need to compare tasks by their ValueClass priority
  // > Why is FUN_USEFUL=1 first and BORING_USELESS=6 last?
  // > Per spec: ValueClass has numeric values (1-6) representing priority
  // > Lower number = higher priority (comes first in sort)
  // > This is an ordinal ranking - 1 is "best", 6 is "worst"
  // > Therefore: Compare priority values directly (ascending)
  //
  // What if ValueClass is the same?
  // > Then return 0 to trigger next level of cascade
  // > Don't try to break ties here - that's what the cascade is for
  // > Each level should only resolve when previous levels are equal
  //
  // Why use getValueClassPriority() helper?
  // > ValueClass enum values might not be numeric (could be strings)
  // > The helper abstracts the priority lookup
  // > If the priority mapping changes, only one place needs updating
  // > Therefore: Use helper for decoupling

  const aPriority = getValueClassPriority(a.valueClass);
  const bPriority = getValueClassPriority(b.valueClass);

  return aPriority - bPriority;
}

/**
 * compareByTrajectoryMatch - Level 3: Higher match % comes first
 */
export function compareByTrajectoryMatch(a: Task, b: Task): number {
  // REASONING:
  // We need to compare tasks by trajectoryMatch (higher % comes first)
  // > Why higher first?
  // > Per spec: "By trajectoryMatch DESC (highest % first)"
  // > DESC = descending = larger values first
  // > Higher match % means task aligns better with user's trajectory
  // > Therefore: Return negative if a has higher match than b
  //
  // What if trajectoryMatch values are equal?
  // > Return 0 to trigger next cascade level
  // > Floating point equality is tricky but acceptable here
  // > Both values come from same calculation logic
  //
  // Why b - a instead of a - b?
  // > Standard sort: negative means a comes first
  // > We want higher values first, so higher should give negative
  // > If a=90%, b=50%: b - a = 50 - 90 = -40 (negative, a first) ✓
  // > If a=50%, b=90%: b - a = 90 - 50 = 40 (positive, b first) ✓
  // > Therefore: return b - a for DESC order

  return b.trajectoryMatch - a.trajectoryMatch;
}

/**
 * compareByWordCount - Level 4: More words = more detail = comes first
 */
export function compareByWordCount(a: Task, b: Task): number {
  // REASONING:
  // We need to compare tasks by wordCount (more words first)
  // > Why more words first?
  // > Per spec: "By wordCount DESC (more detail first)"
  // > More words = more detail = more effort invested
  // > Tasks with more detail are likely more important/valuable
  // > Therefore: Return negative if a has more words than b
  //
  // What if wordCount is the same?
  // > Return 0 to trigger creationTime comparison (last cascade level)
  // > Word counts being equal is a legitimate tie
  // > Final tie-breaker is creationTime (oldest first)
  //
  // Why b - a for DESC order?
  // > Same pattern as trajectoryMatch
  // > If a=100 words, b=50 words: b - a = 50 - 100 = -50 (a first) ✓
  // > If a=50 words, b=100 words: b - a = 100 - 50 = 50 (b first) ✓
  // > Therefore: return b - a for DESC order

  return b.wordCount - a.wordCount;
}

/**
 * compareByCreationTime - Level 5: Older tasks (lower timestamp) come first
 */
export function compareByCreationTime(a: Task, b: Task): number {
  // REASONING:
  // We need to compare tasks by creationTime (older first)
  // > Why older first?
  // > Per spec: "By creationTime ASC (older first)"
  // > ASC = ascending = smaller timestamp first
  // > Earlier timestamp = older task = created first
  // > Older tasks should be prioritized over newer ones
  // > Therefore: Return negative if a is older than b (a.timestamp < b.timestamp)
  //
  // What if creationTime is equal?
  // > Return 0 - tasks are truly equal by all criteria
  // > This is the final tie-breaker
  // > Sort will be stable (preserve original order) for equal elements
  //
  // Why a - b instead of b - a?
  // > We want ASC order (oldest/smallest first)
  // > If a created at T=100, b at T=200: a - b = 100 - 200 = -100 (a first) ✓
  // > If a created at T=200, b at T=100: a - b = 200 - 100 = 100 (b first) ✓
  // > Therefore: return a - b for ASC order

  return a.creationTime - b.creationTime;
}

// SECTION: Type Guards
// Lines 98-110: Helper for type checking
export function isAgentic(task: Task): boolean {
  // REASONING:
  // We need to determine if a task is "agentic" (requires autonomous action)
  // > What makes a task agentic?
  // > Per domain model: TaskType.AGENTIC represents autonomous actions
  // > Only AGENTIC type is considered agentic (not HYBRID)
  // > Therefore: Check if task.type === TaskType.AGENTIC
  //
  // What if type is undefined or null?
  // > Task interface requires type to be defined (not optional)
  // > Runtime validation happens at data boundaries
  // > By this point, type should always be a valid TaskType
  // > Therefore: Direct comparison is safe
  //
  // Why export this function?
  // > Used in sort comparisons AND other parts of the system
  // > Centralizes the agentic definition
  // > If definition changes (e.g., multiple types become agentic),
  // > only this function needs updating
  // > Therefore: Shared utility function

  return task.type === TaskType.AGENTIC;
}

export function isHybrid(task: Task): boolean {
  // REASONING:
  // We need to determine if a task is "hybrid" (mixed delegation potential)
  // > What makes a task hybrid?
  // > TaskType.HYBRID represents tasks with partial AI delegation
  // > Therefore: Check if task.type === TaskType.HYBRID

  return task.type === TaskType.HYBRID;
}

// SECTION: Value Class Utilities
// Lines 113-125: Priority lookup
export function getValueClassPriority(valueClass: ValueClass): number {
  // REASONING:
  // We need to map ValueClass enum to numeric priority (1 = highest, 6 = lowest)
  // > Why numeric priority instead of using enum value directly?
  // > ValueClass enum values might be strings (e.g., "FUN_USEFUL")
  // > We need numeric values for comparison (a - b)
  // > This mapping abstracts the priority from the enum definition
  // > Therefore: Map each enum value to its priority rank
  //
  // What is the priority order?
  // > Per spec: FUN_USEFUL=1 first, BORING_USELESS=6 last
  // > 1 = highest priority (comes first in sorted array)
  // > 6 = lowest priority (comes last in sorted array)
  // > The numeric values themselves ARE the priority ranks
  // > Therefore: Return the enum value directly as priority
  //
  // Why switch statement over object lookup?
  // > Exhaustiveness checking: TypeScript ensures all enum cases are handled
  // > If new ValueClass added, compiler will error here
  // > Default case provides runtime safety
  // > Therefore: Switch with explicit cases + exhaustive check
  //
  // What if valueClass is invalid?
  // > At runtime, data might come from external source
  // > Return lowest priority (6) as safe default
  // > This prevents crashes while handling bad data gracefully

  switch (valueClass) {
    case ValueClass.FUN_USEFUL:
      return 1;
    case ValueClass.USEFUL:
      return 2;
    case ValueClass.HAS_TO_BE_DONE:
      return 3;
    case ValueClass.HAS_TO_BE_DONE_BORING:
      return 4;
    case ValueClass.FUN_USELESS:
      return 5;
    case ValueClass.BORING_USELESS:
      return 6;
    default:
      // Exhaustive check: this should never happen if types are correct
      // But runtime safety: default to lowest priority
      return 6;
  }
}

// SECTION MAP:
// Lines 1-34: File header
// Lines 35-50: Main sort function
// Lines 53-95: Comparison functions
// Lines 98-110: Type guards
// Lines 113-125: Value class utilities
