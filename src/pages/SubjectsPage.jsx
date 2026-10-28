// src/pages/SubjectsPage.jsx
// -------------------------------------------------------
// Subjects overview page — shows all subjects with stats.
// -------------------------------------------------------
import SubjectCard from '../components/SubjectCard';
import ProgressOverview from '../components/ProgressOverview';

export default function SubjectsPage({ tasks, subjects }) {
  return (
    <div className="page-content">
      <ProgressOverview tasks={tasks} />

      <div style={{ marginTop: '1.5rem' }}>
        <h2 className="section__title" style={{ marginBottom: '1rem' }}>All Subjects</h2>
        <div className="subject-grid">
          {subjects.map((s) => (
            <SubjectCard key={s.id} subject={s} tasks={tasks} />
          ))}
        </div>
      </div>
    </div>
  );
}
