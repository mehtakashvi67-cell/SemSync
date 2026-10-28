// src/App.jsx
// -------------------------------------------------------
// Root component — manages global state, routing (via page
// state), and renders the shell (sidebar + topbar + page).
// -------------------------------------------------------
import { useEffect, useState } from 'react';
import { api } from './data/api';

const frontendPriority = { High: 'high', Medium: 'medium', Low: 'low' };
const frontendStatus = { Pending: 'pending', 'In Progress': 'in-progress', Completed: 'completed' };
const backendPriority = { high: 'High', medium: 'Medium', low: 'Low' };
const backendStatus = { pending: 'Pending', 'in-progress': 'In Progress', completed: 'Completed' };

function toFrontendTask(task) {
  return {
    ...task,
    subjectId: String(task.subjectId),
    dueDate: task.dueDate || '',
    dueTime: task.dueTime || '',
    priority: frontendPriority[task.priority] || task.priority,
    status: frontendStatus[task.status] || task.status,
  };
}

// Layout
import Sidebar from './components/Sidebar';
import Topbar  from './components/Topbar';

// Modals
import AddTaskModal  from './components/AddTaskModal';
import ConfirmDialog from './components/ConfirmDialog';

// Pages
import DashboardPage from './pages/DashboardPage';
import TasksPage     from './pages/TasksPage';
import SubjectsPage  from './pages/SubjectsPage';
import CalendarPage  from './pages/CalendarPage';
import SettingsPage  from './pages/SettingsPage';

export default function App() {
  // ---- Persisted data (localStorage) ----
  const [tasks, setTasks] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [loadedSubjects, loadedTasks] = await Promise.all([api.getSubjects(), api.getTasks()]);
      setSubjects(loadedSubjects);
      setTasks(loadedTasks.map(toFrontendTask));
    } catch (cause) {
      setError(cause.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  // ---- UI state ----
  const [activePage,  setActivePage]  = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal state
  const [showModal,   setShowModal]   = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deleteId,    setDeleteId]    = useState(null);

  // ---- Task CRUD operations ----
  async function handleSaveTask(task) {
    const payload = {
      title: task.title,
      description: '',
      subjectId: Number(task.subjectId),
      dueDate: task.dueDate || null,
      dueTime: task.dueTime || null,
      priority: backendPriority[task.priority] || 'Medium',
      status: backendStatus[task.status] || 'Pending',
    };
    try {
      const saved = tasks.some((item) => String(item.id) === String(task.id))
        ? await api.updateTask(task.id, payload)
        : await api.createTask(payload);
      await loadData();
      setError('');
      return true;
    } catch (cause) {
      setError(cause.message);
      return false;
    }
  }

  async function handleToggleComplete(taskId) {
    const task = tasks.find((item) => String(item.id) === String(taskId));
    if (!task) return;
    try {
      await api.updateTaskStatus(taskId, task.status === 'completed' ? 'Pending' : 'Completed');
      await loadData();
      setError('');
    } catch (cause) {
      setError(cause.message);
    }
  }

  function handleDeleteTask(taskId) {
    setDeleteId(taskId);
  }

  async function confirmDelete() {
    try {
      await api.deleteTask(deleteId);
      await loadData();
      setDeleteId(null);
      setError('');
    } catch (cause) {
      setError(cause.message);
    }
  }

  function handleEditTask(task) {
    setEditingTask(task);
    setShowModal(true);
  }

  function openAddModal() {
    setEditingTask(null);
    setShowModal(true);
  }

  async function handleResetData() {
    try {
      await api.resetData();
      await loadData();
      setError('');
    } catch (cause) {
      setError(cause.message);
    }
  }

  // ---- Render active page ----
  function renderPage() {
    switch (activePage) {
      case 'tasks':
        return (
          <TasksPage
            tasks={tasks}
            subjects={subjects}
            searchQuery={searchQuery}
            onToggle={handleToggleComplete}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
          />
        );
      case 'subjects':
        return <SubjectsPage tasks={tasks} subjects={subjects} />;
      case 'calendar':
        return <CalendarPage tasks={tasks} subjects={subjects} />;
      case 'settings':
        return <SettingsPage onResetData={handleResetData} onDataImported={loadData} />;
      default:
        return (
          <DashboardPage
            tasks={tasks}
            subjects={subjects}
            onToggle={handleToggleComplete}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
          />
        );
    }
  }

  return (
    <div className="app-layout">
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="main-content">
        <Topbar
          activePage={activePage}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onAddTask={openAddModal}
          onToggleSidebar={() => setSidebarOpen((o) => !o)}
        />
        {loading && <div className="page-content"><p>Loading SemSync data…</p></div>}
        {error && <div className="page-content" role="alert" style={{ paddingBottom: 0, color: 'var(--color-danger)' }}>{error}</div>}
        {!loading && renderPage()}
      </main>

      {/* Add / Edit modal */}
      {showModal && (
        <AddTaskModal
          subjects={subjects}
          editingTask={editingTask}
          onClose={() => { setShowModal(false); setEditingTask(null); }}
          onSave={handleSaveTask}
        />
      )}

      {/* Delete confirmation */}
      {deleteId && (
        <ConfirmDialog
          message="Are you sure you want to delete this task? This action cannot be undone."
          onConfirm={confirmDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}
