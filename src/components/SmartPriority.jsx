// src/components/SmartPriority.jsx
// -------------------------------------------------------
// "What should I do today?" section.
// Shows up to 6 tasks, prioritised: overdue → today → upcoming,
// then by priority within each group.
// -------------------------------------------------------
import { useEffect, useState } from 'react';
import { Zap, Inbox } from 'lucide-react';
import { dueDateGroup, formatDate } from '../data/helpers';
import { api } from '../data/api';

export default function SmartPriority({ tasks, subjects }) {
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationError, setRecommendationError] = useState('');

  useEffect(() => {
    api.getDashboardToday()
      .then((tasks) => setRecommendations(tasks.map((task) => ({
        ...task,
        priority: ({ High: 'high', Medium: 'medium', Low: 'low' })[task.priority] || task.priority,
        status: ({ Pending: 'pending', 'In Progress': 'in-progress', Completed: 'completed' })[task.status] || task.status,
        subjectId: String(task.subjectId),
        dueDate: task.dueDate && task.dueTime ? `${task.dueDate}T${task.dueTime}:00` : task.dueDate,
      }))))
      .catch((cause) => setRecommendationError(cause.message));
  }, [tasks]);

  const top = recommendations;

  const subjectMap = {};
  subjects.forEach((s) => { subjectMap[s.id] = s; });

  return (
    <div className="section">
      <div className="section__header">
        <h2 className="section__title"><Zap /> What should I do today?</h2>
      </div>
      {recommendationError && <p style={{ color: 'var(--color-danger)', marginBottom: '1rem' }}>{recommendationError}</p>}
      {top.length === 0 ? (
        <div className="task-list">
          <div className="empty-state">
            <Inbox />
            <p className="empty-state__text">You're all caught up! No pending tasks.</p>
          </div>
        </div>
      ) : (
        <div className="priority-cards">
          {top.map((task) => {
            const group = dueDateGroup(task.dueDate);
            const subj = subjectMap[task.subjectId];
            return (
              <div key={task.id} className={`priority-card priority-card--${group}`}>
                <span className={`priority-card__group priority-card__group--${group}`}>
                  {group === 'overdue' ? '⚠ Overdue' : group === 'today' ? '📅 Due Today' : '🗓 Upcoming'}
                </span>
                <span className="priority-card__title">{task.title}</span>
                <div className="priority-card__meta">
                  {subj && (
                    <>
                      <span
                        className="task-item__subject-dot"
                        style={{ background: subj.color }}
                      />
                      <span>{subj.name}</span>
                      <span>·</span>
                    </>
                  )}
                  <span>{formatDate(task.dueDate)}</span>
                  <span>·</span>
                  <span className={`badge badge--${task.priority}`}>
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
