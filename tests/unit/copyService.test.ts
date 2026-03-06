/**
 * File Purpose: Test copy formatting for AI agent consumption
 * Critical Paths:
 *   - Format task data into agent-readable structure
 *   - Include all relevant task metadata
 *   - Handle missing optional fields gracefully
 * Edge Cases:
 *   - Empty task description
 *   - Long descriptions
 *   - Special characters in text
 *   - Missing actor notes
 *   - Completed vs pending tasks
 */

import { describe, it, expect } from 'vitest';
import {
  formatTaskForCopy,
  formatTaskListForAgent,
  createAgentPrompt,
  formatDescriptionSection,
  formatClassificationSection,
  formatActorNotesSection,
  formatTrajectorySection,
  formatMetadataSection,
  copyToClipboard,
  formatTaskForPreview
} from '../../src/services/copyService';
import type { Task } from '../../src/types/task';
import type { Trajectory } from '../../src/types/trajectory';
import { ValueClass, TaskType } from '../../src/types/task';

describe('CopyService', () => {
  describe('formatTaskForCopy', () => {
    it('should include task description in output', () => {
      // REASONING: Primary content must be preserved
      // > Task description is the core of the task
      // > Should appear as H1 header section
      // > Therefore: Description present in formatted output
      const task = createMockTask({ description: 'Build authentication system' });
      const trajectory = createMockTrajectory();
      const result = formatTaskForCopy(task, trajectory);
      expect(result).toContain('Build authentication system');
      expect(result).toContain('# Task');
    });

    it('should include value class label', () => {
      // REASONING: Value classification communicated to agent
      // > Value class affects task priority
      // > Mapped to human-readable name
      // > Therefore: Label appears in Classification section
      const task = createMockTask({
        description: 'Test task',
        valueClass: ValueClass.FUN_USEFUL
      });
      const trajectory = createMockTrajectory();
      const result = formatTaskForCopy(task, trajectory);
      expect(result).toContain('Classification');
      expect(result).toContain('Fun and Useful');
    });

    it('should indicate if task is agentic', () => {
      // REASONING: Task type affects agent routing
      // > AGENTIC = "can delegate to AI"
      // > NON_AGENTIC = "requires human"
      // > Therefore: Type label appears in output
      const agenticTask = createMockTask({ type: TaskType.AGENTIC });
      const result = formatTaskForCopy(agenticTask, createMockTrajectory());
      expect(result).toContain('Agentic');
      expect(result).toContain('can delegate to AI');
    });

    it('should include trajectory match percentage', () => {
      // REASONING: Trajectory alignment is important context
      // > 0-100% match with current trajectory
      // > Displayed with % symbol
      // > Therefore: "80%" appears in Classification
      const task = createMockTask({ trajectoryMatch: 80 });
      const result = formatTaskForCopy(task, createMockTrajectory());
      expect(result).toContain('80%');
      expect(result).toContain('Trajectory Match');
    });

    it('should include word count', () => {
      // REASONING: Word count signals task complexity
      // > Used in sorting algorithm
      // > Helps agent estimate scope
      // > Therefore: Appears in Metadata section
      const task = createMockTask({ wordCount: 150 });
      const result = formatTaskForCopy(task, createMockTrajectory());
      expect(result).toContain('Word Count: 150');
    });

    it('should include actor comparison notes', () => {
      // REASONING: Actor context is valuable for agent
      // > Notes per actor about their progress
      // > Only non-empty notes included
      // > Therefore: Actor notes appear in Actor Context section
      const task = createMockTask({
        actorNotes: {
          'actor-1': 'Competitor launched similar feature',
          'actor-2': 'Industry leader still planning'
        }
      });
      const result = formatTaskForCopy(task, createMockTrajectory());
      expect(result).toContain('Actor Context');
      expect(result).toContain('Competitor launched');
      expect(result).toContain('Industry leader');
    });

    it('should format empty description gracefully', () => {
      // REASONING: Empty description should not cause errors
      // > Empty string is valid input
      // > Should show placeholder or empty header
      // > Therefore: No crash, some output
      const task = createMockTask({ description: '' });
      const result = formatTaskForCopy(task, createMockTrajectory());
      expect(result).toContain('# Task');
      // Should not throw
      expect(typeof result).toBe('string');
    });

    it('should format long descriptions without truncation', () => {
      // REASONING: Complete content must be preserved
      // > No artificial length limits
      // > Full task description included
      // > Therefore: Entire description appears
      const longDesc = 'A'.repeat(5000);
      const task = createMockTask({ description: longDesc });
      const result = formatTaskForCopy(task, createMockTrajectory());
      expect(result).toContain(longDesc);
    });

    it('should handle special characters in description', () => {
      // REASONING: Special chars should not break formatting
      // > Markdown characters, newlines, etc.
      // > Preserved as-is for agent
      // > Therefore: Characters appear correctly
      const desc = 'Task with <script>alert("XSS")</script> and **markdown**';
      const task = createMockTask({ description: desc });
      const result = formatTaskForCopy(task, createMockTrajectory());
      expect(result).toContain('<script>');
      expect(result).toContain('**markdown**');
    });

    it('should handle multiline descriptions', () => {
      // REASONING: Multiline descriptions preserve structure
      // > Newlines are meaningful
      // > Agent can read as formatted
      // > Therefore: Newlines preserved in output
      const desc = 'Line 1\nLine 2\nLine 3';
      const task = createMockTask({ description: desc });
      const result = formatTaskForCopy(task, createMockTrajectory());
      expect(result).toContain('Line 1');
      expect(result).toContain('Line 2');
      expect(result).toContain('Line 3');
    });

    it('should include creation timestamp', () => {
      // REASONING: Temporal context for agent
      // > ISO format date in Metadata
      // > Task age may affect priority
      // > Therefore: Timestamp appears
      const creationTime = new Date('2024-01-15T10:30:00Z').getTime();
      const task = createMockTask({ creationTime });
      const result = formatTaskForCopy(task, createMockTrajectory());
      expect(result).toContain('2024-01-15');
      expect(result).toContain('Created:');
    });

    it('should include completion status', () => {
      // REASONING: Agent knows if task is done
      // > Completed vs pending
      // > Appears in metadata
      // > Therefore: Status shown
      const completedTask = createMockTask({ completed: true });
      const result = formatTaskForCopy(completedTask, createMockTrajectory());
      expect(result).toContain('Completed');
    });
  });

  describe('formatTaskListForAgent', () => {
    it('should format multiple tasks with separators', () => {
      // REASONING: Multiple tasks need clear separation
      // > Each task formatted individually
      // > Combined with separators
      // > Therefore: Each task appears in output
      const tasks = [
        createMockTask({ id: 'task-1', description: 'First task' }),
        createMockTask({ id: 'task-2', description: 'Second task' })
      ];
      const result = formatTaskListForAgent(tasks, createMockTrajectory());
      expect(result).toContain('First task');
      expect(result).toContain('Second task');
    });

    it('should handle empty task list', () => {
      // REASONING: Empty list should not error
      // > Returns minimal output
      // > No tasks section
      // > Therefore: Valid output for empty input
      const result = formatTaskListForAgent([], createMockTrajectory());
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should include task count in header', () => {
      // REASONING: Summary helps agent understand scope
      // > "N tasks" header
      // > Sets context for agent
      // > Therefore: Count appears in header
      const tasks = [createMockTask(), createMockTask()];
      const result = formatTaskListForAgent(tasks, createMockTrajectory());
      expect(result).toContain('2');
      expect(result).toContain('task');
    });

    it('should maintain task order from input', () => {
      // REASONING: Order is significant
      // > Preserves sorted order
      // > Agent receives tasks in priority order
      // > Therefore: First in array appears first in output
      const tasks = [
        createMockTask({ id: 'first', description: 'Priority 1' }),
        createMockTask({ id: 'second', description: 'Priority 2' })
      ];
      const result = formatTaskListForAgent(tasks, createMockTrajectory());
      const firstIndex = result.indexOf('Priority 1');
      const secondIndex = result.indexOf('Priority 2');
      expect(firstIndex).toBeLessThan(secondIndex);
    });

    it('should add section headers between agentic and non-agentic', () => {
      // REASONING: Clear separation helps agent understand
      // > Agentic tasks grouped first
      // > Section headers for clarity
      // > Therefore: Sections labeled
      const tasks = [
        createMockTask({ id: '1', type: TaskType.NON_AGENTIC }),
        createMockTask({ id: '2', type: TaskType.AGENTIC })
      ];
      const result = formatTaskListForAgent(tasks, createMockTrajectory());
      expect(result).toContain('Agentic');
    });

    it('should handle single task list', () => {
      // REASONING: Single task is valid input
      // > Formatted same as multi
      // > No special handling needed
      // > Therefore: Single task appears
      const tasks = [createMockTask({ description: 'Solo task' })];
      const result = formatTaskListForAgent(tasks, createMockTrajectory());
      expect(result).toContain('Solo task');
    });

    it('should include trajectory context', () => {
      // REASONING: Global trajectory for agent context
      // > Current north star shown
      // > Helps agent understand priorities
      // > Therefore: Trajectory text appears
      const tasks = [createMockTask()];
      const trajectory = createMockTrajectory('Build great product > Ship fast');
      const result = formatTaskListForAgent(tasks, trajectory);
      expect(result).toContain('Current Trajectory');
      expect(result).toContain('Build great product');
    });
  });

  describe('createAgentPrompt', () => {
    it('should create a prompt suitable for AI consumption', () => {
      // REASONING: Prompt must be agent-friendly
      // > Clear structure
      // > Instructions included
      // > Therefore: Valid prompt string
      const tasks = [createMockTask()];
      const result = createAgentPrompt(tasks, createMockTrajectory());
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(50);
    });

    it('should include task context', () => {
      // REASONING: Task data embedded in prompt
      // > Task descriptions included
      // > Metadata for context
      // > Therefore: Task appears in prompt
      const tasks = [createMockTask({ description: 'Specific task here' })];
      const result = createAgentPrompt(tasks, createMockTrajectory());
      expect(result).toContain('Specific task here');
    });

    it('should include instructions for agent', () => {
      // REASONING: Agent needs guidance on what to do
      // > Actionable instructions
      // > Expected output format
      // > Therefore: Instructions present
      const tasks = [createMockTask()];
      const result = createAgentPrompt(tasks, createMockTrajectory());
      // Should contain instruction-like content
      expect(result.toLowerCase()).toMatch(/task|complete|work|review/);
    });

    it('should handle task with all metadata', () => {
      // REASONING: Complete task with all fields
      // > All metadata included
      // > Rich context for agent
      // > Therefore: Full representation
      const task = createMockTask({
        description: 'Full task',
        valueClass: ValueClass.FUN_USEFUL,
        trajectoryMatch: 95,
        actorNotes: { 'actor-1': 'Note here' }
      });
      const result = createAgentPrompt([task], createMockTrajectory());
      expect(result).toContain('Full task');
      expect(result).toContain('95%');
    });

    it('should handle minimal task data', () => {
      // REASONING: Sparse data should not break formatting
      // > Only description required
      // > Defaults for missing fields
      // > Therefore: Valid output
      const minimalTask: Task = {
        id: 'minimal',
        description: 'Minimal',
        valueClass: ValueClass.USEFUL,
        type: TaskType.AGENTIC,
        trajectoryMatch: 50,
        wordCount: 1,
        creationTime: Date.now(),
        actorNotes: {},
        completed: false
      };
      const result = createAgentPrompt([minimalTask], createMockTrajectory());
      expect(result).toContain('Minimal');
    });
  });

  describe('ValueClass label mapping', () => {
    it('should map FUN_USEFUL to readable label', () => {
      // REASONING: Highest priority value class
      // > Maps to "Fun and Useful"
      // > User-friendly name
      // > Therefore: Correct label
      const task = createMockTask({ valueClass: ValueClass.FUN_USEFUL });
      const result = formatTaskForCopy(task, createMockTrajectory());
      expect(result).toContain('Fun and Useful');
    });

    it('should map all value classes to readable labels', () => {
      // REASONING: Complete enum coverage
      // > All 6 value classes mapped
      // > Consistent naming
      // > Therefore: All labels present
      const valueClasses = [
        { value: ValueClass.FUN_USEFUL, expected: 'Fun and Useful' },
        { value: ValueClass.USEFUL, expected: 'Useful' },
        { value: ValueClass.HAS_TO_BE_DONE, expected: 'Has to be Done' },
        { value: ValueClass.HAS_TO_BE_DONE_BORING, expected: 'Has to be Done and Boring' },
        { value: ValueClass.FUN_USELESS, expected: 'Fun and Useless' },
        { value: ValueClass.BORING_USELESS, expected: 'Boring and Useless' }
      ];

      valueClasses.forEach(({ value, expected }) => {
        const task = createMockTask({ valueClass: value });
        const result = formatTaskForCopy(task, createMockTrajectory());
        expect(result).toContain(expected);
      });
    });

    it('should handle unknown value class gracefully', () => {
      // REASONING: Defensive programming for invalid data
      // > Unknown value shows "Unknown"
      // > No errors thrown
      // > Therefore: "Unknown" label
      const task = createMockTask({ valueClass: 999 as ValueClass });
      const result = formatTaskForCopy(task, createMockTrajectory());
      expect(result).toContain('Unknown');
    });
  });
});

