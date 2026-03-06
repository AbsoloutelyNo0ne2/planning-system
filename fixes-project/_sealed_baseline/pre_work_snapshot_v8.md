# Pre-Work Snapshot: White Screen Fix
**Task:** Fix white screen on app startup (localhost:5173)
**Task Tier:** 4 (Project-Level, Critical Bug)
**Expected Effort:** 2-4 hours
**Timestamp:** 2026-02-22

---

## Section 1: Problem Understanding

### 1.1 Current State
A Windows desktop task planning application built with Tauri + React + TypeScript + Vite. The application builds successfully but renders a white screen when accessed via browser at localhost:5173.

### 1.2 Bug Description
- **Trigger:** Running `npm run dev` and opening localhost:5173
- **Symptom:** Entire page is white, nothing renders
- **Build Status:** No build errors shown in terminal
- **Previous Fixes:** 4 bugs fixed (step skipping, white screen crash, actor buttons, trajectory) but runtime issue persists

### 1.3 Root Cause Hypotheses
1. **React Error Boundary catching crash** - Component throws during render
2. **Missing CSS/Tailwind configuration** - Styles not loading, content invisible
3. **Store initialization failure** - Zustand stores throwing on init
4. **TypeScript compilation error** - Runtime error not caught by build
5. **Missing index.html root element** - React can't find mount point
6. **Import/module resolution error** - Circular dependency or missing export

### 1.4 Technical Context
- **Stack:** Tauri 2.0, React 18, TypeScript, Zustand, Tailwind CSS, Vite
- **Entry Point:** src/main.tsx (renders App component)
- **Build Tool:** Vite (dev server on port 5173)
- **Last Known Working:** Unknown - has never worked for user

---

## Section 2: Approach Selection

### 2.1 Selected Approach: Phased Development with 5-Layer Construction

**Phase 1: Foundation - Diagnosis (Layer 1-5)**
- Verify index.html structure
- Check browser console for errors
- Add error boundary to catch crashes
- Verify CSS/Tailwind loading

**Phase 2: Core Fix - Implementation (Layer 1-5)**
- Fix identified root cause
- Add defensive programming
- Ensure stores initialize correctly

**Phase 3: Verification - Testing (Layer 1-5)**
- Manual verification (white screen gone)
- Add runtime error detection
- Verify all features work

### 2.2 Alternative Approaches Rejected

**Option A: Blind Fix Attempt**
- Guess at cause and apply patches
- **Rejected:** No evidence-based approach, high regression risk

**Option B: Full Rewrite**
- Rebuild from scratch
- **Rejected:** Overkill, existing code is functional, just runtime issue

---

## Section 3: Project Structure Map

### 3.1 Files to Analyze/Modify
```
planning-system/
├── index.html                    # [READ] Verify root element exists
├── src/
│   ├── main.tsx                  # [READ/MAYBE_MODIFY] Entry point
│   ├── components/App.tsx        # [READ/MAYBE_MODIFY] Main component
│   ├── components/index.ts       # [READ] Export verification
│   ├── styles/index.css          # [READ/MAYBE_MODIFY] Tailwind imports
│   ├── stores/
│   │   ├── taskStore.ts          # [READ] Init logic
│   │   ├── actorStore.ts         # [READ] Init logic
│   │   ├── trajectoryStore.ts    # [READ] Init logic
│   │   └── limitStore.ts         # [READ] Init logic
│   └── types/*.ts                # [READ] Type definitions
├── tailwind.config.js            # [READ] Config verification
├── vite.config.ts                # [READ] Build config
└── package.json                  # [READ] Dependencies
```

### 3.2 Logical Blocks

**Phase 1: Diagnosis**
- index.html: Verify `<div id="root"></div>` exists
- Browser console: Capture error messages
- Error boundary: Add to App.tsx
- CSS check: Verify Tailwind directives present

**Phase 2: Core Fix**
- Based on Phase 1 findings
- Target specific failure point
- Minimal surgical fix

