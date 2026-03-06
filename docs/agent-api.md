# Agent API Documentation

## Overview

This document describes how AI agents can programmatically interact with the task planning system via the Agent SDK.

The Agent SDK provides a type-safe interface for creating, reading, updating, and deleting tasks. It wraps the Supabase client and handles authentication via a service role key that bypasses Row-Level Security (RLS) policies.

## Authentication

Agents must use the service role key to access tasks. This key:
- Bypasses RLS policies
- Has full read/write access to all tasks
- Must be configured via the `AGENT_SUPABASE_SERVICE_KEY` environment variable

**Important:** The service role key should never be exposed in client-side code or committed to version control.

## Installation

```typescript
import { agentSdk } from '../src/services/agentSdk';
import type { AgentTaskInput, AgentResult, Task } from '../src/services/agentSdk';
```

## Quick Start

```typescript
// Get all tasks
const result = await agentSdk.getTasks();
if (result.success) {
  console.log('Tasks:', result.data);
} else {
  console.error('Error:', result.error.message);
}

// Create a new task
const createResult = await agentSdk.addTask({
  description: 'Research new architecture patterns',
  valueClass: ValueClass.FUN_USEFUL,
  type: TaskType.AGENTIC,
  trajectoryMatch: 85,
});
```

## API Reference

### Core CRUD Operations

#### `getTasks()`

Returns all tasks from the database.

**Returns:** `Promise<AgentResult<Task[]>>`

```typescript
const result = await agentSdk.getTasks();

// Success response
{
  success: true,
  data: [
    {
      id: 'task-123',
      description: 'Example task',
      valueClass: 1, // ValueClass.FUN_USEFUL
      type: 'agentic',
      trajectoryMatch: 85,
      wordCount: 2,
      creationTime: 1704067200000,
      actorNotes: {},
      completed: false
    }
  ]
}

// Error response
{
  success: false,
  error: {
    message: 'Failed to fetch tasks: connection refused',
    code: 'CONNECTION_ERROR'
  }
}
```

---

#### `getTaskById(id: string)`

Returns a single task by its ID.

**Parameters:**
- `id` (string): The task ID

**Returns:** `Promise<AgentResult<Task | null>>`

```typescript
const result = await agentSdk.getTaskById('task-123');
if (result.success && result.data) {
  console.log('Task:', result.data);
} else if (result.success && !result.data) {
  console.log('Task not found');
}
```

---

#### `addTask(task: AgentTaskInput)`

Creates a new task in the database.

**Parameters:**
- `task` (AgentTaskInput): The task data
  - `description` (string): Task description (required, max 10000 chars)
  - `valueClass` (ValueClass): Priority classification (required)
  - `type` (TaskType): Task type - 'agentic', 'non-agentic', or 'hybrid' (required)
  - `trajectoryMatch` (number): 0-100 alignment score (required)
  - `actorNotes` (Record<string, string>, optional): Notes about actor progress

**Returns:** `Promise<AgentResult<Task>>`

```typescript
import { ValueClass, TaskType } from '../src/types/task';

const result = await agentSdk.addTask({
  description: 'Implement user authentication',
  valueClass: ValueClass.FUN_USEFUL,
  type: TaskType.AGENTIC,
  trajectoryMatch: 92,
  actorNotes: {
    'actor-1': 'Currently researching OAuth2 flow'
  }
});

if (result.success) {
  console.log('Created task:', result.data.id);
}
```

---

#### `updateTask(id: string, updates: Partial<AgentTaskInput>)`

Updates an existing task. Only provided fields are updated.

**Parameters:**
- `id` (string): The task ID to update
- `updates` (Partial<AgentTaskInput>): Fields to update

**Returns:** `Promise<AgentResult<Task>>`

```typescript
const result = await agentSdk.updateTask('task-123', {
  description: 'Updated description',
  trajectoryMatch: 90
});
```

---

#### `deleteTask(id: string)`

Permanently deletes a task. This operation cannot be undone.

**Parameters:**
- `id` (string): The task ID to delete

**Returns:** `Promise<AgentResult<void>>`

