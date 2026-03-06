/**
 * @fileoverview Slider Variants Component
 *
 * PURPOSE:
 * Provides three distinct slider designs for the user to compare and choose from.
 * All variants support the same props interface for easy interchangeability.
 *
 * DESIGNS:
 * 1. MinimalSlider: Clean, minimal design with native range input
 * 2. VesperSlider: Dark-themed, premium design inspired by Vesper UI
 * 3. GradientSlider: Visual gradient fill showing progress
 *
 * LAYER STATUS: Layer 1-5 Complete
 */

import { useState, useEffect } from 'react';

// SECTION: Shared Types
export interface SliderProps {
  value: number | null;
  onChange: (value: number) => void;
  onSubmit?: () => void;
  min?: number;
  max?: number;
  label?: string;
}

// SECTION: Design 1 — Minimal Slider
// REASONING:
// We need a clean, minimal slider design
// > What makes it minimal?
// > Native input, subtle styling, no extra chrome
// > Best for: Forms where the slider shouldn't draw attention
// > Therefore: Native range input with minimal custom styling
export function MinimalSlider(props: SliderProps): JSX.Element {
  const {
    value,
    onChange,
    onSubmit,
    min = 0,
    max = 100,
    label = 'Value'
  } = props;

  const currentValue = value ?? Math.round((min + max) / 2);

  useEffect(() => {
    if (!onSubmit) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onSubmit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSubmit]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span style={{ color: 'var(--color-text-muted)' }}>{label}</span>
        <span
          className="text-lg font-semibold"
          style={{ color: 'var(--color-accent-400)' }}
        >
          {currentValue}%
        </span>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        value={currentValue}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="minimal-slider"
        style={{
          width: '100%',
          height: '4px',
          WebkitAppearance: 'none',
          appearance: 'none',
          background: 'var(--color-bg-elevated)',
          borderRadius: '2px',
          outline: 'none',
          cursor: 'pointer'
        }}
        autoFocus
      />

      <div className="flex justify-between text-xs" style={{ color: 'var(--color-text-muted)' }}>
        <span>{min}%</span>
        <span>{Math.round((min + max) / 2)}%</span>
        <span>{max}%</span>
      </div>

      <style>{`
        .minimal-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--color-accent-500);
          cursor: pointer;
          border: 2px solid var(--color-bg-surface);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
          transition: transform 0.1s ease;
        }
        .minimal-slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
        }
        .minimal-slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--color-accent-500);
          cursor: pointer;
          border: 2px solid var(--color-bg-surface);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
}

// SECTION: Design 2 — Vesper Slider
// REASONING:
// We need a dark, premium slider inspired by Vesper UI
// > What makes it Vesper-themed?
// > Dark container, subtle glow, monospace value display
// > Best for: Premium dashboards, dark-first interfaces
// > Therefore: Container with dark background, accent glow effects
export function VesperSlider(props: SliderProps): JSX.Element {
  const {
    value,
    onChange,
    onSubmit,
    min = 0,
    max = 100,
    label = 'Value'
  } = props;

  const currentValue = value ?? Math.round((min + max) / 2);
  const percentage = ((currentValue - min) / (max - min)) * 100;

  useEffect(() => {
    if (!onSubmit) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onSubmit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSubmit]);

  return (
    <div
      className="vesper-slider-container space-y-4"
      style={{
        backgroundColor: 'var(--color-bg-elevated)',
        borderRadius: '12px',
        padding: '20px',
        border: '1px solid var(--color-border-subtle)'
      }}
    >
      <div className="flex justify-between items-center">
        <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
          {label}
        </span>
        <span
          className="vesper-value"
          style={{
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            fontSize: '1.25rem',
            fontWeight: 600,
            color: 'var(--color-accent-400)',
            textShadow: '0 0 20px var(--color-accent-500)'
          }}
        >
          {currentValue}%
        </span>
      </div>

      <div style={{ position: 'relative', height: '24px', display: 'flex', alignItems: 'center' }}>
        {/* Track background */}
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '6px',
            backgroundColor: 'var(--color-bg-input)',
            borderRadius: '3px'
          }}
        />
        {/* Active track */}
        <div
          style={{
            position: 'absolute',
            width: `${percentage}%`,
            height: '6px',
            background: 'linear-gradient(90deg, var(--color-accent-700), var(--color-accent-500))',
            borderRadius: '3px',
            boxShadow: '0 0 10px var(--color-accent-500)'
          }}
        />
        {/* Range input */}
        <input
          type="range"
          min={min}
          max={max}
          value={currentValue}
          onChange={(e) => onChange(parseInt(e.target.value, 10))}
          className="vesper-range"
          style={
            {
              position: 'absolute',
              width: '100%',
              height: '24px',
              WebkitAppearance: 'none',
              appearance: 'none',
              background: 'transparent',
              cursor: 'pointer',
              zIndex: 1
            } as React.CSSProperties
          }
          autoFocus
        />
      </div>

      <div className="flex justify-between text-xs" style={{ color: 'var(--color-text-muted)' }}>
        <span style={{ fontFamily: 'ui-monospace, monospace' }}>{min}</span>
        <span style={{ fontFamily: 'ui-monospace, monospace' }}>{max}</span>
      </div>

      <style>{`
        .vesper-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--color-accent-400), var(--color-accent-600));
          cursor: pointer;
          border: 2px solid var(--color-bg-surface);
          box-shadow: 0 0 15px var(--color-accent-500), 0 2px 4px rgba(0, 0, 0, 0.3);
          transition: all 0.2s ease;
        }
        .vesper-range::-webkit-slider-thumb:hover {
          transform: scale(1.15);
          box-shadow: 0 0 20px var(--color-accent-400), 0 4px 8px rgba(0, 0, 0, 0.4);
        }
        .vesper-range::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--color-accent-400), var(--color-accent-600));
          cursor: pointer;
          border: 2px solid var(--color-bg-surface);
          box-shadow: 0 0 15px var(--color-accent-500);
        }
      `}</style>
    </div>
  );
}

// SECTION: Design 3 — Gradient Slider
// REASONING:
// We need a slider with visible gradient fill showing progress
// > What makes it gradient?
// > Custom track with fill bar that grows with value
// > Best for: Visual progress indication, dashboards
// > Therefore: Stacked elements with fill div behind input
export function GradientSlider(props: SliderProps): JSX.Element {
  const {
    value,
    onChange,
    onSubmit,
    min = 0,
    max = 100,
    label = 'Value'
  } = props;

  const currentValue = value ?? Math.round((min + max) / 2);
  const percentage = ((currentValue - min) / (max - min)) * 100;

  useEffect(() => {
    if (!onSubmit) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onSubmit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSubmit]);

  return (
    <div className="gradient-slider-container space-y-4">
      <div className="flex justify-between items-center mb-2">
        <span style={{ color: 'var(--color-text-secondary)' }}>{label}</span>
        <span
          className="text-2xl font-bold"
          style={{
            background: 'linear-gradient(135deg, var(--color-accent-400), var(--color-mint-400))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          {currentValue}%
        </span>
      </div>

      <div
        className="gradient-track-wrapper"
        style={{
          position: 'relative',
          height: '32px',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        {/* Track container */}
        <div
          className="gradient-track"
          style={{
            position: 'absolute',
            width: '100%',
            height: '8px',
            backgroundColor: 'var(--color-bg-elevated)',
            borderRadius: '4px',
            overflow: 'hidden'
          }}
        >
          {/* Gradient fill */}
          <div
            className="gradient-fill"
            style={{
              width: `${percentage}%`,
              height: '100%',
              background: 'linear-gradient(90deg, oklch(35% 0.18 195), oklch(72% 0.22 145))',
              borderRadius: '4px',
              transition: 'width 0.1s ease-out'
            }}
          />
        </div>

        {/* Invisible range input for interaction */}
        <input
          type="range"
          min={min}
          max={max}
          value={currentValue}
          onChange={(e) => onChange(parseInt(e.target.value, 10))}
          className="gradient-range"
          style={
            {
              position: 'absolute',
              width: '100%',
              height: '32px',
              WebkitAppearance: 'none',
              appearance: 'none',
              background: 'transparent',
              cursor: 'pointer',
              zIndex: 2,
              opacity: 0
            } as React.CSSProperties
          }
          autoFocus
        />

        {/* Visible thumb */}
        <div
          className="gradient-thumb"
          style={{
            position: 'absolute',
            left: `calc(${percentage}% - 12px)`,
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, oklch(70% 0.25 195), oklch(60% 0.22 145)',
            border: '3px solid var(--color-bg-surface)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3), 0 0 0 1px var(--color-border-subtle)',
            pointerEvents: 'none',
            transition: 'left 0.1s ease-out',
            zIndex: 1
          }}
        />
      </div>

      <div className="flex justify-between text-xs" style={{ color: 'var(--color-text-muted)' }}>
        <span>{min}%</span>
        <span>{Math.round((min + max) / 2)}%</span>
        <span>{max}%</span>
      </div>

      <style>{`
        .gradient-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 24px;
          height: 24px;
          cursor: pointer;
        }
        .gradient-range::-moz-range-thumb {
          width: 24px;
          height: 24px;
          cursor: pointer;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}

