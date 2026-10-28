// src/pages/DashboardPage.jsx
// -------------------------------------------------------
// Main dashboard showing summary cards, smart priority,
// upcoming deadlines, progress overview, and subjects.
// -------------------------------------------------------
import { ClipboardList, CheckCircle2, Clock, AlertCircle, CalendarClock } from 'lucide-react';
import SummaryCard from '../components/SummaryCard';
import SmartPriority from '../components/SmartPriority';
import TaskList from '../components/TaskList';
import ProgressOverview from '../components/ProgressOverview';
import SubjectCard from '../components/SubjectCard';
import { api } from '../data/api';
import { useEffect, useState } from 'react';

export default function DashboardPage({ tasks, subjects, onToggle, onEdit, onDelete }) {
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0, overdue: 0 });
  useEffect(() => {
    api.getDashboardStats().then(setStats).catch(() => {});
  }, [tasks]);

  const total = stats.total;
  const completed = stats.completed;
  const pending = stats.pending;
  const overdue = stats.overdue;

  // ---- Upcoming deadlines: exclude completed, sort by due date ascending ----
  const upcoming = [...tasks]
    .filter((t) => t.status !== 'completed')
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 8);

  return (
    <div className="page-content">
      {/* Summary cards */}
      <div className="summary-grid">
        <SummaryCard icon={ClipboardList} label="Total Tasks"     value={total}     bgColor="#eef2ff" iconColor="#4f46e5" />
        <SummaryCard icon={CheckCircle2}  label="Completed"       value={completed} bgColor="#f0fdf4" iconColor="#16a34a" />
        <SummaryCard icon={Clock}         label="Pending"         value={pending}   bgColor="#fffbeb" iconColor="#d97706" />
        <SummaryCard icon={AlertCircle}   label="Overdue"         value={overdue}   bgColor="#fef2f2" iconColor="#dc2626" />
      </div>

      {/* Smart priority */}
      <SmartPriority tasks={tasks} subjects={subjects} />

      {/* Upcoming deadlines */}
      <div className="section">
        <div className="section__header">
          <h2 className="section__title"><CalendarClock size={20} /> Upcoming Deadlines</h2>
        </div>
        <TaskList
          tasks={upcoming}
          subjects={subjects}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>

      {/* Bottom row: progress + subjects */}
      <div className="dashboard-bottom">
        <ProgressOverview tasks={tasks} />

        <div className="page-section">
          <h2 className="section__title" style={{ marginBottom: '1rem' }}>Subject Overview</h2>
          <div className="subject-grid">
            {subjects.map((s) => (
              <SubjectCard key={s.id} subject={s} tasks={tasks} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
