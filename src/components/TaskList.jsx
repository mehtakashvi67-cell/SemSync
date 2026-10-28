// src/components/TaskList.jsx
// -------------------------------------------------------
// Renders the full task table with header row and items.
// Supports empty state when no tasks match filters.
// -------------------------------------------------------
import { Inbox } from 'lucide-react';
import TaskItem from './TaskItem';

export default function TaskList({ tasks, subjects, onToggle, onEdit, onDelete }) {
  if (tasks.length === 0) {
    return (
      <div className="task-list">
        <div className="empty-state">
          <Inbox />
          <p className="empty-state__text">No tasks match your current filters.</p>
        </div>
      </div>
    );
  }

  const subjectMap = {};
  subjects.forEach((s) => { subjectMap[s.id] = s; });

  return (
    <div className="task-list">
      <div className="task-list__header">
        <span></span>
        <span>Task</span>
        <span>Subject</span>
        <span>Due Date</span>
        <span>Priority</span>
        <span>Status</span>
        <span></span>
      </div>

      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          subject={subjectMap[task.subjectId]}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
