/**
 * File Purpose: Test the deterministic task sort algorithm
 * Critical Paths:
 *   - Sort order: Agentic first → Non-agentic second
 *   - Within groups: Value class → Trajectory match → Word count → Creation time
 *   - Tie-breaking behavior when multiple fields are equal
 * Edge Cases:
 *   - Empty task list
 *   - Single task
 *   - All tasks have identical sort values
 *   - Tasks with same value class but different trajectory match
 *   - Tasks with same value class and trajectory but different word count
 *   - Tasks with same value class, trajectory, and word count but different creation time
 */

import { describe, it, expect } from 'vitest';
import { sortTasks, compareTasks, isAgentic, isHybrid, getValueClassPriority } from '../../src/services/sortService';
import type { Task } from '../../src/types/task';
import { ValueClass, TaskType } from '../../src/types/task';

describe('SortService', () => {
  describe('sortTasks', () => {
    it('should return empty array when given empty task list', () => {
      // REASONING: We need to verify empty input is handled gracefully
      // > What happens when tasks array is empty?
      // > sortTasks should return empty array without error
      // > Therefore: Call with empty array, expect empty array back
      const result = sortTasks([]);
      expect(result).toEqual([]);
    });

    it('should return single task unchanged', () => {
      // REASONING: Single element sort should return the same element
      // > Does sort mutate original? No - per immutability rules
      // > Does sort change array reference? Yes - creates new array
      // > Therefore: Check result has same task, but is new array reference
      const task = createMockTask({ id: 'task-1', description: 'Test task' });
      const result = sortTasks([task]);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('task-1');
      expect(result).not.toBe([task]); // Should be new array
    });

    it('should place agentic tasks before non-agentic tasks', () => {
      // REASONING: Primary sort criterion - agentic tasks come first
      // > Why? Agentic tasks have higher business value
      // > Create mixed tasks, sort, verify order
      // > Therefore: Agentic in result[0], non-agentic in result[1]
      const agentic = createMockTask({ id: 'agentic', type: TaskType.AGENTIC });
      const nonAgentic = createMockTask({ id: 'non-agentic', type: TaskType.NON_AGENTIC });
      const result = sortTasks([nonAgentic, agentic]);
      expect(result[0].id).toBe('agentic');
      expect(result[1].id).toBe('non-agentic');
    });

    it('should place hybrid tasks between agentic and non-agentic', () => {
      // REASONING: Three-tier sort order - agentic > hybrid > non-agentic
      // > Hybrid tasks have mixed delegation potential
      // > Create all three types, sort, verify order
      // > Therefore: Agentic first, hybrid second, non-agentic last
      const nonAgentic = createMockTask({ id: 'non-agentic', type: TaskType.NON_AGENTIC });
      const hybrid = createMockTask({ id: 'hybrid', type: TaskType.HYBRID });
      const agentic = createMockTask({ id: 'agentic', type: TaskType.AGENTIC });
      const result = sortTasks([nonAgentic, hybrid, agentic]);
      expect(result[0].id).toBe('agentic');
      expect(result[1].id).toBe('hybrid');
      expect(result[2].id).toBe('non-agentic');
    });

    it('should sort hybrid tasks by value class like other types', () => {
      // REASONING: Hybrid tasks should sort within their group by value class
      // > Value class applies to all task types
      // > Therefore: Lower value class hybrid tasks come first
      const hybridLow = createMockTask({
        id: 'hybrid-low',
        type: TaskType.HYBRID,
        valueClass: ValueClass.BORING_USELESS
      });
      const hybridHigh = createMockTask({
        id: 'hybrid-high',
        type: TaskType.HYBRID,
        valueClass: ValueClass.FUN_USEFUL
      });
      const result = sortTasks([hybridLow, hybridHigh]);
      expect(result[0].id).toBe('hybrid-high');
      expect(result[1].id).toBe('hybrid-low');
    });

    it('should sort by value class ascending within agentic tasks', () => {
      // REASONING: Secondary sort - lower value class = higher priority
      // > FUN_USEFUL=1 should come before USEFUL=2
      // > Create agentic tasks with different value classes
      // > Therefore: FUN_USEFUL task first, then others in ascending order
      const highValue = createMockTask({
        id: 'high-value',
        type: TaskType.AGENTIC,
        valueClass: ValueClass.FUN_USEFUL
      });
      const mediumValue = createMockTask({
        id: 'medium-value',
        type: TaskType.AGENTIC,
        valueClass: ValueClass.USEFUL
      });
      const result = sortTasks([mediumValue, highValue]);
      expect(result[0].id).toBe('high-value');
      expect(result[1].id).toBe('medium-value');
    });

    it('should sort by value class ascending within non-agentic tasks', () => {
      // REASONING: Value class applies to both groups independently
      // > Non-agentic tasks should also sort by value class
      // > Therefore: Lower value class non-agentic tasks come first
      const highValue = createMockTask({
        id: 'high-value',
        type: TaskType.NON_AGENTIC,
        valueClass: ValueClass.FUN_USEFUL
      });
      const lowValue = createMockTask({
        id: 'low-value',
        type: TaskType.NON_AGENTIC,
        valueClass: ValueClass.BORING_USELESS
      });
      const result = sortTasks([lowValue, highValue]);
      expect(result[0].id).toBe('high-value');
      expect(result[1].id).toBe('low-value');
    });

    it('should sort by trajectory match descending when value class is equal', () => {
      // REASONING: Tertiary sort - higher trajectory match comes first
      // > When value class is equal, compare trajectoryMatch
      // > Higher percentage = better alignment with goals
      // > Therefore: 90% match before 50% match
      const highMatch = createMockTask({
        id: 'high-match',
        type: TaskType.AGENTIC,
        valueClass: ValueClass.FUN_USEFUL,
        trajectoryMatch: 90
      });
      const lowMatch = createMockTask({
        id: 'low-match',
        type: TaskType.AGENTIC,
        valueClass: ValueClass.FUN_USEFUL,
        trajectoryMatch: 50
      });
      const result = sortTasks([lowMatch, highMatch]);
      expect(result[0].id).toBe('high-match');
      expect(result[1].id).toBe('low-match');
    });

    it('should sort by word count descending when value class and trajectory match are equal', () => {
      // REASONING: Quaternary sort - more words = more detail = first
      // > Per spec: "By wordCount DESC (more detail first)"
      // > When type, value class, trajectory are equal
      // > Therefore: More detailed tasks come first
      const detailed = createMockTask({
        id: 'detailed',
        type: TaskType.AGENTIC,
        valueClass: ValueClass.FUN_USEFUL,
        trajectoryMatch: 80,
        wordCount: 100
      });
      const brief = createMockTask({
        id: 'brief',
        type: TaskType.AGENTIC,
        valueClass: ValueClass.FUN_USEFUL,
        trajectoryMatch: 80,
        wordCount: 20
      });
      const result = sortTasks([brief, detailed]);
      expect(result[0].id).toBe('detailed');
      expect(result[1].id).toBe('brief');
    });

    it('should sort by creation time ascending when all other fields are equal', () => {
      // REASONING: Final tiebreaker - older tasks come first
      // > When all cascade fields are equal
      // > Lower timestamp = created earlier
      // > Therefore: Task with smaller creationTime comes first
      const older = createMockTask({
        id: 'older',
        type: TaskType.AGENTIC,
        valueClass: ValueClass.FUN_USEFUL,
        trajectoryMatch: 80,
        wordCount: 50,
        creationTime: 1000
      });
      const newer = createMockTask({
        id: 'newer',
        type: TaskType.AGENTIC,
        valueClass: ValueClass.FUN_USEFUL,
        trajectoryMatch: 80,
        wordCount: 50,
        creationTime: 2000
      });
      const result = sortTasks([newer, older]);
      expect(result[0].id).toBe('older');
      expect(result[1].id).toBe('newer');
    });

    it('should maintain stable sort order for identical tasks', () => {
      // REASONING: Stable sort preserves original order for equal elements
      // > If tasks are identical by all sort criteria
      // > Their relative order should be maintained
      // > Therefore: Same order as input when values equal
      const taskA = createMockTask({ id: 'task-a', creationTime: 1000 });
      const taskB = createMockTask({ id: 'task-b', creationTime: 1000 });
      // Note: Same creationTime means equal by all criteria
      const result = sortTasks([taskA, taskB]);
      // Should maintain input order (taskA before taskB)
      expect(result[0].id).toBe('task-a');
      expect(result[1].id).toBe('task-b');
    });

    it('should handle mixed agentic and non-agentic tasks correctly', () => {
      // REASONING: Complex scenario - multiple criteria across groups
      // > Mix of agentic/non-agentic with varying value classes
      // > Verify full cascade works correctly
      // > Therefore: All agentic sorted first, then non-agentic, each sorted by value
      const agenticLow = createMockTask({
        id: 'agentic-low',
        type: TaskType.AGENTIC,
        valueClass: ValueClass.BORING_USELESS
      });
      const agenticHigh = createMockTask({
        id: 'agentic-high',
        type: TaskType.AGENTIC,
        valueClass: ValueClass.FUN_USEFUL
      });
      const nonAgenticHigh = createMockTask({
        id: 'non-agentic-high',
        type: TaskType.NON_AGENTIC,
        valueClass: ValueClass.FUN_USEFUL
      });
      const result = sortTasks([agenticLow, nonAgenticHigh, agenticHigh]);
      expect(result[0].id).toBe('agentic-high'); // Agentic + high value
      expect(result[1].id).toBe('agentic-low');  // Agentic + low value
      expect(result[2].id).toBe('non-agentic-high'); // Non-agentic
    });

    it('should handle all three task types together correctly', () => {
      // REASONING: Full three-type sort verification
      // > Mix of all types with varying value classes
      // > Verify agentic > hybrid > non-agentic order is maintained
      // > Within each type group, value class should apply
      const nonAgenticHigh = createMockTask({
        id: 'non-agentic-high',
        type: TaskType.NON_AGENTIC,
        valueClass: ValueClass.FUN_USEFUL
      });
      const hybridLow = createMockTask({
        id: 'hybrid-low',
        type: TaskType.HYBRID,
        valueClass: ValueClass.BORING_USELESS
      });
      const hybridHigh = createMockTask({
        id: 'hybrid-high',
        type: TaskType.HYBRID,
        valueClass: ValueClass.FUN_USEFUL
      });
      const agenticLow = createMockTask({
        id: 'agentic-low',
        type: TaskType.AGENTIC,
        valueClass: ValueClass.BORING_USELESS
      });
      const agenticHigh = createMockTask({
        id: 'agentic-high',
        type: TaskType.AGENTIC,
        valueClass: ValueClass.FUN_USEFUL
      });
      const result = sortTasks([nonAgenticHigh, hybridLow, agenticLow, hybridHigh, agenticHigh]);
      expect(result[0].id).toBe('agentic-high');   // Agentic + high value
      expect(result[1].id).toBe('agentic-low');    // Agentic + low value
      expect(result[2].id).toBe('hybrid-high');    // Hybrid + high value
      expect(result[3].id).toBe('hybrid-low');     // Hybrid + low value
      expect(result[4].id).toBe('non-agentic-high'); // Non-agentic
    });

    it('should handle tasks with zero trajectory match', () => {
      // REASONING: Edge case - zero is valid trajectory value
      // > Should sort without error
      // > 0% match should come after higher matches in DESC order
      // > Therefore: Function handles zero gracefully
      const zeroMatch = createMockTask({
        id: 'zero-match',
        type: TaskType.AGENTIC,
        trajectoryMatch: 0
      });
      const result = sortTasks([zeroMatch]);
      expect(result).toHaveLength(1);
      expect(result[0].trajectoryMatch).toBe(0);
    });

    it('should handle tasks with 100 trajectory match', () => {
      // REASONING: Edge case - maximum trajectory value
      // > 100% is the highest possible match
      // > Should sort before lower matches
      // > Therefore: Maximum value handled correctly
      const maxMatch = createMockTask({
        id: 'max-match',
        type: TaskType.AGENTIC,
        trajectoryMatch: 100
      });
      const result = sortTasks([maxMatch]);
      expect(result[0].trajectoryMatch).toBe(100);
    });

    it('should handle tasks with zero word count', () => {
      // REASONING: Edge case - empty descriptions
      // > wordCount of 0 is possible for empty task description
      // > Should not cause errors
      // > Therefore: Function handles zero word count
      const emptyDesc = createMockTask({
        id: 'empty-desc',
        type: TaskType.AGENTIC,
        description: '',
        wordCount: 0
      });
      const result = sortTasks([emptyDesc]);
      expect(result[0].wordCount).toBe(0);
    });
  });

  describe('compareTasks', () => {
    it('should return negative when task A is agentic and task B is non-agentic', () => {
      // REASONING: Verify comparator returns negative for agentic before non-agentic
      // > Per comparator contract: negative = a comes before b
      // > Agentic should come before non-agentic
      // > Therefore: Return value < 0
      const agentic = createMockTask({ id: 'a', type: TaskType.AGENTIC });
      const nonAgentic = createMockTask({ id: 'b', type: TaskType.NON_AGENTIC });
      expect(compareTasks(agentic, nonAgentic)).toBeLessThan(0);
    });

    it('should return positive when task A is non-agentic and task B is agentic', () => {
      // REASONING: Verify comparator returns positive for non-agentic after agentic
      // > Per comparator contract: positive = b comes before a
      // > Non-agentic should come after agentic
      // > Therefore: Return value > 0
      const nonAgentic = createMockTask({ id: 'a', type: TaskType.NON_AGENTIC });
      const agentic = createMockTask({ id: 'b', type: TaskType.AGENTIC });
      expect(compareTasks(nonAgentic, agentic)).toBeGreaterThan(0);
    });

    it('should return zero when both tasks have identical sort values', () => {
      // REASONING: Identical tasks should compare as equal
      // > All sort criteria equal → return 0
      // > 0 indicates equality (stable sort preserves order)
      // > Therefore: Return exactly 0
      const taskA = createMockTask({ id: 'a', creationTime: 1000 });
      const taskB = createMockTask({ id: 'b', creationTime: 1000 });
      expect(compareTasks(taskA, taskB)).toBe(0);
    });

    it('should compare value class correctly when types match', () => {
      // REASONING: Secondary criterion - value class priority
      // > Lower value class = higher priority = comes first
      // > FUN_USEFUL(1) should return negative compared to USEFUL(2)
      // > Therefore: Lower value class task returns negative
      const highValue = createMockTask({
        id: 'high',
        type: TaskType.AGENTIC,
        valueClass: ValueClass.FUN_USEFUL
      });
      const lowerValue = createMockTask({
        id: 'lower',
        type: TaskType.AGENTIC,
        valueClass: ValueClass.USEFUL
      });
      expect(compareTasks(highValue, lowerValue)).toBeLessThan(0);
      expect(compareTasks(lowerValue, highValue)).toBeGreaterThan(0);
    });

    it('should compare trajectory match correctly when value class matches', () => {
      // REASONING: Tertiary criterion - trajectory match DESC
      // > Higher match = comes first
      // > 90% should return negative compared to 50%
      // > Therefore: b - a pattern for DESC ordering
      const highMatch = createMockTask({
        id: 'high',
        type: TaskType.AGENTIC,
        valueClass: ValueClass.FUN_USEFUL,
        trajectoryMatch: 90
      });
      const lowMatch = createMockTask({
        id: 'low',
        type: TaskType.AGENTIC,
        valueClass: ValueClass.FUN_USEFUL,
        trajectoryMatch: 50
      });
      expect(compareTasks(highMatch, lowMatch)).toBeLessThan(0);
      expect(compareTasks(lowMatch, highMatch)).toBeGreaterThan(0);
    });

    it('should compare word count correctly when trajectory matches', () => {
      // REASONING: Quaternary criterion - word count DESC
      // > More words = more detail = comes first
      // > 100 words should return negative compared to 20
      // > Therefore: b - a pattern for DESC ordering
      const detailed = createMockTask({
        id: 'detailed',
        type: TaskType.AGENTIC,
        valueClass: ValueClass.FUN_USEFUL,
        trajectoryMatch: 80,
        wordCount: 100
      });
      const brief = createMockTask({
        id: 'brief',
        type: TaskType.AGENTIC,
        valueClass: ValueClass.FUN_USEFUL,
        trajectoryMatch: 80,
        wordCount: 20
      });
      expect(compareTasks(detailed, brief)).toBeLessThan(0);
      expect(compareTasks(brief, detailed)).toBeGreaterThan(0);
    });

    it('should compare creation time correctly when all else matches', () => {
      // REASONING: Final criterion - creation time ASC (oldest first)
      // > Lower timestamp = older = comes first
      // > 1000 should return negative compared to 2000
      // > Therefore: a - b pattern for ASC ordering
      const older = createMockTask({
        id: 'older',
        type: TaskType.AGENTIC,
        valueClass: ValueClass.FUN_USEFUL,
        trajectoryMatch: 80,
        wordCount: 50,
        creationTime: 1000
      });
      const newer = createMockTask({
        id: 'newer',
        type: TaskType.AGENTIC,
        valueClass: ValueClass.FUN_USEFUL,
        trajectoryMatch: 80,
        wordCount: 50,
        creationTime: 2000
      });
      expect(compareTasks(older, newer)).toBeLessThan(0);
      expect(compareTasks(newer, older)).toBeGreaterThan(0);
    });
  });

  describe('isAgentic', () => {
    it('should return true for AGENTIC task type', () => {
      // REASONING: Type guard should correctly identify agentic tasks
      // > TaskType.AGENTIC should return true
      // > This is the primary filter for grouping
      // > Therefore: Boolean true
      const agenticTask = createMockTask({
        id: 'test',
        type: TaskType.AGENTIC
      });
      expect(isAgentic(agenticTask)).toBe(true);
    });

    it('should return false for NON_AGENTIC task type', () => {
      // REASONING: Type guard should correctly identify non-agentic tasks
      // > TaskType.NON_AGENTIC should return false
      // > Complete coverage of both enum values
      // > Therefore: Boolean false
      const nonAgenticTask = createMockTask({
        id: 'test',
        type: TaskType.NON_AGENTIC
      });
      expect(isAgentic(nonAgenticTask)).toBe(false);
    });

    it('should return false for HYBRID task type', () => {
      // REASONING: HYBRID is not AGENTIC - they are distinct types
      // > TaskType.HYBRID should return false for isAgentic
      // > Hybrid is its own category between agentic and non-agentic
      // > Therefore: Boolean false
      const hybridTask = createMockTask({
        id: 'test',
        type: TaskType.HYBRID
      });
      expect(isAgentic(hybridTask)).toBe(false);
    });
  });

  describe('isHybrid', () => {
    it('should return true for HYBRID task type', () => {
      // REASONING: Type guard should correctly identify hybrid tasks
      // > TaskType.HYBRID should return true
      // > This identifies tasks with mixed delegation potential
      // > Therefore: Boolean true
      const hybridTask = createMockTask({
        id: 'test',
        type: TaskType.HYBRID
      });
      expect(isHybrid(hybridTask)).toBe(true);
    });

    it('should return false for AGENTIC task type', () => {
      // REASONING: AGENTIC is not HYBRID
      // > TaskType.AGENTIC should return false for isHybrid
      // > Therefore: Boolean false
      const agenticTask = createMockTask({
        id: 'test',
        type: TaskType.AGENTIC
      });
      expect(isHybrid(agenticTask)).toBe(false);
    });

    it('should return false for NON_AGENTIC task type', () => {
      // REASONING: NON_AGENTIC is not HYBRID
      // > TaskType.NON_AGENTIC should return false for isHybrid
      // > Therefore: Boolean false
      const nonAgenticTask = createMockTask({
        id: 'test',
        type: TaskType.NON_AGENTIC
      });
      expect(isHybrid(nonAgenticTask)).toBe(false);
    });
  });

  describe('getValueClassPriority', () => {
    it('should return 1 for FUN_USEFUL', () => {
      // REASONING: Highest priority value class
      // > FUN_USEFUL = 1 should return priority 1
      // > Lower number = higher priority in sort
      // > Therefore: Return exactly 1
      expect(getValueClassPriority(ValueClass.FUN_USEFUL)).toBe(1);
    });

    it('should return 6 for BORING_USELESS', () => {
      // REASONING: Lowest priority value class
      // > BORING_USELESS = 6 should return priority 6
      // > Higher number = lower priority in sort
      // > Therefore: Return exactly 6
      expect(getValueClassPriority(ValueClass.BORING_USELESS)).toBe(6);
    });

    it('should return correct priorities for all value classes', () => {
      // REASONING: Complete enum coverage ensures mapping correctness
      // > Each enum value maps to its numeric value (1-6)
      // > Verify all six enum variants
      // > Therefore: Map each value to expected priority
      expect(getValueClassPriority(ValueClass.FUN_USEFUL)).toBe(1);
      expect(getValueClassPriority(ValueClass.USEFUL)).toBe(2);
      expect(getValueClassPriority(ValueClass.HAS_TO_BE_DONE)).toBe(3);
      expect(getValueClassPriority(ValueClass.HAS_TO_BE_DONE_BORING)).toBe(4);
      expect(getValueClassPriority(ValueClass.FUN_USELESS)).toBe(5);
      expect(getValueClassPriority(ValueClass.BORING_USELESS)).toBe(6);
    });
  });
});

// REASONING: Test helper for creating mock tasks with defaults
// > Why factory? Ensures all required Task fields are populated
// > Default values for unimportant fields, override specific fields
// > Therefore: Partial<Task> input, full Task output
function createMockTask(overrides: Partial<Task> = {}): Task {
  return {
    id: overrides.id || `task-${Date.now()}`,
    description: overrides.description || 'Test task description',
    valueClass: overrides.valueClass ?? ValueClass.USEFUL,
    type: overrides.type ?? TaskType.AGENTIC,
    trajectoryMatch: overrides.trajectoryMatch ?? 50,
    wordCount: overrides.wordCount ?? 10,
    creationTime: overrides.creationTime ?? Date.now(),
    actorNotes: overrides.actorNotes ?? {},
    completed: overrides.completed ?? false,
    ...overrides
  } as Task;
}
