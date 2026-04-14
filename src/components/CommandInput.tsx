/**
 * @fileoverview Command Input - Single-line task entry
 * 
 * PURPOSE:
 * Frictionless task entry with instant submission.
 * User types task, hits Enter, task is created instantly.
 * No multi-step flow, no sliders during entry.
 */

import React, { useState, useRef, useEffect } from 'react';
import { useTaskStore } from '../stores/taskStore';
import { createTask, ValueClass, TaskType } from '../types/task';

export interface CommandInputProps {
  onTaskCreated: () => void;
}

export function CommandInput({ onTaskCreated }: CommandInputProps): JSX.Element {
  const [value, setValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const addTask = useTaskStore((state) => state.addTask);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    
    const trimmed = value.trim();
    if (!trimmed) return;

    // Create task instantly with defaults
    // Value class and type can be edited later if needed
    const newTask = createTask(
      trimmed,
      ValueClass.USEFUL, // Default value class
      TaskType.AGENTIC,  // Default type
      50,                // Default trajectory match
      {}                 // No actor notes initially
    );

    addTask(newTask);
    setValue('');
    onTaskCreated();
    
    // Keep focus for rapid entry
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div
      className="w-full max-w-2xl mx-auto"
      style={{
        backgroundColor: 'var(--color-bg-surface)',
        border: isFocused 
          ? '2px solid var(--color-accent-500)' 
          : '1px solid var(--color-border-default)',
        borderRadius: '4px',
        transition: 'border-color 150ms ease',
      }}
    >
      <form onSubmit={handleSubmit} className="flex items-center gap-3 p-4">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Add a new task... (Press Enter to submit)"
          className="flex-1 bg-transparent outline-none text-sm"
          style={{
            color: 'var(--color-text-primary)',
          }}
          autoFocus
        />
        
        <button
          type="submit"
          disabled={!value.trim()}
          className="px-4 py-2 text-sm font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: value.trim() 
              ? 'var(--color-accent-600)' 
              : 'var(--color-bg-elevated)',
            color: value.trim() ? '#ffffff' : 'var(--color-text-muted)',
          }}
        >
          Add
        </button>
      </form>
      
      {/* Helper text */}
      <div
        className="px-4 pb-3 text-xs"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        Press <kbd style={{ fontFamily: 'monospace', padding: '2px 6px', backgroundColor: 'var(--color-bg-elevated)', borderRadius: '2px' }}>Enter</kbd> to create task instantly
      </div>
    </div>
  );
}
