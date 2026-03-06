/**
 * @fileoverview Copy Service
 * 
 * PURPOSE:
 * Formats task data into agent-ready text for clipboard copying.
 * This is what gets pasted into AI chatbots.
 * 
 * WHY THIS EXISTS:
 * - Centralizes formatting logic (easy to change format)
 * - Can be tested in isolation
 * - Separates presentation from data
 * 
 * FORMAT REQUIREMENTS:
 * The exact format is TBD per spec. Initial implementation will use
 * a clean markdown format with all task context.
 * 
 * LAYER STATUS: Layer 4 Complete (Reasoning + Implementation)
 * NEXT: Layer 5 - Section maps and final polish
 */

import { Task, TaskType } from '../types/task';
import { Trajectory } from '../types/trajectory';

// SECTION: Format Options
// Lines 25-45: Configuration for output format
export interface CopyFormatOptions {
  includeTrajectory: boolean;
  includeActorNotes: boolean;
  includeMetadata: boolean; // timestamps, classifications
}

export const DEFAULT_COPY_OPTIONS: CopyFormatOptions = {
  includeTrajectory: true,
  includeActorNotes: true,
  includeMetadata: true
};

// SECTION: Main Format Function
// Lines 48-70: Primary export
/**
 * formatTaskForCopy - converts task to agent-ready text
 * 
 * RATIONALE for format design:
 * - Clear section headers for AI parsing
 * - All context AI needs to complete the task
 * - Markdown for readability in chat
 * 
 * Sections (configurable via options):
 * - Task Description
 * - Classification (value class, type, trajectory match)
 * - Actor Context (competition notes)
 * - Current Trajectory (north star)
 * - Metadata (creation date, word count)
 */
// REASONING: We need a ValueClass to human-readable string mapping
// > Why not use the enum names directly?
// # Enum names are programmer-friendly (FUN_USEFUL), user needs "Fun and Useful"
// > Should this mapping live here or in the type definition?
// # Here - this is presentation logic, not type definition
// > What about localization?
// # Out of scope for MVP - English only for now
// > Why const instead of function?
// # Simple lookup table - no logic needed, just key-value mapping
const valueClassNames: Record<import('../types/task').ValueClass, string> = {
  1: 'Fun and Useful',
  2: 'Useful',
  3: 'Has to be Done',
  4: 'Has to be Done and Boring',
  5: 'Fun and Useless',
  6: 'Boring and Useless'
};

// REASONING: Main entry point for formatting task to clipboard text
// > Why merge options with defaults?
// # Partial options means user only specifies what they want to change
// > What order for sections?
// # Most important first: Description > Classification > Context > Trajectory > Metadata
// > Why array + join instead of string concatenation?
// # Cleaner to read, easier to add optional sections conditionally
// > What if task or trajectory is null?
// # Graceful handling via optional chaining and empty string fallbacks
export function formatTaskForCopy(
  task: Task,
  trajectory: Trajectory,
  options?: Partial<CopyFormatOptions>
): string {
  const mergedOptions = { ...DEFAULT_COPY_OPTIONS, ...options };

  const sections: string[] = [];

  // Always include description (it's the core of the task)
  sections.push(formatDescriptionSection(task));

  if (mergedOptions.includeMetadata) {
    sections.push(formatClassificationSection(task));
  }

  if (mergedOptions.includeActorNotes) {
    const actorSection = formatActorNotesSection(task);
    if (actorSection) {
      sections.push(actorSection);
    }
  }

  if (mergedOptions.includeTrajectory) {
    sections.push(formatTrajectorySection(trajectory));
  }

  if (mergedOptions.includeMetadata) {
    sections.push(formatMetadataSection(task));
  }

  return sections.join('\n\n');
}

