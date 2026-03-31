# Prios UI Redesign - Design Document

**Date:** 2026-03-24
**Status:** Approved
**Tier:** 4 (Systemic/Architectural)

## Executive Summary

Complete UI redesign of Prios (Priority Planning System) using the Design Skill protocol. The redesign moves from an aggressive neon aesthetic to a refined "Technical Precision" personality suited for a productivity tool.

## Design Personality

### Confirmed Direction: Technical Precision

| Dimension | Decision | Rationale |
|-----------|----------|-----------|
| **Typeface** | Geometric sans + Mono accents | Clean hierarchy, precise data display |
| **Color** | Slate dark + Muted teal | Professional, easier on eyes for extended use |
| **Border Radius** | Sharp (2-4px) | Conveys efficiency, precision, seriousness |
| **Density** | Standard (balanced) | Prioritize focus over information overload |
| **Motion** | Subtle easing (150-200ms) | Polished without distraction |

## Token System

### Color Palette

**Background Scale (Slate Dark):**
```
--color-bg-base: #0f172a      /* Page background */
--color-bg-surface: #1e293b   /* Cards, panels */
--color-bg-elevated: #334155  /* Hover states */
--color-bg-input: #1e293b     /* Input fields */
```

**Text Scale:**
```
--color-text-primary: #f1f5f9   /* Headings, primary text */
--color-text-secondary: #94a3b8 /* Body text */
--color-text-muted: #64748b     /* Captions, metadata */
--color-text-disabled: #475569  /* Disabled states */
```

**Accent (Muted Teal):**
```
--color-accent-50: #f0fdfa
--color-accent-100: #ccfbf1
--color-accent-200: #99f6e4
--color-accent-300: #5eead4
--color-accent-400: #2dd4bf
--color-accent-500: #14b8a6     /* Primary accent */
--color-accent-600: #0d9488
--color-accent-700: #0f766e
--color-accent-800: #115e59
--color-accent-900: #134e4a
```

**Semantic Colors:**
```
--color-success: #22c55e (green-500)
--color-warning: #f59e0b (amber-500)
--color-error: #ef4444 (red-500)
--color-info: #3b82f6 (blue-500)
```

### Border Radius Scale

```
--radius-sm: 2px    /* Buttons */
--radius-md: 3px    /* Inputs */
--radius-lg: 4px    /* Cards, panels */
--radius-full: 9999px /* Pills, badges only */
```

### Typography Scale

```
--text-xs: 12px    /* Captions, metadata */
--text-sm: 14px    /* Body small, labels */
--text-base: 16px  /* Body text */
--text-lg: 18px    /* Emphasis */
--text-xl: 20px    /* Subheadings */
--text-2xl: 24px   /* Headings */
--text-3xl: 30px   /* Large headings */
```

**Font Stack:**
```
--font-sans: 'Inter', 'DM Sans', system-ui, sans-serif
--font-mono: 'JetBrains Mono', 'Fira Code', monospace
```

### Spacing Scale (8-Point Grid)

```
--space-1: 4px
--space-2: 8px
--space-3: 12px
--space-4: 16px
--space-5: 24px
--space-6: 32px
--space-7: 48px
--space-8: 64px
```

### Motion Tokens

```
--duration-fast: 150ms      /* Micro-interactions */
--duration-normal: 200ms    /* State changes */
--easing-default: ease-out  /* Standard easing */
```

## Component Specifications

### Button System

**Sizes:**
- Small: h-8, px-3, text-sm
- Medium: h-10, px-4, text-sm (default)
- Large: h-12, px-6, text-base

**Variants:**
- Primary: accent-500 bg, white text
- Secondary: surface bg, border, secondary text
- Ghost: transparent, secondary text

**States (all required):**
- Default
- Hover (bg shift)
- Active/Pressed (darker)
- Focus-visible (2px ring)
- Disabled (opacity 0.5)

**Border Radius:** 2px (sharp)

### Input System

**Height:** 40px standard

**Border:** 1px solid border-subtle

**Focus:** accent-500 border, no glow

**States:**
- Default
- Hover (border focus color)
- Focus (accent border)
- Error (error border + helper text)
- Disabled

**Border Radius:** 3px

**Labels:** Above input, text-sm, secondary color

### Card System

**Padding:** 16px (compact), 24px (standard)

**Border:** 1px solid border-subtle, no shadow

**Hover:** border-default, no glow

**Border Radius:** 4px

**Dark Mode:** surface on base, elevation via lightness

### Badge System

**Sizes:**
- Small: px-2, py-0.5, text-xs
- Medium: px-2.5, py-1, text-xs

**Variants:**
- Default: surface bg, border
- Accent: accent-100 bg, accent-700 text
- Success/Warning/Error/Info: semantic colors

**Border Radius:** full (pill)

## Anti-Pattern Compliance Checklist

- [x] No oversized rounded corners (20px+)
- [x] No glassmorphism
- [x] No soft corporate gradients
- [x] No eyebrow labels (uppercase with letter-spacing)
- [x] No KPI card grid as default layout
- [x] No decorative sidebar blobs
- [x] No hero sections inside dashboards
- [x] No transform animations on hover
- [x] No dramatic shadows
- [x] No decorative glows

## Accessibility Requirements

- [x] WCAG 2.2 AA contrast ratios
- [x] Minimum 4.5:1 for body text
- [x] Minimum 3:1 for large text
- [x] Visible focus states on all interactive elements
- [x] Keyboard navigation support
- [x] Color never sole conveyor of meaning
- [x] Minimum 14px font size
- [x] Respects prefers-reduced-motion

## Implementation Approach

**Strategy:** Incremental Refactor

1. Update CSS tokens (colors, radii, fonts)
2. Refactor component classes
3. Update components one-by-one
4. Test each component before moving to next

**Fallback:** If incremental approach fails, clean rewrite (Option B)

## Components to Redesign (Priority Order)

1. **LoginScreen** - First impression, sets tone
2. **App.tsx layout** - Main structure, header, task area
3. **TaskInput** - Core 6-step task creation flow
4. **TaskList** - Container for task sections
5. **TaskItem** - Individual task cards
6. **TrajectoryEditor** - Goal path visualization
7. **TaskEditModal** - Editing interface
8. **Notification** - Toast feedback

## Success Criteria

1. All components use new design tokens
2. No anti-patterns present
3. WCAG 2.2 AA compliant
4. Maintains all existing functionality
5. Mobile swipe gestures preserved
6. Build passes with no TypeScript errors
7. Deployed to prios-app.vercel.app

## Approval

- **Approved by:** User
- **Date:** 2026-03-24
- **Next Step:** Invoke writing-plans skill for implementation plan