// REASONING: Test helper for creating mock Task
// > Fills required fields with defaults
// > Override specific values for test cases
// > Therefore: Partial input, complete Task output
function createMockTask(overrides: Partial<Task> = {}): Task {
  return {
    id: overrides.id || `task-${Date.now()}`,
    description: overrides.description || 'Test task',
    valueClass: overrides.valueClass ?? ValueClass.USEFUL,
    type: overrides.type ?? TaskType.AGENTIC,
    trajectoryMatch: overrides.trajectoryMatch ?? 50,
    wordCount: overrides.wordCount ?? 5,
    creationTime: overrides.creationTime ?? Date.now(),
    actorNotes: overrides.actorNotes ?? {},
    completed: overrides.completed ?? false,
    ...overrides
  } as Task;
}

// REASONING: Test helper for creating mock Trajectory
// > Simple factory with default text
// > Override for specific test needs
// > Therefore: Optional text parameter
function createMockTrajectory(text: string = 'Test trajectory'): Trajectory {
  return {
    text,
    lastUpdated: Date.now()
  };
}

    it('should include value class label', () => {
      // Test intent: Verify value classification is communicated
    });

    it('should indicate if task is agentic', () => {
      // Test intent: Verify task type context for agent routing
    });

    it('should include trajectory match percentage', () => {
      // Test intent: Verify trajectory alignment is communicated
    });

    it('should include word count', () => {
      // Test intent: Verify size context for estimation
    });

    it('should include actor comparison notes', () => {
      // Test intent: Verify stakeholder context is preserved
    });

    it('should format empty description gracefully', () => {
      // Test intent: Verify no errors with minimal content
    });

    it('should format long descriptions without truncation', () => {
      // Test intent: Verify complete content preservation
    });

    it('should handle special characters in description', () => {
      // Test intent: Verify encoding/reserved character handling
    });

    it('should handle multiline descriptions', () => {
      // Test intent: Verify formatting preserves structure
    });

    it('should include creation timestamp', () => {
      // Test intent: Verify temporal context
    });

    it('should mark completed tasks appropriately', () => {
      // Test intent: Verify completion status is visible
    });
  });

  describe('formatTaskListForAgent', () => {
    it('should format multiple tasks with separators', () => {
      // Test intent: Verify batch task formatting
    });

    it('should handle empty task list', () => {
      // Test intent: Verify graceful empty input handling
    });

    it('should include task count in header', () => {
      // Test intent: Verify summary information
    });

    it('should maintain task order from input', () => {
      // Test intent: Verify sort order is preserved
    });

    it('should add section headers between agentic and non-agentic', () => {
      // Test intent: Verify clear task type separation
    });

    it('should handle single task list', () => {
      // Test intent: Verify single element formatting
    });

    it('should include trajectory context', () => {
      // Test intent: Verify global trajectory is communicated
    });
  });

  describe('createAgentPrompt', () => {
    it('should create a prompt suitable for AI consumption', () => {
      // Test intent: Verify prompt structure is agent-friendly
    });

    it('should include task context', () => {
      // Test intent: Verify task data is embedded in prompt
    });

    it('should include instructions for agent', () => {
      // Test intent: Verify actionable guidance is provided
    });

    it('should handle task with all metadata', () => {
      // Test intent: Verify complete task representation
    });

    it('should handle minimal task data', () => {
      // Test intent: Verify graceful handling of sparse data
    });
  });

  describe('ValueClass label mapping', () => {
    it('should map FUN_USEFUL to readable label', () => {
      // Test intent: Verify user-friendly value class names
    });

    it('should map all value classes to readable labels', () => {
      // Test intent: Verify complete enum coverage
    });

    it('should handle unknown value class gracefully', () => {
      // Test intent: Verify defensive programming
    });
  });
});
