// src/components/AddTaskModal.jsx
// -------------------------------------------------------
// Modal form for creating or editing a task.
// -------------------------------------------------------
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { generateId } from '../data/helpers';

const EMPTY_FORM = {
  title: '',
  subjectId: '',
  dueDate: '',
  dueTime: '',
  priority: 'medium',
  status: 'pending',
};

export default function AddTaskModal({ subjects, onClose, onSave, editingTask }) {
  const [form, setForm] = useState(EMPTY_FORM);

  // Pre‑fill when editing
  useEffect(() => {
    if (editingTask) {
      setForm({
        title: editingTask.title,
        subjectId: editingTask.subjectId,
        dueDate: editingTask.dueDate || '',
        dueTime: editingTask.dueTime || '',
        priority: editingTask.priority,
        status: editingTask.status,
      });
    } else {
      setForm({ ...EMPTY_FORM, subjectId: subjects[0]?.id ? String(subjects[0].id) : '' });
    }
  }, [editingTask, subjects]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) return;

    const task = {
      id: editingTask ? editingTask.id : generateId(),
      title: form.title.trim(),
      subjectId: form.subjectId || subjects[0]?.id || '',
      dueDate: form.dueDate || '',
      dueTime: form.dueDate ? (form.dueTime || '23:59') : '',
      priority: form.priority,
      status: form.status,
    };

    const saved = await onSave(task);
    if (saved) onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title">{editingTask ? 'Edit Task' : 'New Task'}</h2>
          <button className="modal__close" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal__body">
            {/* Title */}
            <div className="form-group">
              <label htmlFor="task-title">Task title</label>
              <input
                id="task-title"
                name="title"
                type="text"
                placeholder="e.g. Complete Lab Report"
                value={form.title}
                onChange={handleChange}
                required
                autoFocus
              />
            </div>

            {/* Subject */}
            <div className="form-group">
              <label htmlFor="task-subject">Subject</label>
              <select id="task-subject" name="subjectId" value={form.subjectId} onChange={handleChange}>
                <option value="">Select subject</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Date + Time */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="task-date">Due date</label>
                <input id="task-date" name="dueDate" type="date" value={form.dueDate} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label htmlFor="task-time">Due time</label>
                <input id="task-time" name="dueTime" type="time" value={form.dueTime} onChange={handleChange} />
              </div>
            </div>

            {/* Priority + Status */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="task-priority">Priority</label>
                <select id="task-priority" name="priority" value={form.priority} onChange={handleChange}>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="task-status">Status</label>
                <select id="task-status" name="status" value={form.status} onChange={handleChange}>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </div>

          <div className="modal__footer">
            <button type="button" className="btn btn--secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn--primary">
              {editingTask ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
