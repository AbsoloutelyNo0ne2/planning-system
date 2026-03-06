# Planning System - Comprehensive Test Plan

**Generated:** 2026-02-19  
**Based on:** master_spec.md v1.0  
**Test Framework:** Manual + Automated (where applicable)

---

## 1. Critical Issues (Current)

### Issue #1: Styles Not Loading (Tailwind CSS)
**Status:** BLOCKING  
**Severity:** Critical  
**Component:** UI Rendering

**Symptoms:**
- Application renders without CSS styling
- Plain HTML elements visible
- No Tailwind utility classes applied

**Test Steps:**
1. Launch the application
2. Observe window appearance
3. Verify Tailwind classes are present in DOM
4. Check console for CSS loading errors
5. Verify tailwind.config.js exists and is valid

**Expected:** Styled interface with Tailwind utility classes  
**Actual:** Unstyled/plain HTML elements

> Seems fine. All the styles seem to be there. Which is nice.

---

### Issue #2: App Crashes to White Screen After Task Creation
**Status:** BLOCKING  
**Severity:** Critical  
**Component:** Task Creation Flow

**Symptoms:**
- Application window becomes completely white
- No error message visible to user
- Process may still be running

**Test Steps:**
1. Launch application
2. Click task input field
3. Type task description (any text)
4. Press Enter to proceed
5. Select value class (any option)
6. Select type (Agentic or Non-agentic)
7. Enter trajectory match percentage (0-100)
8. Complete actor comparison notes
9. Press Enter after last actor

**Expected:** Task created and added to plan view  
**Actual:** White screen crash

> Still an issue.

---

## 2. Test Categories

### Category A: Task Creation Flow

#### Test A1: Description Input with /DIG Suggestion
**Priority:** P1 (Critical Path)  
**Precondition:** Application running, cursor in input field

**Steps:**
1. Click task input field
2. Type a short description (< 250 words)
   - Example: "Build login feature"
3. Observe for /DIG suggestion display

**Expected Results:**
- Text appears in input field
- If word count < 250: Subtle text appears: "/DIG suggested — enhance task for better clarity"
- Suggestion is dismissable/optional

**Edge Cases:**
- Test with exactly 249 words (should show suggestion)
- Test with exactly 250 words (should NOT show suggestion)
- Test with empty input (should not proceed)
- Test with special characters and unicode

> Works

---

#### Test A2: Value Class Selection
**Priority:** P1 (Critical Path)  
**Precondition:** Description entered, Enter pressed

**Steps:**
1. Verify 6 options are displayed:
   - 1. Fun and useful
   - 2. Useful
   - 3. Has to be done
   - 4. Has to be done and boring
   - 5. Fun and useless
   - 6. Boring and useless
2. Test navigation:
   - Press Down arrow key (should highlight next)
   - Press Up arrow key (should highlight previous)
   - Press 'w' key (should move up)
   - Press 's' key (should move down)
3. Press Enter to select highlighted option

**Expected Results:**
- All 6 options visible and selectable
- Navigation works with both arrow keys and w/s
- Selected value is stored
- UI advances to type selection

> This got skipped entirely for some reason.

---

#### Test A3: Type Selection
**Priority:** P1 (Critical Path)  
**Precondition:** Value class selected

**Steps:**
1. Verify 2 options are displayed:
   - 1. Agentic
   - 2. Non-agentic
2. Navigate with arrow keys or w/s
3. Press Enter to select

**Expected Results:**
- Both options visible
- Selection stored correctly
- UI advances to trajectory match input

> When I click the agentic or non agentic button, both get select, I can´t unselect them

---

#### Test A4: Trajectory Match Input
**Priority:** P1 (Critical Path)  
**Precondition:** Type selected

**Steps:**
1. Verify guiding text: "How much does this help the current trajectory goal?"
2. Enter valid percentages:
   - Test: 0
   - Test: 50
   - Test: 100
3. Enter invalid values:
   - Test: -1 (should reject)
   - Test: 101 (should reject)
   - Test: "abc" (should reject)
   - Test: Empty (should not proceed)
4. Press Enter to confirm

**Expected Results:**
- Guiding text is visible
- Values 0-100 accepted
- Invalid values rejected with message: "Enter 0-100"
- Valid value stored
- UI advances to actor comparison

> Seems to work so far.

---

#### Test A5: Actor Comparison Notes
**Priority:** P1 (Critical Path)  
**Precondition:** Trajectory match entered