**Phase 3: Verification**
- Manual browser verification
- Error boundary tests
- Feature smoke tests

---

## Section 4: Key Architectural Decisions

| Decision | Rationale |
|----------|-----------|
| Phase 1: Diagnosis first | Must identify root cause before fixing |
| Add React Error Boundary | Catches render errors, shows helpful message |
| Check CSS/Tailwind first | Most common white screen cause |
| Verify stores init correctly | Zustand can fail silently |
| Manual verification required | White screen is visual issue, needs human eyes |

---

## Section 5: Assumptions

| # | Assumption | Confidence | Impact if Wrong |
|---|------------|------------|-----------------|
| 1 | Issue is in React layer, not Vite config | 85% | Would need vite troubleshooting |
| 2 | CSS/Tailwind misconfiguration likely culprit | 75% | Would need deeper React debugging |
| 3 | Stores may be throwing on init | 70% | Would need store refactoring |
| 4 | index.html is correctly configured | 60% | May need HTML fixes |
| 5 | Browser console will show error details | 80% | May need to add manual logging |

---

## Section 6: Success Criteria

### Phase 1 (Foundation)
- [ ] Root cause identified with evidence
- [ ] Browser console error captured
- [ ] Specific failing component/file identified

### Phase 2 (Core Fix)
- [ ] White screen resolved
- [ ] App renders visible content
- [ ] No console errors on startup

### Phase 3 (Verification)
- [ ] All 5 task creation steps accessible
- [ ] Actor management works
- [ ] Trajectory editing works
- [ ] No regressions in previous fixes

---

## Section 7: Predicted Risk Areas

1. **Multiple overlapping issues** - One fix reveals another
2. **Environment-specific bug** - Works in test, fails for user
3. **Silent Zustand failure** - Store init fails without error
4. **Tailwind config mismatch** - Classes not compiled
5. **Missing polyfill** - Browser compatibility issue

---

## Section 8: Confidence Summary

| Phase | Confidence | Risk |
|-------|------------|------|
| Phase 1 (Diagnosis) | 90% | Low - systematic approach |
| Phase 2 (Fix) | 75% | Medium - depends on findings |
| Phase 3 (Verify) | 85% | Low - human verification |
| **Overall** | **83%** | **Medium** |

---

## Section 9: Development Phases

### Phase 1: Foundation - Diagnosis
**Goal:** Identify exact root cause of white screen

**Success Criteria:**
- [ ] index.html structure verified
- [ ] Browser console errors captured
- [ ] Specific failure point identified
- [ ] Error boundary added for future debugging

**Features Included:**
- Error detection
- Root cause analysis
- Diagnostic logging

**Features Deferred:**
- Actual fixes → Phase 2
- Full testing → Phase 3

**Test Method:** Human verification (browser console inspection)

**Status:** PENDING

---

### Phase 2: Core Fix - Implementation
**Goal:** Fix the identified root cause

**Success Criteria:**
- [ ] White screen eliminated
- [ ] App renders content
- [ ] No startup errors
- [ ] Previous fixes still work

**Features Included:**
- Root cause fix
- Defensive programming
- Error handling

**Features Deferred:**
- Polish → Phase 3

**Test Method:** Human verification + automated tests

**Status:** PENDING

---

### Phase 3: Verification - Final Testing
**Goal:** Verify complete functionality

**Success Criteria:**
- [ ] Task creation flow works
- [ ] Actor management works
- [ ] All 4 previous bugs still fixed
- [ ] No console warnings

**Features Included:**
- Full feature verification
- Regression testing
- Documentation update

**Features Deferred:** None (final phase)

**Test Method:** Human verification + Playwright E2E

**Status:** PENDING

---

**END OF PRE-WORK SNAPSHOT**

**USER CONFIRMATION REQUIRED:** Please review this plan. Confirm to proceed with Phase 1 (Diagnosis).
