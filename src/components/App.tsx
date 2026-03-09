/**
 * @fileoverview App Component - Vesper Theme
 *
 * PURPOSE:
 * Root component for the Planning & Agent Dispatch System.
 * Orchestrates layout with Vesper "peppermint & orange" dark theme.
 *
 * LAYER STATUS: Layer 1-5 Complete - Vesper Theme Applied
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

export type ViewMode = 'input' | 'plan';

export interface AppProps {
  userType: UserType | null;
}

export function App({ userType }: AppProps): JSX.Element {
  const { logout } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('input');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTrajectoryEditorOpen, setIsTrajectoryEditorOpen] = useState(false);

  const { tasks, loadFromStorage, updateTask, markTaskSent, setUserType } = useTaskStore();

  const agenticTasks = tasks.filter(t => t.type === 'agentic');
  const nonAgenticTasks = tasks.filter(t => t.type === 'non-agentic');
  const hybridTasks = tasks.filter(t => t.type === 'hybrid');
  const { actors, addActor, removeActor, loadFromStorage: loadActors } = useActorStore();
  const { trajectory, setTrajectory, updateTrajectory, loadFromStorage: loadTrajectory } = useTrajectoryStore();
  const { loadFromStorage: loadLimit } = useLimitStore();

  useEffect(() => {
    if (userType) {
      setUserType(userType);
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
    <div
      className="min-h-screen"
      style={{
        backgroundColor: 'var(--color-bg-base)',
        color: 'var(--color-text-primary)'
      }}
    >
      {/* Trajectory Header */}
      <header
        className="p-4 border-b"
        style={{
          backgroundColor: 'var(--color-bg-surface)',
          borderColor: 'var(--color-border-subtle)'
        }}
      >
        <div className="flex items-center justify-between">
          {/* User Type Indicator */}
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
            <h1
              className="text-xl font-semibold transition-colors"
              style={{ color: 'var(--color-text-primary)' }}
            >
              <span
                className="group-hover:text-[var(--color-accent-400)] transition-colors"
              >
                {trajectory?.text || (
                  <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                    No trajectory set — Click to edit
                  </span>
                )}
              </span>
            </h1>
          </button>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="px-3 py-1.5 text-sm rounded font-medium transition-all"
            style={{
              backgroundColor: 'transparent',
              color: 'var(--color-text-secondary)',
              border: '1px solid var(--color-border-subtle)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--color-error-text)';
              e.currentTarget.style.borderColor = 'var(--color-error-border)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--color-text-secondary)';
              e.currentTarget.style.borderColor = 'var(--color-border-subtle)';
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Actor Table */}
      <section className="p-4">
        <div 
          className="rounded-lg p-4"
          style={{ 
            backgroundColor: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border-subtle)'
          }}
        >
          <h2 
            className="text-lg font-semibold mb-3"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Actors
          </h2>
          {actors.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
              No actors configured
            </p>
          ) : (
            <div className="space-y-2">
              {actors.slice(0, 5).map(actor => (
                <div 
                  key={actor.id} 
                  className="flex items-center gap-2 p-2 rounded"
                  style={{ backgroundColor: 'var(--color-bg-elevated)' }}
                >
                  <span style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>
                    {actor.name}
                  </span>
                  {actor.notes && (
                    <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                      — {actor.notes}
                    </span>
                  )}
                </div>
              ))}
              {actors.length > 5 && (
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                  +{actors.length - 5} more actors...
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Task Input */}
      <section className="p-4">
        {viewMode === 'input' && (
          <TaskInput onTaskCreated={handleTaskCreated} />
        )}
      </section>

      {/* Task List */}
      <section className="p-4">
        <TaskList
          agenticTasks={agenticTasks}
          nonAgenticTasks={nonAgenticTasks}
          hybridTasks={hybridTasks}
          onTaskClick={handleTaskClick}
          onCopyClick={handleCopyClick}
          onSentClick={handleSentClick}
        />
      </section>

      {/* Bottom Actions */}
      <section 
        className="p-4 border-t"
        style={{ 
          backgroundColor: 'var(--color-bg-surface)',
          borderColor: 'var(--color-border-subtle)'
        }}
      >
        <div className="flex gap-2 justify-center flex-wrap">
          <button
            onClick={() => setViewMode('input')}
            className="px-4 py-2 rounded font-medium transition-all"
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
          >
            New task
          </button>
          <button
            onClick={() => setViewMode('plan')}
            className="px-4 py-2 rounded font-medium transition-all"
            style={{ 
              backgroundColor: 'var(--color-mint-700)',
              color: 'var(--color-bg-base)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-mint-600)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-mint-700)';
            }}
          >
            Cancel New task
          </button>
          <button
            onClick={handleAddActor}
            className="px-4 py-2 rounded font-medium transition-all"
            style={{ 
              backgroundColor: 'var(--color-bg-elevated)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border-default)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)';
              e.currentTarget.style.borderColor = 'var(--color-border-focus)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-bg-elevated)';
              e.currentTarget.style.borderColor = 'var(--color-border-default)';
            }}
          >
            +Actor
          </button>
          <button
            onClick={handleRemoveActor}
            className="px-4 py-2 rounded font-medium transition-all"
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
          >
            -Actor
          </button>
        </div>
      </section>

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
