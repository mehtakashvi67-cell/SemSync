// src/components/ProgressOverview.jsx
// -------------------------------------------------------
// Animated progress bar + completion stats.
// -------------------------------------------------------
import { TrendingUp } from 'lucide-react';

export default function ProgressOverview({ tasks }) {
  const total     = tasks.length;
  const completed = tasks.filter((t) => t.status === 'completed').length;
  const pending   = total - completed;
  const pct       = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className="progress-section">
      <div className="progress-section__header">
        <h2 className="progress-section__title"><TrendingUp size={20} /> Progress Overview</h2>
        <span className="progress-section__pct">{pct}%</span>
      </div>

      <div className="progress-bar">
        <div className="progress-bar__fill" style={{ width: `${pct}%` }} />
      </div>

      <div className="progress-section__counts">
        <span><strong>{completed}</strong> completed</span>
        <span><strong>{pending}</strong> remaining</span>
        <span><strong>{total}</strong> total</span>
      </div>
    </div>
  );
}
