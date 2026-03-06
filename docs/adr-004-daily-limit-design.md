# ADR-004: Daily Limit Design — Architecture for 20-Task Daily Limit Feature

## Status
Accepted

## Context
<!-- 
What is the issue that we're seeing that is motivating this decision or change?
Intent: Document the daily limit feature requirements and constraints.
Content will include:
- User wants a daily task limit of 20 tasks
- Limit is configurable in code (constant)
- When limit reached: blur effect, text selection blocked, buttons disabled, notification shown
- Need to track daily count and reset at midnight
-->

The application must enforce a daily task limit with the following requirements from the specification:

**Functional Requirements:**
- Default limit: 20 tasks per day
- Configurable in code (constant at top of relevant file)
- Daily reset at midnight local time
- Count only completed tasks (sent button)

**UI Requirements when limit reached:**
- All tasks visually blurred (unreadable)
- Text cannot be selected via cursor (user-select: none)
- Copy button disabled
- Send button disabled with notification: "No more work for you today."
- Notification displayed in "nice small GUI notification"

**Technical Constraints:**
- Limit state must persist across app restarts
- Date boundary handling (what constitutes a "day")
- Performance: check should be fast
- Reactiveness: UI must update immediately when limit is reached

## Decision
<!-- 
What is the change that we're proposing or have agreed to implement?
Intent: State the architectural approach for the daily limit feature.
Content will include:
- Separate limitStore for limit state
- limitService for business logic
- CSS classes for blur and selection blocking
- Limit state stored in JSON file
-->

We will implement the daily limit feature with a **layered architecture**:

