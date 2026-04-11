import React from 'react';
import { usePointerGlow } from '../../hooks/usePointerGlow';

export interface GlowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  color?: string;
  hueShift?: number;
  className?: string;
}

/**
 * GlowButton - Cursor-following glow effect using CSS masking
 * 
 * Features:
 * - GPU-accelerated CSS mask animation
 * - OKLCH color manipulation for analogous gradient
 * - 400ms smooth transition
 * - Supports theme colors via CSS variables
 * 
 * @param children Button content
 * @param color Base glow color (default: '#6366f1')
 * @param hueShift Hue rotation for gradient (default: 19)
 * @param className Additional CSS classes
 * @param props Button HTML attributes
 */
export function GlowButton({
  children,
  color = '#6366f1',
  hueShift = 19,
  className = '',
  ...props
}: GlowButtonProps) {
  const { ref, onPointerMove } = usePointerGlow<HTMLButtonElement>();

  return (
    <>
      <style>{`
        .btn-glow {
          position: relative;
          isolation: isolate;
          overflow: hidden;
          --x: 50%;
          --y: 50%;
        }
        
        .btn-glow::before {
          content: '';
          position: absolute;
          inset: -1px;
          background: linear-gradient(
            115deg,
            oklch(from var(--glow-color) calc(l - 0.05) c calc(h - var(--hue-shift))) 0%,
            var(--glow-color) 50%,
            oklch(from var(--glow-color) calc(l + 0.1) c calc(h + var(--hue-shift))) 100%
          );
          z-index: -1;
          -webkit-mask: radial-gradient(20rem 20rem at var(--x) var(--y), #000 1%, transparent 50%);
          mask: radial-gradient(20rem 20rem at var(--x) var(--y), #000 1%, transparent 50%);
          transition: mask 400ms ease, -webkit-mask 400ms ease, opacity 300ms ease;
          opacity: var(--glow-opacity, 0);
          pointer-events: none;
        }
        
        .btn-glow:hover {
          --glow-opacity: 1;
        }
        
        .btn-glow::after {
          content: '';
          position: absolute;
          inset: 1px;
          background: var(--glow-bg, #0a0a0a);
          border-radius: inherit;
          z-index: -1;
          opacity: 0.9;
          transition: opacity 300ms ease;
        }
        
        .btn-glow:hover::after {
          opacity: 0;
        }
        
        /* Disabled state */
        .btn-glow:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .btn-glow:disabled::before {
          opacity: 0 !important;
        }
        
        .btn-glow:disabled::after {
          opacity: 0.9 !important;
        }
      `}</style>
      
      <button
        ref={ref}
        onPointerMove={onPointerMove}
        style={{
          '--glow-color': color,
          '--hue-shift': hueShift.toString(),
          '--glow-bg': 'var(--color-bg-surface, #0a0a0a)',
        } as React.CSSProperties}
        className={`btn-glow ${className}`}
        {...props}
      >
        <span className="relative z-10 w-full flex items-center justify-center gap-2">
          {children}
        </span>
      </button>
    </>
  );
}