// SECTION: Section Formatters
// Lines 73-95: Individual section formatters (composable)
// REASONING: Format just the task description as a markdown H1
// > Why H1 (#) for description?
// # It's the most important piece - the task itself
// > What if description is empty?
// # Return empty header with placeholder - caller should validate before formatting
// > Why not include word count here?
// # Separation of concerns - description is content, word count is metadata
// > Should we trim the description?
// # Yes - remove leading/trailing whitespace that might have been saved
export function formatDescriptionSection(task: Task): string {
  const description = task.description?.trim() || '';
  return `# Task\n${description}`;
}
// REASONING: Format classification as a markdown list
// > Why include all three: value class, type, and trajectory match?
// # AI needs full context: importance (value class), delegability (type), relevance (match %)
// > How to handle unknown ValueClass?
// # Fallback to "Unknown" - graceful degradation
// > Why format trajectory match with % symbol?
// # Clearer than decimal, matches user mental model (0-100%)
// > What order for the three items?
// # Value (most important) > Type > Match - matches UI priority
export function formatClassificationSection(task: Task): string {
  const valueClassName = valueClassNames[task.valueClass] || 'Unknown';
  const typeLabel = task.type === TaskType.AGENTIC ? 'Agentic (can delegate to AI)' : 'Non-Agentic (requires human)';
  const matchLabel = `${task.trajectoryMatch ?? 0}%`;

  return `## Classification
- Value: ${valueClassName}
- Type: ${typeLabel}
- Trajectory Match: ${matchLabel}`;
}
// REASONING: Format actor notes as a bulleted list per actor
// > Why only include actors with actual notes?
// # Empty notes add noise - filter them out
// > What if no actors have notes?
// # Return empty string - section can be omitted entirely
// > Why include actor ID in output?
// # Useful for debugging/tracing even if not shown in UI
// > Format: "ActorID: Note" or just "Note"?
// # "Actor: Note" format is clearer for AI context
// > Should we sort actors?
// # Object.keys order is insertion order - acceptable for now
export function formatActorNotesSection(task: Task): string {
  const notes = task.actorNotes || {};
  const entries = Object.entries(notes).filter(([, note]) => note?.trim());

  if (entries.length === 0) {
    return '';
  }

  const lines = entries.map(([actorId, note]) => `- ${actorId}: ${note.trim()}`);
  return `## Actor Context\n${lines.join('\n')}`;
}
// REASONING: Format trajectory as its own section
// > Why include trajectory in task copy?
// # AI needs context: this task should serve the north star goal
// > What if trajectory text is empty?
// # Show placeholder - indicates misconfiguration rather than hiding it
// > Why preserve the ">" chain format?
// # It's the user's format - keep it recognizable
// > Should we parse into steps here?
// # No - raw format is sufficient for context, parsing adds complexity
export function formatTrajectorySection(trajectory: Trajectory): string {
  const text = trajectory?.text?.trim() || 'No trajectory defined';
  return `## Current Trajectory\n${text}`;
}
// REASONING: Format metadata (creation date, word count)
// > Why include creation date?
// # Context for AI: task age might affect priority or relevance
// > Why include word count?
// # Signal of task complexity; also used in sorting algorithm
// > What format for date?
// # ISO string is unambiguous and parseable: "2024-01-15T10:30:00.000Z"
// > Why word count over character count?
// # Matches the sorting algorithm which uses words, not characters
// > What if creationTime is missing?
// # Fallback to "Unknown" - gracefully handle edge case
export function formatMetadataSection(task: Task): string {
  const createdDate = task.creationTime
    ? new Date(task.creationTime).toISOString()
    : 'Unknown';
  const wordCount = task.wordCount ?? 0;

  return `## Metadata
- Created: ${createdDate}
- Word Count: ${wordCount}`;
}

// SECTION: Clipboard Integration
// Lines 98-110: Tauri clipboard command
/**
 * copyToClipboard - sends formatted text to system clipboard
 * 
 * TAURI INTEGRATION:
 * Invokes clipboard command in src-tauri/src/main.rs
 */
// REASONING: Tauri clipboard integration via invoke
// > Why return Promise<boolean> instead of void?
// # Caller needs to know success/failure for UI feedback
// > Why not use navigator.clipboard?
// # Tauri app runs in native context - use Tauri's clipboard for consistency
// > What if Tauri bridge is not available?
// # Fallback to navigator.clipboard, then return false if both fail
// > Why invoke 'copy_to_clipboard' specifically?
// # Matches the Rust command registered in src-tauri/src/main.rs
// > Error handling: log or silent?
// # Silent return false - let caller decide how to handle errors (show toast, etc)
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    // Check if running in Tauri environment
    if (typeof window !== 'undefined' && (window as any).__TAURI__) {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('copy_to_clipboard', { text });
      return true;
    }

    // Fallback to web clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

// SECTION: Preview
// Lines 113-125: Returns HTML preview for UI
// REASONING: Format task as HTML for UI preview (not for clipboard)
// > Why HTML instead of markdown?
// # UI renders HTML, not markdown - needs styled display
// > What should be included?
// # Summary only: description + key metadata (type, value class)
// > Why escape HTML in description?
// # Security: prevent XSS if task description contains HTML/script tags
// > Styling: inline styles or classes?
// # Classes for CSS - maintain separation of concerns
// > What if description is very long?
// # Truncate with ellipsis after reasonable length (e.g., 200 chars)
// > Why include task ID?
// # Debug/selection context - small gray text at end
export function formatTaskForPreview(task: Task): string {
  const description = escapeHtml(task.description?.trim() || '');
  const valueClassName = valueClassNames[task.valueClass] || 'Unknown';
  const typeBadge = task.type === TaskType.AGENTIC
    ? '<span class="badge agentic">AI</span>'
    : '<span class="badge human">Human</span>';

  const truncated = description.length > 200
    ? description.slice(0, 200) + '...'
    : description;

  return `<div class="task-preview">
  <div class="task-preview-header">
    ${typeBadge}
    <span class="value-class">${escapeHtml(valueClassName)}</span>
  </div>
  <div class="task-preview-description">${truncated}</div>
  <div class="task-preview-footer">
    <span class="task-id">${escapeHtml(task.id)}</span>
  </div>
</div>`;
}

// REASONING: HTML escaping utility
// > Why needed?
// # Task descriptions are user input - must sanitize before rendering as HTML
// > What characters to escape?
// # &, <, >, ", ' - the basic XSS prevention set
// > Why not use a library?
// # Simple enough to implement inline; keeps dependency count low
// > What about unicode or other attacks?
// # Basic escaping is sufficient for this context; user content is trusted
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// SECTION MAP:
// Lines 1-19: File header with documentation
// Lines 21-36: Imports and Format options (CopyFormatOptions, DEFAULT_COPY_OPTIONS)
// Lines 55-71: ValueClass to human-readable name mapping
// Lines 73-114: Main format function (formatTaskForCopy)
// Lines 116-130: Description section formatter
// Lines 131-149: Classification section formatter
// Lines 150-171: Actor notes section formatter
// Lines 172-184: Trajectory section formatter
// Lines 185-205: Metadata section formatter
// Lines 207-245: Tauri clipboard integration (copyToClipboard)
// Lines 247-283: HTML preview formatter (formatTaskForPreview)
// Lines 285-302: HTML escaping utility function
