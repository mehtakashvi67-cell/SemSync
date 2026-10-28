// src/data/sampleData.js
// -------------------------------------------------------
// Realistic sample tasks and subjects used to seed the app
// on first launch.  Stored in localStorage afterwards.
// -------------------------------------------------------

export const SUBJECTS = [
  { id: 'sub-1', name: 'Data Structures', color: '#4f46e5' },      // indigo
  { id: 'sub-2', name: 'Operating Systems', color: '#0891b2' },     // cyan
  { id: 'sub-3', name: 'Web Development', color: '#16a34a' },       // green
  { id: 'sub-4', name: 'Discrete Mathematics', color: '#d97706' },  // amber
];

// Helper – produces an ISO date string offset from "today"
function offsetDate(days, hours = 23, minutes = 59) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
}

export const SAMPLE_TASKS = [
  {
    id: 'task-1',
    title: 'Implement Binary Search Tree',
    subjectId: 'sub-1',
    dueDate: offsetDate(-2, 17, 0),   // 2 days overdue
    priority: 'high',
    status: 'pending',
  },
  {
    id: 'task-2',
    title: 'Write OS Process Scheduling Report',
    subjectId: 'sub-2',
    dueDate: offsetDate(-1, 23, 59),  // 1 day overdue
    priority: 'medium',
    status: 'in-progress',
  },
  {
    id: 'task-3',
    title: 'Build React Portfolio Page',
    subjectId: 'sub-3',
    dueDate: offsetDate(0, 23, 59),   // due today
    priority: 'high',
    status: 'in-progress',
  },
  {
    id: 'task-4',
    title: 'Solve Graph Theory Problem Set',
    subjectId: 'sub-4',
    dueDate: offsetDate(0, 18, 0),    // due today
    priority: 'medium',
    status: 'pending',
  },
  {
    id: 'task-5',
    title: 'Hash Table Implementation Lab',
    subjectId: 'sub-1',
    dueDate: offsetDate(2, 14, 0),    // upcoming
    priority: 'low',
    status: 'pending',
  },
  {
    id: 'task-6',
    title: 'CSS Grid & Flexbox Assignment',
    subjectId: 'sub-3',
    dueDate: offsetDate(3, 23, 59),   // upcoming
    priority: 'medium',
    status: 'pending',
  },
  {
    id: 'task-7',
    title: 'Memory Management Quiz Prep',
    subjectId: 'sub-2',
    dueDate: offsetDate(5, 10, 0),    // upcoming
    priority: 'high',
    status: 'pending',
  },
  {
    id: 'task-8',
    title: 'Combinatorics Worksheet',
    subjectId: 'sub-4',
    dueDate: offsetDate(-3, 12, 0),   // 3 days overdue – completed
    priority: 'low',
    status: 'completed',
  },
];
