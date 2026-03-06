# Pre-Work Snapshot: Planning System Bug Fixes
**Task Tier:** 4 (Project-Level, >60 min execution)  
**Expected Effort:** 2-3 hours  
**Timestamp:** 2026-02-20  
**Sealed Location:** `/_sealed_baseline/pre_work_snapshot.md`

---

## Section 1: Problem Understanding

### 1.1 Current State
A Windows desktop task planning application has been built using Tauri 2.0 + React + TypeScript. Core functionality exists but several critical bugs remain that prevent proper user experience.

### 1.2 Identified Bugs (User-Reported)
1. **Step Skipping Bug:** Step 2 (value class selection) is skipped during task creation flow
2. **White Screen Crash:** App crashes to white screen when finishing the dialog window
3. **Actor Button Failures:** +Actor and -Actor buttons do not work (edit/save works)
4. **Trajectory Editing Unknown:** User unsure how to edit trajectories
5. **State Management Issues:** Multiple step progression logic errors

### 1.3 Technical Context
- **Stack:** Tauri 2.0, React 18, TypeScript, Zustand, Tailwind CSS, Vite
- **State:** 4 Zustand stores (task, limit, actor, trajectory)
- **Backend:** Rust file operations via Tauri commands
- **Key Files:** TaskInput.tsx (multi-step form), actorStore.ts (actor management)

### 1.4 Root Cause Hypotheses
- Step skipping: `isComplete` flag or step increment logic error
- White screen: Component rendering error (null/undefined access) or React error boundary catch
- Actor buttons: Event handler binding or store action dispatch issue
- Trajectory: UI/UX discoverability issue or store integration problem

---

## Section 2: Approach Selection

### 2.1 Alternative Approaches

**Option A: Reactive Debugging (Quick Fix)**
- Jump directly to suspected files
- Apply targeted patches
- Test manually
- **Rejected:** High regression risk, no verification, no prevention

**Option B: Systematic TDD Approach (Selected)**
- Write failing tests for each bug first
- Implement fixes with test verification
- Add regression prevention tests
- Full code review and QA
- **Selected:** Provides verification, prevents regression, follows TDD principles

**Option C: Rewrite Affected Components**
- Rebuild TaskInput from scratch
- Rewrite actor management
- **Rejected:** Overkill for known bugs, introduces new risks

### 2.2 Fix Strategy
```
Phase 1: Bug Reproduction & Test Creation
├── Create failing tests for each bug
├── Document reproduction steps
└── Verify bugs exist in current code

Phase 2: Root Cause Analysis
├── Use debugger on failing tests
├── Trace execution paths
└── Identify exact failure points

Phase 3: Implementation
├── Fix step progression logic
├── Fix actor button handlers
├── Fix white screen cause
├── Add defensive programming
└── Verify all tests pass

Phase 4: Regression Prevention
├── Add integration tests
├── Add E2E tests with Playwright
└── Document known issues

Phase 5: Verification & Delivery
├── Run full test suite
├── Manual verification
└── Update documentation
```

### 2.3 Testing Strategy
- **Unit Tests:** Jest/Vitest for individual functions and stores
- **Integration Tests:** Component interaction testing
- **E2E Tests:** Playwright for full user flow simulation
- **Coverage Target:** 80%+ for fixed components

---

## Section 3: Project Structure Map