```typescript
const result = await agentSdk.deleteTask('task-123');
if (result.success) {
  console.log('Task deleted');
}
```

---

### Query Operations

#### `getTasksByType(type: TaskType)`

Returns tasks filtered by type.

**Parameters:**
- `type` (TaskType): 'agentic' | 'non-agentic' | 'hybrid'

**Returns:** `Promise<AgentResult<Task[]>>`

```typescript
const result = await agentSdk.getTasksByType(TaskType.AGENTIC);
// Returns only agentic tasks
```

---

#### `getPendingTasks()`

Returns all incomplete tasks, ordered by priority (valueClass ascending) then creation time.

**Returns:** `Promise<AgentResult<Task[]>>`

```typescript
const result = await agentSdk.getPendingTasks();
// Returns tasks where completed === false
```

---

#### `getCompletedTasks()`

Returns all completed tasks, ordered by completion time (newest first).

**Returns:** `Promise<AgentResult<Task[]>>`

```typescript
const result = await agentSdk.getCompletedTasks();
```

---

### Action Operations

#### `completeTask(id: string)`

Marks a task as completed. Sets `completed: true` and `completedTime` to current timestamp.

**Parameters:**
- `id` (string): The task ID to complete

**Returns:** `Promise<AgentResult<Task>>`

```typescript
const result = await agentSdk.completeTask('task-123');
if (result.success) {
  console.log('Task completed at:', result.data.completedTime);
}
```

---

#### `reopenTask(id: string)`

Reopens a completed task. Sets `completed: false` and clears `completedTime`.

**Parameters:**
- `id` (string): The task ID to reopen

**Returns:** `Promise<AgentResult<Task>>`

```typescript
const result = await agentSdk.reopenTask('task-123');
```

---

## Error Handling

All SDK methods return a discriminated union type `AgentResult<T>`:

```typescript
type AgentResult<T> =
  | { success: true; data: T }
  | { success: false; error: { message: string; code?: string; details?: unknown } };
```

**Always check `result.success` before accessing `result.data`.**

### Common Error Codes

| Code | Description | Resolution |
|------|-------------|------------|
| `PGRST116` | Task not found | Verify the task ID exists |
| `VALIDATION_ERROR` | Input validation failed | Check error message for details |
| `23503` | Foreign key violation | Referenced data not found |
| `23505` | Duplicate key | Task with same constraints exists |
| `NOT_FOUND` | Resource not found | Task ID doesn't exist |

### Error Handling Pattern

```typescript
const result = await agentSdk.addTask(taskData);

if (!result.success) {
  // Handle specific error codes
  switch (result.error.code) {
    case 'VALIDATION_ERROR':
      console.error('Invalid input:', result.error.message);
      break;
    case '23505':
      console.error('Task already exists');
      break;
    default:
      console.error('Unexpected error:', result.error.message);
  }
  return;
}

// Safe to use result.data
console.log('Created:', result.data);
```

---

## Type Reference

### AgentTaskInput

Input type for creating a task:

```typescript
interface AgentTaskInput {
  description: string;           // Required
  valueClass: ValueClass;        // Required - 1-6 priority
  type: TaskType;                // Required - 'agentic' | 'non-agentic' | 'hybrid'
  trajectoryMatch: number;       // Required - 0-100 alignment score
  actorNotes?: Record<string, string>;  // Optional
}
```

### Task

Full task type returned by SDK methods:

```typescript
interface Task {
  id: string;                    // Unique task ID
  description: string;           // Task description
  valueClass: ValueClass;        // Priority (1-6)
  type: TaskType;                // Task type
  trajectoryMatch: number;       // 0-100 alignment score
  wordCount: number;             // Auto-calculated from description
  creationTime: number;          // Unix timestamp (ms)
  actorNotes: Record<string, string>;  // Actor progress notes
  completed: boolean;            // Completion status
  completedTime?: number;        // Unix timestamp when completed
}
```

### ValueClass Enum

Priority classification (lower number = higher priority):

