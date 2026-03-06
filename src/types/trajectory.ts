/**
 * @fileoverview Trajectory Type Definitions
 * 
 * PURPOSE:
 * Defines the data structure for the user's current trajectory (long-term goal).
 * The trajectory is displayed prominently and tasks are matched against it.
 * 
 * LAYER STATUS: Layer 4 Complete (all functions implemented)
 * NEXT: Layer 5 - Add section index to file header
 */

// SECTION: Trajectory Type
// Lines 12-28: Trajectory interface
/**
 * Trajectory - the user's current north star goal
 * 
 * Format: Logical chain like "Make X > Use X to make Y > ..."
 * Displayed at top center of the application UI.
 */
export interface Trajectory {
  id: string;
  text: string;
  createdAt: number; // Timestamp
  lastUpdated: number; // Timestamp
}

// SECTION: Constants
// Lines 31-40: Default trajectory
export const DEFAULT_TRAJECTORY = 'Define your trajectory > Break it down > Execute systematically';

// SECTION: Factory and Validation
// Lines 43-55: Trajectory functions
// REASONING:
// We need to create a Trajectory > What fields are required?
// > text and lastUpdated > When should it be created?
// > Now, with current timestamp for tracking changes
// > Therefore: Return object with provided text and current timestamp
// REASONING:
// We need to create a Trajectory > What fields are required?
// > text and lastUpdated > When should it be created?
// > Now, with current timestamp for tracking changes
// > FIX: Don't trim text - preserve exact input as test expects
// > Therefore: Return object with provided text and current timestamp
export function createTrajectory(text: string): Trajectory {
  const now = Date.now();
  return {
    id: `traj-${now}-${Math.random().toString(36).substr(2, 9)}`,
    text: text,
    createdAt: now,
    lastUpdated: now,
  };
}

export interface TrajectoryValidationResult {
  valid: boolean;
  errors: string[];
}

// REASONING:
// We need to validate a Trajectory > What makes it invalid?
// > Missing or empty text > Can text be whitespace only?
// > No, trim and check length to ensure meaningful content
// > Therefore: Check text exists and is non-empty after trimming
export function validateTrajectory(trajectory: Partial<Trajectory>): TrajectoryValidationResult {
  const errors: string[] = [];
  if (!trajectory.text || trajectory.text.trim().length === 0) {
    errors.push('Trajectory text is required');
  }
  return {
    valid: errors.length === 0,
    errors,
  };
}

// SECTION: Utility Types
// Lines 58-70: Trajectory parsing helpers
/**
 * ParsedTrajectoryStep - represents one step in the "X > Y > Z" chain
 */
export interface ParsedTrajectoryStep {
  index: number;
  text: string;
}

// REASONING:
// We need to parse trajectory text into steps > What format is expected?
// > "X > Y > Z" format with angle brackets as separators
// > How to handle empty or malformed input?
// > Return empty array if no text or no valid steps found
// > Therefore: Split by ">" delimiter, trim each part, filter empty, assign indices
export function parseTrajectorySteps(text: string): ParsedTrajectoryStep[] {
  if (!text || text.trim().length === 0) {
    return [];
  }
  return text
    .split('>')
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .map((part, index) => ({ index, text: part }));
}

// SECTION MAP:
// Lines 1-11: File header
// Lines 12-28: Trajectory interface
// Lines 31-40: Default constant
// Lines 43-55: Factory and validation
// Lines 58-70: Utility types and functions
