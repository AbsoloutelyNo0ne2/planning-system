/**
 * @fileoverview TrajectoryEditor Component - Vesper Theme
 *
 * PURPOSE:
 * Modal component for editing trajectory with Vesper "peppermint & orange" styling.
 */

import { useState, useEffect } from 'react';

export interface TrajectoryEditorProps {
  isOpen: boolean;
  currentText: string | null;
  onClose: () => void;
  onSave: (text: string) => Promise<void>;
}

export function TrajectoryEditor({
  isOpen,
  currentText,
  onClose,
  onSave,
}: TrajectoryEditorProps): JSX.Element | null {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setText(currentText || '');
      setError(null);
    }
  }, [isOpen, currentText]);

  if (!isOpen) return null;

  const handleSave = async () => {
    const trimmed = text.trim();
    if (trimmed.length === 0) {
      setError('Trajectory text is required');
      return;
    }
    setIsSaving(true);
    try {
      await onSave(trimmed);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: 'oklch(8% 0.02 260 / 0.85)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="trajectory-editor-title"
    >
      <div
        className="rounded-lg p-6 w-full max-w-lg mx-4"
        style={{ 
          backgroundColor: 'var(--color-bg-surface)',
          border: '1px solid var(--color-border-default)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="trajectory-editor-title"
          className="text-xl font-bold mb-4"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Edit Trajectory
        </h2>

        <p 
          className="text-sm mb-4"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Define your long-term goal. Use &gt; to chain steps:
          <br />
          <code 
            className="px-2 py-1 rounded text-xs"
            style={{ 
              backgroundColor: 'var(--color-bg-elevated)',
              color: 'var(--color-mint-400)'
            }}
          >
            Make X &gt; Use X to make Y &gt; Deliver Z
          </code>
        </p>

        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setError(null);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Enter your trajectory..."
          className="w-full h-32 p-3 rounded resize-none outline-none transition-all"
          style={{
            backgroundColor: 'var(--color-bg-input)',
            border: '1px solid var(--color-border-default)',
            color: 'var(--color-text-primary)'
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-accent-500)';
            e.currentTarget.style.boxShadow = '0 0 0 3px oklch(70% 0.25 195 / 0.15)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-border-default)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          aria-label="Trajectory text"
        />

        {error && (
          <p 
            className="text-sm mt-2" 
            role="alert"
            style={{ color: 'var(--color-error-text)' }}
          >
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 rounded transition-colors font-medium"
            style={{ 
              color: 'var(--color-text-secondary)',
              backgroundColor: 'transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)';
              e.currentTarget.style.color = 'var(--color-text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--color-text-secondary)';
            }}
            type="button"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 rounded transition-colors font-medium"
            style={{
              backgroundColor: isSaving ? 'var(--color-bg-elevated)' : 'var(--color-accent-600)',
              color: isSaving ? 'var(--color-text-disabled)' : 'var(--color-bg-base)',
              cursor: isSaving ? 'not-allowed' : 'pointer'
            }}
            onMouseEnter={(e) => {
              if (!isSaving) {
                e.currentTarget.style.backgroundColor = 'var(--color-accent-500)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSaving) {
                e.currentTarget.style.backgroundColor = 'var(--color-accent-600)';
              }
            }}
            type="button"
          >
            {isSaving ? 'On it' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
