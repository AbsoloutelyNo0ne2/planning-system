/**
 * @fileoverview Actor Type Definitions
 * 
 * PURPOSE:
 * Defines data structures for actors (competitors/tracked entities) and their
 * notes on tasks. Actors enable the comparison table feature.
 * 
 * WHY THIS EXISTS:
 * Actors are a distinct domain from tasks. Separating types follows SRP
 * and allows independent evolution of actor-related features.
 * 
 * LAYER STATUS: Layer 4 Complete (all functions implemented)
 * NEXT: Layer 5 - Add section index to file header
 */

// SECTION: Core Actor Types
// Lines 15-35: Actor interface
export type ActorId = string;

/**
 * Actor - a tracked entity for comparison purposes
 *
 * Examples: Competitors, colleagues, public figures, or aspirational selves.
 * The name is user-defined and displayed in the comparison table.
 */
export interface Actor {
  id: ActorId;
  name: string;
  notes?: string; // Optional notes about the actor
  createdAt: number; // Timestamp
}

// SECTION: Actor Notes
// Lines 38-55: ActorNote interface
/**
 * ActorNote - links an actor's progress to a specific task
 * 
 * RATIONALE for separate type:
 * - Allows multiple actors per task
 * - Tracks when the note was created
 * - Can query all notes for an actor (across tasks) or for a task (across actors)
 */
export interface ActorNote {
  actorId: ActorId;
  taskId: string;
  note: string;
  createdAt: number;
}

// SECTION: Factory Functions
// Lines 58-75: Actor creation signatures
// REASONING:
// We need to create an Actor instance > What fields are required?
// > id, name, createdAt > How to generate ID?
// > Use crypto.randomUUID() for uniqueness, fall back to timestamp + random
// > Therefore: Return object with generated ID and current timestamp
export function createActor(name: string): Actor {
  const id = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  return {
    id,
    name: name.trim(),
    createdAt: Date.now(),
  };
}

// REASONING:
// We need to create an ActorNote > What fields link actor to task?
// > actorId, taskId, note content > When was it created?
// > Need timestamp for chronological display
// > Therefore: Return object with all provided fields plus current timestamp
export function createActorNote(actorId: ActorId, taskId: string, note: string): ActorNote {
  return {
    actorId,
    taskId,
    note: note.trim(),
    createdAt: Date.now(),
  };
}

// SECTION: Validation
// Lines 78-90: Actor validation
export interface ActorValidationResult {
  valid: boolean;
  errors: string[];
}

// REASONING:
// We need to validate an Actor > What makes an actor invalid?
// > Missing or empty name > What else?
// > ID is required but system-generated, so allow partial validation
// > Therefore: Check name exists and is non-empty after trimming
export function validateActor(actor: Partial<Actor>): ActorValidationResult {
  const errors: string[] = [];
  if (!actor.name || actor.name.trim().length === 0) {
    errors.push('Actor name is required');
  }
  return {
    valid: errors.length === 0,
    errors,
  };
}

// REASONING:
// We need to validate an ActorNote > What fields are mandatory?
// > actorId, taskId, note content > Can any be empty?
// > No, all three are required for a valid note
// > Therefore: Check all three fields are present and non-empty
export function validateActorNote(note: Partial<ActorNote>): ActorValidationResult {
  const errors: string[] = [];
  if (!note.actorId || note.actorId.trim().length === 0) {
    errors.push('Actor ID is required');
  }
  if (!note.taskId || note.taskId.trim().length === 0) {
    errors.push('Task ID is required');
  }
  if (!note.note || note.note.trim().length === 0) {
    errors.push('Note content is required');
  }
  return {
    valid: errors.length === 0,
    errors,
  };
}

// SECTION MAP:
// Lines 1-14: File header
// Lines 15-35: Actor interface
// Lines 38-55: ActorNote interface
// Lines 58-75: Factory function signatures
// Lines 78-90: Validation types and functions
