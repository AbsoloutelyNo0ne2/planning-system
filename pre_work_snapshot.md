# Pre-Work Snapshot — Planning System Bug Fixes & Completion
**Task**: Fix critical bugs and complete missing features in planning system
**Tier**: 4 (Multi-step project, >60 minutes expected)
**Timestamp**: 2026-02-23
**Protocol**: UMP v8.0 Full Ultimate Protocol

---

## Section 1: Problem Understanding

### Original Task (from user)
The user has a planning system app that "doesn't work fully." Specific issues:
1. **Step 2 is skipped** - The value class selection step can be bypassed
2. **White screen after adding task** - App crashes/goes blank after task creation
3. **Learning tasks missing** - Feature not implemented (hardcoded empty array)
4. **Potential other issues** - Need full audit

### Current State Analysis
**Tech Stack**: React 18 + TypeScript + Vite + Tauri + Zustand + Tailwind
**Architecture**: Desktop app with Rust backend for file persistence
**Test Coverage**: Vitest (unit) + Playwright (E2E) exists
**State**: Partially functional - task creation works but has race conditions

### Discovered Bugs from Code Review

**Bug 1: Step 2 Skipped (ValueClassSelector)**
- Location: TaskInput.tsx lines 425-431
- Issue: Keyboard `selectedIndex` and mouse click selection are decoupled
- When user clicks option, `selectedIndex` may not match, causing empty selection

**Bug 2: White Screen After Task Creation**
- Location: TaskInput.tsx lines 144-190 (completion useEffect)
- Issue: Race condition - useEffect re-triggers after state reset
- The effect runs on formData change, but reset order can cause re-trigger

**Bug 3: Learning Tasks Always Empty**
- Location: App.tsx line 185 - hardcoded `learningTasks={[]}`
- Issue: No store/state for learning tasks, no UI component
- Missing: learningTaskStore.ts, creation flow, display section

**Bug 4: Task Edit Not Implemented**
- Location: TaskItem.tsx
- Issue: No edit modal, no updateTask in store
- User clicks task but nothing happens for editing

**Bug 5: Type Safety Issues**
- Location: taskStore.ts lines 115-122
- Issue: String comparisons instead of TaskType enum
- Fragile and bypasses TypeScript safety

---

## Section 2: Approach Selection

### Selected Approach: Incremental Bug Fix with Feature Completion
**Rationale**: Codebase is well-structured with clear separation. Fix specific bugs and complete missing features using existing architecture.

| Approach | Pros | Cons | Decision |
|----------|------|------|----------|
| Full Rewrite | Clean slate | 4x time, discards working code | REJECTED |
| Minimal Patch | Fast | Leaves debt, features missing | REJECTED |
| Incremental Fix | Preserves code, fixes bugs, completes features | Requires testing | ACCEPTED |

### Build vs Use Analysis
| Component | Category | Decision | Justification |
|-----------|----------|----------|---------------|
| React/Vite/Tauri/Zustand | Infrastructure | USE | Already established |
| Bug Fixes | Product | BUILD | Specific to codebase |
| Learning Tasks | Product | BUILD | Unique to application |
| Edit Modal | Product | BUILD | Specific requirements |

---

## Section 3: Project Structure Map

### Planned File Changes
```
src/
├── components/
│   ├── TaskInput.tsx              [MODIFY] - Fix race condition, step logic
│   ├── TaskList.tsx               [MODIFY] - Add learning tasks handling
│   ├── TaskItem.tsx               [MODIFY] - Add edit trigger
│   ├── TaskEditModal.tsx          [NEW] - Edit task flow
│   └── LearningTaskSection.tsx    [NEW] - Learning tasks display
├── stores/
│   ├── taskStore.ts               [MODIFY] - Add updateTask, fix filtering
│   └── learningTaskStore.ts       [NEW] - Learning tasks state
├── types/
│   └── task.ts                    [VERIFY] - Enum usage
└── App.tsx                        [MODIFY] - Wire learning tasks, edit modal
```

### Function Signatures (Modified/Created)
```typescript
// TaskInput.tsx - FIXED
function useCompletionEffect(
  formData: FormData,
  currentStep: Step,
  isComplete: boolean,
  onTaskCreated: () => void
): void;

// ValueClassSelector - FIXED
interface ValueClassSelectorProps {
  selectedValue: ValueClass | null;  // Single source of truth
  onSelect: (value: ValueClass) => void;
}

// taskStore.ts - FIXED
function updateTask(taskId: string, updates: Partial<Task>): Promise<void>;
function getTasksByType(type: TaskType): Task[]; // Uses enum

// learningTaskStore.ts - NEW
interface LearningTaskStore {
  learningTasks: LearningTask[];
  addLearningTask: (task: Omit<LearningTask, 'id'>) => Promise<void>;
  updateLearningTask: (id: string, updates: Partial<LearningTask>) => Promise<void>;
}

// TaskEditModal.tsx - NEW
interface TaskEditModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskId: string, updates: Partial<Task>) => Promise<void>;
}
```

### Dependencies
```
EXISTING (no new dependencies):
- react ^18.2.0
- @tauri-apps/api ^1.5.0
- zustand ^4.4.0
- typescript ^5.0.0
- vitest ^1.0.0
- @playwright/test ^1.40.0
- tailwindcss ^3.3.0
```

