# Prios UI Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use subagent-driven-development to implement this plan task-by-task.

**Goal:** Redesign the Prios UI from aggressive neon aesthetic to refined Technical Precision personality.

**Architecture:** Incremental refactor approach - update CSS tokens first, then refactor components one-by-one. Preserve all existing functionality including authentication, task CRUD, trajectory editing, and mobile swipe gestures.

**Tech Stack:** React, TypeScript, Tailwind CSS, Custom CSS variables, Vite

---

## Phase 1: Token System Update

### Task 1: Update Color Tokens

**Files:**
- Modify: `D:\kilo\planning-system\src\styles\index.css:25-104`

**Step 1: Replace background scale**
Replace the navy backgrounds with slate dark:
```css
/* Replace lines 30-35 */
--color-bg-base: #0f172a;
--color-bg-surface: #1e293b;
--color-bg-elevated: #334155;
--color-bg-input: #1e293b;
--color-bg-hover: #475569;
--color-bg-active: #64748b;
```

**Step 2: Replace border colors**
```css
/* Replace lines 38-40 */
--color-border-subtle: #334155;
--color-border-default: #475569;
--color-border-focus: #64748b;
```

**Step 3: Replace text colors**
```css
/* Replace lines 48-51 */
--color-text-primary: #f1f5f9;
--color-text-secondary: #94a3b8;
--color-text-muted: #64748b;
--color-text-disabled: #475569;
```

**Step 4: Replace accent colors with muted teal**
Replace lines 58-67 with:
```css
/* Muted Teal Accent (hue 173, lower chroma) */
--color-accent-50: oklch(97% 0.01 173);
--color-accent-100: oklch(94% 0.03 173);
--color-accent-200: oklch(88% 0.06 173);
--color-accent-300: oklch(80% 0.10 173);
--color-accent-400: oklch(70% 0.13 173);
--color-accent-500: oklch(60% 0.15 173);
--color-accent-600: oklch(52% 0.14 173);
--color-accent-700: oklch(44% 0.12 173);
--color-accent-800: oklch(36% 0.10 173);
--color-accent-900: oklch(28% 0.08 173);
```

**Step 5: Replace mint/secondary colors**
Replace lines 74-83 with muted neutral secondary:
```css
/* Neutral Secondary (no green tint) */
--color-secondary-50: oklch(97% 0.01 260);
--color-secondary-100: oklch(94% 0.02 260);
--color-secondary-200: oklch(88% 0.03 260);
--color-secondary-300: oklch(80% 0.04 260);
--color-secondary-400: oklch(70% 0.05 260);
--color-secondary-500: oklch(60% 0.05 260);
--color-secondary-600: oklch(52% 0.04 260);
--color-secondary-700: oklch(44% 0.04 260);
--color-secondary-800: oklch(36% 0.03 260);
--color-secondary-900: oklch(28% 0.02 260);
```

**Step 6: Run build to verify**
Run: `npm run build`
Expected: Build succeeds with no errors

**Step 7: Commit**
```bash
git add src/styles/index.css
git commit -m "refactor: Update color tokens to muted teal palette"
```

---

### Task 2: Update Typography Tokens

**Files:**
- Modify: `D:\kilo\planning-system\src\styles\index.css:122-124`

**Step 1: Add Google Fonts import at top of file**
Add after line 17 (after header comment block):
```css
/* Import Inter font for Technical Precision personality */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
```

**Step 2: Update font stack**
Replace lines 122-124:
```css
--font-sans: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace;
```

**Step 3: Add font-display to html**
In the `@layer base` block, add to `html`:
```css
font-display: swap;
```

**Step 4: Run build to verify**
Run: `npm run build`
Expected: Build succeeds

**Step 5: Commit**
```bash
git add src/styles/index.css
git commit -m "refactor: Add Inter font and update typography tokens"
```

---

### Task 3: Update Border Radius Tokens

**Files:**
- Modify: `D:\kilo\planning-system\src\styles\index.css:218-409`

**Step 1: Update card radius**
Replace `.vesper-card` border-radius:
```css
border-radius: 4px;
```

**Step 2: Update input radius**
Replace `.vesper-input` border-radius:
```css
border-radius: 3px;
```

**Step 3: Update button radius**
Replace `.vesper-btn` border-radius:
```css
border-radius: 2px;
```

**Step 4: Update task item radius**
Replace `.vesper-task-item` border-radius:
```css
border-radius: 4px;
```

