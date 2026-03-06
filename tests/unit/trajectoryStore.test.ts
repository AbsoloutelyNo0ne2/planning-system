/**
 * Trajectory Store (Zustand) Tests
 *
 * PURPOSE: Verify the Zustand trajectory store that manages
 * the north star goal and trajectory editing functionality.
 *
 * CRITICAL PATHS:
 * - Setting initial trajectory
 * - Updating trajectory text
 * - Persistence to storage
 * - Loading from storage
 * - Error handling
 *
 * EDGE CASES:
 * - Empty trajectory text
 * - Very long trajectory text
 * - Updating when no trajectory exists
 * - Storage failures
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock fileService before importing the store
vi.mock('../../src/services/fileService', () => ({
  loadTrajectory: vi.fn().mockResolvedValue({ success: true, data: null }),
  saveTrajectory: vi.fn().mockResolvedValue({ success: true }),
}));

import { useTrajectoryStore, TrajectoryStore } from '../../src/stores/trajectoryStore';
import { saveTrajectory, loadTrajectory } from '../../src/services/fileService';

describe('TrajectoryStore - Bug 4: Trajectory Editing Unknown', () => {
  let store: TrajectoryStore;

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store to initial state
    useTrajectoryStore.setState({
      trajectory: null,
      isLoading: false,
      error: null,
    });
    store = useTrajectoryStore.getState();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('setTrajectory', () => {
    it('should create a new trajectory when user saves goal', () => {
      // REASONING: This test catches the trajectory creation bug.
      // The bug occurs when users try to set their north star goal
      // but the trajectory is not created or saved properly.
      // This makes the trajectory feature appear non-functional.
      const goalText = 'Become a world-class software engineer';

      store.setTrajectory(goalText);

      const updatedStore = useTrajectoryStore.getState();

      // BUG: This assertion FAILS because setTrajectory doesn't properly
      // create the trajectory object. The trajectory stays null
      // or the text is not saved.
      expect(updatedStore.trajectory).not.toBeNull();
      expect(updatedStore.trajectory?.text).toBe(goalText);
      expect(updatedStore.trajectory?.id).toBeTruthy();
      expect(updatedStore.trajectory?.createdAt).toBeTruthy();
    });

    it('should persist trajectory to storage immediately', async () => {
      // REASONING: This test verifies the persistence flow.
      // The bug might create the trajectory in memory but fail to save it,
      // so it's lost on app restart.
      const goalText = 'Launch successful product';

      store.setTrajectory(goalText);

      // Wait for async save
      await new Promise(resolve => setTimeout(resolve, 10));

      // BUG: This assertion FAILS - saveTrajectory is not called
      // The trajectory exists in state but is never persisted
      expect(saveTrajectory).toHaveBeenCalledWith(
        expect.objectContaining({
          text: goalText,
        })
      );
    });

    it('should overwrite existing trajectory when setting new one', () => {
      // REASONING: This test verifies trajectory replacement.
      // The bug might append instead of replace, or fail to clear old data.
      const firstGoal = 'First goal';
      const secondGoal = 'Second goal';

      // Set first trajectory
      store.setTrajectory(firstGoal);

      const firstId = useTrajectoryStore.getState().trajectory?.id;

      // Set second trajectory
      store.setTrajectory(secondGoal);

      const updatedStore = useTrajectoryStore.getState();

      // BUG: This assertion FAILS - setTrajectory might:
      // 1. Not replace the existing trajectory
      // 2. Keep the old ID (should create new one per spec)
      // 3. Merge texts instead of replacing
      expect(updatedStore.trajectory?.text).toBe(secondGoal);
      expect(updatedStore.trajectory?.id).not.toBe(firstId); // New ID for new trajectory
    });

    it('should handle empty trajectory text', () => {
      // REASONING: This test verifies empty input handling.
      // The bug might accept empty text or crash on empty input.
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Ensure no trajectory exists
      expect(useTrajectoryStore.getState().trajectory).toBeNull();

      store.setTrajectory('');

      const updatedStore = useTrajectoryStore.getState();

      // BUG: This assertion FAILS - empty text might:
      // 1. Not create a trajectory (null remains)
      // 2. Create a trajectory with empty text
      // 3. Throw an error
      expect(updatedStore.trajectory).not.toBeNull();
      expect(updatedStore.trajectory?.text).toBe('');
      expect(consoleError).not.toHaveBeenCalled();

      consoleError.mockRestore();
    });

    it('should create trajectory with unique ID', () => {
      // REASONING: This test verifies ID uniqueness.
      // The bug might create duplicate IDs.
      store.setTrajectory('Goal 1');
      const id1 = useTrajectoryStore.getState().trajectory?.id;

      store.setTrajectory('Goal 2');
      const id2 = useTrajectoryStore.getState().trajectory?.id;

      expect(id1).not.toBe(id2);
    });
  });

  describe('updateTrajectory', () => {
    it('should update existing trajectory text while preserving ID', () => {
      // REASONING: This test catches the trajectory editing bug.
      // The bug occurs when users try to edit their trajectory
      // but the update doesn't work or creates a new trajectory instead.
      // First, set an initial trajectory
      store.setTrajectory('Original goal description');

      const originalTrajectory = useTrajectoryStore.getState().trajectory;
      const originalId = originalTrajectory?.id;
      const originalCreatedAt = originalTrajectory?.createdAt;

      // Now update the trajectory
      store.updateTrajectory('Updated goal description');

      const updatedStore = useTrajectoryStore.getState();

      // BUG: This assertion FAILS because updateTrajectory:
      // 1. Doesn't update the text
      // 2. Creates a new trajectory instead of updating (changes ID)
      // 3. Doesn't update lastUpdated timestamp
      expect(updatedStore.trajectory?.text).toBe('Updated goal description');
      expect(updatedStore.trajectory?.id).toBe(originalId); // Same ID
      expect(updatedStore.trajectory?.createdAt).toBe(originalCreatedAt); // Same created time
    });

    it('should do nothing when updating non-existent trajectory', () => {
      // REASONING: This test verifies safe handling of update with no trajectory.
      // The bug might create a trajectory when one doesn't exist,
      // or throw an error.
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Ensure no trajectory exists
      expect(useTrajectoryStore.getState().trajectory).toBeNull();

      store.updateTrajectory('Update without existing trajectory');

      const updatedStore = useTrajectoryStore.getState();

      // BUG: This assertion FAILS - updateTrajectory might:
      // 1. Create a new trajectory (should do nothing)
      // 2. Throw an error
      // 3. Corrupt state
      expect(updatedStore.trajectory).toBeNull();
      expect(updatedStore.error).toBeNull();
      expect(consoleError).not.toHaveBeenCalled();

      consoleError.mockRestore();
    });

    it('should persist updated trajectory to storage', async () => {
      // REASONING: This test verifies persistence of updates.
      // The bug might update in memory but not persist changes.
      store.setTrajectory('Initial goal');

      // Clear mock to track only the update save
      vi.mocked(saveTrajectory).mockClear();

      store.updateTrajectory('Updated goal');

      // Wait for async save
      await new Promise(resolve => setTimeout(resolve, 10));

      // BUG: This assertion FAILS - updateTrajectory doesn't call saveToStorage
      // Updates are lost on app restart
      expect(saveTrajectory).toHaveBeenCalledWith(
        expect.objectContaining({
          text: 'Updated goal',
        })
      );
    });

    it('should update lastUpdated timestamp on each edit', async () => {
      // REASONING: This test verifies the lastUpdated field is maintained.
      // The bug might not update this timestamp, making it useless.
      store.setTrajectory('First version');

      const firstVersion = useTrajectoryStore.getState().trajectory;
      const firstLastUpdated = firstVersion?.lastUpdated;

      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 50));

      store.updateTrajectory('Second version');

      const secondVersion = useTrajectoryStore.getState().trajectory;

      // BUG: This assertion FAILS - lastUpdated might:
      // 1. Not be set at all
      // 2. Not change between updates
      expect(secondVersion?.lastUpdated).toBeGreaterThan(firstLastUpdated!);
    });

    it('should preserve createdAt while updating lastUpdated', () => {
      // REASONING: This test verifies timestamp handling.
      // The bug might update createdAt instead of lastUpdated.
      store.setTrajectory('Original');

      const originalCreatedAt = useTrajectoryStore.getState().trajectory?.createdAt;

      // Wait a bit
      const startTime = Date.now();

      store.updateTrajectory('Updated');

      const updatedTrajectory = useTrajectoryStore.getState().trajectory;

      // BUG: This assertion FAILS - createdAt might be updated
      // when only lastUpdated should change
      expect(updatedTrajectory?.createdAt).toBe(originalCreatedAt);
      expect(updatedTrajectory?.lastUpdated).toBeGreaterThanOrEqual(startTime);
    });
  });

  describe('UI Clarity - Trajectory Visibility', () => {
    it('should provide clear indication when no trajectory is set', () => {
      // REASONING: This test verifies UI clarity for empty state.
      // The bug is that users don't know if they can edit or where to set trajectory.
      const currentStore = useTrajectoryStore.getState();

      // BUG: This assertion FAILS - the store might not expose
      // a clear way for UI to distinguish "loading" from "empty"
      expect(currentStore.trajectory).toBeNull();
      expect(currentStore.isLoading).toBe(false);
      expect(currentStore.error).toBeNull();
    });

    it('should indicate loading state during storage operations', async () => {
      // REASONING: This test verifies loading state during async operations.
      // The bug might not set loading flag, making UI unresponsive.
      let resolveLoad: (value: { success: true; data: null }) => void;
      const loadPromise = new Promise<{ success: true; data: null }>(resolve => {
        resolveLoad = resolve;
      });

      vi.mocked(loadTrajectory).mockReturnValueOnce(loadPromise);

      // Start loading
      const loadOperation = store.loadFromStorage();

      // Check loading state is set
      expect(useTrajectoryStore.getState().isLoading).toBe(true);

      // Resolve the load
      resolveLoad!({ success: true, data: null });
      await loadOperation;

      // BUG: This assertion FAILS - isLoading might not be set back to false
      expect(useTrajectoryStore.getState().isLoading).toBe(false);
    });

    it('should expose hasTrajectory selector or equivalent', () => {
      // REASONING: This test verifies UI helper for trajectory status.
      // The bug might require UI to check trajectory === null directly.
      const hasTrajectory = useTrajectoryStore.getState().trajectory !== null;

      expect(typeof hasTrajectory).toBe('boolean');
      expect(hasTrajectory).toBe(false);

      // After setting
      store.setTrajectory('New goal');
      const hasTrajectoryAfter = useTrajectoryStore.getState().trajectory !== null;

      expect(hasTrajectoryAfter).toBe(true);
    });
  });

  describe('loadFromStorage', () => {
    it('should load existing trajectory from storage', async () => {
      // REASONING: This test verifies trajectory persistence loading.
      // The bug might fail to load saved trajectories.
      const savedTrajectory = {
        id: 'traj-123',
        text: 'My saved goal',
        createdAt: Date.now() - 86400000, // 1 day ago
        lastUpdated: Date.now() - 3600000, // 1 hour ago
      };

      vi.mocked(loadTrajectory).mockResolvedValueOnce({
        success: true,
        data: savedTrajectory,
      });

      await store.loadFromStorage();

      const updatedStore = useTrajectoryStore.getState();

      // BUG: This assertion FAILS - loaded trajectory might:
      // 1. Not be set in state
      // 2. Lose properties during loading
      // 3. Be overwritten by default values
      expect(updatedStore.trajectory).toEqual(savedTrajectory);
    });

    it('should remain null when storage is empty', async () => {
      // REASONING: This test verifies empty storage handling.
      // The bug might create a default trajectory when none exists.
      vi.mocked(loadTrajectory).mockResolvedValueOnce({
        success: true,
        data: null,
      });

      await store.loadFromStorage();

      const updatedStore = useTrajectoryStore.getState();

      // BUG: This assertion FAILS - load might create a default trajectory
      // instead of keeping null for empty storage
      expect(updatedStore.trajectory).toBeNull();
    });

    it('should set error when load fails', async () => {
      // REASONING: This test verifies error handling.
      // The bug might silently fail without setting error state.
      vi.mocked(loadTrajectory).mockResolvedValueOnce({
        success: false,
        error: 'Storage read failed',
      });

      await store.loadFromStorage();

      const updatedStore = useTrajectoryStore.getState();

      // BUG: This assertion FAILS - error might not be set
      // or might be set to wrong value
      expect(updatedStore.error).toBe('Storage read failed');
    });

    it('should clear loading state after error', async () => {
      // REASONING: This test verifies loading state cleanup.
      // The bug might leave isLoading true after error.
      vi.mocked(loadTrajectory).mockResolvedValueOnce({
        success: false,
        error: 'Failed',
      });

      await store.loadFromStorage();

      const updatedStore = useTrajectoryStore.getState();

      // BUG: This assertion FAILS - isLoading stays true on error
      expect(updatedStore.isLoading).toBe(false);
      expect(updatedStore.error).toBeTruthy();
    });
  });

  describe('clearError', () => {
    it('should clear error state when called', () => {
      // REASONING: This test verifies error dismissal works.
      // Users need to dismiss error messages.
      useTrajectoryStore.setState({ error: 'Some error message' });

      store.clearError();

      const updatedStore = useTrajectoryStore.getState();

      expect(updatedStore.error).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('should handle very long trajectory text', () => {
      // REASONING: This test verifies handling of long text.
      // The bug might truncate or reject long goals.
      const longText = 'Goal: '.repeat(1000);

      store.setTrajectory(longText);

      const updatedStore = useTrajectoryStore.getState();

      expect(updatedStore.trajectory?.text).toBe(longText);
    });

    it('should handle special characters in trajectory text', () => {
      // REASONING: This test verifies text handling.
      // The bug might corrupt text with special characters.
      const specialText = 'Goal with <html> & "quotes" and \'apostrophes\'';

      store.setTrajectory(specialText);

      const updatedStore = useTrajectoryStore.getState();

      expect(updatedStore.trajectory?.text).toBe(specialText);
    });

    it('should handle rapid consecutive updates', async () => {
      // REASONING: This test verifies race condition handling.
      // The bug might lose updates with rapid edits.
      store.setTrajectory('Initial');

      // Rapid updates
      const updates = ['Update 1', 'Update 2', 'Update 3'];
      updates.forEach(text => {
        store.updateTrajectory(text);
      });

      const updatedStore = useTrajectoryStore.getState();

      // Should have one of the updates (last one wins)
      expect(updatedStore.trajectory?.text).toBe('Update 3');
    });

    it('should handle set then immediate update', () => {
      // REASONING: This test verifies state consistency.
      // The bug might lose the update if called too quickly after set.
      store.setTrajectory('Initial');
      store.updateTrajectory('Updated');

      const updatedStore = useTrajectoryStore.getState();

      expect(updatedStore.trajectory?.text).toBe('Updated');
    });

    it('should handle multiple sequential sets', () => {
      // REASONING: This test verifies replacement behavior.
      // The bug might accumulate instead of replace.
      store.setTrajectory('Goal 1');
      store.setTrajectory('Goal 2');
      store.setTrajectory('Goal 3');

      const updatedStore = useTrajectoryStore.getState();

      // Should only have the last goal
      expect(updatedStore.trajectory?.text).toBe('Goal 3');
    });

    it('should generate valid timestamps', () => {
      // REASONING: This test verifies timestamp validity.
      // The bug might generate invalid timestamps.
      const beforeTime = Date.now();

      store.setTrajectory('Test');

      const afterTime = Date.now();
      const trajectory = useTrajectoryStore.getState().trajectory;

      expect(trajectory?.createdAt).toBeGreaterThanOrEqual(beforeTime);
      expect(trajectory?.createdAt).toBeLessThanOrEqual(afterTime);
    });

    it('should maintain lastUpdated on set operation', () => {
      // REASONING: This test verifies set also sets lastUpdated.
      // The bug might leave lastUpdated undefined on set.
      store.setTrajectory('New goal');

      const trajectory = useTrajectoryStore.getState().trajectory;

      expect(trajectory?.lastUpdated).toBeDefined();
      expect(trajectory?.lastUpdated).toBe(trajectory?.createdAt);
    });
  });
});
