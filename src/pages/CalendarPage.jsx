// src/pages/CalendarPage.jsx
// -------------------------------------------------------
// Calendar view – shows tasks grouped by date.
// A simple, clear month view with task dots.
// -------------------------------------------------------
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import { formatDate } from '../data/helpers';

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];
const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export default function CalendarPage({ tasks, subjects }) {
  const today = new Date();
  const [year,  setYear]  = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  function prev() {
    if (month === 0) { setMonth(11); setYear(year - 1); }
    else setMonth(month - 1);
  }
  function next() {
    if (month === 11) { setMonth(0); setYear(year + 1); }
    else setMonth(month + 1);
  }

  // Build days grid
  const firstDay   = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  // Map tasks to days
  const tasksByDay = {};
  tasks.forEach((t) => {
    if (!t.dueDate) return;
    const d = new Date(t.dueDate);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      if (!tasksByDay[day]) tasksByDay[day] = [];
      tasksByDay[day].push(t);
    }
  });

  const [selectedDay, setSelectedDay] = useState(null);
  const selectedTasks = selectedDay ? (tasksByDay[selectedDay] || []) : [];

  const subjectMap = {};
  subjects.forEach((s) => { subjectMap[s.id] = s; });

  const isToday = (d) =>
    d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  return (
    <div className="page-content">
      <div className="page-section">
        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.25rem' }}>
          <button className="task-item__action-btn" onClick={prev} aria-label="Previous month">
            <ChevronLeft size={20} />
          </button>
          <h2 style={{ fontSize:'1.125rem', fontWeight:700 }}>{MONTH_NAMES[month]} {year}</h2>
          <button className="task-item__action-btn" onClick={next} aria-label="Next month">
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Day names */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', textAlign:'center', marginBottom:'0.5rem' }}>
          {DAY_NAMES.map((dn) => (
            <span key={dn} style={{ fontSize:'0.75rem', fontWeight:600, color:'var(--color-text-muted)', padding:'0.25rem 0' }}>
              {dn}
            </span>
          ))}
        </div>

        {/* Days grid */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:'4px' }}>
          {cells.map((day, i) => {
            if (day === null) return <div key={`e-${i}`} />;
            const hasTasks = !!tasksByDay[day];
            const active = day === selectedDay;
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                style={{
                  padding: '0.5rem 0',
                  borderRadius: 'var(--radius-md)',
                  border: active ? '2px solid var(--color-accent)' : '2px solid transparent',
                  background: isToday(day) ? 'var(--color-accent-light)' : 'transparent',
                  fontWeight: isToday(day) ? 700 : 400,
                  color: isToday(day) ? 'var(--color-accent)' : 'var(--color-text-primary)',
                  cursor: hasTasks ? 'pointer' : 'default',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.875rem',
                }}
              >
                {day}
                {hasTasks && (
                  <span style={{
                    width:6, height:6, borderRadius:'50%', background:'var(--color-accent)', display:'inline-block'
                  }} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected day tasks */}
      {selectedDay && (
        <div className="page-section" style={{ marginTop:'1.25rem' }}>
          <h3 style={{ fontSize:'0.9375rem', fontWeight:600, marginBottom:'0.75rem' }}>
            Tasks on {MONTH_NAMES[month]} {selectedDay}
          </h3>
          {selectedTasks.length === 0 ? (
            <div className="empty-state">
              <Inbox />
              <p className="empty-state__text">No tasks on this day.</p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
              {selectedTasks.map((t) => {
                const subj = subjectMap[t.subjectId];
                return (
                  <div key={t.id} style={{
                    display:'flex', alignItems:'center', gap:'0.75rem',
                    padding:'0.75rem 1rem', background:'var(--color-bg)', borderRadius:'var(--radius-md)',
                  }}>
                    <span className="task-item__subject-dot" style={{ background: subj?.color || '#ccc' }} />
                    <span style={{ flex:1, fontWeight:500 }}>{t.title}</span>
                    <span className={`badge badge--${t.priority}`}>
                      {t.priority.charAt(0).toUpperCase() + t.priority.slice(1)}
                    </span>
                    <span className={`badge badge--${t.status}`}>
                      {t.status === 'in-progress' ? 'In Progress' : t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                    </span>
                    <span style={{ fontSize:'0.75rem', color:'var(--color-text-muted)' }}>
                      {formatDate(t.dueDate)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
