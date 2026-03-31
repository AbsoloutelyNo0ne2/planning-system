# Layout Wireframe: 1/3 + 2/3 Split Layout

## 1. Current Layout Analysis

**Existing Structure:** Single-column vertical stack with the following order:

```
+------------------------------------------+
| HEADER: Trajectory + User Badge + Logout |
+------------------------------------------+
| ACTORS TABLE: Full-width section         |
+------------------------------------------+
| TASK INPUT: Conditional (viewMode input) |
+------------------------------------------+
| TASK LIST: Full-width, 3 sections        |
|  - Agentic Tasks                         |
|  - Hybrid Tasks                          |
|  - Non-Agentic Tasks                     |
+------------------------------------------+
| BOTTOM ACTIONS: Button row                |
|  [New task] [Cancel] [+Actor] [-Actor]   |
+------------------------------------------+
```

**Issues with Current Layout:**
- Task creation and task list compete for vertical space
- No simultaneous view of actors and tasks
- Excessive vertical scrolling required
- Mobile experience requires full-page transitions

---

## 2. New Layout Structure

### Overview

A responsive split-column layout with fixed header and dynamic right panel:

```
+------------------------------------------+
| HEADER: Trajectory + User Badge + Logout |  <- Unchanged
+------------------------------------------+
|  LEFT (1/3)      |  RIGHT (2/3)          |
|                  |                        |
|  [Agents]        |  [State Toggle]       |
|  Actor cards     |  -------------------  |
|  (compact)       |  [Content Area]       |
|                  |  - State A: Form      |
|                  |  - State B: Task List |
+------------------------------------------+
```

### Left Column (1/3 width)

**Content:**
- Agents header (collapsed by default, expandable)
- Actor cards/entries (compact format)
- Actor count indicator
- Quick-add actor button (+)

**Visual Treatment:**
- Background: `var(--color-bg-surface)`
- Border-right: `1px solid var(--color-border-subtle)`
- Sticky positioning (scrolls independently)

### Right Column (2/3 width)

**Toggle Mechanism:**
- Two-state toggle: **Create** | **Tasks**
- Visual: Pill-style tabs or segmented control
- Position: Top of right column, right-aligned

**State A: Task Creation Form**
- TaskInput component (existing, width-adjusted)
- Full multi-step flow accessible
- Progress indicator visible

**State B: Task List**
- TaskList component (existing)
- All three task type sections
- Scrollable within right column

### Top Header (Unchanged)

- Trajectory display (click to edit)
- User type badge (Personal/Showcase)
- Logout button

---

## 3. Visual Wireframes

### Desktop Layout (>1024px)

**State A: Task Creation Active**

```
+------------------------------------------------------------------+
|  [Personal]     "Daily planning trajectory..."          [Logout] |
+------------------------------------------------------------------+
|                     |                                             |
|  AGENTS (3)   [+]   |     [CREATE]  [TASKS]                      |
|  ---------------    |     ---------------------------------------|
|  @ Daniel           |     STEP 2 OF 6: Value Class              |
|  Primary actor      |     ---------------------------------------|
|  ---------------    |                                             |
|  @ Claude           |     [ ] Fun & Useful                       |
|  AI Assistant       |     [ ] Useful                             |
|  ---------------    |     [ ] Has to be Done                     |
|  @ GPT-4            |     [ ] Has to be Done (Boring)            |
|  Research agent     |     [ ] Fun but Useless                    |
|                     |     [ ] Boring & Useless                   |
|                     |                                             |
|                     |     ↑/↓ or W/S to navigate                 |
+------------------------------------------------------------------+
```

**State B: Task List Active**

```
+------------------------------------------------------------------+
|  [Personal]     "Daily planning trajectory..."          [Logout] |
+------------------------------------------------------------------+
|                     |                                             |
|  AGENTS (3)   [+]   |     [CREATE]  [TASKS]                      |
|  ---------------    |     ---------------------------------------|
|  @ Daniel           |     AGENTIC TASKS         [Unlimited]      |
|  Primary actor      |     ---------------------------------------|
|  ---------------    |     Task item 1...                         |
|  @ Claude           |     Task item 2...                         |
|  AI Assistant       |                                             |
|  ---------------    |     HYBRID TASKS        [3 remaining]      |
|  @ GPT-4            |     ---------------------------------------|
|  Research agent     |     Task item 3...                         |
|                     |                                             |
|                     |     NON-AGENTIC TASKS   [2 remaining]      |
|                     |     ---------------------------------------|
|                     |     Task item 4...                         |
+------------------------------------------------------------------+
```

