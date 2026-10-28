// src/pages/TasksPage.jsx
// -------------------------------------------------------
// Full task management page with filters.
// -------------------------------------------------------
import { useState } from 'react';
import TaskList from '../components/TaskList';

export default function TasksPage({ tasks, subjects, searchQuery, onToggle, onEdit, onDelete }) {
  const [filterSubject,  setFilterSubject]  = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus,   setFilterStatus]   = useState('all');

  // ---- Apply filters ----
  let filtered = tasks;

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter((t) => t.title.toLowerCase().includes(q));
  }
  if (filterSubject !== 'all') {
    filtered = filtered.filter((t) => t.subjectId === filterSubject);
  }
  if (filterPriority !== 'all') {
    filtered = filtered.filter((t) => t.priority === filterPriority);
  }
  if (filterStatus !== 'all') {
    filtered = filtered.filter((t) => t.status === filterStatus);
  }

  // Sort by due date ascending
  filtered = [...filtered].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  return (
    <div className="page-content">
      {/* Filters */}
      <div className="filters" style={{ marginBottom: '1.25rem' }}>
        <select
          className="filter-select"
          value={filterSubject}
          onChange={(e) => setFilterSubject(e.target.value)}
          aria-label="Filter by subject"
        >
          <option value="all">All Subjects</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        <select
          className="filter-select"
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          aria-label="Filter by priority"
        >
          <option value="all">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <select
          className="filter-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          aria-label="Filter by status"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Task list */}
      <TaskList
        tasks={filtered}
        subjects={subjects}
        onToggle={onToggle}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
}