**Step 5: Update slider border-radius**
Replace `.vesper-slider` related border-radius values:
```css
.vesper-slider {
  border-radius: 2px;
}
.vesper-slider::-webkit-slider-runnable-track {
  border-radius: 2px;
}
.vesper-slider::-moz-range-track {
  border-radius: 2px;
}
```

**Step 6: Run build to verify**
Run: `npm run build`
Expected: Build succeeds

**Step 7: Commit**
```bash
git add src/styles/index.css
git commit -m "refactor: Update border radius to sharp (2-4px)"
```

---

### Task 4: Remove Glow Effects

**Files:**
- Modify: `D:\kilo\planning-system\src\styles\index.css`

**Step 1: Remove glow from input focus**
Replace `.vesper-input:focus` box-shadow:
```css
.vesper-input:focus {
  border-color: var(--color-accent-500);
  outline: none;
  /* Removed glow effect */
}
```

**Step 2: Remove glow from progress bar**
Replace `.vesper-progress-bar`:
```css
.vesper-progress-bar {
  background: var(--color-accent-500);
  height: 100%;
  border-radius: 2px;
  transition: width var(--duration-moderate) var(--easing-out);
  /* Removed glow effect */
}
```

**Step 3: Remove glow from slider thumb**
Replace `.vesper-slider::-webkit-slider-thumb`:
```css
.vesper-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 2px;
  background: var(--color-accent-500);
  border: 1px solid var(--color-accent-600);
  margin-top: -4px;
  transition: background 150ms ease-out;
  cursor: grab;
}
```

**Step 4: Remove text-shadow from slider display**
Replace `.vesper-slider-display-value`:
```css
.vesper-slider-display-value {
  font-size: 48px;
  font-weight: 700;
  color: var(--color-accent-400);
  font-family: var(--font-mono);
  line-height: 1;
  /* Removed text-shadow */
}
```

**Step 5: Run build to verify**
Run: `npm run build`
Expected: Build succeeds

**Step 6: Commit**
```bash
git add src/styles/index.css
git commit -m "refactor: Remove glow effects for Technical Precision"
```

---

## Phase 2: Component Redesign

### Task 5: Redesign LoginScreen

**Files:**
- Modify: `D:\kilo\planning-system\src\components\LoginScreen.tsx`

**Step 1: Remove gradient background**
Replace the multi-layer gradient with solid background:
```tsx
// Remove the background style with multiple radial gradients
// Replace with:
style={{
  background: 'var(--color-bg-base)',
}}
```

**Step 2: Update container classes**
Remove fancy animations, apply clean styling:
```tsx
// Container should use simple, clean styles
className="min-h-screen flex items-center justify-center"
style={{ background: 'var(--color-bg-base)' }}
```

**Step 3: Update input styling**
Remove glows, use sharp radius:
```tsx
// Input should use:
className="w-full px-4 py-3 bg-surface border border-border-default rounded-sm text-text-primary placeholder:text-text-muted focus:border-accent-500 focus:outline-none"
style={{ borderRadius: '3px' }}
```

**Step 4: Update button styling**
Sharp corners, no shimmer:
```tsx
// Buttons should use:
className="px-6 py-3 bg-accent-600 text-white font-medium rounded-sm hover:bg-accent-500 active:bg-accent-700 disabled:opacity-50 transition-colors duration-150"
style={{ borderRadius: '2px' }}
```

**Step 5: Remove title glow**
Replace text-shadow styling with clean typography:
```tsx
// Title should be clean, no glow
<h1 className="text-3xl font-bold text-text-primary">
  Planning System
</h1>
```

**Step 6: Update hint text**
Remove swipe hints if present, keep minimal:
```tsx
<p className="text-text-muted text-sm">
  Enter your passphrase to continue
</p>
```

**Step 7: Run build to verify**
Run: `npm run build`
Expected: Build succeeds

**Step 8: Test locally**
Run: `npm run dev`
Verify: Login screen appears with clean, sharp styling

**Step 9: Commit**
```bash
git add src/components/LoginScreen.tsx
git commit -m "refactor: Redesign LoginScreen with Technical Precision"
```

---

### Task 6: Redesign App.tsx Layout

**Files:**
- Modify: `D:\kilo\planning-system\src\components\App.tsx`

