/**
* @fileoverview App Component - Blue/Purple Theme
*
* PURPOSE:
* Root component for the Planning & Agent Dispatch System.
* Orchestrates layout with permanent 1/3 + 2/3 grid split.
*
* LAYOUT:
* - Header: 52px height, user badge, trajectory, logout
* - Left (1/3): Agents panel with actor list
* - Right (2/3): Task creation area with TaskInput and TaskList
*/

import { useState, useEffect } from 'react';
import { TaskInput } from './TaskInput';
import { TaskList } from './TaskList';
import { TaskEditModal } from './TaskEditModal';
import { TrajectoryEditor } from './TrajectoryEditor';
import { useTaskStore } from '../stores/taskStore';
import { useActorStore } from '../stores/actorStore';
import { useTrajectoryStore } from '../stores/trajectoryStore';
import { useLimitStore } from '../stores/limitStore';
import { Task } from '../types/task';
import { useAuth } from '../contexts/AuthContext';
import type { UserType } from '../types/auth';
import FluidBlobCanvas from './FluidBlobCanvas';
import { ColorSchemeSwitcher } from './ColorSchemeSwitcher';
import { useColorScheme, COLOR_SCHEMES } from '../contexts/ColorSchemeContext';

export type ViewMode = 'input' | 'plan';

export interface AppProps {
  userType: UserType | null;
}

export function App({ userType }: AppProps): JSX.Element {
  const { logout } = useAuth();
  const { currentScheme, setScheme } = useColorScheme();
  const [viewMode, setViewMode] = useState<ViewMode>('input');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTrajectoryEditorOpen, setIsTrajectoryEditorOpen] = useState(false);

  // Get the base hue from the current color scheme
  const scheme = COLOR_SCHEMES[currentScheme.id as keyof typeof COLOR_SCHEMES];
  const baseHue = scheme?.blob?.baseHue ?? 280;

const { loadFromStorage, updateTask, markTaskSent, setUserType, getSortedTasks } = useTaskStore();

// Sort all tasks first, then filter by type
const sortedTasks = getSortedTasks();
const agenticTasks = sortedTasks.filter(t => t.type === 'agentic');
const nonAgenticTasks = sortedTasks.filter(t => t.type === 'non-agentic');
const hybridTasks = sortedTasks.filter(t => t.type === 'hybrid');
  const { actors, addActor, removeActor, loadFromStorage: loadActors } = useActorStore();
  const { trajectory, setTrajectory, updateTrajectory, loadFromStorage: loadTrajectory, setUserType: setTrajectoryUserType } = useTrajectoryStore();
  const { loadFromStorage: loadLimit } = useLimitStore();

  useEffect(() => {
    if (userType) {
      setUserType(userType);
      setTrajectoryUserType(userType);
      loadFromStorage();
    }
    loadActors();
    loadTrajectory();
    loadLimit();
  }, [userType]);

  const handleTaskCreated = () => setViewMode('plan');

  const handleTaskClick = (task: Task) => {
    setEditingTask(task);
    setIsEditModalOpen(true);
  };

  const handleEditClose = () => {
    setIsEditModalOpen(false);
    setEditingTask(null);
  };

  const handleEditSave = (taskId: string, updates: Partial<Task>) => {
    updateTask(taskId, updates);
  };

  const handleCopyClick = () => {};

  const handleSentClick = async (task: Task) => {
    await markTaskSent(task.id);
  };

  const handleAddActor = () => {
    const name = window.prompt('Enter actor name:');
    if (name && name.trim()) addActor(name.trim());
  };

  const handleRemoveActor = () => {
    if (actors.length === 0) {
      window.alert('No actors to remove');
      return;
    }
    const lastActor = actors[actors.length - 1];
    removeActor(lastActor.id);
  };

  const handleTrajectoryClick = () => setIsTrajectoryEditorOpen(true);

  const handleTrajectorySave = async (text: string) => {
    if (trajectory) await updateTrajectory(text);
    else await setTrajectory(text);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header - 52px height - sticky */}
      <header
        className="px-4 py-3 border-b flex items-center justify-between sticky top-0 z-50"
        style={{
          height: '52px',
          borderColor: 'var(--color-border-default)',
          backgroundColor: 'var(--color-bg-surface)'
        }}
      >
        {/* User Type Badge */}
        <div className="flex items-center gap-2">
          <span
            className="px-2 py-1 text-xs font-medium rounded"
            style={{
              backgroundColor: userType === 'personal' ? 'var(--color-mint-700)' : 'var(--color-accent-700)',
              color: 'var(--color-bg-base)'
            }}
          >
            {userType === 'personal' ? 'Personal' : 'Showcase'}
          </span>
        </div>

        {/* Trajectory Text */}
        <button
          onClick={handleTrajectoryClick}
          className="flex-1 text-center group cursor-pointer mx-4"
          aria-label={trajectory ? 'Edit trajectory' : 'Set trajectory'}
        >
          <span
            className="text-sm font-medium transition-colors group-hover:text-[var(--color-accent-400)]"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {trajectory?.text || (
              <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                No trajectory set — Click to edit
              </span>
            )}
          </span>
        </button>

{/* Color Scheme Switcher + Logout */}
<div className="flex items-center gap-2">
  <ColorSchemeSwitcher
    currentSchemeId={currentScheme.id}
    onSchemeChange={(scheme) => setScheme(scheme.id as any)}
  />
  <button
    onClick={logout}
    className="radial-glow px-3 py-1.5 text-sm rounded font-medium transition-colors duration-300 relative overflow-hidden"
    style={{
      backgroundColor: 'transparent',
      color: 'var(--color-text-secondary)',
      border: '1px solid var(--color-border-default)',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.color = 'var(--color-error-text)';
      e.currentTarget.style.borderColor = 'var(--color-error-border)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.color = 'var(--color-text-secondary)';
      e.currentTarget.style.borderColor = 'var(--color-border-default)';
    }}
    onMouseMove={(e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      e.currentTarget.style.setProperty('--x', x + '%');
      e.currentTarget.style.setProperty('--y', y + '%');
    }}
  >
    Logout
  </button>
