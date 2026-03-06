# Pre-Work Snapshot — Planning & Agent Dispatch System
# Generated: 2026-02-17
# Protocol: UMP Tier 4
# Status: AWAITING USER CONFIRMATION

---

## Section 1: Problem Understanding

### 1.1 Core Requirements (from master_spec.md)
A Windows desktop application for task planning and agent dispatch with the following capabilities:

**Task Creation Flow:**
1. Task description input (< 250 words triggers /DIG suggestion)
2. Value class selection (6 tiers: Fun+Useful → Boring+Useless)
3. Type selection (Agentic vs Non-agentic)
4. Trajectory match percentage (0-100)
5. Actor comparison notes (sequential input per actor)

**Task Management:**
- Deterministic sort: Agentic first → Non-agentic second
- Within groups: Value class → Trajectory match → Word count → Age
- Copy button: Formats task for AI agent consumption
- Sent button: Archives task to completed file
- Edit capability: All fields except creation time

**System Features:**
- Trajectory display (top center, editable)
- Actor comparison table (below trajectory)
- Actor management (add/remove)
- Persistent storage (JSON/MD files)

### 1.2 Additional Requirements (from user query)
**Daily Task Limit Feature:**
- Default limit: 20 tasks per day
- Configurable in code (constant at top of relevant file)
- When limit reached:
  - All tasks visually blurred (unreadable)
  - Text cannot be selected via cursor (user-select: none)
- Copy button STOPS working (disabled along with send button)
- Send button disabled with notification: "No more work for you today."
  - Notification shown in "nice small GUI notification"

### 1.3 Success Criteria
| # | Criterion | Measurable | Verification |
|---|-----------|------------|--------------|
| 1 | Task creation flow completes in < 30 seconds | Yes | Manual timing test |
| 2 | Sort order matches deterministic cascade spec | Yes | Unit test with sample data |
| 3 | Tasks persist across app restarts | Yes | Integration test |
| 4 | Copy button produces agent-ready format | Yes | Manual verification |
| 5 | Sent tasks archive correctly | Yes | File system verification |
| 6 | Daily limit enforces at exactly 20 tasks | Yes | Unit test |
| 7 | Blur effect applies when limit reached | Yes | Visual inspection |
| 8 | Text selection blocked when limit reached | Yes | Manual test |
| 9 | Notification displays on button click | Yes | Manual test |

---

## Section 2: Approach Selection

### 2.1 Selected Approach: Tauri + React + TypeScript

**Why Tauri:**
- Bundle size: ~5MB vs Electron's ~100MB+ — critical for a personal tool
- Security: Rust-based with explicit permission model for file system access
- Performance: Native speed, minimal memory footprint
- Modern: Built on web standards, active development

**Why React + TypeScript:**
- Component model matches UI decomposition needs
- Type safety prevents runtime errors in task data structures
- Ecosystem mature for desktop patterns

### 2.2 Alternatives Considered

