/**
 * @fileoverview Task Item Component - Vesper Theme
 * 
 * PURPOSE:
 * Displays a single task with Vesper "peppermint & orange" styling.
 * Handles click interactions and disabled states.
 */

import * as React from 'react';
import { Task, TaskType } from '../types/task';
import { useLimitStore, limitStoreInstance } from '../stores/limitStore';
import { useActorStore } from '../stores/actorStore';

export interface TaskItemProps {
  task: Task;
  isLimitReached: boolean;
  remainingCount: number;
  onClick: (task: Task) => void;
  onCopy: (task: Task) => void;
  onSent: (task: Task) => Promise<void>;
}

function ActorNotesDisplay({ actorNotes }: { actorNotes: Record<string, string> }): JSX.Element | null {
  const { actors } = useActorStore();

  const notesWithActors = Object.entries(actorNotes)
    .filter(([, note]) => note.trim().length > 0)
    .map(([actorId, note]) => ({
      actor: actors.find(a => a.id === actorId),
      note,
    }))
    .filter(({ actor }) => actor !== undefined);

  if (notesWithActors.length === 0) return null;

  return (
    <div 
      className="actor-notes mt-2 pt-2"
      style={{ borderTop: '1px solid var(--color-border-subtle)' }}
    >
      <div 
        className="text-xs font-medium mb-1"
        style={{ color: 'var(--color-text-muted)' }}
      >
        Actor Notes:
      </div>
      <div className="space-y-1">
        {notesWithActors.map(({ actor, note }) => (
          <div key={actor!.id} className="flex items-start gap-2 text-sm">
            <span 
              className="font-medium whitespace-nowrap"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {actor!.name}:
            </span>
            <span style={{ color: 'var(--color-text-muted)' }}>{note}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TaskItem(props: TaskItemProps): JSX.Element {
  const { task, isLimitReached, remainingCount, onClick, onCopy, onSent } = props;

  const handleClick = (): void => {
    if (!isLimitReached) onClick(task);
  };

  const showRemaining = task.type !== TaskType.AGENTIC && remainingCount < Infinity;
  const isUnlimited = task.type === TaskType.AGENTIC;

  return (
    <div
      className="task-item flex flex-col p-3 mb-2 rounded-lg cursor-pointer transition-all"
      style={{
        backgroundColor: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border-subtle)',
        opacity: isLimitReached ? 0.5 : 1
      }}
      onClick={handleClick}
      onMouseEnter={(e) => {
        if (!isLimitReached) {
          e.currentTarget.style.backgroundColor = 'var(--color-bg-elevated)';
          e.currentTarget.style.borderColor = 'var(--color-border-default)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--color-bg-surface)';
        e.currentTarget.style.borderColor = 'var(--color-border-subtle)';
      }}
    >
      <div className="flex items-center justify-between w-full">
        <span 
          className="task-description flex-1 pr-4 break-all overflow-wrap-anywhere"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {task.description}
        </span>

        <div className="flex items-center gap-3 shrink-0">
          {showRemaining && <RemainingBadge count={remainingCount} isLimitReached={isLimitReached} />}
          {isUnlimited && <UnlimitedBadge />}
          
          <div className="flex gap-2">
            <CopyButton task={task} onCopy={onCopy} disabled={isLimitReached} />
            <SentButton onClick={() => onSent(task)} disabled={isLimitReached} />
          </div>
        </div>
      </div>

      <ActorNotesDisplay actorNotes={task.actorNotes} />
    </div>
  );
}

function RemainingBadge({ count, isLimitReached }: { count: number; isLimitReached: boolean }): JSX.Element {
  if (isLimitReached) {
    return (
      <span 
        className="text-xs font-medium px-2 py-1 rounded"
        style={{ 
          backgroundColor: 'var(--color-error-bg)',
          color: 'var(--color-error-text)',
          border: '1px solid var(--color-error-border)'
        }}
      >
        Limit reached
      </span>
    );
  }
  
  const isLow = count <= 2;
  return (
    <span 
      className="text-xs font-medium px-2 py-1 rounded"
      style={{ 
        backgroundColor: isLow ? 'var(--color-warning-bg)' : 'var(--color-info-bg)',
        color: isLow ? 'var(--color-warning-text)' : 'var(--color-info-text)',
        border: `1px solid ${isLow ? 'var(--color-warning-border)' : 'var(--color-info-border)'}`
      }}
    >
      {count} remaining
    </span>
  );
}

function UnlimitedBadge(): JSX.Element {
  return (
    <span 
      className="text-xs font-medium px-2 py-1 rounded"
      style={{ 
        backgroundColor: 'var(--color-success-bg)',
        color: 'var(--color-success-text)',
        border: '1px solid var(--color-success-border)'
      }}
    >
      Unlimited
    </span>
  );
}

function CopyButton({
  task,
  onCopy,
  disabled,
}: {
  task: Task;
  onCopy: (task: Task) => void;
  disabled: boolean;
}): JSX.Element {
  const showLimitNotification = useLimitStore((state) => state.showLimitNotification);
  const [copied, setCopied] = React.useState(false);

  const handleClick = async (e: React.MouseEvent): Promise<void> => {
    e.stopPropagation();
    if (disabled) {
      showLimitNotification();
      return;
    }
    try {
      await navigator.clipboard.writeText(task.description);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onCopy(task);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className="px-3 py-1 text-sm font-medium rounded transition-all"
      style={{
        backgroundColor: disabled 
          ? 'var(--color-bg-elevated)' 
          : copied 
            ? 'var(--color-success-bg)' 
            : 'var(--color-accent-600)',
        color: disabled 
          ? 'var(--color-text-disabled)' 
          : copied 
            ? 'var(--color-success-text)' 
            : 'var(--color-bg-base)',
        border: disabled ? '1px solid var(--color-border-subtle)' : 'none',
        cursor: disabled ? 'not-allowed' : 'pointer'
      }}
      onMouseEnter={(e) => {
        if (!disabled && !copied) {
          e.currentTarget.style.backgroundColor = 'var(--color-accent-500)';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !copied) {
          e.currentTarget.style.backgroundColor = 'var(--color-accent-600)';
        }
      }}
      aria-disabled={disabled}
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

function SentButton({
  onClick,
  disabled,
}: {
  onClick: () => Promise<void>;
  disabled: boolean;
}): JSX.Element {
  const showLimitNotification = useLimitStore((state) => state.showLimitNotification);
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handleClick = async (e: React.MouseEvent): Promise<void> => {
    e.stopPropagation();
    if (disabled) {
      showLimitNotification();
      return;
    }
    setIsProcessing(true);
    try {
      await onClick();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isProcessing}
      className="px-3 py-1 text-sm font-medium rounded transition-all"
      style={{
        backgroundColor: disabled || isProcessing 
          ? 'var(--color-bg-elevated)' 
          : 'var(--color-mint-700)',
        color: disabled || isProcessing 
          ? 'var(--color-text-disabled)' 
          : 'var(--color-bg-base)',
        border: disabled || isProcessing ? '1px solid var(--color-border-subtle)' : 'none',
        cursor: disabled || isProcessing ? 'not-allowed' : 'pointer'
      }}
      onMouseEnter={(e) => {
        if (!disabled && !isProcessing) {
          e.currentTarget.style.backgroundColor = 'var(--color-mint-600)';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !isProcessing) {
          e.currentTarget.style.backgroundColor = 'var(--color-mint-700)';
        }
      }}
      aria-disabled={disabled || isProcessing}
    >
      {isProcessing ? 'On it' : 'Sent'}
    </button>
  );
}

export function handleDisabledButtonClick(): void {
  const { showLimitNotification } = limitStoreInstance.getState();
  showLimitNotification();
}