**Step 1: Update header styling**
Replace with clean, sharp design:
```tsx
// Header should use:
<header className="px-6 py-4 border-b border-border-subtle">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-4">
      <span className="text-text-secondary text-sm font-mono">
        {userType}
      </span>
      <h1 className="text-lg font-semibold text-text-primary">
        {trajectory || 'No trajectory set'}
      </h1>
    </div>
    <button
      onClick={logout}
      className="px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary border border-border-subtle rounded-sm hover:border-border-default transition-colors"
      style={{ borderRadius: '2px' }}
    >
      Logout
    </button>
  </div>
</header>
```

**Step 2: Update main content area**
Apply standard density spacing:
```tsx
<main className="flex-1 p-6">
  <div className="max-w-4xl mx-auto space-y-6">
    {/* Task input and list */}
  </div>
</main>
```

**Step 3: Update section headers**
Remove uppercase styling, use clean hierarchy:
```tsx
<h2 className="text-sm font-medium text-text-secondary mb-3">
  Agentic Tasks
</h2>
```

**Step 4: Run build to verify**
Run: `npm run build`
Expected: Build succeeds

**Step 5: Commit**
```bash
git add src/components/App.tsx
git commit -m "refactor: Redesign App layout with clean hierarchy"
```

---

### Task 7: Redesign TaskInput Component

**Files:**
- Modify: `D:\kilo\planning-system\src\components\TaskInput.tsx`

**Step 1: Update container styling**
Remove glows, apply clean design:
```tsx
// Main container
<div className="w-full space-y-4">
  <div className="border border-border-subtle rounded p-4" style={{ borderRadius: '4px' }}>
    {/* Input content */}
  </div>
</div>
```

**Step 2: Update textarea styling**
Sharp corners, no fancy effects:
```tsx
<textarea
  className="w-full bg-transparent text-text-primary placeholder:text-text-muted resize-none focus:outline-none"
  style={{ minHeight: '120px' }}
  placeholder="Describe the task in detail..."
/>
```

**Step 3: Update step indicator**
Clean, minimal progress display:
```tsx
<div className="flex items-center gap-2 text-text-muted text-sm">
  <span className="font-mono">{currentStep}</span>
  <span>/</span>
  <span className="font-mono">{totalSteps}</span>
</div>
```

**Step 4: Update action buttons**
Sharp, clean button styling:
```tsx
<button
  className="px-4 py-2 bg-accent-600 text-white font-medium rounded-sm hover:bg-accent-500 transition-colors"
  style={{ borderRadius: '2px' }}
>
  Continue
</button>
```

**Step 5: Update swipe feedback**
Replace glow effects with subtle color shift:
```tsx
// Remove glow animations, use simple opacity
className={cn(
  "transition-opacity duration-150",
  swipeFeedback === 'proceed' && "opacity-80",
  swipeFeedback === 'back' && "opacity-60"
)}
```

**Step 6: Run build to verify**
Run: `npm run build`
Expected: Build succeeds

**Step 7: Commit**
```bash
git add src/components/TaskInput.tsx
git commit -m "refactor: Redesign TaskInput with sharp styling"
```

---

### Task 8: Redesign TaskList and TaskItem

**Files:**
- Modify: `D:\kilo\planning-system\src\components\TaskList.tsx`
- Modify: `D:\kilo\planning-system\src\components\TaskItem.tsx`

**Step 1: Update TaskList container**
```tsx
// TaskList.tsx
<div className="space-y-3">
  {tasks.map(task => (
    <TaskItem key={task.id} task={task} />
  ))}
</div>
```

**Step 2: Update TaskItem card**
Remove hover glow, use border shift:
```tsx
// TaskItem.tsx
<div
  className="p-4 bg-surface border border-border-subtle cursor-pointer transition-colors hover:border-border-default"
  style={{ borderRadius: '4px' }}
>
  <div className="flex items-start justify-between gap-4">
    <p className="text-text-primary">{task.description}</p>
    <span className="text-text-muted text-sm font-mono shrink-0">
      {task.valueClass}
    </span>
  </div>
</div>
```

**Step 3: Update status badges**
Clean, minimal badges:
```tsx
<span className="px-2 py-0.5 text-xs font-medium bg-accent-100 text-accent-700">
  {task.type}
</span>
```

**Step 4: Run build to verify**
Run: `npm run build`
Expected: Build succeeds

**Step 5: Commit**
```bash
git add src/components/TaskList.tsx src/components/TaskItem.tsx
git commit -m "refactor: Redesign TaskList/TaskItem with clean cards"
```

---

### Task 9: Redesign TrajectoryEditor

**Files:**
- Modify: `D:\kilo\planning-system\src\components\TrajectoryEditor.tsx`

