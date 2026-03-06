import { useState } from 'react';
import { useTaskStore, getTaskStore } from '../stores/taskStore';
import { Task, TaskType, ValueClass } from '../types/task';

export function DebugTest() {
  const { tasks, addTask } = useTaskStore();
  const [log, setLog] = useState<string[]>([]);

  const addTestTask = () => {
    const testTask: Task = {
      id: `test-${Date.now()}`,
      description: 'Test task ' + new Date().toISOString(),
      valueClass: ValueClass.FUN_USEFUL,
      type: TaskType.AGENTIC,
      trajectoryMatch: 75,
      wordCount: 5,
      creationTime: Date.now(),
      actorNotes: {},
      completed: false,
    };
    
    console.log('DEBUG: Adding task:', testTask);
    setLog(prev => [...prev, `Adding: ${testTask.id}`]);

    addTask(testTask).then(() => {
      console.log('DEBUG: Tasks after add:', getTaskStore().tasks);
      setLog(prev => [...prev, `Store has: ${getTaskStore().tasks.length} tasks`]);
    });
  };

  return (
    <div style={{ padding: 20, border: '2px solid red', margin: 10, background: '#fff0f0' }}>
      <h2 style={{ color: 'red', margin: '0 0 10px 0' }}>DEBUG TEST</h2>
      <button 
        onClick={addTestTask}
        style={{ 
          padding: '10px 20px', 
          fontSize: 16, 
          cursor: 'pointer',
          background: '#ff4444',
          color: 'white',
          border: 'none',
          borderRadius: 4
        }}
      >
        Add Test Task
      </button>
      <div style={{ marginTop: 15 }}>
        <h3 style={{ margin: '0 0 5px 0' }}>Tasks in store: {tasks.length}</h3>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          {tasks.map(t => (
            <li key={t.id}>{t.description.substring(0, 50)}...</li>
          ))}
        </ul>
      </div>
      <div style={{ marginTop: 15, fontFamily: 'monospace', fontSize: 12 }}>
        <h3 style={{ margin: '0 0 5px 0' }}>Log:</h3>
        {log.map((l, i) => <div key={i}>{l}</div>)}
      </div>
    </div>
  );
}
