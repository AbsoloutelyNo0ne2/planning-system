# Cursor-Following Glow Effect (CSS Mask Approach)

**Reference:** Frontend Masters blog + CodePen by Ines (glowy hover effect, 2023 top pen)

## What it does
- Button has a hidden overlay with a colorful gradient background
- Overlay is masked with a radial gradient that follows the cursor
- Only the area under the mask is visible, creating a glow that tracks the mouse
- Smooth 400ms transition on the mask for fluidity

## Technical specs
- **Mask:** `radial-gradient(20rem 20rem at var(--x) var(--y), #000 1%, transparent 50%)`
- **Transition:** `mask 400ms ease, -webkit-mask 400ms ease, opacity 300ms ease`
- **Variables:** `--x` and `--y` set via JavaScript on `pointermove` (in pixels, not %)
- **Performance:** Uses CSS masking (GPU-accelerated), no layout thrashing
- **Isolation:** `isolation: isolate` to contain stacking context

## The trick
Two layers:
1. Base button with background
2. `::before` pseudo-element with gradient, masked by cursor position
3. `::after` pseudo-element for the dark surface overlay

## Source Code Reference

### 1. The Hook (extract to: `hooks/usePointerGlow.js`)
```javascript
import { useRef } from 'react';

export function usePointerGlow() {
  const ref = useRef(null);
  
  const onPointerMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ref.current.style.setProperty('--x', `${x}px`);
    ref.current.style.setProperty('--y', `${y}px`);
  };
  
  return { ref, onPointerMove };
}
```

### 2. The Component (extract to: `components/GlowButton.jsx`)
```jsx
import { usePointerGlow } from '../hooks/usePointerGlow';

export function GlowButton({ 
  children, 
  color = '#6366f1', 
  hueShift = 19,
  className = '', 
  ...props 
}) {
  const { ref, onPointerMove } = usePointerGlow();
  
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
        }
        
        .btn-glow:hover {
          --glow-opacity: 1;
        }
        
        .btn-glow::after {
          content: '';
          position: absolute;
          inset: 1px;
          background: #0a0a0a; /* Dark mode surface color */
          border-radius: inherit;
          z-index: -1;
          opacity: 0.9;
        }
      `}</style>
      
      <button
        ref={ref}
        onPointerMove={onPointerMove}
        style={{ 
          '--glow-color': color, 
          '--hue-shift': hueShift,
          ...props.style 
        }}
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
```

## Implementation Notes for Planning System

### Files to create/modify:
1. `src/hooks/usePointerGlow.js` - Custom hook
2. `src/components/ui/GlowButton.tsx` - Reusable component (TypeScript version)
3. `src/styles/glow-effects.css` - Global CSS (or add to index.css)

### Production usage (LoginScreen):
- Replace current `btn-liquid` on Sign In button with `GlowButton`
- Pass theme color from `ColorSchemeContext`
- Keep existing form logic, just swap the button component

### CSS Variables used:
- `--x` - Cursor X position in pixels
- `--y` - Cursor Y position in pixels  
- `--glow-color` - Base glow color (from theme)
- `--hue-shift` - Hue rotation for gradient (default 19)
- `--glow-opacity` - Opacity toggle (0 on idle, 1 on hover)

### Key differences from current `btn-liquid`:
- Uses CSS `mask` instead of `width/height` animation
- GPU-accelerated, no layout recalculation
- Smoother 400ms transition vs 500ms
- More performant on low-end devices
- Supports analogous color gradient (hue shift)