### 3.1 Planned File Structure
```
planning-system/
├── src/
│   ├── components/
│   │   ├── TaskInput.tsx          # [MODIFY] Step flow logic fix
│   │   ├── TaskList.tsx           # [READ] Reference only
│   │   ├── TaskItem.tsx           # [READ] Reference only
│   │   └── Notification.tsx       # [READ] Reference only
│   ├── stores/
│   │   ├── taskStore.ts           # [MODIFY] Task creation fix
│   │   ├── actorStore.ts          # [MODIFY] Actor button actions
│   │   ├── trajectoryStore.ts     # [MODIFY] Trajectory editing
│   │   └── limitStore.ts          # [READ] Reference only
│   ├── types/
│   │   ├── task.ts                # [READ] Type definitions
│   │   ├── actor.ts               # [READ] Type definitions
│   │   └── trajectory.ts          # [READ] Type definitions
│   └── services/
│       └── sortService.ts         # [READ] Reference only
├── tests/
│   ├── unit/
│   │   ├── taskInput.test.ts      # [NEW] Step progression tests
│   │   ├── actorStore.test.ts     # [NEW] Actor action tests
│   │   └── trajectoryStore.test.ts # [NEW] Trajectory tests
│   ├── integration/
│   │   └── taskCreation.test.ts   # [NEW] Full flow tests
│   └── e2e/
│       └── taskFlow.spec.ts       # [NEW] Playwright tests
└── fixes-project/
    ├── pre_work_snapshot.md       # [THIS FILE]
    ├── should_work.md             # [PENDING] Perfection loop
    ├── reasoning_audit.md         # [PENDING] Post-completion
    ├── post_work_snapshot.md      # [PENDING] Post-completion
    └── TEST_RESULTS.md            # [NEW] Test documentation
```

### 3.2 Logical Blocks to Modify

**TaskInput.tsx:**
- Lines ~40-80: Step progression state machine
- Lines ~100-150: `isComplete` flag logic
- Lines ~200-300: Form submission handler
- Lines ~350-450: Step 2 (value class) rendering

**actorStore.ts:**
- Lines ~40-60: addActor action
- Lines ~70-90: removeActor action
- Lines ~100-120: updateActor action (working, for reference)

**trajectoryStore.ts:**
- Lines ~50-80: updateTrajectory action
- Lines ~100-120: UI integration points

---

## Section 4: Key Architectural Decisions

### 4.1 Decision Log

| Decision | Rationale | Alternatives Rejected |
|----------|-----------|----------------------|
| TDD-first approach | Ensures bugs are actually fixed; prevents regression | Direct patching without tests |
| Keep existing store architecture | Bugs are in logic, not architecture; rewriting adds risk | Full store rewrite |
| Add defensive null checks | Prevents white screen from undefined access | Assume valid state always |
| Add step validation guards | Prevents invalid step transitions | Trust user flow logic |
| Playwright for E2E | Real browser testing for Tauri desktop app | JSDOM (inaccurate for desktop) |

### 4.2 Fix-Specific Decisions

**Step Skipping Fix:**
- Add explicit step increment validation
- Ensure step 2 is never bypassed
- Add debug logging for step transitions

**Actor Button Fix:**
- Verify event handler binding
- Check store action dispatch
- Ensure state immutability

**White Screen Fix:**
- Add error boundary to TaskInput
- Add null checks before accessing nested properties
- Add component-level error recovery

---

## Section 5: Assumptions

| # | Assumption | Confidence | Impact if Wrong |
|---|------------|------------|-----------------|
| 1 | Bugs are in React/TypeScript layer, not Rust backend | 85% | Would need Rust debugging tools |
| 2 | Step skipping is logic error, not race condition | 90% | Would need async state analysis |
| 3 | Actor buttons have handlers defined but not bound correctly | 80% | May require UI framework debugging |
| 4 | White screen is React render error, not Tauri crash | 75% | Would need Tauri-level debugging |
| 5 | Tests can reproduce all bugs deterministically | 85% | May need manual reproduction steps |
| 6 | User's assessment of "edit works" is accurate | 70% | Actor CRUD may have broader issues |

---

## Section 6: Success Criteria

### 6.1 Bug Fixes (Measurable)
- [ ] Step 2 (value class) displays and requires user input before advancing
- [ ] Task creation completes without white screen crash
- [ ] +Actor button adds new actor to store
- [ ] -Actor button removes selected actor from store
- [ ] Trajectory editing UI is discoverable and functional

### 6.2 Test Coverage (Measurable)
- [ ] Unit tests for step progression: 100% branch coverage
- [ ] Unit tests for actor actions: 100% coverage
- [ ] Integration tests for task creation flow: passes
- [ ] E2E tests for full user journey: passes
- [ ] Overall coverage for modified files: ≥80%

### 6.3 Quality Gates (Verifiable)
- [ ] All existing tests still pass (no regressions)
- [ ] No TypeScript compilation errors
- [ ] No ESLint warnings in modified files
- [ ] Manual verification confirms fixes work in actual app
- [ ] Documentation updated with known issues and workarounds

