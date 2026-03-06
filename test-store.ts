import { createTaskStore, TaskStore } from './src/stores/taskStore';
import { createTask, TaskType, ValueClass } from './src/types/task';

// Create store instance
const store = createTaskStore();

// Check initial state
console.log('Initial tasks:', store.getState().tasks.length);

// Create a task
const task = createTask(
  'Test task description',
  ValueClass.USEFUL,
  TaskType.AGENTIC,
  75,
  {}
);

console.log('\nCreated task type:', task.type);
console.log('TaskType.AGENTIC:', TaskType.AGENTIC);
console.log('Direct comparison:', task.type === TaskType.AGENTIC);
console.log('typeof task.type:', typeof task.type);
console.log('typeof TaskType.AGENTIC:', typeof TaskType.AGENTIC);

// Add task to store
store.getState().addTask(task);

// Get fresh state
const state = store.getState();
console.log('\n=== After adding ===');
console.log('tasks array length:', state.tasks.length);
console.log('First task type:', state.tasks[0]?.type);
console.log('TaskType.AGENTIC value:', TaskType.AGENTIC);
console.log('Comparison in store:', state.tasks[0]?.type === TaskType.AGENTIC);

// Test filter manually
const manualFilter = state.tasks.filter(t => t.type === TaskType.AGENTIC);
console.log('Manual filter result:', manualFilter.length);

// Check the getter
console.log('agenticTasks getter:', state.agenticTasks.length);
console.log('nonAgenticTasks getter:', state.nonAgenticTasks.length);

// Debug: Check if the issue is with the getter accessing old state
console.log('\n=== Debug getter ===');
const rawTasks = state.tasks;
console.log('Raw tasks:', rawTasks.map(t => ({ id: t.id, type: t.type })));
const filtered = rawTasks.filter(t => {
  const matches = t.type === TaskType.AGENTIC;
  console.log(`Task ${t.id}: type="${t.type}", TaskType.AGENTIC="${TaskType.AGENTIC}", matches=${matches}`);
  return matches;
});
console.log('Filtered result:', filtered.length);