---

## Section 4: Key Architectural Decisions

### Decision 1: Fix Race Condition with Ref Guard Pattern
**Context**: White screen caused by useEffect re-triggering after reset
**Decision**: Use useRef to track completion state, prevent re-trigger
**Rejected**: useCallback (insufficient), useMemo (wrong tool)

### Decision 2: Unify Selection State in ValueClassSelector
**Context**: Keyboard and mouse selection decoupled
**Decision**: Single source of truth - selectedValue prop drives UI
**Rejected**: Separate states (current approach, has bug)

### Decision 3: Separate Store for Learning Tasks
**Context**: Learning tasks have different lifecycle
**Decision**: New Zustand store following existing pattern
**Rejected**: Add to taskStore (pollutes), no persistence (data loss)

### Decision 4: Modal for Edit Mode
**Context**: Need ability to edit tasks
**Decision**: Modal overlay to preserve list context
**Rejected**: Inline edit (complex state), separate page (context loss)

### Decision 5: Enum Over String Comparison
**Context**: Task filtering uses string literals
**Decision**: Use TaskType enum everywhere
**Rejected**: Keep strings (fragile)

---

## Section 5: Assumptions

| # | Assumption | Confidence | Impact | Validation |
|---|------------|------------|--------|------------|
| 1 | White screen is React error, not Tauri crash | 85% | High | Check console |
| 2 | Learning tasks follow same storage pattern | 90% | Medium | Check spec |
| 3 | Edit allows all fields except creation_time | 95% | Low | Spec Section 11 |
| 4 | Zustand stores handle persistence correctly | 80% | High | Review fileService |
| 5 | Test infrastructure is functional | 75% | High | Run existing tests |

---

## Section 6: Success Criteria

| # | Criterion | Test Method | Measurable |
|---|-----------|-------------|------------|
| 1 | Step 2 cannot be skipped | E2E test | Yes |
| 2 | Task creation completes without white screen | E2E + manual | Yes |
| 3 | Learning tasks display in third section | E2E + unit | Yes |
| 4 | Task edit modal opens and saves changes | E2E + unit | Yes |
| 5 | Task type filtering uses enum correctly | Unit test | Yes |
| 6 | All existing tests pass | Test runner | Yes |
| 7 | New tests cover fixed bugs | Coverage report | Yes |
| 8 | No TypeScript errors | Compiler | Yes |

---

## Section 7: Predicted Risk Areas

| # | Risk | Likelihood | Impact | Mitigation |
|---|------|------------|--------|------------|
| 1 | Race condition fix introduces new async bugs | Medium | High | Thorough testing, git checkpoints |
| 2 | Learning task store conflicts with existing | Low | Medium | Follow established patterns |
| 3 | Edit modal breaks responsive layout | Medium | Low | Test multiple viewports |
| 4 | State reset affects other features | Medium | High | Comprehensive E2E testing |
| 5 | Zustand batches updates unexpectedly | Medium | Medium | Use flushSync where critical |

---

## Section 8: Confidence Summary

| Component | Confidence | Reasoning |
|-----------|------------|-----------|
| Race condition fix | 85% | Common pattern, well-understood |
| Step 2 fix | 90% | State unification straightforward |
| Learning tasks | 85% | Pattern replication |
| Edit modal | 80% | More UI complexity |
| Enum fixes | 95% | Mechanical change |
| Test coverage | 75% | Depends on infrastructure |

**Overall Confidence**: 85%

---

## Section 9: Development Phases

### Phase 1: Foundation
**Goal**: Establish baseline, verify current behavior
**Success Criteria**:
- [ ] All existing tests pass
- [ ] App runs without errors
- [ ] Git commit of current state
- [ ] Documented reproduction steps for bugs

### Phase 2: Bug Fixes (Critical)
**Goal**: Fix white screen and step 2 skip
**Success Criteria**:
- [ ] White screen fixed
- [ ] Step 2 cannot be skipped
- [ ] Tests added for both bugs

### Phase 3: Learning Tasks
**Goal**: Implement learning tasks feature
**Success Criteria**:
- [ ] Learning task store created
- [ ] Learning tasks display in UI
- [ ] Tests passing

### Phase 4: Task Edit
**Goal**: Implement task editing
**Success Criteria**:
- [ ] Edit modal UI
- [ ] Update logic in store
- [ ] Tests passing

### Phase 5: Polish & Type Safety
**Goal**: Enum fixes, final testing
**Success Criteria**:
- [ ] All TaskType comparisons use enum
- [ ] All tests pass
- [ ] No TypeScript errors

### Phase 6: Perfection Loop
**Goal**: Review, simplify, remove unnecessary code
**Success Criteria**:
- [ ] should_work.md shows convergence
- [ ] No unused code
- [ ] All criteria met

---

## Status: READY FOR USER CONFIRMATION

**BLOCKING GATE**: Awaiting user confirmation before proceeding with implementation.

Please confirm:
1. The bug fixes identified match your issues
2. The learning tasks and edit features are required
3. The approach and phases look correct

Confirm to proceed, or specify corrections.
