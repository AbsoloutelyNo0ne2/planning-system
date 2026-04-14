import { useRef } from 'react';

/**
 * usePointerGlow - Spatial awareness hook for cursor-following effects
 * 
 * Tracks pointer coordinates relative to an element and updates CSS variables.
 * Returns ref and handler for any element that needs spatial awareness.
 */
export function usePointerGlow<T extends HTMLElement = HTMLElement>() {
  const ref = useRef<T>(null);

  const handlePointerMove = (e: React.PointerEvent<T>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ref.current.style.setProperty('--x', `${x}px`);
    ref.current.style.setProperty('--y', `${y}px`);
  };

  return { ref, handlePointerMove };
}