</div>
</header>

      {/* Main content - permanent 1/3 + 2/3 split */}
      <main className="flex-1 grid grid-cols-1 md:grid-cols-3">
{/* LEFT: Agents Panel (1/3) */}
      <div
        className="md:col-span-1 border-r p-4 md:sticky md:top-[52px] md:h-[calc(100vh-52px)] overflow-auto relative pointer-events-none"
        style={{
          borderColor: 'var(--color-border-default)',
          backgroundColor: 'var(--color-bg-surface)'
        }}
      >
        {/* Fluid blob background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-auto">
          <FluidBlobCanvas positionsPreset="agents" baseHue={baseHue} />
          {/* Dark overlay for readability */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'rgba(12, 15, 26, 0.6)' }}
          />
        </div>

{/* Content on top - pointer events none by default, interactive elements have pointer-events-auto */}
        <div className="relative z-10 pointer-events-none">
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-sm font-medium"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Agents
            </h2>
<div className="flex gap-1">
              <button
                onClick={handleAddActor}
                className="radial-glow px-2 py-1 text-xs rounded font-medium transition-all pointer-events-auto"
                style={{
                  backgroundColor: 'var(--color-bg-elevated)',
                  color: 'var(--color-text-primary)',
                  border: '1px solid var(--color-border-default)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-bg-elevated)';
                }}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = ((e.clientX - rect.left) / rect.width) * 100;
                  const y = ((e.clientY - rect.top) / rect.height) * 100;
                  e.currentTarget.style.setProperty('--x', x + '%');
                  e.currentTarget.style.setProperty('--y', y + '%');
                }}
>
                +Add
              </button>
              <button
                onClick={handleRemoveActor}
                className="radial-glow px-2 py-1 text-xs rounded font-medium transition-all pointer-events-auto"
                style={{
                  backgroundColor: 'var(--color-bg-elevated)',
                  color: 'var(--color-error-text)',
                  border: '1px solid var(--color-error-border)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-error-bg)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-bg-elevated)';
                }}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = ((e.clientX - rect.left) / rect.width) * 100;
                  const y = ((e.clientY - rect.top) / rect.height) * 100;
                  e.currentTarget.style.setProperty('--x', x + '%');
                  e.currentTarget.style.setProperty('--y', y + '%');
                }}
              >
-Remove
</button>
</div>
</div>

{actors.length === 0 ? (
<p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
No actors configured
</p>
) : (
<div className="space-y-2">
{actors.map(actor => (
<div
key={actor.id}
className="flex items-center gap-2 p-2 rounded"
style={{ backgroundColor: 'var(--color-bg-elevated)' }}
>
<span style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>
{actor.name}
</span>
{actor.notes && (
<span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
— {actor.notes}
</span>
)}
</div>
))}
</div>
)}
</div>
</div>

        {/* RIGHT: Task Creation (2/3) */}
        <div
          className="md:col-span-2 p-6"
          style={{ backgroundColor: 'var(--color-bg-base)' }}
        >
          {/* Task Input */}
          {viewMode === 'input' && (
            <div className="mb-6">
              <TaskInput onTaskCreated={handleTaskCreated} />
            </div>
          )}

          {/* Task List */}
          <TaskList
            agenticTasks={agenticTasks}
            nonAgenticTasks={nonAgenticTasks}
            hybridTasks={hybridTasks}
            onTaskClick={handleTaskClick}
            onCopyClick={handleCopyClick}
            onSentClick={handleSentClick}
          />

{/* Bottom Actions */}
        <div className="mt-6 flex gap-2 justify-center flex-wrap">
          <button
            onClick={() => setViewMode('input')}
            className="radial-glow px-4 py-2 rounded font-medium transition-all"
            style={{
              backgroundColor: 'var(--color-accent-600)',
              color: 'var(--color-bg-base)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-accent-500)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-accent-600)';
            }}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = ((e.clientX - rect.left) / rect.width) * 100;
              const y = ((e.clientY - rect.top) / rect.height) * 100;
              e.currentTarget.style.setProperty('--x', x + '%');
              e.currentTarget.style.setProperty('--y', y + '%');
            }}
          >
            New task
          </button>
          <button
            onClick={() => setViewMode('plan')}
            className="radial-glow px-4 py-2 rounded font-medium transition-all"
            style={{
              backgroundColor: 'transparent',
              color: 'var(--color-text-secondary)',
              border: '1px solid var(--color-border-default)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-bg-elevated)';
              e.currentTarget.style.color = 'var(--color-text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--color-text-secondary)';
            }}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = ((e.clientX - rect.left) / rect.width) * 100;
              const y = ((e.clientY - rect.top) / rect.height) * 100;
              e.currentTarget.style.setProperty('--x', x + '%');
              e.currentTarget.style.setProperty('--y', y + '%');
            }}
          >
            Cancel New task
          </button>
        </div>
        </div>
      </main>

      {/* Modals */}
      <TaskEditModal
        task={editingTask}
        isOpen={isEditModalOpen}
        onClose={handleEditClose}
        onSave={handleEditSave}
      />

      <TrajectoryEditor
        isOpen={isTrajectoryEditorOpen}
        currentText={trajectory?.text || null}
        onClose={() => setIsTrajectoryEditorOpen(false)}
        onSave={handleTrajectorySave}
      />
    </div>
  );
}
