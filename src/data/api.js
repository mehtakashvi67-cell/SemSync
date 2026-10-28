const apiOrigin = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const API_BASE = `${apiOrigin}/api`;

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    });
  } catch {
    throw new Error('Cannot reach the SemSync server. Start the backend and try again.');
  }

  const contentType = response.headers.get('content-type') || '';
  const body = contentType.includes('application/json') ? await response.json() : null;
  if (!response.ok) throw new Error(body?.error || body?.message || `Request failed (${response.status}).`);
  return body;
}

export const api = {
  getSubjects: () => request('/subjects'),
  getTasks: () => request('/tasks'),
  createTask: (task) => request('/tasks', { method: 'POST', body: JSON.stringify(task) }),
  updateTask: (id, task) => request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(task) }),
  updateTaskStatus: (id, status) => request(`/tasks/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  deleteTask: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),
  getDashboardStats: () => request('/dashboard/stats'),
  getDashboardToday: () => request('/dashboard/today'),
  resetData: () => request('/data/reset', { method: 'POST', body: '{}' }),
  exportData: () => `${API_BASE}/data/export`,
  importData: (data) => request('/data/import', { method: 'POST', body: JSON.stringify(data) }),
};
