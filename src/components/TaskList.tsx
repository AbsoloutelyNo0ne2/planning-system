/**
 * @fileoverview Task List Component - Vesper Theme
 * 
 * PURPOSE:
 * Displays sorted tasks in sections with Vesper "peppermint & orange" styling.
 * Applies per-type limit states and shows remaining counts.
 */

import type { JSX } from 'react';
import { Task } from '../types/task';
import { TaskItem } from './TaskItem';
import { useLimitStore } from '../stores/limitStore';

export interface TaskListProps {
  agenticTasks: Task[];
  nonAgenticTasks: Task[];
  hybridTasks: Task[];
  onTaskClick: (task: Task) => void;
  onCopyClick: (task: Task) => void;
  onSentClick: (task: Task) => Promise<void>;
}

export function TaskList(props: TaskListProps): JSX.Element {
  const {
    agenticTasks,
    nonAgenticTasks,
    hybridTasks,
    onTaskClick,
    onCopyClick,
    onSentClick
  } = props;

  const {
    isHybridLimitReached,
    isNonAgenticLimitReached,
    isAgenticLimitReached,
    hybridRemaining,
    nonAgenticRemaining,
    agenticRemaining,
  } = useLimitStore();

  return (
    <div className="task-list space-y-6 p-4" aria-label="Task list">
      <AgenticSection
        tasks={agenticTasks}
        isLimitReached={isAgenticLimitReached}
        remainingCount={agenticRemaining}
        onTaskClick={onTaskClick}
        onCopyClick={onCopyClick}
        onSentClick={onSentClick}
      />

      <HybridSection
        tasks={hybridTasks}
        isLimitReached={isHybridLimitReached}
        remainingCount={hybridRemaining}
        onTaskClick={onTaskClick}
        onCopyClick={onCopyClick}
        onSentClick={onSentClick}
      />

      <NonAgenticSection
        tasks={nonAgenticTasks}
        isLimitReached={isNonAgenticLimitReached}
        remainingCount={nonAgenticRemaining}
        onTaskClick={onTaskClick}
        onCopyClick={onCopyClick}
        onSentClick={onSentClick}
      />
    </div>
  );
}

function AgenticSection({
  tasks,
  isLimitReached,
  remainingCount,
  onTaskClick,
  onCopyClick,
  onSentClick
}: {
  tasks: Task[];
  isLimitReached: boolean;
  remainingCount: number;
  onTaskClick: (task: Task) => void;
  onCopyClick: (task: Task) => void;
  onSentClick: (task: Task) => Promise<void>;
}): JSX.Element {
  if (tasks.length === 0) return <EmptyAgenticState />;

	return (
	<section className="agentic-section space-y-3" aria-label="Agentic tasks">
		<div className="flex items-center justify-between">
			<h2
				className="text-lg font-semibold uppercase tracking-wide"
				style={{ color: 'var(--color-accent-400)' }}
			>
				AGENTIC TASKS
			</h2>
			<span
				className="text-xs font-medium px-2 py-1"
				style={{
					backgroundColor: 'var(--color-bg-elevated)',
					color: 'var(--color-accent-500)',
					border: '1px solid var(--color-accent-600)',
					borderRadius: '2px'
				}}
			>
				Unlimited
			</span>
		</div>
		<div className="grid gap-3">
			{tasks.map(task => (
				<TaskItem
					key={task.id}
					task={task}
					isLimitReached={isLimitReached}
					remainingCount={remainingCount}
					onClick={() => onTaskClick(task)}
					onCopy={() => onCopyClick(task)}
					onSent={() => onSentClick(task)}
				/>
			))}
		</div>
	</section>
);
}