```typescript
enum ValueClass {
  FUN_USEFUL = 1,        // Most valuable
  USEFUL = 2,
  HAS_TO_BE_DONE = 3,
  HAS_TO_BE_DONE_BORING = 4,
  FUN_USELESS = 5,
  BORING_USELESS = 6      // Least valuable
}
```

### TaskType Enum

Task delegation type:

```typescript
enum TaskType {
  AGENTIC = 'agentic',         // Can be delegated to AI agents
  NON_AGENTIC = 'non-agentic', // Requires human execution
  HYBRID = 'hybrid'            // Combination of both
}
```

---

## Configuration

### Environment Variables

```bash
# Required - Supabase project URL
VITE_SUPABASE_URL=https://rstjrsnwmajdmhhmbwmm.supabase.co

# Required - Service role key for agent access
AGENT_SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Getting a Service Role Key

1. Go to your Supabase dashboard
2. Navigate to Project Settings > API
3. Copy the "service_role" key (NOT the anon key)
4. Set it as `AGENT_SUPABASE_SERVICE_KEY` in your environment

**Warning:** The service role key has full database access. Keep it secure.

---

## Best Practices

1. **Always check success**: Never assume an operation succeeded
2. **Handle errors gracefully**: Show meaningful messages to users
3. **Validate inputs**: The SDK validates, but pre-validation improves UX
4. **Use specific methods**: `getPendingTasks()` instead of filtering `getTasks()`
5. **Prefer complete over delete**: Use `completeTask()` for reversible completion

---

## Examples

### Complete Workflow Example

```typescript
import { agentSdk } from '../src/services/agentSdk';
import { ValueClass, TaskType } from '../src/types/task';

async function planAndExecute() {
  // 1. Get pending agentic tasks
  const pendingResult = await agentSdk.getPendingTasks();
  if (!pendingResult.success) {
    console.error('Failed to load tasks:', pendingResult.error.message);
    return;
  }

  const agenticTasks = pendingResult.data.filter(
    t => t.type === TaskType.AGENTIC
  );

  // 2. Pick highest priority task
  const nextTask = agenticTasks[0];
  if (!nextTask) {
    console.log('No pending agentic tasks');
    return;
  }

  // 3. Execute the task (your agent logic here)
  console.log('Working on:', nextTask.description);
  await executeTask(nextTask);

  // 4. Mark as complete
  const completeResult = await agentSdk.completeTask(nextTask.id);
  if (completeResult.success) {
    console.log('Task completed!');
  }
}

async function executeTask(task: Task) {
  // Your agent implementation
}
```

### Batch Operations

```typescript
// Create multiple tasks
const tasksToCreate = [
  { description: 'Task 1', valueClass: ValueClass.FUN_USEFUL, type: TaskType.AGENTIC, trajectoryMatch: 90 },
  { description: 'Task 2', valueClass: ValueClass.USEFUL, type: TaskType.AGENTIC, trajectoryMatch: 80 },
];

const results = await Promise.all(
  tasksToCreate.map(t => agentSdk.addTask(t))
);

// Check for failures
const failures = results.filter(r => !r.success);
if (failures.length > 0) {
  console.error(`${failures.length} tasks failed to create`);
}
```

---

## Troubleshooting

### "AGENT_SUPABASE_SERVICE_KEY not configured"

The service role key is not set in the environment. Set the `AGENT_SUPABASE_SERVICE_KEY` environment variable.

### "Task not found"

The task ID doesn't exist or has been deleted. Use `getTasks()` to verify the ID.

### "Invalid input: Description cannot be empty"

The task description is required and cannot be empty or whitespace-only.

### Connection errors

If you see connection errors, verify:
1. `VITE_SUPABASE_URL` is correct
2. `AGENT_SUPABASE_SERVICE_KEY` is valid
3. Supabase project is active
4. Network connectivity is available

---

## Changelog

### Version 1.0.0

- Initial release
- Core CRUD operations
- Query operations (by type, pending, completed)
- Action operations (complete, reopen)
- Full TypeScript support

---

## Support

For issues or questions about the Agent SDK:
1. Check this documentation first
2. Review the types in `src/services/agentSdk.ts`
3. Check the Supabase service in `src/services/agentSupabaseClient.ts`