**Steps:**
1. For each configured actor:
   - Verify format: "Actor [Name]: [input field]"
   - Type natural language progress note
   - Press Enter to move to next actor
2. After last actor, press Enter to finalize

**Expected Results:**
- Sequential actor inputs displayed
- Notes stored for each actor
- Task creation completes
- Plan view updates with new task

**Edge Case:**
- If no actors exist: Skip this step and complete task creation

> Seems to work.

---

#### Test A6: Complete Flow Without Crash
**Priority:** P1 (Critical Path)  
**Precondition:** Fresh application launch

**Steps:**
1. Open application
2. Create task with all fields:
   - Description: "Complete end-to-end test"
   - Value class: "Fun and useful"
   - Type: "Agentic"
   - Trajectory match: 75
   - Actor notes for all actors
3. Complete task creation

**Expected Results:**
- No white screen crash
- Task appears in plan view
- All data correctly saved
- UI remains responsive

> The app does not crash, but becomes unusable.

---

### Category B: Task Sorting

#### Test B1: Agentic Tasks Appear Before Non-Agentic
**Priority:** P2 (Core Feature)  
**Precondition:** Multiple tasks exist

**Steps:**
1. Create task A: Type = Agentic
2. Create task B: Type = Non-agentic
3. Create task C: Type = Agentic
4. Observe plan view order

**Expected Results:**
- All Agentic tasks listed first
- Non-agentic tasks listed after
- Within each group, further sorting applied

---

#### Test B2: Value Class Sorting (FUN_USEFUL First)
**Priority:** P2 (Core Feature)  
**Precondition:** Multiple tasks with different value classes

**Steps:**
1. Create tasks with all 6 value classes (Agentic type)
2. Observe sorting order within Agentic group

**Expected Order:**
1. Fun and useful
2. Useful
3. Has to be done
4. Has to be done and boring
5. Fun and useless
6. Boring and useless

---

#### Test B3: Trajectory Match Sorting (High First)
**Priority:** P2 (Core Feature)  
**Precondition:** Tasks with same value class

**Steps:**
1. Create Task A: Value class = "Useful", Trajectory match = 50
2. Create Task B: Value class = "Useful", Trajectory match = 90
3. Create Task C: Value class = "Useful", Trajectory match = 75

**Expected Order:**
- Task B (90) first
- Task C (75) second
- Task A (50) third

---

#### Test B4: Word Count Sorting (More First)
**Priority:** P2 (Core Feature)  
**Precondition:** Tasks with same value class and trajectory match

**Steps:**
1. Create Task A: 10 words, same value/trajectory
2. Create Task B: 50 words, same value/trajectory
3. Create Task C: 25 words, same value/trajectory

**Expected Order:**
- Task B (50 words) first
- Task C (25 words) second
- Task A (10 words) third

---

#### Test B5: Creation Time Sorting (Older First)
**Priority:** P2 (Core Feature)  
**Precondition:** Tasks with same value, trajectory, and word count

**Steps:**
1. Create Task A (wait 1 second)
2. Create Task B (wait 1 second)
3. Create Task C

**Expected Order:**
- Task A first (oldest)
- Task B second
- Task C third (newest)

---

### Category C: Daily Limit

#### Test C1: Limit Is 20 Tasks
**Priority:** P1 (Critical Path)  
**Precondition:** Application running

**Steps:**
1. Create 19 tasks successfully
2. Attempt to create 20th task
3. Attempt to create 21st task

**Expected Results:**
- Tasks 1-20: Created successfully
- Task 21: Creation blocked with limit message

---

#### Test C2: Blur Effect Applies at Limit
**Priority:** P1 (Critical Path)  
**Precondition:** 20 tasks exist

**Steps:**
1. Verify 20 tasks in plan view
2. Observe UI at limit

**Expected Results:**
- Blur effect applied to task area
- Visual indication of limit reached

---

#### Test C3: Text Selection Blocked
**Priority:** P1 (Critical Path)  
**Precondition:** 20 tasks exist

**Steps:**
1. Attempt to select task text
2. Try triple-click to select
3. Try Ctrl+A to select all

**Expected Results:**
- Text cannot be selected
- No text cursor appears on hover
- Keyboard shortcuts blocked

---

#### Test C4: Copy Button Disabled
**Priority:** P1 (Critical Path)  
**Precondition:** 20 tasks exist

**Steps:**
1. Look for Copy button on any task
2. Attempt to click Copy button

