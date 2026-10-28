// src/data/helpers.js
// -------------------------------------------------------
// Pure utility functions used across components.
// -------------------------------------------------------

/**
 * Format an ISO date string to a short, human‑readable form.
 * e.g. "Oct 28, 5:00 PM"
 */
export function formatDate(value, timeValue) {
  if (!value) return '—';
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return timeValue ? `${formattedDate}, ${formatTime(timeValue)}` : formattedDate;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Return 'overdue' | 'today' | 'upcoming' relative to now.
 */
export function dueDateGroup(value) {
  if (!value) return 'upcoming';
  const dateOnly = String(value).slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) return 'upcoming';
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  if (dateOnly < todayKey) return 'overdue';
  if (dateOnly === todayKey) return 'today';
  return 'upcoming';
}

/**
 * Priority sort weight (higher weight = should appear first).
 */
export function priorityWeight(p) {
  if (p === 'high')   return 3;
  if (p === 'medium') return 2;
  return 1;
}

/**
 * Generate a simple unique id.
 */
export function generateId() {
  return 'task-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);
}

/**
 * Nice greeting based on time of day.
 */
export function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

/**
 * Today formatted nicely.
 */
export function todayString() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format a time string to a human-readable form.
 */
export function formatTime(time) {
  if (!/^\d{2}:\d{2}$/.test(time || '')) return '';
  const [hours, minutes] = time.split(':').map(Number);
  const suffix = hours >= 12 ? 'PM' : 'AM';
  return `${hours % 12 || 12}:${String(minutes).padStart(2, '0')} ${suffix}`;
}
