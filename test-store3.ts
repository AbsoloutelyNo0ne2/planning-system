import { create } from 'zustand';
import { TaskType, Task, ValueClass } from './src/types/task';

// Simple test to verify getter behavior
const store = create<{
  tasks: Task[];
  agenticTasks: Task[];
  addTask: (task: Task) => void;
}>((set, get) => ({
  tasks: [],

  get agenticTasks() {
    const currentTasks = get().tasks;
    console.log('Getter executing:');
    console.log('  currentTasks.length:', currentTasks.length);
    console.log('  TaskType.AGENTIC:', TaskType.AGENTIC);
    const filtered = currentTasks.filter(t => t.type === TaskType.AGENTIC);
    console.log('  filtered.length:', filtered.length);
    return filtered;
  },

  addTask: (task: Task) => {
    console.log('addTask called');
    set((state) => {
      console.log('  set callback - old state length:', state.tasks.length);
      const newState = {
        tasks: [task, ...state.tasks]
      };
      console.log('  set callback - new state length:', newState.tasks.length);
      return newState;
    });
    console.log('  set completed');
    console.log('  get().tasks.length after set:', get().tasks.length);
  },
}));

// Test
const task: Task = {
  id: 'test-1',
  description: 'Test',
  valueClass: ValueClass.USEFUL,
  type: TaskType.AGENTIC,
  trajectoryMatch: 50,
  wordCount: 1,
  creationTime: Date.now(),
  actorNotes: {},
  completed: false
};

console.log('=== Before adding ===');
console.log('tasks:', store.getState().tasks.length);
console.log('agenticTasks:', store.getState().agenticTasks.length);

console.log('\n=== Adding task ===');
store.getState().addTask(task);

console.log('\n=== After adding ===');
const state = store.getState();
console.log('tasks:', state.tasks.length);
console.log('agenticTasks:', state.agenticTasks.length);
console.log('First task type:', state.tasks[0]?.type);
console.log('TaskType.AGENTIC:', TaskType.AGENTIC);
console.log('Match:', state.tasks[0]?.type === TaskType.AGENTIC);

// Call getter again
console.log('\n=== Calling agenticTasks getter directly ===');
const at = state.agenticTasks;
console.log('Result:', at.length);

// Manual filter
console.log('\n=== Manual filter ===');
const manual = state.tasks.filter(t => t.type === TaskType.AGENTIC);
console.log('Manual result:', manual.length);