**Expected Results:**
- Copy button is visually disabled (grayed out)
- Click does not trigger copy action
- Cursor shows "not-allowed" on hover

---

#### Test C5: Send Button Disabled
**Priority:** P1 (Critical Path)  
**Precondition:** 20 tasks exist

**Steps:**
1. Look for Sent button on any task
2. Attempt to click Sent button

**Expected Results:**
- Sent button is visually disabled
- Click does not trigger action

---

#### Test C6: Notification Shows
**Priority:** P1 (Critical Path)  
**Precondition:** 20 tasks exist

**Steps:**
1. Attempt to create 21st task
2. Observe notification/message

**Expected Results:**
- Clear message: "Daily limit of 20 tasks reached"
- Notification is dismissable
- No crash or error

---

### Category D: UI/UX

#### Test D1: Styles Load Correctly (Tailwind)
**Priority:** P1 (Critical Path)  
**Precondition:** Application launched

**Steps:**
1. Launch application
2. Verify visual styling:
   - Colors applied
   - Typography consistent
   - Spacing correct
   - Components styled
3. Check DevTools for loaded stylesheets

**Expected Results:**
- Tailwind utility classes applied
- No unstyled elements
- No console CSS errors

---

#### Test D2: Window Size Is Correct (1200x800)
**Priority:** P2 (Core Feature)  
**Precondition:** Application launched

**Steps:**
1. Launch application
2. Check window dimensions
3. Attempt to resize

**Expected Results:**
- Default size: 1200x800 pixels
- Minimum size enforced (optional)
- Window is resizable or fixed as designed

---

#### Test D3: Trajectory Displays at Top
**Priority:** P2 (Core Feature)  
**Precondition:** Application launched, trajectory configured

**Steps:**
1. Open application
2. Observe top section of window
3. Verify trajectory text visible

**Expected Results:**
- Trajectory text centered at top
- Text is readable
- Position consistent

---

#### Test D4: Actor Table Shows Below Trajectory
**Priority:** P2 (Core Feature)  
**Precondition:** Actors configured

**Steps:**
1. Verify actor table position
2. Check format: "Actor Name: Latest comparison note"
3. Test with 1-5 actors
4. Test with 6+ actors (should scroll)

**Expected Results:**
- Table positioned below trajectory
- Each actor on separate line
- Scrollbar appears after 5 actors
- Scroll is vertical only

---

#### Test D5: Task Input Field Is Visible
**Priority:** P1 (Critical Path)  
**Precondition:** Application launched

**Steps:**
1. Verify input field visible
2. Check cursor is blinking by default
3. Click input field
4. Type test text

**Expected Results:**
- Input field clearly visible
- Cursor blinking on app open
- Text appears when typing
- Focus state clear

---

#### Test D6: Task List Displays Correctly
**Priority:** P2 (Core Feature)  
**Precondition:** Tasks exist

**Steps:**
1. Create multiple tasks
2. Observe task list display
3. Verify sections: Agentic, Non-agentic, Learning
4. Check Copy/Sent buttons on each task

**Expected Results:**
- Tasks grouped by type (Agentic, Non-agentic, Learning)
- Each task has Copy and Sent buttons
- Layout matches UI specification
- No overflow or clipping

---

#### Test D7: Button Visibility
**Priority:** P2 (Core Feature)  
**Precondition:** Application launched

**Steps:**
1. Verify bottom-left buttons:
   - [Edit] button visible
   - [Save] button visible
2. Verify bottom-right buttons:
   - [+Actor] button visible
   - [-Actor] button visible
3. Click each button

**Expected Results:**
- All buttons visible
- Buttons respond to clicks
- Appropriate actions triggered

---

### Category E: Persistence

#### Test E1: Tasks Save to File
**Priority:** P2 (Core Feature)  
**Precondition:** Tasks created

**Steps:**
1. Create 3 test tasks
2. Note their content
3. Check local file storage location
4. Verify JSON/MD file exists
5. Open file and verify content

**Expected Results:**
- File created in configured location
- Task data matches created tasks
- Format is valid JSON or MD
- All fields persisted

---

#### Test E2: Tasks Load on Restart
**Priority:** P2 (Core Feature)  
**Precondition:** Tasks saved

**Steps:**
1. Create tasks
2. Close application completely
3. Reopen application
4. Observe task list

**Expected Results:**
- Previously created tasks appear
- All data intact (description, value class, type, etc.)
- Sort order maintained

