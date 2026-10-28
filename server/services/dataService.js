const { db } = require('../db/database');

const subjectFindById = db.prepare('SELECT * FROM subjects WHERE id = ?');

const normalizeTask = (row) => row ? {
  id: row.id,
  title: row.title,
  description: row.description,
  subjectId: row.subject_id,
  subjectName: row.subject_name || null,
  subjectColor: row.subject_color || null,
  dueDate: row.due_date,
  dueTime: row.due_time,
  priority: row.priority,
  status: row.status,
  createdAt: row.created_at,
  updatedAt: row.updated_at
} : null;

const taskSelect = `
  SELECT t.*, s.name AS subject_name, s.color AS subject_color
  FROM tasks t JOIN subjects s ON s.id = t.subject_id
`;

const subjects = {
  all: () => db.prepare('SELECT id, name, color, created_at AS createdAt FROM subjects ORDER BY id').all(),
  find: (id) => subjectFindById.get(id),
  create: (name, color) => db.prepare('INSERT INTO subjects (name, color) VALUES (?, ?)').run(name, color).lastInsertRowid,
  update: (id, name, color) => db.prepare('UPDATE subjects SET name = ?, color = ? WHERE id = ?').run(name, color, id).changes,
};

const tasks = {
  all: () => db.prepare(taskSelect + ' ORDER BY CASE WHEN t.due_date IS NULL THEN 1 ELSE 0 END, t.due_date, t.due_time, t.id').all().map(normalizeTask),
  find: (id) => normalizeTask(db.prepare(taskSelect + ' WHERE t.id = ?').get(id)),
  create: (input) => {
    const result = db.prepare(`INSERT INTO tasks (title, description, subject_id, due_date, due_time, priority, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)`).run(input.title, input.description || '', input.subjectId, input.dueDate || null, input.dueTime || null, input.priority, input.status);
    return tasks.find(result.lastInsertRowid);
  },
  update: (id, input) => {
    const changes = db.prepare(`UPDATE tasks SET title = ?, description = ?, subject_id = ?, due_date = ?, due_time = ?,
      priority = ?, status = ?, updated_at = datetime('now') WHERE id = ?`).run(input.title, input.description || '', input.subjectId,
      input.dueDate || null, input.dueTime || null, input.priority, input.status, id).changes;
    return changes ? tasks.find(id) : null;
  },
  updateStatus: (id, status) => {
    const changes = db.prepare("UPDATE tasks SET status = ?, updated_at = datetime('now') WHERE id = ?").run(status, id).changes;
    return changes ? tasks.find(id) : null;
  },
  remove: (id) => db.prepare('DELETE FROM tasks WHERE id = ?').run(id).changes,
};

function dateGroup(dueDate) {
  if (!dueDate) return 'upcoming';
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  if (dueDate < todayKey) return 'overdue';
  if (dueDate === todayKey) return 'today';
  return 'upcoming';
}

const dashboard = {
  stats: () => {
    const today = new Date();
    const todayKey = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
    const total = db.prepare('SELECT COUNT(*) AS value FROM tasks').get().value;
    const completed = db.prepare("SELECT COUNT(*) AS value FROM tasks WHERE status = 'Completed'").get().value;
    const pending = db.prepare("SELECT COUNT(*) AS value FROM tasks WHERE status = 'Pending'").get().value;
    const inProgress = db.prepare("SELECT COUNT(*) AS value FROM tasks WHERE status = 'In Progress'").get().value;
    const overdue = db.prepare("SELECT COUNT(*) AS value FROM tasks WHERE status != 'Completed' AND due_date IS NOT NULL AND due_date < ?").get(todayKey).value;
    return { total, completed, pending, overdue, inProgress, completionPercentage: total ? Math.round(completed / total * 100) : 0 };
  },
  today: () => {
    const priorityOrder = { High: 0, Medium: 1, Low: 2 };
    const groupOrder = { overdue: 0, today: 1, upcoming: 2 };
    return tasks.all().filter(task => task.status !== 'Completed').sort((a, b) => {
      const groupDifference = groupOrder[dateGroup(a.dueDate)] - groupOrder[dateGroup(b.dueDate)];
      if (groupDifference) return groupDifference;
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }).slice(0, 6);
  }
};

module.exports = { subjects, tasks, dashboard, normalizeTask };
