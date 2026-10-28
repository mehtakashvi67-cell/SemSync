const express = require('express');
const { db } = require('../db/database');
const { resetDatabase } = require('../db/database');
const service = require('../services/dataService');

const router = express.Router();
const priorities = ['High', 'Medium', 'Low'];
const statuses = ['Pending', 'In Progress', 'Completed'];
const error = (res, status, message, details) => res.status(status).json({ error: message, ...(details ? { details } : {}) });
const validDate = value => {
  if (!value) return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day;
};
const validTime = value => !value || /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
const subjectExists = id => service.subjects.find(Number(id));

router.get('/health', (req, res) => res.json({ status: 'ok', database: 'connected' }));
router.get('/subjects', (req, res) => res.json(service.subjects.all()));
router.post('/subjects', (req, res) => {
  const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
  const color = typeof req.body.color === 'string' ? req.body.color.trim() : '';
  if (!name) return error(res, 400, 'Subject name is required.');
  if (!/^#[0-9a-f]{6}$/i.test(color)) return error(res, 400, 'Color must be a six-digit hex value, such as #4f46e5.');
  try { res.status(201).json(service.subjects.find(service.subjects.create(name, color))); }
  catch (cause) { error(res, 400, 'A subject with that name already exists.', cause.message); }
});
router.put('/subjects/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!subjectExists(id)) return error(res, 404, 'Subject not found.');
  const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
  const color = typeof req.body.color === 'string' ? req.body.color.trim() : '';
  if (!name || !/^#[0-9a-f]{6}$/i.test(color)) return error(res, 400, 'A non-empty name and valid six-digit hex color are required.');
  try { service.subjects.update(id, name, color); res.json(service.subjects.find(id)); }
  catch (cause) { error(res, 400, 'Unable to update subject.', cause.message); }
});
router.delete('/subjects/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!subjectExists(id)) return error(res, 404, 'Subject not found.');
  try {
    const result = db.prepare('DELETE FROM subjects WHERE id = ?').run(id);
    res.json({ deleted: result.changes === 1 });
  } catch { error(res, 409, 'Subject cannot be deleted while tasks are assigned to it.'); }
});

const taskValidation = (body, partial = false) => {
  const values = {};
  if (!partial || Object.prototype.hasOwnProperty.call(body, 'title')) {
    values.title = typeof body.title === 'string' ? body.title.trim() : '';
    if (!values.title) return 'Task title is required.';
  }
  if (!partial || Object.prototype.hasOwnProperty.call(body, 'description')) values.description = typeof body.description === 'string' ? body.description : '';
  if (!partial || Object.prototype.hasOwnProperty.call(body, 'subjectId')) {
    values.subjectId = Number(body.subjectId);
    if (!Number.isInteger(values.subjectId) || !subjectExists(values.subjectId)) return 'A valid subject is required.';
  }
  if (!partial || Object.prototype.hasOwnProperty.call(body, 'dueDate')) values.dueDate = body.dueDate || null;
  if (!validDate(values.dueDate)) return 'dueDate must be YYYY-MM-DD or null.';
  if (!partial || Object.prototype.hasOwnProperty.call(body, 'dueTime')) values.dueTime = body.dueTime || null;
  if (!validTime(values.dueTime)) return 'dueTime must be HH:MM or null.';
  if (!partial || Object.prototype.hasOwnProperty.call(body, 'priority')) values.priority = body.priority;
  if (!partial && !priorities.includes(values.priority) || partial && values.priority !== undefined && !priorities.includes(values.priority)) return 'Priority must be High, Medium or Low.';
  if (!partial || Object.prototype.hasOwnProperty.call(body, 'status')) values.status = body.status;
  if (!partial && !statuses.includes(values.status) || partial && values.status !== undefined && !statuses.includes(values.status)) return 'Status must be Pending, In Progress or Completed.';
  return null;
};

router.get('/tasks', (req, res) => res.json(service.tasks.all()));
router.get('/tasks/:id', (req, res) => {
  const task = service.tasks.find(req.params.id);
  if (!task) return error(res, 404, 'Task not found.');
  res.json(task);
});
router.post('/tasks', (req, res) => {
  const validation = taskValidation(req.body);
  if (validation) return error(res, 400, validation);
  const task = service.tasks.create({
    title: req.body.title.trim(), description: req.body.description || '', subjectId: Number(req.body.subjectId),
    dueDate: req.body.dueDate || null, dueTime: req.body.dueTime || null, priority: req.body.priority, status: req.body.status || 'Pending'
  });
  res.status(201).json(task);
});
router.put('/tasks/:id', (req, res) => {
  if (!service.tasks.find(req.params.id)) return error(res, 404, 'Task not found.');
  const validation = taskValidation(req.body);
  if (validation) return error(res, 400, validation);
  const task = service.tasks.update(req.params.id, {
    title: req.body.title.trim(), description: req.body.description || '', subjectId: Number(req.body.subjectId),
    dueDate: req.body.dueDate || null, dueTime: req.body.dueTime || null, priority: req.body.priority, status: req.body.status
  });
  res.json(task);
});
router.patch('/tasks/:id/status', (req, res) => {
  if (!statuses.includes(req.body.status)) return error(res, 400, 'Status must be Pending, In Progress or Completed.');
  const task = service.tasks.updateStatus(req.params.id, req.body.status);
  if (!task) return error(res, 404, 'Task not found.');
  res.json(task);
});
router.delete('/tasks/:id', (req, res) => {
  if (!service.tasks.remove(req.params.id)) return error(res, 404, 'Task not found.');
  res.json({ deleted: true });
});

router.get('/dashboard/stats', (req, res) => res.json(service.dashboard.stats()));
router.get('/dashboard/today', (req, res) => res.json(service.dashboard.today()));
router.get('/reset', (req, res) => {
  resetDatabase();
  res.json({ message: 'Database reset.' });
});

router.post('/data/reset', (req, res) => {
  resetDatabase();
  res.json({ reset: true });
});

module.exports = router;
