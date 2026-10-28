// src/components/Topbar.jsx
// -------------------------------------------------------
// Top navigation bar with greeting, search, and "Add Task" button.
// -------------------------------------------------------
import { Search, Plus, Menu } from 'lucide-react';
import { getGreeting, todayString } from '../data/helpers';

const PAGE_TITLES = {
  dashboard: 'Dashboard',
  tasks:     'My Tasks',
  subjects:  'Subjects',
  calendar:  'Calendar',
  settings:  'Settings',
};

export default function Topbar({ activePage, searchQuery, onSearchChange, onAddTask, onToggleSidebar }) {
  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button className="topbar__hamburger" onClick={onToggleSidebar} aria-label="Toggle menu">
          <Menu size={22} />
        </button>

        <div className="topbar__left">
          <h1 className="topbar__title">
            {PAGE_TITLES[activePage] || 'Dashboard'}
          </h1>
          <span className="topbar__subtitle">
            {getGreeting()} — {todayString()}
          </span>
        </div>
      </div>

      <div className="topbar__right">
        <div className="topbar__search">
          <Search />
          <input
            id="search-tasks"
            className="topbar__search-input"
            type="text"
            placeholder="Search tasks…"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <button id="add-task-btn" className="topbar__add-btn" onClick={onAddTask}>
          <Plus />
          <span>Add Task</span>
        </button>
      </div>
    </header>
  );
}