### Tablet Layout (768-1024px)

**Adjusted ratio: 2/5 + 3/5**

```
+------------------------------------------------------------------+
|  [Personal]     "Daily planning trajectory..."          [Logout] |
+------------------------------------------------------------------+
|               |                                                   |
|  AGENTS (3)   |     [CREATE]  [TASKS]                            |
|  -----------  |     -------------------------------------------  |
|  @ Daniel     |                                                   |
|  @ Claude     |     [Content area - same as desktop               |
|  @ GPT-4      |      but narrower]                                |
|               |                                                   |
+------------------------------------------------------------------+
```

### Mobile Layout (<768px)

**Stacked layout: Single column with collapsible panels**

```
+------------------------------------------+
|  [Personal]     "Trajectory..."  [Logout] |
+------------------------------------------+
|  [CREATE]  [TASKS]                        |
+------------------------------------------+
|  [CONTENT AREA - Full width]              |
|                                           |
|  (State A: Task creation form)            |
|  OR                                       |
|  (State B: Task list)                     |
|                                           |
+------------------------------------------+
|  [AGENTS ▼]  (Collapsed, tap to expand)   |
+------------------------------------------+
```

**Mobile - Agents Expanded:**

```
+------------------------------------------+
|  [Personal]     "Trajectory..."  [Logout] |
+------------------------------------------+
|  [CREATE]  [TASKS]                        |
+------------------------------------------+
|  [CONTENT AREA - Full width]              |
|  (Scrollable)                             |
+------------------------------------------+
|  [AGENTS ▲]                               |
|  ---------------------------------------- |
|  @ Daniel - Primary actor                 |
|  @ Claude - AI Assistant                  |
|  @ GPT-4 - Research agent                 |
|  [+ Add Actor]                            |
+------------------------------------------+
```

---

## 4. Interaction States

### Toggle Between Create/Tasks

| Trigger | Action | Result |
|---------|--------|--------|
| Click "CREATE" tab | Switch to State A | Shows TaskInput, hides TaskList |
| Click "TASKS" tab | Switch to State B | Shows TaskList, hides TaskInput |
| Keyboard shortcut: `C` | Switch to Create | Quick access to task creation |
| Keyboard shortcut: `T` | Switch to Tasks | Quick access to task list |
| Task created | Auto-switch to Tasks | Shows newly created task in list |

### Agents Column Behavior

| Viewport | Default State | Expand/Collapse | Width |
|----------|---------------|-----------------|-------|
| Desktop | Always visible | N/A | Fixed 1/3 |
| Tablet | Always visible | N/A | Fixed 2/5 |
| Mobile | Collapsed | Tap header to toggle | Full width when expanded |

### Transitions

| Transition | Duration | Easing | Notes |
|------------|----------|--------|-------|
| Tab switch | 200ms | ease-out | Fade + slide |
| Mobile agents expand | 250ms | ease-in-out | Slide up |
| TaskInput steps | 150ms | ease | Existing behavior |
| Actor card hover | 100ms | ease | Subtle highlight |

---

## 5. Component Changes Required

### App.tsx

**Current:** Vertical stack with conditional viewMode
**Required Changes:**

```tsx
// Add new state for right panel toggle
const [rightPanelMode, setRightPanelMode] = useState<'create' | 'tasks'>('create');

// Remove viewMode state (replaced by rightPanelMode)
// Remove bottom actions section
// Restructure layout with flexbox/grid

// New layout structure:
<div className="flex flex-col h-screen">
  <header>...</header>
  <main className="flex flex-1 overflow-hidden">
    <aside className="w-1/3 ..."> {/* Left: Agents */}
      <AgentsColumn actors={actors} />
    </aside>
    <section className="flex-1 ..."> {/* Right: Toggle + Content */}
      <RightPanel mode={rightPanelMode} />
    </section>
  </main>
</div>
```

### TaskList.tsx

**Current:** Full-width, takes entire container
**Required Changes:**

