// src/components/Sidebar.jsx
// -------------------------------------------------------
// Vertical sidebar with logo, navigation links, and footer.
// -------------------------------------------------------
import {
  LayoutDashboard,
  ListChecks,
  BookOpen,
  CalendarDays,
  Settings,
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard',  icon: LayoutDashboard },
  { id: 'tasks',     label: 'My Tasks',   icon: ListChecks },
  { id: 'subjects',  label: 'Subjects',   icon: BookOpen },
  { id: 'calendar',  label: 'Calendar',   icon: CalendarDays },
  { id: 'settings',  label: 'Settings',   icon: Settings },
];

export default function Sidebar({ activePage, onNavigate, isOpen, onClose }) {
  return (
    <>
      {/* Dark overlay on mobile */}
      <div
        className={`sidebar-overlay ${isOpen ? 'sidebar-overlay--visible' : ''}`}
        onClick={onClose}
      />

      <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
        {/* Brand */}
        <div className="sidebar__brand">
          <div className="sidebar__logo">S</div>
          <span className="sidebar__name">SemSync</span>
        </div>

        {/* Navigation */}
        <nav className="sidebar__nav">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`sidebar__link ${activePage === id ? 'sidebar__link--active' : ''}`}
              onClick={() => { onNavigate(id); onClose(); }}
            >
              <Icon />
              {label}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar__footer">
          SemSync &copy; {new Date().getFullYear()}
        </div>
      </aside>
    </>
  );
}