---

## Section 7: Predicted Risk Areas

### 7.1 High-Risk Areas
1. **State Machine Complexity:** Step progression has multiple interacting flags (isComplete, currentStep, formData)
2. **Store Action Binding:** Zustand actions may not be properly bound to components
3. **Race Conditions:** Async store updates may cause timing issues
4. **Error Boundaries:** Missing error boundaries make white screen debugging difficult

### 7.2 Risk Mitigation
- Add extensive logging during debugging phase
- Use React DevTools for state inspection
- Implement error boundaries before fixing white screen
- Test each fix in isolation before combining

### 7.3 Failure Modes
| Failure Mode | Likelihood | Impact | Mitigation |
|--------------|------------|--------|------------|
| Tests pass but bug persists in app | Medium | High | Manual verification required |
| Fix introduces new bug | Medium | High | Comprehensive test suite; git revert |
| Cannot reproduce white screen deterministically | Medium | Medium | Add error logging; user retest |
| Actor store has deeper architectural issue | Low | High | Code review before implementation |
| Step logic entangled with other features | Medium | Medium | Careful refactoring; feature flags |

---

## Section 8: Confidence Summary

### 8.1 Per-Component Confidence

| Component | Fix Confidence | Risk Level | Notes |
|-----------|----------------|------------|-------|
| Step Skipping | 85% | Medium | Logic fix, well-understood |
| White Screen | 70% | High | Root cause unclear, needs debugging |
| Actor Buttons | 80% | Medium | Likely binding issue |
| Trajectory Edit | 60% | High | Unclear if UX or logic issue |
| Test Creation | 90% | Low | Standard TDD practice |

### 8.2 Overall Confidence
**Overall Confidence: 77%**

Primary uncertainties:
- White screen root cause not yet identified
- Trajectory editing unclear if logic or UX issue
- May discover additional bugs during fixing

Mitigation: Systematic TDD approach provides verification at each step.

---

## Section 9: Execution Plan Summary

### 9.1 Agent Delegation

| Task | Agent | Dependencies | Estimated Time |
|------|-------|--------------|----------------|
| Write failing unit tests | dev_team-qa_engineer | None | 30 min |
| Diagnose white screen cause | dev_team-debugger_optimizer | Tests | 45 min |
| Fix step progression logic | dev_team-frontend_dev | Diagnosis | 30 min |
| Fix actor button bindings | dev_team-frontend_dev | Step fix | 20 min |
| Fix trajectory editing | dev_team-frontend_dev | Actor fix | 20 min |
| Write integration tests | dev_team-qa_engineer | All fixes | 30 min |
| Write E2E tests | e2e-runner | Integration tests | 30 min |
| Code review | dev_team-code_reviewer | All code | 20 min |
| Documentation | dev_team-technical_writer | Review | 15 min |

### 9.2 Parallel Execution Batches

**Batch 1 (Independent):**
- QA Engineer: Write failing unit tests
- Debugger: Begin white screen analysis

**Batch 2 (After Batch 1):**
- Frontend Dev: Fix step progression
- Frontend Dev: Fix actor buttons (parallel, different files)

**Batch 3 (After Batch 2):**
- Frontend Dev: Fix trajectory editing
- QA Engineer: Write integration tests

**Batch 4 (After Batch 3):**
- E2E Runner: End-to-end tests
- Code Reviewer: Review all changes

**Batch 5 (After Batch 4):**
- Technical Writer: Documentation updates

---

## Section 10: User Confirmation Gate

**STOP:** Do not proceed to implementation until user confirms this plan.

### 10.1 Confirmation Required
Please review and confirm:
1. Bug list is accurate and complete
2. Approach (TDD-first) is acceptable
3. Success criteria are appropriate
4. Time estimate (2-3 hours) is reasonable

### 10.2 Questions for User
1. Can you provide exact reproduction steps for the white screen?
2. Are there any other bugs not listed above?
3. Is trajectory editing expected to be in-app or via configuration file?
4. What is the priority order for these fixes?

---

**END OF PRE-WORK SNAPSHOT**

**Next Step:** Await user confirmation, then seal to `/_sealed_baseline/` and begin execution.
