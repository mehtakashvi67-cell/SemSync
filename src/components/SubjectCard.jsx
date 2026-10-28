// src/components/SubjectCard.jsx
// -------------------------------------------------------
// Small card for a single subject with a mini progress bar.
// -------------------------------------------------------

export default function SubjectCard({ subject, tasks }) {
  const subjectTasks = tasks.filter((t) => t.subjectId === subject.id);
  const total     = subjectTasks.length;
  const completed = subjectTasks.filter((t) => t.status === 'completed').length;
  const pct       = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className="subject-card">
      <div className="subject-card__dot" style={{ background: subject.color }} />
      <div className="subject-card__name">{subject.name}</div>
      <div className="subject-card__stats">
        {completed}/{total} tasks completed
      </div>
      <div className="progress-bar">
        <div
          className="progress-bar__fill"
          style={{ width: `${pct}%`, background: subject.color }}
        />
      </div>
    </div>
  );
}
