# Button Design Exploration — Prios

## Current State Analysis

**Current button styles:**
- Simple solid background (`var(--color-bg-elevated)`)
- Single color border (`var(--color-border-default)`)
- Basic hover: background changes to `var(--color-bg-hover)`
- No animation, no depth, no personality
- Same treatment for all buttons (primary, secondary, danger)

**Problem:** Buttons lack visual hierarchy and don't feel premium or aligned with the "Technical Precision" aesthetic.

---

## Design Directions

### Direction 1: **Gradient Edge Glow**
Buttons with subtle gradient borders that glow on hover.

**Primary Button:**
- Background: `linear-gradient(135deg, var(--color-accent-500), var(--color-accent-600))`
- Border: `1px solid transparent` with `background-clip: padding-box, border-box`
- Gradient border using pseudo-element
- Hover: Border gradient intensifies, slight scale (1.02)
- Shadow: `0 4px 20px rgba(accent, 0.3)` on hover

**Secondary Button:**
- Background: `var(--color-bg-surface)`
- Border: `1px solid var(--color-border-default)`
- Hover: Border color shifts to accent color
- Subtle inner glow on hover

**Danger Button:**
- Background: `transparent`
- Border: `1px solid var(--color-error-border)`
- Text: `var(--color-error-text)`
- Hover: Background becomes `var(--color-error-bg)`

---

### Direction 2: **Layered Depth**
Buttons with layered shadows and subtle 3D effect.

**Primary Button:**
- Background: `var(--color-accent-600)`
- Shadow: Multi-layer
  ```css
  box-shadow: 
    0 1px 2px rgba(0,0,0,0.3),
    0 2px 4px rgba(0,0,0,0.2),
    0 4px 8px rgba(0,0,0,0.15)
  ```
- Hover: Shadow expands, button lifts (translateY -1px)
- Active: Shadow collapses, button presses down

**Secondary Button:**
- Background: `var(--color-bg-elevated)`
- Inset shadow: `inset 0 1px 0 rgba(255,255,255,0.05)`
- Border: `1px solid var(--color-border-default)`
- Hover: Background lightens, border becomes accent

**Tertiary/Ghost Button:**
- Background: `transparent`
- Hover: Background becomes `var(--color-bg-surface)`
- Active: Background becomes `var(--color-bg-elevated)`

---

### Direction 3: **Neon Accent**
Cyberpunk-inspired with neon accent glows.

**Primary Button:**
- Background: `var(--color-accent-600)`
- Border: `1px solid var(--color-accent-400)`
- Text: `#ffffff`
- Shadow: `0 0 20px rgba(accent, 0.4)`
- Hover: Shadow expands to `0 0 30px rgba(accent, 0.6)`
- Text shadow: `0 0 10px rgba(255,255,255,0.5)`

**Secondary Button:**
- Background: `transparent`
- Border: `1px solid var(--color-accent-500/50)`
- Text: `var(--color-accent-400)`
- Hover: Background becomes `var(--color-accent-500/10)`
- Border becomes solid accent

---

### Direction 4: **Glassmorphism**
Frosted glass effect with backdrop blur.

**Primary Button:**
- Background: `rgba(accent, 0.8)` with `backdrop-filter: blur(10px)`
- Border: `1px solid rgba(255,255,255,0.1)`
- Shadow: `0 4px 30px rgba(0,0,0,0.3)`
- Hover: Background becomes more opaque (0.95)

**Secondary Button:**
- Background: `rgba(255,255,255,0.05)`
- Border: `1px solid rgba(255,255,255,0.1)`
- Backdrop blur: `blur(10px)`
- Hover: Background becomes `rgba(255,255,255,0.1)`

---

### Direction 5: **Minimalist Refined**
Ultra-clean with refined details.

**Primary Button:**
- Background: `var(--color-accent-600)`
- No border
- Shadow: `0 1px 1px rgba(0,0,0,0.2)`
- Hover: Background shifts to `var(--color-accent-500)`
- Smooth transition: `all 0.2s cubic-bezier(0.4,0,0.2,1)`

**Secondary Button:**
- Background: `transparent`
- Border: `1px solid var(--color-border-default)`
- Hover: Border becomes `var(--color-accent-500)`
- Text: `var(--color-text-secondary)` → `var(--color-text-primary)`

**Danger Button:**
- Background: `transparent`
- Border: `1px solid var(--color-error-border)`
- Text: `var(--color-error-text)`
- Hover: Background `var(--color-error-bg/20)`

---

### Direction 6: **Animated Border**
Border animation on hover/focus.

**Primary Button:**
- Background: `var(--color-accent-600)`
- Border: `2px solid transparent`
- Pseudo-element with gradient border
- Hover: Gradient rotates/borrows from border-color animation
- Keyframes: `border-angle 2s linear infinite`

**Secondary Button:**
- Similar but with muted colors
- Border animates on focus state

---

### Direction 7: **Pill Shape + Badge**
Rounded pills with status badges.

**Primary Button:**
- Border-radius: `9999px` (full pill)
- Padding: `8px 16px`
- Icon + text layout
- Badge: Small circle indicator for notifications

**Secondary Button:**
- Same pill shape
- Lighter background
- Icon-based

---

### Direction 8: **Split Gradient**
Two-tone gradient split horizontally or diagonally.