// SECTION: Demo Component for Easy Comparison
// REASONING:
// We need a way to show all three sliders side by side
// > Why a demo component?
// > Makes it easy to compare without switching imports
// > Useful for development and user testing
// > Therefore: Container that renders all three variants
export function SliderVariantsDemo(): JSX.Element {
  const [minimalValue, setMinimalValue] = useState(50);
  const [vesperValue, setVesperValue] = useState(50);
  const [gradientValue, setGradientValue] = useState(50);

  return (
    <div className="space-y-8 p-6">
      <div>
        <h3
          className="text-sm font-semibold mb-4 uppercase tracking-wide"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Minimal Slider
        </h3>
        <MinimalSlider
          value={minimalValue}
          onChange={setMinimalValue}
          label="Minimal"
        />
      </div>

      <div>
        <h3
          className="text-sm font-semibold mb-4 uppercase tracking-wide"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Vesper Slider
        </h3>
        <VesperSlider
          value={vesperValue}
          onChange={setVesperValue}
          label="Vesper"
        />
      </div>

      <div>
        <h3
          className="text-sm font-semibold mb-4 uppercase tracking-wide"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Gradient Slider
        </h3>
        <GradientSlider
          value={gradientValue}
          onChange={setGradientValue}
          label="Gradient"
        />
      </div>
    </div>
  );
}

// SECTION MAP:
// Lines 1-18: File header with purpose
// Lines 21-24: Shared SliderProps interface
// Lines 27-96: MinimalSlider component
// Lines 99-196: VesperSlider component
// Lines 199-300: GradientSlider component
// Lines 303-357: SliderVariantsDemo component
// Lines 359-365: Section map
