/**
 * @fileoverview Hybrid Step Component
 *
 * PURPOSE:
 * Step 4 in the task creation flow - shown only when HYBRID task type is selected.
 * Allows users to configure the agentic/human split ratio for hybrid tasks.
 *
 * WHY THIS EXISTS:
 * Hybrid tasks have mixed delegation potential. This step captures the preferred
 * balance between AI autonomy and human oversight (0-100 scale).
 *
 * LAYER STATUS: Layer 1-3 Complete
 */

import { useEffect } from 'react';

// SECTION: Component Props
interface HybridStepProps {
  value: number | null;
  onChange: (value: number) => void;
  onSubmit: () => void;
}

// REASONING:
// We need HybridStep for configuring hybrid task split
// > What does it need?
// > Range input 0-100 representing % agentic vs human
// > 0 = fully human, 100 = fully agentic
// > Visual feedback showing the split
// > Therefore: Range input with contextual labels
export function HybridStep(props: HybridStepProps): JSX.Element {
  const { value, onChange, onSubmit } = props;
  const currentValue = value ?? 50;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onSubmit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSubmit]);

  // Calculate labels based on ratio
  const getSplitDescription = (ratio: number): string => {
    if (ratio <= 20) return 'Mostly Human';
    if (ratio <= 40) return 'Human-Led';
    if (ratio <= 60) return 'Balanced';
    if (ratio <= 80) return 'AI-Led';
    return 'Mostly AI';
  };

  return (
    <div className="space-y-6">
      <div className="vesper-slider-display">
        <div className="vesper-slider-display-value">
          {currentValue}%
        </div>
        <div className="vesper-slider-display-label">Agentic Split</div>
        <div className="vesper-slider-display-sublabel">
          {getSplitDescription(currentValue)}
        </div>
      </div>

      <div className="vesper-slider-container px-2">
        <input
          type="range"
          min="0"
          max="100"
          value={currentValue}
          onChange={(e) => onChange(parseInt(e.target.value, 10))}
          className="vesper-slider"
          style={{
            background: `linear-gradient(to right, oklch(70% 0.25 195) 0%, oklch(72% 0.22 145) ${currentValue}%, oklch(18% 0.03 260) ${currentValue}%, oklch(18% 0.03 260) 100%)`
          }}
          autoFocus
        />
        <div className="vesper-slider-labels">
          <span>Human-led (0%)</span>
          <span>Balanced (50%)</span>
          <span>AI-led (100%)</span>
        </div>
      </div>

      <div 
        className="rounded-lg p-4 text-sm"
        style={{ 
          backgroundColor: 'var(--color-bg-elevated)',
          color: 'var(--color-text-secondary)'
        }}
      >
        <p className="mb-2" style={{ color: 'var(--color-text-primary)' }}>
          <strong>Hybrid tasks</strong> combine AI assistance with human oversight.
        </p>
        <ul 
          className="list-disc list-inside space-y-1"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <li>Lower values = more human direction required</li>
          <li>Higher values = more AI autonomy allowed</li>
          <li>This helps prioritize tasks in your workflow</li>
        </ul>
      </div>

      <div 
        className="text-center text-sm"
        style={{ color: 'var(--color-text-muted)' }}
      >
        Press Enter to confirm
      </div>
    </div>
  );
}

// SECTION MAP:
// Lines 1-14: File header
// Lines 17-22: Props interface
// Lines 25-82: HybridStep component with slider
// Lines 84-88: Section map