**Primary Button:**
- Background: `linear-gradient(135deg, var(--color-accent-500) 0%, var(--color-accent-700) 100%)`
- Hover: Gradient angle shifts to 145deg
- Transition: `background 0.3s ease`

**Secondary Button:**
- Background: `linear-gradient(135deg, var(--color-bg-surface) 0%, var(--color-bg-elevated) 100%)`
- Border: `1px solid var(--color-border-default)`

---

### Direction 9: **Outline + Fill Animation**
Starts as outline, fills on hover.

**Primary Button:**
- Initial: Outline only (`1px solid var(--color-accent-500)`)
- Background: `transparent`
- Text: `var(--color-accent-500)`
- Hover: Background fills from bottom with `var(--color-accent-500)`
- Text becomes `#ffffff`

**Implementation:**
```css
background-image: linear-gradient(var(--color-accent-500), var(--color-accent-500));
background-size: 100% 0%;
background-position: bottom;
transition: background-size 0.3s ease;
```

---

### Direction 10: **Textured Background**
Subtle pattern or noise overlay.

**Primary Button:**
- Background: `var(--color-accent-600)`
- Overlay: `url("data:image/svg+xml,...noise...")`
- Blend mode: `overlay`
- Opacity: `0.03`
- Hover: Noise becomes more visible

**Secondary Button:**
- Same texture but lighter
- Border: `1px solid var(--color-border-default)`

---

## Recommended Approach: Hybrid

Combine best elements from multiple directions:

### Primary Button (New Task, Submit)
```css
background: linear-gradient(135deg, var(--color-accent-500), var(--color-accent-600));
border: 1px solid transparent;
border-radius: 4px;
color: #ffffff;
padding: 8px 16px;
font-weight: 500;
transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
box-shadow: 0 1px 2px rgba(0,0,0,0.2);

&:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(var(--color-accent-rgb), 0.3);
  filter: brightness(1.1);
}

&:active {
  transform: translateY(0);
  box-shadow: 0 1px 1px rgba(0,0,0,0.2);
}
```

### Secondary Button (Cancel, Back)
```css
background: transparent;
border: 1px solid var(--color-border-default);
border-radius: 4px;
color: var(--color-text-secondary);
padding: 8px 16px;
font-weight: 500;
transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

&:hover {
  background: var(--color-bg-elevated);
  border-color: var(--color-accent-500);
  color: var(--color-text-primary);
}

&:active {
  background: var(--color-bg-surface);
}
```

### Danger Button (Remove, Delete)
```css
background: transparent;
border: 1px solid var(--color-error-border);
color: var(--color-error-text);
padding: 8px 16px;
font-weight: 500;
border-radius: 4px;
transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

&:hover {
  background: var(--color-error-bg);
  border-color: var(--color-error-border);
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.2);
}

&:active {
  background: var(--color-error-bg);
  transform: scale(0.98);
}
```

### Ghost Button (Theme Switcher, Minor Actions)
```css
background: transparent;
border: none;
color: var(--color-text-secondary);
padding: 6px 12px;
font-weight: 500;
border-radius: 4px;
transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

&:hover {
  background: var(--color-bg-surface);
  color: var(--color-text-primary);
}

&:active {
  background: var(--color-bg-elevated);
}
```

---

## Animation Timing Functions

```css
/* Standard easing */
--ease-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.68, -0.04, 0.3, 1.05);

/* Usage */
transition: all 200ms var(--ease-out);
```

---

## Color Variables to Add

```css
/* Button-specific tokens */
--color-btn-primary-bg: var(--color-accent-600);
--color-btn-primary-hover: var(--color-accent-500);
--color-btn-primary-active: var(--color-accent-700);
--color-btn-primary-text: #ffffff;

--color-btn-secondary-bg: transparent;
--color-btn-secondary-border: var(--color-border-default);
--color-btn-secondary-hover-bg: var(--color-bg-elevated);
--color-btn-secondary-hover-border: var(--color-accent-500);
--color-btn-secondary-text: var(--color-text-secondary);
--color-btn-secondary-hover-text: var(--color-text-primary);

--color-btn-danger-bg: transparent;
--color-btn-danger-border: var(--color-error-border);
--color-btn-danger-hover-bg: var(--color-error-bg);
--color-btn-danger-text: var(--color-error-text);
```

---

## Implementation Priority

1. **Phase 1:** Primary button with gradient + shadow + lift
2. **Phase 2:** Secondary button with border animation
3. **Phase 3:** Danger button with glow effect
4. **Phase 4:** Ghost button for minor actions
5. **Phase 5:** Add consistent transition timings
6. **Phase 6:** Test with all color schemes

---

## Files to Modify

- `src/styles/index.css` - Add button component classes
- `src/components/App.tsx` - Update +Add/-Remove buttons
- `src/components/LoginScreen.tsx` - Update Submit button
- `src/components/TaskInput.tsx` - Update step buttons
- `src/components/TaskItem.tsx` - Update Copy/Sent buttons
- `src/components/TaskEditModal.tsx` - Update modal buttons
- `src/components/ColorSchemeSwitcher.tsx` - Update dropdown buttons

---

## Testing Checklist

- [ ] All buttons visible on all color schemes
- [ ] Hover states work smoothly
- [ ] Active states provide feedback
- [ ] Disabled states are clear
- [ ] Keyboard focus states visible
- [ ] Mobile touch targets adequate (min 44px)
- [ ] Transitions feel smooth (200ms)
- [ ] No performance issues with shadows/gradients