function NonAgenticSection({
  tasks,
  isLimitReached,
  remainingCount,
  onTaskClick,
  onCopyClick,
  onSentClick
}: {
  tasks: Task[];
  isLimitReached: boolean;
  remainingCount: number;
  onTaskClick: (task: Task) => void;
  onCopyClick: (task: Task) => void;
  onSentClick: (task: Task) => Promise<void>;
}): JSX.Element {
  if (tasks.length === 0) return <EmptyNonAgenticState />;

	return (
	<section className="non-agentic-section space-y-3" aria-label="Non-agentic tasks">
		<div className="flex items-center justify-between">
			<h2
				className="text-lg font-semibold uppercase tracking-wide"
				style={{ color: 'var(--color-text-secondary)' }}
			>
				NON-AGENTIC TASKS
			</h2>
			<RemainingHeader count={remainingCount} isLimitReached={isLimitReached} />
		</div>
		<div style={{ display: 'grid', gap: '0.75rem' }}>
			{tasks.map(task => (
				<TaskItem
					key={task.id}
					task={task}
					isLimitReached={isLimitReached}
					remainingCount={remainingCount}
					onClick={() => onTaskClick(task)}
					onCopy={() => onCopyClick(task)}
					onSent={() => onSentClick(task)}
				/>
			))}
		</div>
	</section>
);
}

function HybridSection({
  tasks,
  isLimitReached,
  remainingCount,
  onTaskClick,
  onCopyClick,
  onSentClick
}: {
  tasks: Task[];
  isLimitReached: boolean;
  remainingCount: number;
  onTaskClick: (task: Task) => void;
  onCopyClick: (task: Task) => void;
  onSentClick: (task: Task) => Promise<void>;
}): JSX.Element {
  if (tasks.length === 0) return <EmptyHybridState />;

	return (
	<section className="hybrid-section space-y-3" aria-label="Hybrid tasks">
		<div className="flex items-center justify-between">
			<h2
				className="text-lg font-semibold uppercase tracking-wide"
				style={{ color: 'var(--color-accent-500)' }}
			>
				HYBRID TASKS
			</h2>
			<RemainingHeader count={remainingCount} isLimitReached={isLimitReached} />
		</div>
		<div style={{ display: 'grid', gap: '0.75rem' }}>
			{tasks.map(task => (
				<TaskItem
					key={task.id}
					task={task}
					isLimitReached={isLimitReached}
					remainingCount={remainingCount}
					onClick={() => onTaskClick(task)}
					onCopy={() => onCopyClick(task)}
					onSent={() => onSentClick(task)}
				/>
			))}
		</div>
	</section>
);
}

function RemainingHeader({ count, isLimitReached }: { count: number; isLimitReached: boolean }): JSX.Element {
	if (isLimitReached) {
		return (
			<span
				className="text-xs font-medium px-2 py-1"
				style={{
					backgroundColor: 'var(--color-bg-elevated)',
					color: 'var(--color-text-secondary)',
					border: '1px solid var(--color-border-default)',
					borderRadius: '2px'
				}}
			>
				Daily limit reached
			</span>
		);
	}

	const isLow = count <= 2;
	return (
		<span
			className="text-xs font-medium px-2 py-1"
			style={{
				backgroundColor: 'var(--color-bg-elevated)',
				color: isLow ? 'var(--color-accent-500)' : 'var(--color-text-secondary)',
				border: `1px solid ${isLow ? 'var(--color-accent-600)' : 'var(--color-border-default)'}`,
				borderRadius: '2px'
			}}
		>
			{count} remaining today
		</span>
	);
}

function EmptyAgenticState(): JSX.Element {
  return (
    <div 
      className="empty-state py-4 text-center text-sm"
      style={{ color: 'var(--color-text-muted)' }}
    >
      No agentic tasks
    </div>
  );
}

function EmptyNonAgenticState(): JSX.Element {
  return (
    <div 
      className="empty-state py-4 text-center text-sm"
      style={{ color: 'var(--color-text-muted)' }}
    >
      No non-agentic tasks
    </div>
  );
}

function EmptyHybridState(): JSX.Element {
  return (
    <div 
      className="empty-state py-4 text-center text-sm"
      style={{ color: 'var(--color-text-muted)' }}
    >
      No hybrid tasks
    </div>
  );
}
