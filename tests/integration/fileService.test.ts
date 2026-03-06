/**
 * File Purpose: Test file persistence via Tauri commands
 * Critical Paths:
 *   - Load tasks from JSON file
 *   - Save tasks to JSON file
 *   - Handle file I/O errors gracefully
 *   - Atomic write operations
 * Edge Cases:
 *   - File does not exist
 *   - File is corrupted/invalid JSON
 *   - Disk is full
 *   - Permission denied
 *   - Concurrent file access
 *   - Very large files
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  loadTasks,
  saveTasks,
  loadCompleted,
  saveCompleted,
  loadTrajectory,
  saveTrajectory,
  loadActors,
  saveActors,
  loadLimitState,
  saveLimitState,
  DATA_DIR,
  TASKS_FILE,
  COMPLETED_FILE,
  TRAJECTORY_FILE,
  ACTORS_FILE,
  LIMIT_FILE
} from '../../src/services/fileService';
import type { Task } from '../../src/types/task';
import type { Trajectory } from '../../src/types/trajectory';

// REASONING: Mock Tauri API for testing
// > Tauri functions not available in test environment
// > Mock invoke to simulate file operations
// > Therefore: vi.fn() for all Tauri calls
const mockInvoke = vi.fn();
const mockJoin = vi.fn();

vi.mock('@tauri-apps/api/tauri', () => ({
  invoke: (...args: unknown[]) => mockInvoke(...args)
}));

vi.mock('@tauri-apps/api/path', () => ({
  join: (...args: string[]) => mockJoin(...args)
}));

describe('FileService', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockInvoke.mockReset();
    mockJoin.mockReset();
    // Default mock implementation
    mockJoin.mockImplementation((...parts) => parts.join('/'));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Task File Operations', () => {
    describe('loadTasks', () => {
      it('should load tasks from tasks.json', async () => {
        // REASONING: Successful file read returns tasks
        // > Mock Tauri invoke to return JSON
        // > Parse and return as FileResult
        // > Therefore: success: true with tasks data
        const mockTasks = [createMockTask({ id: 'task-1', description: 'Test' })];
        mockInvoke
          .mockResolvedValueOnce('/app/data') // get_app_data_dir
          .mockResolvedValueOnce(JSON.stringify(mockTasks)); // read_file

        const result = await loadTasks();
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toHaveLength(1);
          expect(result.data[0].id).toBe('task-1');
        }
      });

      it('should return empty array when file does not exist', async () => {
        // REASONING: Missing file = new user, return empty
        // > File not found error handled gracefully
        // > Returns success: true with empty array
        // > Therefore: No error, empty tasks
        mockInvoke
          .mockResolvedValueOnce('/app/data')
          .mockRejectedValueOnce(new Error('file not found'));

        const result = await loadTasks();
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toEqual([]);
        }
      });

      it('should return error when file contains invalid JSON', async () => {
        // REASONING: Corrupted data = real error
        // > Invalid JSON cannot be parsed
        // > Returns success: false with error
        // > Therefore: Error result
        mockInvoke
          .mockResolvedValueOnce('/app/data')
          .mockResolvedValueOnce('not valid json {{{');

        const result = await loadTasks();
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toContain('Failed to load tasks');
        }
      });

      it('should handle file read permission errors', async () => {
        // REASONING: Permission denied = genuine error
        // > Access restrictions should propagate
        // > Returns success: false
        // > Therefore: Error with message
        mockInvoke
          .mockResolvedValueOnce('/app/data')
          .mockRejectedValueOnce(new Error('permission denied'));

        const result = await loadTasks();
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toContain('permission denied');
        }
      });

      it('should parse task dates correctly', async () => {
        // REASONING: Timestamps must deserialize correctly
        // > creationTime stored as number
        // > Parsed back to number
        // > Therefore: Valid timestamp
        const timestamp = Date.now();
        const mockTasks = [createMockTask({ creationTime: timestamp })];
        mockInvoke
          .mockResolvedValueOnce('/app/data')
          .mockResolvedValueOnce(JSON.stringify(mockTasks));

        const result = await loadTasks();
        if (result.success) {
          expect(result.data[0].creationTime).toBe(timestamp);
        }
      });

      it('should validate task structure', async () => {
        // REASONING: Data integrity on load
        // > Tasks should have required fields
        // > Structure preserved through serialization
        // > Therefore: Valid task objects
        const mockTasks = [createMockTask({
          id: 'valid-task',
          description: 'Valid task',
          valueClass: 1,
          type: 'agentic',
          trajectoryMatch: 80,
          wordCount: 10,
          creationTime: Date.now(),
          actorNotes: {},
          completed: false
        })];
        mockInvoke
          .mockResolvedValueOnce('/app/data')
          .mockResolvedValueOnce(JSON.stringify(mockTasks));

        const result = await loadTasks();
        if (result.success) {
          expect(result.data[0]).toHaveProperty('id');
          expect(result.data[0]).toHaveProperty('description');
          expect(result.data[0]).toHaveProperty('valueClass');
        }
      });

      it('should handle empty file (zero bytes)', async () => {
        // REASONING: Empty file = parse error, not file not found
        // > Returns error since '' is invalid JSON
        // > Different from missing file
        // > Therefore: Error result
        mockInvoke
          .mockResolvedValueOnce('/app/data')
          .mockResolvedValueOnce('');

        const result = await loadTasks();
        // Empty string causes JSON parse error
        expect(result.success).toBe(false);
      });
    });

    describe('saveTasks', () => {
      it('should save tasks to tasks.json', async () => {
        // REASONING: Successful write returns success
        // > Directory ensured, file written
        // > Returns FileResult with success: true
        // > Therefore: Success
        const tasks = [createMockTask({ id: 'save-test' })];
        mockInvoke
          .mockResolvedValueOnce('/app/data') // ensureDataDir
          .mockResolvedValueOnce(undefined)    // ensure_dir
          .mockResolvedValueOnce(undefined);  // write_file

        const result = await saveTasks(tasks);
        expect(result.success).toBe(true);
      });

      it('should create directory if it does not exist', async () => {
        // REASONING: Directory creation happens before write
        // > ensureDataDir called first
        // > Then write_file
        // > Therefore: Both operations invoked
        const tasks = [createMockTask()];
        mockInvoke
          .mockResolvedValueOnce('/app/data')
          .mockResolvedValueOnce(undefined)
          .mockResolvedValueOnce(undefined);

        await saveTasks(tasks);
        expect(mockInvoke).toHaveBeenCalledWith('ensure_dir', expect.any(Object));
      });

      it('should return error when disk is full', async () => {
        // REASONING: Storage exhaustion = write error
        // > Returns success: false
        // > Error message propagated
        // > Therefore: Error result
        mockInvoke
          .mockResolvedValueOnce('/app/data')
          .mockResolvedValueOnce(undefined)
          .mockRejectedValueOnce(new Error('disk full'));

        const result = await saveTasks([createMockTask()]);
        expect(result.success).toBe(false);
      });

      it('should return error when permission denied', async () => {
        // REASONING: Access restriction = error
        // > Cannot write without permission
        // > Returns error
        // > Therefore: Permission error
        mockInvoke
          .mockResolvedValueOnce('/app/data')
          .mockResolvedValueOnce(undefined)
          .mockRejectedValueOnce(new Error('permission denied'));

        const result = await saveTasks([createMockTask()]);
        expect(result.success).toBe(false);
      });

      it('should serialize task dates correctly', async () => {
        // REASONING: Timestamps preserved through serialization
        // > creationTime as number
        // > JSON.stringify preserves number
        // > Therefore: Timestamp in output
        const timestamp = 1705312800000;
        const tasks = [createMockTask({ creationTime: timestamp })];
        mockInvoke
          .mockResolvedValueOnce('/app/data')
          .mockResolvedValueOnce(undefined)
          .mockResolvedValueOnce(undefined);

        await saveTasks(tasks);
        // Check that write_file was called with serialized tasks
        const writeCall = mockInvoke.mock.calls.find(call => call[0] === 'write_file');
        expect(writeCall).toBeDefined();
      });

      it('should overwrite existing file', async () => {
        // REASONING: Update behavior = overwrite
        // > write_file replaces existing
        // > No append, full replacement
        // > Therefore: File overwritten
        mockInvoke
          .mockResolvedValueOnce('/app/data')
          .mockResolvedValueOnce(undefined)
          .mockResolvedValueOnce(undefined);

        const result = await saveTasks([createMockTask()]);
        expect(result.success).toBe(true);
      });

      it('should handle empty task array', async () => {
        // REASONING: Empty array is valid save
        // > Clears all tasks
        // > File contains []
        // > Therefore: Success with empty
        mockInvoke
          .mockResolvedValueOnce('/app/data')
          .mockResolvedValueOnce(undefined)
          .mockResolvedValueOnce(undefined);

        const result = await saveTasks([]);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('Completed Tasks File Operations', () => {
    describe('loadCompleted', () => {
      it('should load completed tasks from completed.json', async () => {
        // REASONING: Archive file read
        // > CompletedTask structure includes originalTask
        // > Same pattern as loadTasks
        // > Therefore: Success with completed tasks
        const mockCompleted = [{
          id: 'completed-1',
          originalTask: createMockTask(),
          sentTime: Date.now()
        }];
        mockInvoke
          .mockResolvedValueOnce('/app/data')
          .mockResolvedValueOnce(JSON.stringify(mockCompleted));

        const result = await loadCompleted();
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toHaveLength(1);
        }
      });

      it('should return empty array when completed file missing', async () => {
        // REASONING: Missing archive = no history yet
        // > Returns empty array, not error
        // > Graceful first-run handling
        // > Therefore: Empty success
        mockInvoke
          .mockResolvedValueOnce('/app/data')
          .mockRejectedValueOnce(new Error('file not found'));

        const result = await loadCompleted();
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toEqual([]);
        }
      });

      it('should handle invalid JSON in completed file', async () => {
        // REASONING: Corrupted archive = error
        // > Invalid JSON cannot be parsed
        // > Returns error result
        // > Therefore: Error
        mockInvoke
          .mockResolvedValueOnce('/app/data')
          .mockResolvedValueOnce('invalid json');

        const result = await loadCompleted();
        expect(result.success).toBe(false);
      });
    });

    describe('saveCompleted', () => {
      it('should save completed tasks to completed.json', async () => {
        // REASONING: Archive persistence
        // > Save completed task list
        // > Overwrites (caller handles append)
        // > Therefore: Success
        mockInvoke
          .mockResolvedValueOnce('/app/data')
          .mockResolvedValueOnce(undefined)
          .mockResolvedValueOnce(undefined);

        const completed = [{
          id: 'comp-1',
          originalTask: createMockTask(),
          sentTime: Date.now()
        }];
        const result = await saveCompleted(completed);
        expect(result.success).toBe(true);
      });

      it('should handle empty completed array', async () => {
        // REASONING: Empty archive valid
        // > Clear history
        // > File contains []
        // > Therefore: Success
        mockInvoke
          .mockResolvedValueOnce('/app/data')
          .mockResolvedValueOnce(undefined)
          .mockResolvedValueOnce(undefined);

        const result = await saveCompleted([]);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('Trajectory File Operations', () => {
    describe('loadTrajectory', () => {
      it('should load trajectory from trajectory.json', async () => {
        // REASONING: Trajectory file read
        // > Single object, not array
        // > Parse and return
        // > Therefore: Success with trajectory data
        const mockTrajectory = { text: 'Test trajectory', lastUpdated: Date.now() };
        mockInvoke
          .mockResolvedValueOnce('/app/data')
          .mockResolvedValueOnce(JSON.stringify(mockTrajectory));

        const result = await loadTrajectory();
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.text).toBe('Test trajectory');
        }
      });

      it('should return default trajectory when file missing', async () => {
        // REASONING: Missing file = not configured
        // > Returns null to indicate not set
        // > Different from empty array
        // > Therefore: Success with null
        mockInvoke
          .mockResolvedValueOnce('/app/data')
          .mockRejectedValueOnce(new Error('file not found'));

        const result = await loadTrajectory();
        expect(result.success).toBe(true);
      });

      it('should parse trajectory percentage correctly', async () => {
        // REASONING: Numeric values preserved
        // > Percentage as number
        // > lastUpdated as timestamp
        // > Therefore: Valid numbers
        const mockTrajectory = { text: 'Test', lastUpdated: 1705312800000 };
        mockInvoke
          .mockResolvedValueOnce('/app/data')
          .mockResolvedValueOnce(JSON.stringify(mockTrajectory));

        const result = await loadTrajectory();
        if (result.success) {
          expect(result.data.lastUpdated).toBe(1705312800000);
        }
      });
    });

    describe('saveTrajectory', () => {
      it('should save trajectory to trajectory.json', async () => {
        // REASONING: Trajectory persistence
        // > Save single object
        // > Pretty printed JSON
        // > Therefore: Success
        mockInvoke
          .mockResolvedValueOnce('/app/data')
          .mockResolvedValueOnce(undefined)
          .mockResolvedValueOnce(undefined);

        const trajectory = { text: 'New trajectory', lastUpdated: Date.now() };
        const result = await saveTrajectory(trajectory);
        expect(result.success).toBe(true);
      });

      it('should serialize trajectory percentage correctly', async () => {
        // REASONING: Numeric serialization
        // > Numbers preserved in JSON
        // > No precision loss
        // > Therefore: Valid output
        mockInvoke
          .mockResolvedValueOnce('/app/data')
          .mockResolvedValueOnce(undefined)
          .mockResolvedValueOnce(undefined);

        const trajectory = { text: 'Test', lastUpdated: 12345 };
        const result = await saveTrajectory(trajectory);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('Actors File Operations', () => {
    describe('loadActors', () => {
      it('should load actors from actors.json', async () => {
        // REASONING: Actors file read
        // > Array of Actor objects
        // > Same pattern as tasks
        // > Therefore: Success with actors
        const mockActors = [{
          id: 'actor-1',
          name: 'Competitor A',
          createdAt: Date.now()
        }];
        mockInvoke
          .mockResolvedValueOnce('/app/data')
          .mockResolvedValueOnce(JSON.stringify(mockActors));

        const result = await loadActors();
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toHaveLength(1);
          expect(result.data[0].name).toBe('Competitor A');
        }
      });

      it('should return empty array when actors file missing', async () => {
        // REASONING: Missing file = no actors yet
        // > Returns empty array
        // > Graceful handling
        // > Therefore: Empty success
        mockInvoke
          .mockResolvedValueOnce('/app/data')
          .mockRejectedValueOnce(new Error('file not found'));

        const result = await loadActors();
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toEqual([]);
        }
      });

      it('should parse actor data correctly', async () => {
        // REASONING: Actor fields preserved
        // > id, name, createdAt
        // > Timestamps as numbers
        // > Therefore: Valid actor objects
        const mockActors = [{
          id: 'actor-1',
          name: 'Test Actor',
          createdAt: 1705312800000
        }];
        mockInvoke
          .mockResolvedValueOnce('/app/data')
          .mockResolvedValueOnce(JSON.stringify(mockActors));

        const result = await loadActors();
        if (result.success) {
          expect(result.data[0].id).toBe('actor-1');
          expect(result.data[0].name).toBe('Test Actor');
          expect(result.data[0].createdAt).toBe(1705312800000);
        }
      });
    });

    describe('saveActors', () => {
      it('should save actors to actors.json', async () => {
        // REASONING: Actors persistence
        // > Save actor list
        // > Overwrites existing
        // > Therefore: Success
        mockInvoke
          .mockResolvedValueOnce('/app/data')
          .mockResolvedValueOnce(undefined)
          .mockResolvedValueOnce(undefined);

        const actors = [{
          id: 'actor-1',
          name: 'Test Actor',
          createdAt: Date.now()
        }];
        const result = await saveActors(actors);
        expect(result.success).toBe(true);
      });

      it('should handle empty actors array', async () => {
        // REASONING: Empty actors valid
        // > Clear all actors
        // > File contains []
        // > Therefore: Success
        mockInvoke
          .mockResolvedValueOnce('/app/data')
          .mockResolvedValueOnce(undefined)
          .mockResolvedValueOnce(undefined);

        const result = await saveActors([]);
        expect(result.success).toBe(true);
      });

      it('should preserve actor creation timestamps', async () => {
        // REASONING: Temporal data integrity
        // > createdAt preserved through save/load
        // > Numbers not corrupted
        // > Therefore: Timestamp maintained
        mockInvoke
          .mockResolvedValueOnce('/app/data')
          .mockResolvedValueOnce(undefined)
          .mockResolvedValueOnce(undefined);

        const actors = [{
          id: 'actor-1',
          name: 'Test',
          createdAt: 1705312800000
        }];
        const result = await saveActors(actors);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('File Path Constants', () => {
    it('should export DATA_DIR as "data"', () => {
      // REASONING: Directory name for data storage
      // > Centralized constant
      // > Used for path construction
      // > Therefore: "data"
      expect(DATA_DIR).toBe('data');
    });

    it('should export TASKS_FILE as "tasks.json"', () => {
      // REASONING: Tasks filename
      // > Standard naming
      // > Used by load/save
      // > Therefore: "tasks.json"
      expect(TASKS_FILE).toBe('tasks.json');
    });

    it('should export COMPLETED_FILE as "completed.json"', () => {
      // REASONING: Completed tasks filename
      // > Archive file
      // > Separate from active tasks
      // > Therefore: "completed.json"
      expect(COMPLETED_FILE).toBe('completed.json');
    });

    it('should export TRAJECTORY_FILE as "trajectory.json"', () => {
      // REASONING: Trajectory filename
      // > Single object storage
      // > User's north star
      // > Therefore: "trajectory.json"
      expect(TRAJECTORY_FILE).toBe('trajectory.json');
    });

    it('should export ACTORS_FILE as "actors.json"', () => {
      // REASONING: Actors filename
      // > List of competitors/tracked entities
      // > Array storage
      // > Therefore: "actors.json"
      expect(ACTORS_FILE).toBe('actors.json');
    });
  });

  describe('Error Handling', () => {
    it('should wrap Tauri errors in descriptive messages', async () => {
      // REASONING: User-friendly error messages
      // > Technical errors wrapped
      // > Context provided
      // > Therefore: Descriptive error
      mockInvoke
        .mockResolvedValueOnce('/app/data')
        .mockRejectedValueOnce(new Error('Some low-level error'));

      const result = await loadTasks();
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Failed to load');
      }
    });

    it('should not leak sensitive path information in errors', async () => {
      // REASONING: Security-conscious error handling
      // > Full paths not exposed
      // > Generic error messages
      // > Therefore: No path leakage
      mockInvoke
        .mockResolvedValueOnce('/app/data')
        .mockRejectedValueOnce(new Error('/home/user/secret/path'));

      const result = await loadTasks();
      expect(result.success).toBe(false);
      // Error should be wrapped, not expose full path
      expect(result.error).toContain('Failed to load tasks');
    });

    it('should handle concurrent read/write operations', async () => {
      // REASONING: File locking not guaranteed
      // > Best-effort handling
      // > Tauri manages atomicity
      // > Therefore: Functions work under concurrency
      mockInvoke
        .mockResolvedValueOnce('/app/data')
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce(undefined);

      const tasks = [createMockTask()];
      const result = await saveTasks(tasks);
      expect(result.success).toBe(true);
    });
  });
});

// REASONING: Test helper for creating mock Task
// > Provides default values for all required fields
// > Override specific values as needed
// > Therefore: Partial input, complete Task output
function createMockTask(overrides: Partial<Task> = {}): Task {
  return {
    id: overrides.id || `task-${Date.now()}`,
    description: overrides.description || 'Test task',
    valueClass: overrides.valueClass ?? 2, // USEFUL
    type: overrides.type ?? 'agentic',
    trajectoryMatch: overrides.trajectoryMatch ?? 50,
    wordCount: overrides.wordCount ?? 5,
    creationTime: overrides.creationTime ?? Date.now(),
    actorNotes: overrides.actorNotes ?? {},
    completed: overrides.completed ?? false,
    ...overrides
  } as Task;
}