**Step 1: Update modal overlay**
Remove blur, use solid overlay:
```tsx
<div className="fixed inset-0 bg-base/90 flex items-center justify-center p-6 z-modal">
  {/* Modal content */}
</div>
```

**Step 2: Update modal content**
Sharp corners, clean styling:
```tsx
<div
  className="w-full max-w-2xl bg-surface border border-border-subtle p-6"
  style={{ borderRadius: '4px' }}
>
  <h2 className="text-lg font-semibold text-text-primary mb-4">
    Edit Trajectory
  </h2>
  <textarea
    className="w-full bg-input border border-border-default text-text-primary placeholder:text-text-muted p-3 focus:border-accent-500 focus:outline-none"
    style={{ borderRadius: '3px' }}
  />
</div>
```

**Step 3: Run build to verify**
Run: `npm run build`
Expected: Build succeeds

**Step 4: Commit**
```bash
git add src/components/TrajectoryEditor.tsx
git commit -m "refactor: Redesign TrajectoryEditor with sharp modal"
```

---

### Task 10: Redesign TaskEditModal

**Files:**
- Modify: `D:\kilo\planning-system\src\components\TaskEditModal.tsx`

**Step 1: Update modal styling**
Apply same pattern as TrajectoryEditor:
```tsx
<div className="fixed inset-0 bg-base/90 flex items-center justify-center p-6 z-modal">
  <div
    className="w-full max-w-lg bg-surface border border-border-subtle p-6"
    style={{ borderRadius: '4px' }}
  >
    {/* Form fields with sharp inputs */}
  </div>
</div>
```

**Step 2: Update form inputs**
```tsx
<input
  className="w-full bg-input border border-border-default px-3 py-2 text-text-primary focus:border-accent-500 focus:outline-none"
  style={{ borderRadius: '3px' }}
/>
```

**Step 3: Run build to verify**
Run: `npm run build`
Expected: Build succeeds

**Step 4: Commit**
```bash
git add src/components/TaskEditModal.tsx
git commit -m "refactor: Redesign TaskEditModal with clean form"
```

---

### Task 11: Redesign Notification

**Files:**
- Modify: `D:\kilo\planning-system\src\components\Notification.tsx`

**Step 1: Update toast styling**
Remove glows, use solid colors:
```tsx
<div
  className="px-4 py-3 bg-surface border border-border-subtle text-text-primary"
  style={{ borderRadius: '4px' }}
>
  {message}
</div>
```

**Step 2: Run build to verify**
Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**
```bash
git add src/components/Notification.tsx
git commit -m "refactor: Redesign Notification with clean toast"
```

---

## Phase 3: Verification & Deployment

### Task 12: Verify Anti-Pattern Compliance

**Step 1: Run anti-pattern checklist**
Review all components for:
- [ ] No gradients (except semantic progress bars)
- [ ] No glassmorphism
- [ ] No border-radius > 4px on structural elements
- [ ] No text-shadow or glow effects
- [ ] No eyebrow labels (uppercase + letter-spacing)
- [ ] No KPI grid as default layout

**Step 2: Fix any violations found**
If any anti-patterns remain, create fix commit.

**Step 3: Commit**
```bash
git add -A
git commit -m "fix: Remove remaining anti-patterns"
```

---

### Task 13: Verify Accessibility

**Step 1: Check contrast ratios**
Verify:
- Primary text on background: ≥ 4.5:1
- Secondary text on background: ≥ 4.5:1
- Muted text on background: ≥ 3:1

**Step 2: Check focus states**
Verify all interactive elements have visible focus.

**Step 3: Run build**
Run: `npm run build`
Expected: Build succeeds

---

### Task 14: Build and Deploy

**Step 1: Run production build**
Run: `npm run build`
Expected: Build succeeds with no errors

**Step 2: Commit all changes**
```bash
git add -A
git commit -m "feat: Complete Prios UI redesign - Technical Precision"
git push origin main
```

**Step 3: Deploy to Vercel**
Run: `npx vercel --prod`
Expected: Deployment succeeds

**Step 4: Verify deployment**
Navigate to: `https://prios-app.vercel.app`
Verify: All components display with new design

---

## Execution Handoff

**Plan complete and saved to `docs/plans/2026-03-24-prios-ui-redesign-implementation.md`.**

**Two execution options:**

**1. Subagent-Driven (this session)**
- I dispatch fresh subagent per task
- Review between tasks
- Fast iteration with quality gates

**2. Parallel Session (separate)**
- Open new session with executing-plans
- Batch execution with checkpoints

**Which approach?**
