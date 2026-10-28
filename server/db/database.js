const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const databasePath = process.env.DATABASE_PATH
  ? path.resolve(__dirname, '..', process.env.DATABASE_PATH)
  : path.join(__dirname, '..', 'semsync.sqlite');

fs.mkdirSync(path.dirname(databasePath), { recursive: true });
const db = new Database(databasePath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS subjects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE CHECK (trim(name) <> ''),
      color TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL CHECK (trim(title) <> ''),
      description TEXT NOT NULL DEFAULT '',
      subject_id INTEGER NOT NULL,
      due_date TEXT,
      due_time TEXT,
      priority TEXT NOT NULL CHECK (priority IN ('High', 'Medium', 'Low')),
      status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Completed')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (subject_id) REFERENCES subjects(id) ON UPDATE CASCADE ON DELETE RESTRICT
    );
  `);

  if (db.prepare('SELECT COUNT(*) AS count FROM subjects').get().count === 0) {
    const insertSubject = db.prepare('INSERT INTO subjects (name, color) VALUES (?, ?)');
    insertSubject.run('Data Structures', '#4f46e5');
    insertSubject.run('Operating Systems', '#0891b2');
    insertSubject.run('Web Development', '#16a34a');
    insertSubject.run('Discrete Mathematics', '#d97706');
    const ids = Object.fromEntries(db.prepare('SELECT name, id FROM subjects').all().map(s => [s.name, s.id]));
    const relativeDate = days => {
      const date = new Date();
      date.setDate(date.getDate() + days);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };
    const insert = db.prepare(`INSERT INTO tasks
      (title, description, subject_id, due_date, due_time, priority, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)`);
    insert.run('Build React Portfolio Page', '', ids['Web Development'], relativeDate(0), '23:59', 'High', 'In Progress');
    insert.run('Hash Table Implementation Lab', '', ids['Data Structures'], relativeDate(2), '14:00', 'Low', 'Pending');
    insert.run('Combinatorics Worksheet', '', ids['Discrete Mathematics'], relativeDate(-3), '12:00', 'Low', 'Completed');
  }
}

function resetDatabase() {
  const reset = db.transaction(() => {
    db.prepare('DELETE FROM tasks').run();
    db.prepare('DELETE FROM subjects').run();
    db.prepare("DELETE FROM sqlite_sequence WHERE name IN ('tasks', 'subjects')").run();
  });
  reset();
  seedSampleData();
}

function seedSampleData() {
  if (db.prepare('SELECT COUNT(*) AS count FROM subjects').get().count > 0) return;
  const seed = db.transaction(() => {
    const insertSubject = db.prepare('INSERT INTO subjects (name, color) VALUES (?, ?)');
    const insert = db.prepare(`INSERT INTO tasks
      (title, description, subject_id, due_date, due_time, priority, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)`);
    insertSubject.run('Data Structures', '#4f46e5');
    insertSubject.run('Operating Systems', '#0891b2');
    insertSubject.run('Web Development', '#16a34a');
    insertSubject.run('Discrete Mathematics', '#d97706');
    const ids = Object.fromEntries(db.prepare('SELECT name, id FROM subjects').all().map(s => [s.name, s.id]));
    const relativeDate = days => {
      const date = new Date(); date.setDate(date.getDate() + days);
      return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
    };
    insert.run('Build React Portfolio Page', '', ids['Web Development'], relativeDate(0), '23:59', 'High', 'In Progress');
    insert.run('Hash Table Implementation Lab', '', ids['Data Structures'], relativeDate(2), '14:00', 'Low', 'Pending');
    insert.run('Combinatorics Worksheet', '', ids['Discrete Mathematics'], relativeDate(-3), '12:00', 'Low', 'Completed');
  });
  seed();
}

initializeDatabase();
module.exports = { db, databasePath, resetDatabase };
