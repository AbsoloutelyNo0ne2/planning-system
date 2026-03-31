# Prios UI Redesign - Master Tracker

## Task Classification
**Tier:** 4 (Systemic/Architectural)
**Score:** 7/8 points
**Started:** 2026-03-23

## Project Overview
Complete UI redesign of Prios (Priority Planning System) using the Design Skill protocol.

## Current State Analysis

### Existing Components (13 files)
- `App.tsx` - Main application container
- `LoginScreen.tsx` - Authentication screen
- `ProtectedApp.tsx` - Route guard
- `TaskInput.tsx` - Task creation flow (6 steps)
- `TaskList.tsx` - Task list container
- `TaskItem.tsx` - Individual task cards
- `TaskEditModal.tsx` - Task editing modal
- `TrajectoryEditor.tsx` - Goal trajectory editor
- `HybridStep.tsx` - Hybrid task step
- `Notification.tsx` - Toast notifications
- `ErrorBoundary.tsx` - Error handling
- `DebugTest.tsx` - Debug component
- `sliders/SliderVariants.tsx` - Slider components

### Existing Design System
- OKLCH color space (neon cyan/green on deep navy)
- 8-point grid spacing
- Typography scale
- Component classes (`.vesper-*`)
- Already follows some design skill principles

### Current Personality (to be redefined)
- Typeface: System UI stack
- Color: Cool/dark with neon accents
- Border radius: 6-8px (neutral/professional)
- Density: Standard
- Motion: Subtle easing

## Design Skill Requirements

### Phase 1: Personality Definition
- [ ] Determine typeface mood
- [ ] Define color temperature
- [ ] Choose border radius tier
- [ ] Set density level
- [ ] Define motion character

### Phase 2: Token System
- [ ] Color tokens (neutral, brand, semantic)
- [ ] Spacing tokens (8-point grid)
- [ ] Typography tokens
- [ ] Border radius tokens
- [ ] Shadow tokens

### Phase 3: Component Vocabulary
- [ ] Button system (sizes, variants, states)
- [ ] Input system
- [ ] Card system
- [ ] Typography components
- [ ] Badge system

### Phase 4: Implementation
- [ ] Update CSS variables
- [ ] Refactor each component
- [ ] Apply accessibility standards
- [ ] Test dark mode
- [ ] Verify anti-pattern compliance

## Anti-Pattern Check
- [ ] No oversized rounded corners (20px+)
- [ ] No glassmorphism
- [ ] No soft corporate gradients
- [ ] No eyebrow labels
- [ ] No KPI card grid as default
- [ ] No decorative sidebar blobs

## Status
- **Phase:** Planning
- **Next:** Brainstorming session