| Approach | Pros | Cons | Rejection Reason |
|----------|------|------|------------------|
| Electron | Mature, easy web→desktop | 100MB+ bundle, memory hog | Bundle size unacceptable for personal tool |
| Native WPF (C#) | Native look, no runtime | Windows-only, more code | Cross-platform future-proofing |
| Native WinUI (C++) | Maximum performance | Steep learning curve, verbose | Development velocity |
| Flutter Desktop | Single codebase, fast | Still maturing, limited desktop ecosystem | Risk of edge cases |

### 2.3 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│  Presentation Layer (React Components)                    │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │ TaskInput   │ │ TaskList    │ │ Trajectory  │          │
│  │             │ │             │ │ Editor      │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
├─────────────────────────────────────────────────────────────┤
│  State Management (Zustand)                               │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │ TaskStore   │ │ ActorStore  │ │ LimitStore  │          │
│  │             │ │             │ │             │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
├─────────────────────────────────────────────────────────────┤
│  Services (TypeScript)                                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │ FileService │ │ SortService │ │ CopyService │          │
│  │             │ │             │ │             │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
├─────────────────────────────────────────────────────────────┤
│  Tauri Bridge (Rust - minimal)                             │
│  ┌─────────────┐ ┌─────────────┐                          │
│  │ FileSystem  │ │ Clipboard   │                          │
│  │ Commands    │ │ Commands    │                          │
│  └─────────────┘ └─────────────┘                          │
└─────────────────────────────────────────────────────────────┘
```

---

## Section 3: Project Structure Map

### Folder Structure
```
planning-system/
├── src/
│   ├── components/           # React components
│   │   ├── App.tsx          # Main app shell
│   │   ├── TaskInput.tsx    # Task creation input
│   │   ├── TaskList.tsx     # Sorted task display
│   │   ├── TaskItem.tsx     # Individual task with Copy/Sent
│   │   ├── TrajectoryEditor.tsx
│   │   ├── ActorTable.tsx
│   │   ├── ActorManager.tsx
│   │   ├── SelectModal.tsx  # Value class / Type selectors
│   │   ├── Notification.tsx # Limit reached notification
│   │   └── index.ts
│   │
│   ├── stores/              # Zustand state stores
│   │   ├── taskStore.ts     # Task CRUD + sorting
│   │   ├── actorStore.ts    # Actor management
│   │   ├── trajectoryStore.ts
│   │   ├── limitStore.ts    # Daily limit tracking
│   │   └── index.ts
│   │
│   ├── services/            # Business logic
│   │   ├── sortService.ts   # Deterministic sort algorithm
│   │   ├── fileService.ts   # File I/O via Tauri
│   │   ├── copyService.ts   # Clipboard formatting
│   │   ├── limitService.ts  # Daily limit enforcement
│   │   └── index.ts
│   │
│   ├── types/               # TypeScript definitions
│   │   ├── task.ts          # Task, ValueClass, TaskType
│   │   ├── actor.ts         # Actor, ActorNote
│   │   ├── trajectory.ts    # Trajectory
│   │   └── index.ts
│   │
│   ├── constants/           # Configuration
│   │   └── config.ts        # DAILY_TASK_LIMIT = 20
│   │
│   ├── hooks/               # Custom React hooks
│   │   ├── useTaskLimit.ts  # Limit checking hook
│   │   └── index.ts
│   │
│   ├── utils/               # Helper functions
│   │   ├── dateUtils.ts     # Date comparison for daily reset
│   │   └── index.ts
│   │
│   ├── styles/              # CSS/Tailwind
│   │   └── index.css
│   │
│   └── main.tsx             # React entry point
│
├── src-tauri/               # Tauri Rust backend
│   ├── src/
│   │   └── main.rs          # File system + clipboard commands
│   └── Cargo.toml
│
├── data/                    # Runtime data (gitignored)
│   ├── tasks.json
│   ├── completed.json
│   ├── trajectory.json
│   └── actors.json
│
├── tests/                   # Test suites
│   ├── unit/
│   │   ├── sortService.test.ts
│   │   ├── limitService.test.ts
│   │   └── copyService.test.ts
│   └── integration/
│       └── fileService.test.ts
│
├── docs/                    # Documentation
│   └── architecture.md
│
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── tauri.conf.json
```

### Function Signatures

**types/task.ts:**
```typescript
type TaskId = string;
type Timestamp = number;

enum ValueClass {
  FUN_USEFUL = 1,
  USEFUL = 2,
  HAS_TO_BE_DONE = 3,
  HAS_TO_BE_DONE_BORING = 4,
  FUN_USELESS = 5,
  BORING_USELESS = 6
}

enum TaskType {
  AGENTIC = 'agentic',
  NON_AGENTIC = 'non-agentic'
}

interface Task {
  id: TaskId;
  description: string;
  valueClass: ValueClass;
  type: TaskType;
  trajectoryMatch: number; // 0-100
  wordCount: number;
  creationTime: Timestamp;
  actorNotes: Record<ActorId, string>;
  completed: boolean;
  completedTime?: Timestamp;
}

function createTask(
  description: string,
  valueClass: ValueClass,
  type: TaskType,
  trajectoryMatch: number,
  actorNotes: Record<ActorId, string>
): Task;

function validateTask(task: Partial<Task>): ValidationResult;
```

**types/actor.ts:**
```typescript
type ActorId = string;

interface Actor {
  id: ActorId;
  name: string;
  createdAt: Timestamp;
}

interface ActorNote {
  actorId: ActorId;
  taskId: TaskId;
  note: string;
  createdAt: Timestamp;
}
```

**services/sortService.ts:**
```typescript
function sortTasks(tasks: Task[]): Task[];
function compareTasks(a: Task, b: Task): number;
function isAgentic(task: Task): boolean;
function getValueClassPriority(valueClass: ValueClass): number;
```

**services/limitService.ts:**
```typescript
const DAILY_TASK_LIMIT: number = 20;

interface LimitState {
  tasksCompletedToday: number;
  lastResetDate: string; // YYYY-MM-DD
  limitReached: boolean;
}

function checkLimitReached(state: LimitState): boolean;
function incrementTaskCount(state: LimitState): LimitState;
function shouldReset(state: LimitState, currentDate: Date): boolean;
function getRemainingTasks(state: LimitState): number;
```

**services/fileService.ts:**
```typescript
const DATA_DIR: string = 'data';
const TASKS_FILE: string = 'tasks.json';
const COMPLETED_FILE: string = 'completed.json';
const TRAJECTORY_FILE: string = 'trajectory.json';
const ACTORS_FILE: string = 'actors.json';

async function loadTasks(): Promise<Task[]>;
async function saveTasks(tasks: Task[]): Promise<void>;
async function loadCompleted(): Promise<CompletedTask[]>;
async function saveCompleted(tasks: CompletedTask[]): Promise<void>;
async function loadTrajectory(): Promise<Trajectory>;
async function saveTrajectory(trajectory: Trajectory): Promise<void>;
async function loadActors(): Promise<Actor[]>;
async function saveActors(actors: Actor[]): Promise<void>;
```

**stores/limitStore.ts:**
```typescript
interface LimitStore {
  state: LimitState;
  checkLimit: () => boolean;
  incrementCount: () => void;
  resetIfNeeded: () => void;
}

function createLimitStore(): StoreApi<LimitStore>;
```

---

## Section 4: Key Architectural Decisions

### Decision 1: Daily Limit Storage Location
**Choice:** Store in separate limit.json file, not embedded in tasks
**Reasoning:** Separation of concerns — limit state is orthogonal to task data; allows limit reset without touching task history
**Alternative:** Calculate from tasks.json timestamps
**Rejected:** Requires full task scan on every check, more complex

### Decision 2: Blur Implementation Strategy
**Choice:** CSS filter: blur(4px) with conditional class application
**Reasoning:** Simple, performant, reversible; works across all task content uniformly
**Alternative:** Obfuscate text content (replace with asterisks)
**Rejected:** Loses visual structure, harder to implement

### Decision 3: Text Selection Blocking
**Choice:** CSS user-select: none on task container when limit reached
**Reasoning:** Standard CSS, no JavaScript overhead, consistent behavior
**Alternative:** JavaScript event prevention on mouse events
**Rejected:** More code, potential for bypass, accessibility concerns

### Decision 4: Copy Button Behavior When Limit Reached
**Choice:** Copy button disabled when daily limit reached (same as send button)
**Reasoning:** User clarified that both Copy and Send buttons stop working when limit reached; enforces the daily work boundary strictly
**Alternative:** Keep Copy button functional as escape hatch
**Rejected:** User explicitly wants Copy button disabled along with Send button

### Decision 5: Notification Implementation
**Choice:** In-app toast notification using React state (not OS native)
**Reasoning:** Consistent with app UI, controllable styling, no platform dependencies
**Alternative:** Tauri native notification
**Rejected:** Adds complexity, styling limitations

### Decision 6: State Management
**Choice:** Zustand for all stores
**Reasoning:** Minimal boilerplate, TypeScript-friendly, handles async actions well
**Alternative:** Redux Toolkit
**Rejected:** Overkill for this scope, more boilerplate
**Alternative:** React Context + useReducer
**Rejected:** More verbose, less performant for frequent updates

---

## Section 5: Assumptions

### 5.1 Technical Assumptions
| # | Assumption | Confidence | Impact if Wrong |
|---|------------|------------|-----------------|
| 1 | Tauri file system API has stable read/write for JSON files | 95% | High — would need alternative storage |
| 2 | React 18+ concurrent features not required | 90% | Low — can use traditional rendering |
| 3 | No need for real-time sync across devices | 99% | Low — explicitly local-only app |
| 4 | Windows 10+ support sufficient (no Win7/8) | 95% | Medium — would limit Tauri compatibility |

### 5.2 Functional Assumptions
| # | Assumption | Confidence | Impact if Wrong |
|---|------------|------------|-----------------|
| 5 | User wants limit hard-coded, not user-configurable at runtime | 90% | Medium — would need settings UI |
| 6 | "Day" resets at midnight local time | 95% | Low — edge case behavior |
| 7 | Copy format for agents is plaintext, not structured | 85% | Medium — would need format specification |
| 8 | No need for task search/filter beyond sorting | 90% | Low — feature addition later |

### 5.3 Process Assumptions
| # | Assumption | Confidence | Impact if Wrong |
|---|------------|------------|-----------------|
| 9 | User has Node.js 18+ installed | 90% | High — would need to install |
| 10 | User has Rust toolchain installed | 85% | High — Tauri compilation requires |

---

## Section 6: Predicted Risk Areas

### Risk 1: Tauri File System Permissions
**Likelihood:** Medium | **Impact:** High
**Description:** Tauri's security model requires explicit allowlist for file system operations. If misconfigured, app cannot persist data.
**Mitigation:** Careful tauri.conf.json configuration; test file operations early in Layer 4

### Risk 2: Daily Limit Reset Edge Cases
**Likelihood:** Medium | **Impact:** Medium
**Description:** Date comparison across day boundaries, timezone issues, daylight saving time transitions
**Mitigation:** Use date-fns or similar for robust date handling; store dates in UTC

### Risk 3: Sort Algorithm Complexity
**Likelihood:** Low | **Impact:** Medium
**Description:** Tiered cascade sort with multiple tie-breakers could have subtle bugs
**Mitigation:** Comprehensive unit tests with edge cases (equal values, identical timestamps)

### Risk 4: CSS Blur Performance
**Likelihood:** Low | **Impact:** Low
**Description:** Large task lists with blur filter could cause GPU strain
**Mitigation:** Test with 100+ tasks; consider will-change or contain properties

### Risk 5: Copy Format Agent Compatibility
**Likelihood:** Medium | **Impact:** Medium
**Description:** Unclear what "agent-ready" means; format may need iteration
**Mitigation:** Start with simple format, refine based on usage

### Risk 6: Data Corruption on Crash
**Likelihood:** Low | **Impact:** High
**Description:** Unsaved data loss if app crashes during task creation
**Mitigation:** Auto-save after each state change; write to temp file then atomic rename

### Risk 7: Rust/TypeScript Type Alignment
**Likelihood:** Medium | **Impact:** Medium
**Description:** Data passing through Tauri bridge must match types exactly
**Mitigation:** Shared type definitions, strict TypeScript, serialization tests

---

## Section 7: Confidence Summary

| Component | Confidence | Notes |
|-----------|------------|-------|
| Overall architecture | 92% | Tauri pattern well-established |
| Task data model | 98% | Straightforward from spec |
| Sort algorithm | 95% | Clear requirements, testable |
| Daily limit feature | 90% | New requirement, needs testing |
| File persistence | 88% | Tauri API dependency |
| UI/UX | 85% | Subjective, may need iteration |
| Copy format | 80% | Undefined in spec |

**Overall Confidence: 90%**

---

## Section 8: Dependencies

```
DEPENDENCIES:
- tauri: ^2.0.0 (Desktop app shell)
- react: ^18.2.0 (UI framework)
- react-dom: ^18.2.0 (DOM renderer)
- zustand: ^4.4.0 (State management)
- date-fns: ^2.30.0 (Date utilities)
- lucide-react: ^0.294.0 (Icons)
- tailwindcss: ^3.3.0 (Styling)

DEV DEPENDENCIES:
- typescript: ^5.2.0 (Type safety)
- vite: ^5.0.0 (Build tool)
- vitest: ^1.0.0 (Testing)
- @tauri-apps/cli: ^2.0.0 (Tauri commands)

OPTIONAL (if needed):
- class-variance-authority: ^0.7.0 (Component variants)
- clsx: ^2.0.0 (Class name utilities)
```

---

## APPENDIX: Tier 4 Documentation Plan

Per UMP Protocol, the following will be generated during execution:

**Stage 3 (Pre-Execution):**
- WCGW.md: What Could Go Wrong (Phase 4 depth = 243 branches)
- HTPFA.md: How To Prepare For All
- PLAN.md: Step-by-step execution
- CHECKLIST.md: Task verification
- MEMORY.md: Execution learnings
- EXTRAS.md: Nice-to-have additions

**Post-Completion:**
- should_work.md: Perfection convergence log
- reasoning_audit.md: Reasoning transparency
- post_work_snapshot.md: Actual vs planned comparison

---

END OF PRE-WORK SNAPSHOT

**STATUS: AWAITING USER CONFIRMATION**

Please review this snapshot. If approved, I will proceed with implementation.
If corrections needed, specify changes and I will regenerate.