---

#### Test E3: Limit State Persists
**Priority:** P2 (Core Feature)  
**Precondition:** 20 tasks created

**Steps:**
1. Create 20 tasks
2. Close application
3. Reopen application
4. Attempt to create new task

**Expected Results:**
- Limit still enforced
- Notification appears
- No ability to exceed 20 tasks

---

#### Test E4: Trajectory Persists
**Priority:** P2 (Core Feature)  
**Precondition:** Trajectory configured

**Steps:**
1. Edit trajectory
2. Save trajectory
3. Close application
4. Reopen application

**Expected Results:**
- Trajectory text matches saved value
- Last updated timestamp maintained
- Display format correct

---

#### Test E5: Actors Persist
**Priority:** P2 (Core Feature)  
**Precondition:** Actors added

**Steps:**
1. Add 3 actors
2. Close application
3. Reopen application
4. Check actor table

**Expected Results:**
- All 3 actors present
- Actor notes maintained
- Comparison table displays correctly

---

### Category F: Data Management

#### Test F1: Task Edit Functionality
**Priority:** P2 (Core Feature)  
**Precondition:** Tasks exist

**Steps:**
1. Click on a task (not on Copy/Sent buttons)
2. Verify edit window opens
3. Modify description
4. Change value class
5. Change type
6. Change trajectory match
7. Save changes

**Expected Results:**
- Edit window opens on task click
- All fields editable except creation_time
- Changes saved successfully
- Plan view updates

---

#### Test F2: Task Delete Functionality
**Priority:** P2 (Core Feature)  
**Precondition:** Tasks exist

**Steps:**
1. Right-click on task OR use delete key (implementation dependent)
2. Confirm deletion if prompted
3. Verify task removed

**Expected Results:**
- Task removed from plan view
- File storage updated
- Sort order recalculated

---

#### Test F3: Actor Add
**Priority:** P2 (Core Feature)  
**Precondition:** Application running

**Steps:**
1. Click [+Actor] button
2. Enter actor name: "Test Actor"
3. Press Enter to confirm
4. Verify actor appears in table

**Expected Results:**
- Input prompt appears
- Actor added to list
- Table updates immediately
- Actor persists after restart

---

#### Test F4: Actor Remove
**Priority:** P2 (Core Feature)  
**Precondition:** Multiple actors exist

**Steps:**
1. Click [-Actor] button
2. Select actor to remove
3. Confirm removal if prompted
4. Verify actor removed

**Expected Results:**
- Selection interface appears
- Actor removed from list
- Associated notes handled gracefully
- Table updates immediately

---

#### Test F5: Trajectory Edit
**Priority:** P2 (Core Feature)  
**Precondition:** Application running

**Steps:**
1. Click [Edit] button (bottom left)
2. Verify trajectory editor opens
3. Modify trajectory text
4. Click [Save] button
5. Verify updated trajectory displays

**Expected Results:**
- Editor opens with current trajectory
- Format: Logical chain "Make X > Use X to make Y > ..."
- Changes save successfully
- Top display updates

---

## 3. Test Execution Order

### Priority 1 (Fix First) - BLOCKING ISSUES

**Goal:** Get application to basic working state

| Order | Test ID | Test Name | Category |
|-------|---------|-----------|----------|
| 1 | CI-1 | Styles Loading (Tailwind CSS) | Critical Issue |
| 2 | CI-2 | App Crash on Task Creation | Critical Issue |
| 3 | D1 | Styles Load Correctly | UI/UX |
| 4 | D5 | Task Input Field Is Visible | UI/UX |
| 5 | A6 | Complete Flow Without Crash | Task Creation |
| 6 | C1 | Limit Is 20 Tasks | Daily Limit |
| 7 | C2-C6 | Daily Limit Features | Daily Limit |

**Exit Criteria:**
- Application launches without styling issues
- Task creation completes without crash
- Daily limit enforcement functional

---

### Priority 2 (Core Features) - ESSENTIAL FUNCTIONALITY

**Goal:** Verify all core features work correctly

