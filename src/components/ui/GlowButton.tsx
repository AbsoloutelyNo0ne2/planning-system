import React from 'react';
import { usePointerGlow } from '../../hooks/usePointerGlow';

export interface GlowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  color?: string;
  className?: string;
}

/**
 * GlowButton v4 - Laser border glow
 * 
 * Sharp line that travels along border edge following cursor.
 * Face stays completely dark (#0a0a0a).
 * 
 * @param children Button content
 * @param color Glow color (theme color)
 * @param className Additional CSS classes
 * @param props Button HTML attributes
 */
export function GlowButton({
  children,
  color = '#8b5cf6',
  className = '',
  ...props
}: GlowButtonProps) {
  const { ref, handlePointerMove } = usePointerGlow<HTMLButtonElement>();

  return (
    <button
      ref={ref}
      onPointerMove={handlePointerMove}
      style={{
        '--glow-color': color,
      } as React.CSSProperties}
      className={`btn-glow ${className} flex items-center justify-center gap-2 font-medium transition-transform active:scale-[0.98] text-white`}
      {...props}
    >
      {children}
    </button>
  );
}
