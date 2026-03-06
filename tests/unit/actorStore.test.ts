/**
 * Actor Store (Zustand) Tests
 *
 * PURPOSE: Verify the Zustand actor store that manages actor state including
 * CRUD operations and persistence integration.
 *
 * CRITICAL PATHS:
 * - Actor creation with validation
 * - Actor removal by ID
 * - Actor name updates
 * - Persistence to storage
 * - Error handling
 *
 * EDGE CASES:
 * - Invalid actor names
 * - Removing non-existent actors
 * - Updating actors that don't exist
 * - Storage failures
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock fileService before importing the store
vi.mock('../../src/services/fileService', () => ({
  loadActors: vi.fn().mockResolvedValue({ success: true, data: [] }),
  saveActors: vi.fn().mockResolvedValue({ success: true }),
}));

import { useActorStore, ActorStore } from '../../src/stores/actorStore';
import { saveActors, loadActors } from '../../src/services/fileService';

describe('ActorStore - Bug 3: Actor Button Failures', () => {
  let store: ActorStore;

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store to initial state
    const currentStore = useActorStore.getState();
    useActorStore.setState({
      actors: [],
      isLoading: false,
      error: null,
    });
    store = useActorStore.getState();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('addActor', () => {
    it('should add an actor when button is clicked', () => {
      // REASONING: This test catches the actor button failure bug.
      // The bug occurs when the +Actor button is clicked but no actor
      // is added to the store. This could be due to:
      // 1. Missing event handler binding
      // 2. Store action not being called
      // 3. Validation rejecting valid input
      // We simulate clicking the +Actor button and verify the actor is added.
      const initialActorCount = store.actors.length;

      // Simulate what happens when +Actor button is clicked
      store.addActor('New Test Actor');

      // Get updated state
      const updatedStore = useActorStore.getState();

      // BUG: This assertion FAILS because addActor doesn't properly add the actor
      // The button click doesn't result in a new actor being created
      expect(updatedStore.actors).toHaveLength(initialActorCount + 1);
      expect(updatedStore.actors[0]).toMatchObject({
        name: 'New Test Actor',
      });
    });

    it('should persist actor after successful addition', async () => {
      // REASONING: This test verifies the persistence flow.
      // The bug might be that actors are added to state but never saved,
      // so they disappear on app restart.
      store.addActor('Persistent Actor');

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 10));

      // BUG: This assertion FAILS - saveActors is not called after addActor
      // The store adds to local state but doesn't trigger persistence
      expect(saveActors).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ name: 'Persistent Actor' }),
        ])
      );
    });

    it('should handle rapid consecutive add clicks', () => {
      // REASONING: This test checks for race conditions in addActor.
      // The bug might manifest when users click +Actor multiple times quickly.
      // We verify all clicks result in distinct actors.
      const actorNames = ['Actor 1', 'Actor 2', 'Actor 3'];

      // Simulate rapid clicks
      actorNames.forEach(name => {
        store.addActor(name);
      });

      const updatedStore = useActorStore.getState();

      // BUG: This assertion FAILS - rapid additions might:
      // 1. Create duplicate IDs
      // 2. Overwrite each other
      // 3. Only save the last one
      expect(updatedStore.actors).toHaveLength(3);

      // Verify each actor has a unique ID
      const ids = updatedStore.actors.map(a => a.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(3);
    });

    it('should validate actor name before adding', () => {
      // REASONING: This test verifies input validation.
      // The bug might be that invalid names are silently rejected
      // without user feedback, making the button appear broken.
      store.addActor(''); // Empty name

      const updatedStore = useActorStore.getState();

      // BUG: This assertion FAILS - empty names might be added
      // or the error might not be set properly
      expect(updatedStore.actors).toHaveLength(0);
      expect(updatedStore.error).toBeTruthy();
    });

    it('should trim actor name before validation', () => {
      // REASONING: This test verifies whitespace handling.
      // The bug might reject names with leading/trailing spaces
      // or add them without trimming.
      store.addActor('   Trimmed Actor   ');

      const updatedStore = useActorStore.getState();

      // BUG: This assertion FAILS - the store might:
      // 1. Reject valid names with whitespace
      // 2. Add names without trimming
      expect(updatedStore.actors).toHaveLength(1);
      expect(updatedStore.actors[0].name).toBe('Trimmed Actor');
    });
  });

  describe('removeActor', () => {
    it('should remove an actor when -Actor button is clicked', () => {
      // REASONING: This test catches the -Actor button failure bug.
      // First add an actor, then try to remove it.
      // The bug occurs when the button click doesn't remove the actor.
      store.addActor('Actor to Remove');

      const afterAdd = useActorStore.getState();
      expect(afterAdd.actors).toHaveLength(1);
      const actorId = afterAdd.actors[0].id;

      // Simulate clicking -Actor button
      store.removeActor(actorId);

      const afterRemove = useActorStore.getState();

      // BUG: This assertion FAILS because removeActor doesn't work
      // The actor remains in the store after the button click
      expect(afterRemove.actors).toHaveLength(0);
    });

    it('should persist removal to storage', async () => {
      // REASONING: Verify that removals are saved.
      // The bug might be that removal happens in memory but isn't persisted.
      store.addActor('Actor to Remove');

      const actorId = useActorStore.getState().actors[0].id;

      // Clear mock to check only the removal save
      vi.mocked(saveActors).mockClear();

      store.removeActor(actorId);

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 10));

      // BUG: This assertion FAILS - saveToStorage isn't called after remove
      expect(saveActors).toHaveBeenCalled();
    });

    it('should handle removing non-existent actor gracefully', () => {
      // REASONING: This test verifies error handling for invalid removals.
      // The bug might cause crashes when removing already-removed actors.
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      store.removeActor('non-existent-id-123');

      // BUG: This assertion FAILS - the store might throw an error
      // or corrupt its state when removing non-existent actors
      expect(consoleError).not.toHaveBeenCalled();

      consoleError.mockRestore();
    });

    it('should maintain state integrity after failed removal', () => {
      // REASONING: This test verifies state consistency.
      // The bug might corrupt the actors array on failed removal.
      store.addActor('Existing Actor');
      const beforeState = useActorStore.getState();
      const beforeLength = beforeState.actors.length;

      // Try to remove non-existent actor
      store.removeActor('invalid-id');

      const afterState = useActorStore.getState();

      // BUG: This assertion FAILS - the actors array might be corrupted
      expect(afterState.actors).toHaveLength(beforeLength);
      expect(afterState.actors[0].name).toBe('Existing Actor');
    });
  });

  describe('updateActor', () => {
    it('should update actor name when editing', () => {
      // REASONING: This test verifies actor name editing works.
      // The bug might prevent name updates from being applied.
      store.addActor('Old Name');

      const actorId = useActorStore.getState().actors[0].id;

      store.updateActor(actorId, 'New Name');

      const updatedStore = useActorStore.getState();

      // BUG: This assertion FAILS - the updateActor action might not
      // properly update the actor name in the store
      expect(updatedStore.actors[0].name).toBe('New Name');
    });

    it('should preserve other actor properties when updating name', () => {
      // REASONING: This test verifies immutability of updates.
      // The bug might replace the entire actor object, losing createdAt.
      store.addActor('Original Name');

      const actor = useActorStore.getState().actors[0];
      const originalCreatedAt = actor.createdAt;
      const originalId = actor.id;

      store.updateActor(originalId, 'Updated Name');

      const updatedActor = useActorStore.getState().actors[0];

      // BUG: This assertion FAILS - update might recreate the actor
      // losing the original createdAt timestamp and ID
      expect(updatedActor.id).toBe(originalId);
      expect(updatedActor.createdAt).toBe(originalCreatedAt);
    });

    it('should persist update to storage', async () => {
      // REASONING: Verify updates are persisted.
      // The bug might update in memory but not save to storage.
      store.addActor('Original');
      const actorId = useActorStore.getState().actors[0].id;

      // Clear mock to track only the update save
      vi.mocked(saveActors).mockClear();

      store.updateActor(actorId, 'Updated');

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 10));

      // BUG: This assertion FAILS - saveToStorage isn't called after update
      expect(saveActors).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ name: 'Updated' }),
        ])
      );
    });

    it('should not create actor when updating non-existent', () => {
      // REASONING: This test verifies safe update handling.
      // The bug might create a new actor instead of doing nothing.
      store.addActor('Existing');

      store.updateActor('non-existent-id', 'New Name');

      const updatedStore = useActorStore.getState();

      // BUG: This assertion FAILS - a new actor might be created
      // or the existing actor's name might be changed
      expect(updatedStore.actors).toHaveLength(1);
      expect(updatedStore.actors[0].name).toBe('Existing');
    });
  });

  describe('loadFromStorage', () => {
    it('should load actors from storage on init', async () => {
      // REASONING: This test verifies initial load works.
      // The bug might be that actors aren't loaded, making buttons appear broken.
      const mockActors = [
        { id: 'actor-1', name: 'Loaded Actor', createdAt: Date.now() },
      ];

      vi.mocked(loadActors).mockResolvedValueOnce({
        success: true,
        data: mockActors,
      });

      await store.loadFromStorage();

      const updatedStore = useActorStore.getState();

      // BUG: This assertion FAILS - actors might not be loaded properly
      // or default actors might overwrite loaded ones
      expect(updatedStore.actors).toHaveLength(1);
      expect(updatedStore.actors[0].name).toBe('Loaded Actor');
    });

    it('should create default actor when storage is empty', async () => {
      // REASONING: This test verifies default actor creation.
      // The bug might fail to create the default "Yesterday me" actor.
      vi.mocked(loadActors).mockResolvedValueOnce({
        success: true,
        data: [],
      });

      await store.loadFromStorage();

      const updatedStore = useActorStore.getState();

      // BUG: This assertion FAILS - default actor might not be created
      // or might have wrong name
      expect(updatedStore.actors).toHaveLength(1);
      expect(updatedStore.actors[0].name).toBe('Yesterday me');
    });

    it('should clear loading state after load completes', async () => {
      // REASONING: This test verifies loading state management.
      // The bug might leave isLoading true after load.
      await store.loadFromStorage();

      const updatedStore = useActorStore.getState();

      // BUG: This assertion FAILS - isLoading might stay true
      expect(updatedStore.isLoading).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should set error state when save fails', async () => {
      // REASONING: This test verifies error feedback.
      // The bug might fail silently, making buttons appear unresponsive.
      vi.mocked(saveActors).mockResolvedValueOnce({ success: false, error: 'Storage failed' });

      store.addActor('Test Actor');

      // Wait for async save
      await new Promise(resolve => setTimeout(resolve, 50));

      const updatedStore = useActorStore.getState();

      // BUG: This assertion FAILS - errors might not be caught
      // or might not update the error state
      expect(updatedStore.error).toBe('Storage failed');
    });

    it('should clear error when clearError is called', () => {
      // REASONING: This test verifies error dismissal works.
      // Set error first, then clear it.
      useActorStore.setState({ error: 'Some error' });

      store.clearError();

      const updatedStore = useActorStore.getState();

      expect(updatedStore.error).toBeNull();
    });
  });
});

describe('ActorStore - edge cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useActorStore.setState({
      actors: [],
      isLoading: false,
      error: null,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should handle adding actor with very long name', () => {
    const store = useActorStore.getState();
    const longName = 'A'.repeat(1000);

    store.addActor(longName);

    const updatedStore = useActorStore.getState();

    // BUG: This might fail if there's a length validation
    expect(updatedStore.actors).toHaveLength(1);
    expect(updatedStore.actors[0].name).toBe(longName);
  });

  it('should handle adding actor with special characters in name', () => {
    const store = useActorStore.getState();
    const specialName = 'Actor <script>alert("xss")</script> & Co.';

    store.addActor(specialName);

    const updatedStore = useActorStore.getState();

    expect(updatedStore.actors).toHaveLength(1);
    expect(updatedStore.actors[0].name).toBe(specialName);
  });

  it('should handle concurrent add and remove operations', () => {
    const store = useActorStore.getState();

    // Add initial actors
    store.addActor('Actor A');
    store.addActor('Actor B');

    const actorA = useActorStore.getState().actors.find(a => a.name === 'Actor A');

    // Concurrent operations
    store.addActor('Actor C');
    if (actorA) {
      store.removeActor(actorA.id);
    }

    const updatedStore = useActorStore.getState();

    // Should end up with 2 actors (B and C)
    expect(updatedStore.actors).toHaveLength(2);
  });

  it('should handle duplicate names', () => {
    const store = useActorStore.getState();

    store.addActor('Duplicate Name');
    store.addActor('Duplicate Name');

    const updatedStore = useActorStore.getState();

    // Should allow duplicate names (different IDs)
    expect(updatedStore.actors).toHaveLength(2);
    expect(updatedStore.actors[0].name).toBe('Duplicate Name');
    expect(updatedStore.actors[1].name).toBe('Duplicate Name');
    expect(updatedStore.actors[0].id).not.toBe(updatedStore.actors[1].id);
  });

  it('should generate unique IDs for each actor', () => {
    const store = useActorStore.getState();

    // Add multiple actors
    for (let i = 0; i < 10; i++) {
      store.addActor(`Actor ${i}`);
    }

    const updatedStore = useActorStore.getState();
    const ids = updatedStore.actors.map(a => a.id);
    const uniqueIds = new Set(ids);

    // All IDs should be unique
    expect(uniqueIds.size).toBe(10);
  });

  it('should handle setActors bulk operation', () => {
    const store = useActorStore.getState();
    const newActors = [
      { id: '1', name: 'Bulk 1', createdAt: Date.now() },
      { id: '2', name: 'Bulk 2', createdAt: Date.now() },
    ];

    store.setActors(newActors);

    const updatedStore = useActorStore.getState();
    expect(updatedStore.actors).toHaveLength(2);
    expect(updatedStore.actors[0].name).toBe('Bulk 1');
  });
});
