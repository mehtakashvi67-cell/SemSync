const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../index');
const { resetDatabase } = require('../db/database');

beforeEach(() => resetDatabase());

test('health endpoint reports database availability', async () => {
  const response = await request(app).get('/api/health');
  assert.equal(response.status, 200);
  assert.equal(response.body.database, 'connected');
});

test('creates a task and returns its subject', async () => {
  const response = await request(app).post('/api/tasks').send({
    title: 'Test task', subjectId: 1, dueDate: '2026-11-01', dueTime: '09:30', priority: 'Medium', status: 'Pending'
  });
  assert.equal(response.status, 201);
  assert.equal(response.body.title, 'Test task');
  assert.equal(response.body.subjectId, 1);
});

test('rejects an empty task title', async () => {
  const response = await request(app).post('/api/tasks').send({ title: '   ', subjectId: 1, priority: 'High', status: 'Pending' });
  assert.equal(response.status, 400);
});

test('rejects invalid priority and status values', async () => {
  const priorityResponse = await request(app).post('/api/tasks').send({ title: 'Priority test', subjectId: 1, priority: 'Urgent', status: 'Pending' });
  assert.equal(priorityResponse.status, 400);
  const statusResponse = await request(app).post('/api/tasks').send({ title: 'Status test', subjectId: 1, priority: 'High', status: 'Blocked' });
  assert.equal(statusResponse.status, 400);
});

test('returns 404 for nonexistent task', async () => {
  const response = await request(app).get('/api/tasks/999999');
  assert.equal(response.status, 404);
});

test('updates task status and dashboard counts', async () => {
  const created = await request(app).post('/api/tasks').send({ title: 'Complete me', subjectId: 1, priority: 'High', status: 'Pending' });
  const updated = await request(app).patch(`/api/tasks/${created.body.id}/status`).send({ status: 'Completed' });
  assert.equal(updated.status, 200);
  assert.equal(updated.body.status, 'Completed');
  const stats = await request(app).get('/api/dashboard/stats');
  assert.equal(stats.body.completed, 2);
  assert.equal(stats.body.completionPercentage, Math.round(stats.body.completed / stats.body.total * 100));
});

test('rejects invalid JSON import data', async () => {
  const response = await request(app).post('/api/data/import').send({ subjects: [], tasks: [{ title: 'Bad', priority: 'Urgent', status: 'Pending' }] });
  assert.equal(response.status, 400);
});
