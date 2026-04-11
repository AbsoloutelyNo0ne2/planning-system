import { useRef } from 'react';

/**
 * Custom hook for cursor-following glow effect using CSS masking.
 * Tracks pointer coordinates relative to the element and updates CSS variables.
 * 
 * @returns Object containing ref and onPointerMove handler
 */
export function usePointerGlow<T extends HTMLElement = HTMLElement>() {
  const ref = useRef<T>(null);

  const onPointerMove = (e: React.PointerEvent<T>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ref.current.style.setProperty('--x', `${x}px`);
    ref.current.style.setProperty('--y', `${y}px`);
  };

  return { ref, onPointerMove };
}