### Architecture Overview
```
┌─────────────────────────────────────────────┐
│  Presentation Layer (React Components)       │
│  ┌───────────────────────────────────────┐ │
│  │ TaskItem.tsx                          │ │
│  │ - Applies 'limit-reached' CSS class   │ │
│  │ - Conditionally disables Copy button  │ │
│  │ - Conditionally disables Send button  │ │
│  └───────────────────────────────────────┘ │
│  ┌───────────────────────────────────────┐ │
│  │ Notification.tsx                      │ │
│  │ - Shows when limit reached + Send     │ │
│  └───────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
│  State Layer (Zustand)                      │
│  ┌───────────────────────────────────────┐ │
│  │ limitStore.ts                         │ │
│  │ - tasksCompletedToday: number         │ │
│  │ - lastResetDate: string               │ │
│  │ - limitReached: boolean               │ │
│  │ - Actions: increment, reset, check    │ │
│  └───────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
│  Service Layer (Business Logic)             │
│  ┌───────────────────────────────────────┐ │
│  │ limitService.ts                       │ │
│  │ - checkLimitReached()                 │ │
│  │ - incrementTaskCount()                │ │
│  │ - shouldReset()                       │ │
│  │ - DAILY_TASK_LIMIT constant           │ │
│  └───────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
│  Persistence Layer (JSON Files)           │
│  ┌───────────────────────────────────────┐ │
│  │ data/limit.json                       │ │
│  │ - { count, lastResetDate }            │ │
│  └───────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

### Key Design Decisions

**1. Storage Location: Separate limit.json file**
- Limit state is orthogonal to task data
- Allows limit reset without touching task history
- Simpler than calculating from task timestamps

**2. CSS-Based Visual Effects**
- `filter: blur(4px)` for visual blur (not text obfuscation)
- `user-select: none` for text selection blocking
- Both applied via conditional CSS class when `limitReached: true`

**3. Button Behavior**
- Copy button: Disabled when limit reached (as specified)
- Send button: Disabled when limit reached, triggers notification
- Notification: Toast-style in-app notification (not OS native)

**4. Date Handling**
- Store dates in ISO format (YYYY-MM-DD) in local time
- Reset check on app startup and before each task send
- Compare current date vs lastResetDate

**5. Constant Configuration**
- `DAILY_TASK_LIMIT = 20` in `src/constants/config.ts`
- Exported constant, imported where needed
- Changing requires app restart (compile-time constant)

## Consequences
<!-- 
What becomes easier or more difficult to do because of this change?
Intent: Document practical impacts of the daily limit architecture.
Content will include:
- Clear separation of concerns
- Testable business logic
- CSS effects are simple and performant
- Edge cases around date boundaries
-->

**Positive Consequences:**
- **Clear separation of concerns**: Limit logic isolated from task logic
- **Testable business logic**: `limitService.ts` can be unit tested independently
- **Simple CSS effects**: Standard CSS properties, no JavaScript needed
- **Reactivity**: Zustand ensures UI updates immediately when state changes
- **Persistence**: Limit state survives app restarts
- **Configurable**: Constant is easy to find and change

**Negative Consequences:**
- **Edge cases around date boundaries**: Midnight transitions, timezone changes, daylight saving
- **Manual date handling**: No automatic cron-like reset; relies on user activity
- **Single-user assumption**: Architecture assumes one user per device
- **No per-user limits**: If multi-user support added later, architecture would need changes

**Mitigations for Negative Consequences:**
- **Date handling**: Use `date-fns` library for robust date comparison
- **Reset timing**: Check reset on app startup, before send, and on focus
- **Timezone**: Store dates in local time (user's timezone) consistently

## Alternatives Considered
<!-- 
List at least 2 alternatives with specific trade-offs.
Intent: Show evaluation of other architectural approaches.
Content will include:
- Calculate from task timestamps vs separate limit.json
- Text obfuscation vs CSS blur
- OS native notification vs in-app toast
-->

### Alternative 1: Calculate Limit from Task Timestamps
**Description:** Don't store separate limit state; calculate tasks completed today from `completed.json` by filtering timestamps.

**Pros:**
- No separate state to maintain
- Single source of truth (task data)
- Always accurate (no risk of state getting out of sync)

**Cons:**
- O(n) scan of all completed tasks on every check
- Performance degrades as history grows
- More complex query logic
- No place to store metadata (like manual reset)

**Rejected because:**
1. Performance concern: scanning all tasks on every UI update
2. Unnecessary complexity: limit state is simple (just a count and date)
3. Separate file is cleaner separation of concerns

### Alternative 2: Text Obfuscation (Replace with Asterisks)
**Description:** When limit reached, replace task text content with asterisks or "[LIMIT REACHED]" placeholders.

**Pros:**
- Guaranteed unreadable
- No CSS filter concerns
- Works on all browsers (though Tauri uses WebView2)

**Cons:**
- Loses visual structure of task list
- Harder to implement (need to store original text)
- More invasive to component logic
- User can't see how many tasks they have (even blurred)

**Rejected because:**
1. CSS blur is simpler and reversible
2. Specification specifically mentions "blur effect"
3. Maintains visual structure while preventing readability

### Alternative 3: JavaScript Event Prevention for Text Selection
**Description:** Use JavaScript to prevent selection events instead of CSS `user-select: none`.

**Pros:**
- Can show custom message when selection attempted
- More control over behavior

**Cons:**
- More code complexity
- Potential for bypass (e.g., via DevTools)
- Accessibility concerns (screen readers may not respect it)
- Performance overhead (event handlers on all task elements)

**Rejected because:**
1. CSS `user-select: none` is standard and sufficient
2. Less code, less complexity
3. Better performance (no JavaScript overhead)

### Alternative 4: OS Native Notification (Tauri notification API)
**Description:** Use Tauri's native notification API instead of in-app toast.

**Pros:**
- Native look and feel
- Works even if app is minimized
- User can disable per-app notifications in OS settings

**Cons:**
- Requires notification permission
- Styling limitations (OS-controlled)
- Adds permission complexity
- May feel intrusive for a personal tool

**Rejected because:**
1. In-app toast is more consistent with app UI
2. No permission complexity
3. "Nice small GUI notification" implies in-app, not OS native
4. Simpler to implement and style

---

## Layer Compliance
- **Layer 1 (Headers):** ✅ Document header with purpose stated
- **Layer 2 (Structure):** ✅ All sections (Status, Context, Decision, Consequences, Alternatives)
- **Layer 3 (Intent):** ✅ Comments indicate what each section will contain

## Quality Self-Assessment

### Acceptance Criteria Verification

1. **All 4 ADR files created with proper format**
   - This file: ADR-004 ✅
   - Other files created in parallel

2. **Each ADR presents at least 2 alternatives with trade-offs**
   - ✅ 4 alternatives presented (Timestamp calculation, Text obfuscation, JS event prevention, OS native notification)
   - Each with detailed Pros/Cons and rejection reasons

3. **Decisions reference specific technical requirements from the project**
   - ✅ References: 20 task limit, blur effect, user-select: none, disabled buttons, notification requirement
   - Specific component names (TaskItem.tsx, Notification.tsx)
   - Specific CSS properties (filter: blur, user-select: none)

4. **Consequences section is substantive**
   - ✅ Separated into Positive, Negative with Mitigations
   - Specific technical consequences (O(n) scan, edge cases, date handling)

5. **All files have Layer 1-3 content**
   - ✅ Layer 1: Header comment explaining document purpose
   - ✅ Layer 2: All required sections present
   - ✅ Layer 3: HTML comments indicating section intent

### Confidence Rating: **High**

**Explanation:** The daily limit architecture is well-defined because:
- Specification provides clear requirements
- Architecture diagram shows clear separation of concerns
- Each component responsibility is defined
- Alternatives cover the key design decisions

### Known Gaps / Uncertainties

1. **Exact blur value:** Specification says "blur effect" but 4px is an assumption (tunable)
2. **Notification style:** "Nice small GUI notification" is subjective; exact styling TBD
3. **Date reset edge cases:** Daylight saving time transitions not fully specified
4. **Limit constant location:** Assumed `src/constants/config.ts` but could be elsewhere
5. **Task completion definition:** Assumed "Send" button marks as completed

### Layer Compliance Confirmation
- ✅ Layer 1: File header with document purpose
- ✅ Layer 2: Complete document structure with all headings
- ✅ Layer 3: Intent comments in each major section

### Doubts / Questions

None. This ADR is ready for review.
