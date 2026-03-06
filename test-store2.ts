import { create } from 'zustand';
import { TaskType, Task, ValueClass } from './src/types/task';
import { sortTasks } from './src/services/sortService';

// Inline store creation with debug
const store = create<{
  tasks: Task[];
  agenticTasks: Task[];
  addTask: (task: Task) => void;
}>((set, get) => ({
  tasks: [],

  // Inline the getter with debug
  get agenticTasks() {
    console.log('Getter called!');
    console.log('  TaskType.AGENTIC:', TaskType.AGENTIC);
    console.log('  get().tasks.length:', get().tasks.length);
    if (get().tasks.length > 0) {
      console.log('  First task type:', get().tasks[0].type);
      console.log('  Direct compare:', get().tasks[0].type === TaskType.AGENTIC);
    }
    const result = get().tasks.filter(t => {
      const match = t.type === TaskType.AGENTIC;
      console.log(`    Task ${t.id}: ${t.type} === ${TaskType.AGENTIC} = ${match}`);
      return match;
    });
    console.log('  Filtered count:', result.length);
    return result;
  },

  addTask: (task: Task) => {
    set((state) => ({
      tasks: [task, ...state.tasks]
    }));
  },
}));

// Test
console.log('=== Creating task ===');
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

console.log('Task type:', task.type);
console.log('TaskType.AGENTIC:', TaskType.AGENTIC);

console.log('\n=== Adding to store ===');
store.getState().addTask(task);

console.log('\n=== Checking state ===');
const state = store.getState();
console.log('tasks:', state.tasks.length);
console.log('agenticTasks:', state.agenticTasks.length);
