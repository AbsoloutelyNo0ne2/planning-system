/**
* @fileoverview Task Edit Modal Component
*
* PURPOSE:
* Modal dialog for editing existing tasks. Opens when user clicks on a task.
* Provides form fields for all editable task properties.
*
* LAYER STATUS: Layer 4 Complete
* NEXT: Layer 5 - Section maps and polish
*
* DESIGN: Technical Precision Theme
* - Sharp corners (2-4px border-radius)
* - No glow effects
* - CSS variables for colors
*/

import * as React from 'react';
import { Task, ValueClass, TaskType } from '../types/task';
import { ActorId } from '../types/actor';
import { useActorStore } from '../stores/actorStore';

// SECTION: Component Props
// Lines 20-35: TaskEditModal props
export interface TaskEditModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskId: string, updates: Partial<Task>) => void;
}

// SECTION: Component
// Lines 38-280: TaskEditModal component
/**
* TaskEditModal - Edit existing tasks
*
* LAYOUT:
* ┌─────────────────────────────────────────────┐
* │ Edit Task [X]                               │
* ├─────────────────────────────────────────────┤
* │ Description: [textarea]                     │
* │ Value Class: [dropdown]                     │
* │ Type: [Agentic/Non-Agentic radio]           │
* │ Trajectory Match: [0-100 slider]            │
* │ Creation Time: [locked display]             │
* │                                             │
* │ Actor Notes:                                │
* │ [Actor 1]: [input]                          │
* │ [Actor 2]: [input]                          │
* ├─────────────────────────────────────────────┤
* │ [Cancel] [Save Changes]                     │
* └─────────────────────────────────────────────┘
*
* EDITABLE FIELDS:
* - description: Task description text
* - valueClass: Priority classification
* - type: Agentic or non-agentic
* - trajectoryMatch: 0-100 alignment percentage
* - actorNotes: Per-actor progress notes
*
* LOCKED FIELDS:
* - creationTime: Immutable task creation timestamp
* - id: Immutable unique identifier
*/
export function TaskEditModal(props: TaskEditModalProps): JSX.Element | null {
  const { task, isOpen, onClose, onSave } = props;
  const { actors } = useActorStore();

  // REASONING: Local form state to manage edits before saving
  // Using separate state for each field enables controlled inputs
  const [description, setDescription] = React.useState('');
  const [valueClass, setValueClass] = React.useState<ValueClass>(ValueClass.FUN_USEFUL);
  const [type, setType] = React.useState<TaskType>(TaskType.AGENTIC);
  const [trajectoryMatch, setTrajectoryMatch] = React.useState(50);
  const [actorNotes, setActorNotes] = React.useState<Record<ActorId, string>>({});

  // REASONING: Initialize form state when task changes or modal opens
  // This ensures form always reflects current task data
  React.useEffect(() => {
    if (task && isOpen) {
      setDescription(task.description);
      setValueClass(task.valueClass);
      setType(task.type);
      setTrajectoryMatch(task.trajectoryMatch);
      setActorNotes({ ...task.actorNotes });
    }
  }, [task, isOpen]);

  // REASONING: Early return if modal is closed or no task selected
  if (!isOpen || !task) {
    return null;
  }

  // REASONING: Handle save by collecting all form values into updates object
  // Only include changed fields in update, though store handles full partial
  const handleSave = (): void => {
    onSave(task.id, {
      description,
      valueClass,
      type,
      trajectoryMatch,
      actorNotes,
    });
    onClose();
  };

  // REASONING: Handle cancel by resetting form and closing
  const handleCancel = (): void => {
    onClose();
  };

  // REASONING: Update actor note for specific actor
  const handleActorNoteChange = (actorId: ActorId, note: string): void => {
    setActorNotes((prev) => ({
      ...prev,
      [actorId]: note,
    }));
  };

  // REASONING: Close on backdrop click but not when clicking modal content
  const handleBackdropClick = (e: React.MouseEvent): void => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

	return (
	<div
		className="fixed inset-0 flex items-center justify-center z-[var(--z-modal)]"
		onClick={handleBackdropClick}
		role="dialog"
		aria-modal="true"
		aria-labelledby="edit-task-title"
		style={{
			backgroundColor: 'rgba(12, 15, 26, 0.9)',
		}}
	>
		<div
			className="w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
			style={{
				backgroundColor: 'var(--color-bg-surface)',
				border: '1px solid var(--color-border-default)',
				borderRadius: '4px',
			}}
		>
	{/* Header */}
		<div
			className="flex items-center justify-between p-4"
			style={{
				borderBottom: '1px solid var(--color-border-default)',
			}}
		>
          <h2
            id="edit-task-title"
            className="text-lg font-semibold"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Edit Task
          </h2>
          <button
            onClick={onClose}
            className="transition-colors"
            style={{
              color: 'var(--color-text-muted)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-text-secondary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-muted)'}
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Form */}
        <div className="p-4 space-y-4">
          {/* Description Field */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium mb-1"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="vesper-input w-full"
              style={{
                backgroundColor: 'var(--color-bg-input)',
                border: '1px solid var(--color-border-default)',
                borderRadius: '3px',
                color: 'var(--color-text-primary)',
                padding: 'var(--space-3) var(--space-4)',
              }}
            />
          </div>

          {/* Value Class Dropdown */}
          <div>
            <label
              htmlFor="valueClass"
              className="block text-sm font-medium mb-1"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Value Class
            </label>
            <select
              id="valueClass"
              value={valueClass}
              onChange={(e) => setValueClass(Number(e.target.value) as ValueClass)}
              className="vesper-input w-full"
              style={{
                backgroundColor: 'var(--color-bg-input)',
                border: '1px solid var(--color-border-default)',
                borderRadius: '3px',
                color: 'var(--color-text-primary)',
                padding: 'var(--space-3) var(--space-4)',
              }}
            >
              <option value={ValueClass.FUN_USEFUL}>Fun &amp; Useful (1)</option>
              <option value={ValueClass.USEFUL}>Useful (2)</option>
              <option value={ValueClass.HAS_TO_BE_DONE}>Has to be done (3)</option>
              <option value={ValueClass.HAS_TO_BE_DONE_BORING}>Has to be done (Boring) (4)</option>
              <option value={ValueClass.FUN_USELESS}>Fun but Useless (5)</option>
              <option value={ValueClass.BORING_USELESS}>Boring &amp; Useless (6)</option>
            </select>
          </div>

          {/* Type Radio */}
          <div>
            <span
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Type
            </span>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="type"
                  value={TaskType.AGENTIC}
                  checked={type === TaskType.AGENTIC}
                  onChange={() => setType(TaskType.AGENTIC)}
                  className="h-4 w-4"
                  style={{
                    accentColor: 'var(--color-accent-500)',
                  }}
                />
                <span
                  className="ml-2 text-sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  Agentic
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="type"
                  value={TaskType.NON_AGENTIC}
                  checked={type === TaskType.NON_AGENTIC}
                  onChange={() => setType(TaskType.NON_AGENTIC)}
                  className="h-4 w-4"
                  style={{
                    accentColor: 'var(--color-accent-500)',
                  }}
                />
                <span
                  className="ml-2 text-sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  Non-Agentic
                </span>
              </label>
            </div>
          </div>

          {/* Trajectory Match Slider */}
          <div>
            <label
              htmlFor="trajectoryMatch"
              className="block text-sm font-medium mb-1"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Trajectory Match: {trajectoryMatch}%
            </label>
            <input
              id="trajectoryMatch"
              type="range"
              min="0"
              max="100"
              value={trajectoryMatch}
              onChange={(e) => setTrajectoryMatch(Number(e.target.value))}
              className="vesper-slider"
            />
          </div>

          {/* Creation Time (Locked) */}
          <div>
            <span
              className="block text-sm font-medium mb-1"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Creation Time (Locked)
            </span>
            <div
              className="text-sm"
              style={{
                backgroundColor: 'var(--color-bg-base)',
                color: 'var(--color-text-muted)',
                borderRadius: '3px',
                padding: 'var(--space-3) var(--space-4)',
              }}
            >
              {new Date(task.creationTime).toLocaleString()}
            </div>
          </div>

          {/* Actor Notes */}
          <div>
            <span
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Actor Notes
            </span>
            <div className="space-y-2">
              {actors.length === 0 ? (
                <p
                  className="text-sm italic"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  No actors configured
                </p>
              ) : (
                actors.map((actor) => (
                  <div key={actor.id} className="flex items-center gap-2">
                    <span
                      className="text-sm font-medium w-24 truncate"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      {actor.name}:
                    </span>
                    <input
                      type="text"
                      value={actorNotes[actor.id] || ''}
                      onChange={(e) => handleActorNoteChange(actor.id, e.target.value)}
                      placeholder="Add note..."
                      className="flex-1 text-sm"
                      style={{
                        backgroundColor: 'var(--color-bg-input)',
                        border: '1px solid var(--color-border-default)',
                        borderRadius: '3px',
                        color: 'var(--color-text-primary)',
                        padding: 'var(--space-2) var(--space-3)',
                      }}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div
          className="flex justify-end gap-3 p-4"
          style={{
            borderTop: '1px solid var(--color-border-subtle)',
          }}
        >
          <button
            onClick={handleCancel}
            className="vesper-btn vesper-btn-secondary"
            style={{
              borderRadius: '2px',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="vesper-btn vesper-btn-primary"
            style={{
              borderRadius: '2px',
            }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// SECTION MAP:
// Lines 1-17: File header
// Lines 20-35: Props interface (TaskEditModalProps)
// Lines 38-60: Component documentation
// Lines 61-280: Main component (TaskEditModal)
// Lines 65-85: State initialization
// Lines 87-92: Early return
// Lines 94-115: Event handlers
// Lines 117-280: JSX markup
// Lines 130-150: Description field
// Lines 152-175: Value class dropdown
// Lines 177-207: Type radio buttons
// Lines 209-225: Trajectory match slider
// Lines 227-234: Creation time (locked)
// Lines 236-256: Actor notes section
// Lines 258-278: Action buttons
// Lines 280+: Section map
// LAYER STATUS: Layer 4 Complete (End of file - total 320 lines)
