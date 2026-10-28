const express = require('express');
const fs = require('fs');
const path = require('path');
const { db } = require('../db/database');
const service = require('../services/dataService');

const router = express.Router();
const dataDirectory = path.join(__dirname, '..', 'data');
const priorities = ['High', 'Medium', 'Low'];
const statuses = ['Pending', 'In Progress', 'Completed'];
const sendError = (res, status, message) => res.status(status).json({ error: message });

router.get('/data/export', (req, res) => {
  const exportData = { subjects: service.subjects.all(), tasks: service.tasks.all() };
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filePath = path.join(dataDirectory, `semsync-export-${timestamp}.json`);
  fs.writeFileSync(filePath, JSON.stringify(exportData, null, 2));
  res.download(filePath, path.basename(filePath));
});

router.post('/data/import', express.json({ limit: '1mb' }), (req, res) => {
  const payload = req.body;
  if (!payload || !Array.isArray(payload.subjects) || !Array.isArray(payload.tasks)) {
    return sendError(res, 400, 'JSON must contain subjects and tasks arrays.');
  }

  const subjectMap = new Map();
  const subjectInsert = db.prepare('INSERT INTO subjects (name, color) VALUES (?, ?)');
  const taskInsert = db.prepare(`INSERT INTO tasks
    (title, description, subject_id, due_date, due_time, priority, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)`);

  try {
    const importTransaction = db.transaction(() => {
      for (const subject of payload.subjects) {
        if (!subject || typeof subject.name !== 'string' || !subject.name.trim() || !/^#[0-9a-f]{6}$/i.test(subject.color || '')) {
          throw new Error('Every subject needs a non-empty name and valid hex color.');
        }
        let existing = db.prepare('SELECT id FROM subjects WHERE name = ?').get(subject.name.trim());
        if (!existing) existing = { id: subjectInsert.run(subject.name.trim(), subject.color).lastInsertRowid };
        subjectMap.set(subject.id, existing.id);
      }

      let added = 0;
      for (const task of payload.tasks) {
        if (!task || typeof task.title !== 'string' || !task.title.trim()) throw new Error('Every task needs a non-empty title.');
        if (!priorities.includes(task.priority) || !statuses.includes(task.status)) throw new Error('Every task must have a valid priority and status.');
        let subjectId = task.subjectId ? subjectMap.get(task.subjectId) || Number(task.subjectId) : subjectMap.get(task.subject_id);
        if (!subjectId && task.subjectName) subjectId = db.prepare('SELECT id FROM subjects WHERE name = ?').get(task.subjectName)?.id;
        if (!subjectId || !db.prepare('SELECT 1 FROM subjects WHERE id = ?').get(subjectId)) throw new Error(`Task "${task.title}" references a missing subject.`);
        if (task.dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(task.dueDate)) throw new Error(`Task "${task.title}" has an invalid dueDate.`);
        if (task.dueDate) {
          const [year, month, day] = task.dueDate.split('-').map(Number);
          const parsed = new Date(Date.UTC(year, month - 1, day));
          if (parsed.getUTCFullYear() !== year || parsed.getUTCMonth() !== month - 1 || parsed.getUTCDate() !== day) throw new Error(`Task "${task.title}" has an invalid dueDate.`);
        }
        if (task.dueTime && !/^([01]\d|2[0-3]):[0-5]\d$/.test(task.dueTime)) throw new Error(`Task "${task.title}" has an invalid dueTime.`);
        taskInsert.run(task.title.trim(), task.description || '', subjectId, task.dueDate || null, task.dueTime || null, task.priority, task.status);
        added += 1;
      }
      return added;
    });
    const added = importTransaction();
    res.status(201).json({ imported: added });
  } catch (cause) {
    sendError(res, 400, cause.message || 'Invalid JSON import.');
  }
});

module.exports = router;
