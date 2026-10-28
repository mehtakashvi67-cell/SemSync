// src/components/TaskItem.jsx
// -------------------------------------------------------
// Single row inside the task table / list.
// -------------------------------------------------------
import { Check, Pencil, Trash2 } from 'lucide-react';
import { formatDate, dueDateGroup } from '../data/helpers';

export default function TaskItem({ task, subject, onToggle, onEdit, onDelete }) {
  const group = dueDateGroup(task.dueDate);
  const isDone = task.status === 'completed';

  return (
    <div className={`task-item ${isDone ? 'task-item--completed' : ''}`}>
      {/* Checkbox */}
      <button
        className={`task-item__check ${isDone ? 'task-item__check--done' : ''}`}
        onClick={() => onToggle(task.id)}
        aria-label={isDone ? 'Mark incomplete' : 'Mark complete'}
      >
        {isDone && <Check />}
      </button>

      {/* Title */}
      <span className="task-item__title" title={task.title}>{task.title}</span>

      {/* Subject */}
      <span className="task-item__subject">
        <span
          className="task-item__subject-dot"
          style={{ background: subject?.color || '#ccc' }}
        />
        {subject?.name || 'Unknown'}
      </span>

      {/* Due date */}
      <span className={`task-item__due ${
        !isDone && group === 'overdue' ? 'task-item__due--overdue' :
        !isDone && group === 'today'   ? 'task-item__due--today'   : ''
      }`}>
        {formatDate(task.dueDate, task.dueTime)}
      </span>

      {/* Priority */}
      <span className={`badge badge--${task.priority}`}>
        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
      </span>

      {/* Status */}
      <span className={`badge badge--${task.status}`}>
        {task.status === 'in-progress' ? 'In Progress' :
         task.status.charAt(0).toUpperCase() + task.status.slice(1)}
      </span>

      {/* Actions */}
      <div className="task-item__actions">
        <button className="task-item__action-btn" onClick={() => onEdit(task)} aria-label="Edit task">
          <Pencil size={15} />
        </button>
        <button className="task-item__action-btn task-item__action-btn--delete" onClick={() => onDelete(task.id)} aria-label="Delete task">
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}