| Order | Test ID | Test Name | Category |
|-------|---------|-----------|----------|
| 8 | A1-A5 | Task Creation Flow (all steps) | Task Creation |
| 9 | B1 | Agentic Tasks First | Sorting |
| 10 | B2 | Value Class Sorting | Sorting |
| 11 | B3 | Trajectory Match Sorting | Sorting |
| 12 | B4 | Word Count Sorting | Sorting |
| 13 | B5 | Creation Time Sorting | Sorting |
| 14 | D2-D4 | Window/Trajectory/Actor Display | UI/UX |
| 15 | D6-D7 | Task List and Buttons | UI/UX |
| 16 | E1-E2 | Save and Load Tasks | Persistence |
| 17 | E3 | Limit State Persistence | Persistence |
| 18 | E4-E5 | Trajectory and Actor Persistence | Persistence |
| 19 | F1-F2 | Task Edit and Delete | Data Management |
| 20 | F3-F5 | Actor and Trajectory Management | Data Management |

**Exit Criteria:**
- All task creation steps functional
- Sorting algorithm produces correct order
- Data persists across restarts
- CRUD operations complete successfully

---

### Priority 3 (Polish) - ENHANCEMENTS & EDGE CASES

**Goal:** Ensure robustness and handle edge cases

| Order | Test ID | Test Name | Category |
|-------|---------|-----------|----------|
| 21 | A1-EC | Description Edge Cases | Task Creation |
| 22 | A4-EC | Trajectory Input Validation | Task Creation |
| 23 | D4-EC | Actor Scroll (6+ actors) | UI/UX |
| 24 | Performance | Large Task List (100+) | Performance |
| 25 | Error Handling | File Permission Errors | Error Handling |
| 26 | Stress Test | Rapid Task Creation | Performance |
| 27 | Recovery | Crash Recovery | Persistence |

**Exit Criteria:**
- Edge cases handled gracefully
- No memory leaks with large datasets
- Error messages are user-friendly

---

## 4. Bug Report Template

```markdown
## Bug #[ID]

**Severity:** [Critical/High/Medium/Low]  
**Priority:** [P1/P2/P3]  
**Component:** [TaskInput/TaskList/Sorting/Persistence/UI/etc]  
**Environment:** [OS/Version/Build]  
**Reporter:** [Name]  
**Date Reported:** [YYYY-MM-DD]

### Summary
[Brief description of the issue]

### Steps to Reproduce
1. [First step]
2. [Second step]
3. [Third step]
4. [Continue as needed]

### Expected Result
[What should happen]

### Actual Result
[What actually happens]

### Error Message
```
[Any error messages displayed or in console]
```

### Screenshots
[Attach if applicable]

### Fix Required
[Technical details on what needs to be fixed]

### Acceptance Criteria
- [ ] Fix implemented
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual test verification complete
- [ ] Code review approved
- [ ] Documentation updated (if needed)

### Notes
[Any additional context, workarounds, or related issues]
```

---

## Appendix A: Test Data

### Sample Task Descriptions

**Short (< 250 words, triggers /DIG):**
- "Build login page"
- "Fix bug"
- "Update docs"

**Long (>= 250 words, no /DIG):**
- "Implement user authentication system with JWT tokens, including login/logout endpoints, password reset flow with email verification, and role-based access control. Include rate limiting to prevent brute force attacks."

### Sample Value Classes
1. Fun and useful
2. Useful
3. Has to be done
4. Has to be done and boring
5. Fun and useless
6. Boring and useless

### Sample Trajectory Matches
- 0, 25, 50, 75, 100 (valid)
- -1, 101, abc (invalid)

### Sample Actor Notes
- "Actor A: Making progress on frontend implementation"
- "Actor B: Blocked on API response format"

---

## Appendix B: Test Environment

### Required Setup
- OS: Windows 10/11
- Node.js: v18+ (if applicable)
- Display: 1920x1080 minimum recommended

### File Locations
- Active tasks: [TBD - application data directory]
- Completed tasks: [TBD - application data directory]
- Trajectory: [TBD - application data directory]
- Actors: [TBD - application data directory]

---

## Appendix C: Sign-Off Checklist

**Test Plan Completion:**

- [ ] All P1 (Priority 1) tests executed
- [ ] All P2 (Priority 2) tests executed
- [ ] All P3 (Priority 3) tests executed
- [ ] Critical issues (CI-1, CI-2) resolved
- [ ] No blocking bugs remaining
- [ ] Code coverage >= 80% (if automated)
- [ ] Performance benchmarks met
- [ ] Documentation complete

**Approval:**

| Role | Name | Date | Signature |
|------|------|------|-----------|
| QA Engineer | | | |
| Developer | | | |
| Product Owner | | | |

---

**End of Test Plan**