- Adjust max-width for narrower container
- Add internal scrolling
- Maintain existing sections and styling

```tsx
// Add overflow handling
<div className="task-list space-y-6 p-4 overflow-y-auto max-h-[calc(100vh-200px)]">
```

### TaskInput.tsx

**Current:** Centered with max-w-2xl
**Required Changes:**

- Reduce max-width for right column context
- Keep existing multi-step flow
- Ensure progress bar fits narrower container

```tsx
// Adjust container width
<div className="w-full max-w-xl mx-auto p-4 ...">
```

### Actor-related Components (New)

**Create new compact components:**

```tsx
// AgentsColumn.tsx - New component
// - Collapsible on mobile
// - Compact actor cards
// - Add actor button inline

// ActorCard.tsx - New compact variant
// - Smaller padding
// - Truncated notes
// - Initial avatar
```

---

## 6. Responsive Behavior

### Breakpoints

| Breakpoint | Width | Layout | Left Width | Right Width |
|------------|-------|--------|------------|-------------|
| Desktop | >1024px | Side-by-side | 33.33% (1/3) | 66.67% (2/3) |
| Tablet | 768-1024px | Side-by-side | 40% (2/5) | 60% (3/5) |
| Mobile | <768px | Stacked | Collapsible | 100% |

### CSS Implementation

```css
/* Tailwind-based responsive classes */
.layout-container {
  @apply flex flex-col h-screen;
}

.main-content {
  @apply flex flex-1 overflow-hidden;
}

.left-column {
  @apply w-full md:w-2/5 lg:w-1/3;
  @apply border-r border-[var(--color-border-subtle)];
  @apply bg-[var(--color-bg-surface)];
  @apply hidden md:block; /* Hidden on mobile */
}

.right-column {
  @apply flex-1 overflow-y-auto;
  @apply p-4;
}

/* Mobile agents panel */
.mobile-agents {
  @apply block md:hidden;
  @apply border-t border-[var(--color-border-subtle)];
}
```

### Visual Priority

| Priority | Element | Always Visible |
|----------|---------|----------------|
| 1 | Header | Yes |
| 2 | Toggle tabs | Yes |
| 3 | Content area | Yes |
| 4 | Agents column | Desktop/Tablet only |
| 5 | Mobile agents | Expandable on demand |

---

## 7. Implementation Steps

### Phase 1: Layout Structure

1. Create `AgentsColumn.tsx` component
2. Create `ActorCard.tsx` compact variant
3. Create `RightPanel.tsx` component with toggle
4. Create `TabToggle.tsx` component

### Phase 2: App Restructure

5. Update `App.tsx` layout to flexbox split
6. Remove bottom actions section
7. Remove viewMode conditional rendering
8. Add rightPanelMode state

### Phase 3: Component Adjustments

9. Update `TaskList.tsx` for narrower width
10. Update `TaskInput.tsx` max-width
11. Add overflow handling to both components
12. Test scroll behavior independently

### Phase 4: Responsive Implementation

13. Add responsive breakpoints to layout
14. Implement mobile agents collapse
15. Add mobile tab toggle styling
16. Test all viewport sizes

### Phase 5: Polish

17. Add keyboard shortcuts (C/T)
18. Add transition animations
19. Ensure accessibility (ARIA labels)
20. Test interaction flow end-to-end

---

## 8. Design Tokens Reference

| Token | Usage |
|-------|-------|
| `--color-bg-surface` | Left column background |
| `--color-bg-base` | Right column background |
| `--color-border-subtle` | Column divider |
| `--color-accent-600` | Active tab |
| `--color-text-primary` | Headers |
| `--color-text-secondary` | Actor notes |
| `--color-text-muted` | Placeholder text |

---

## 9. Accessibility Considerations

- Tab toggle: `role="tablist"`, `aria-selected`
- Content areas: `role="tabpanel"`
- Agents column: `aria-label="Agents list"`
- Mobile collapse: `aria-expanded` state
- Keyboard: Focus management on tab switch

---

## 10. Performance Notes

- Left column: `position: sticky` for independent scroll
- Right column: Virtual scrolling for large task lists (future)
- Debounce window resize for responsive breakpoints
- Memoize ActorCard components to prevent re-renders
