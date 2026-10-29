import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from './api.js';
import { useDebounce } from './hooks/useDebounce.js';
import { useTheme } from './hooks/useTheme.js';
import TaskItem from './components/TaskItem.jsx';
import TaskModal from './components/TaskModal.jsx';
import { ChevronIcon, MoonIcon, PlusIcon, SearchIcon, SunIcon } from './components/Icons.jsx';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
];

export default function App() {
  const { theme, toggleTheme } = useTheme();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const debouncedSearch = useDebounce(search.trim(), 400);

  const [tasks, setTasks] = useState([]);
  const [counts, setCounts] = useState({ total: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null); // null | { mode: 'create' } | { mode: 'edit', task }

  const controllerRef = useRef(null);

  const loadTasks = useCallback(async () => {
    // Cancela a requisição anterior para que respostas antigas nunca sobrescrevam as novas
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      const data = await api.list({ search: debouncedSearch, status }, controller.signal);
      setTasks(data.tasks);
      setCounts({ total: data.total, completed: data.completed });
      setError('');
    } catch (err) {
      if (err.name === 'AbortError') return;
      setError(err.message);
    } finally {
      if (controllerRef.current === controller) setLoading(false);
    }
  }, [debouncedSearch, status]);

  useEffect(() => {
    loadTasks();
    return () => controllerRef.current?.abort();
  }, [loadTasks]);

  const closeModal = useCallback(() => setModal(null), []);

  async function handleSave({ title, dueDate }) {
    if (modal.mode === 'edit') {
      await api.update(modal.task.id, { title, dueDate });
    } else {
      await api.create({ title, dueDate });
    }
    setModal(null);
    await loadTasks();
  }

  async function handleToggle(task) {
    const next = !task.completed;

    // Atualização otimista: a UI responde na hora e depois sincroniza com o servidor
    setTasks((current) =>
      current.map((t) => (t.id === task.id ? { ...t, completed: next ? 1 : 0 } : t))
    );
    setCounts((current) => ({ ...current, completed: current.completed + (next ? 1 : -1) }));

    try {
      await api.update(task.id, { completed: next });
    } catch (err) {
      setError(err.message);
    }
    await loadTasks();
  }

  async function handleDelete(task) {
    if (!window.confirm(`Delete "${task.title}"?`)) return;
    try {
      await api.remove(task.id);
    } catch (err) {
      setError(err.message);
    }
    await loadTasks();
  }

  const isEmpty = !loading && !error && tasks.length === 0;

  return (
    <main className="card">
      <h1>TODO LIST</h1>

      <div className="toolbar">
        <div className="search">
          <SearchIcon className="search-icon" />
          <input
            type="search"
            value={search}
            placeholder="Search note..."
            aria-label="Search tasks"
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="select">
          <select
            value={status}
            aria-label="Filter tasks"
            onChange={(event) => setStatus(event.target.value)}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronIcon className="select-chevron" />
        </div>

        <button
          type="button"
          className="square-btn"
          onClick={toggleTheme}
          aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
        >
          {theme === 'light' ? <MoonIcon /> : <SunIcon />}
        </button>
      </div>

      <p className="counters" aria-live="polite">
        <span>
          Total <strong>{counts.total}</strong>
        </span>
        <span>
          Completed <strong>{counts.completed}</strong>
        </span>
      </p>

      {error && (
        <div className="error-banner" role="alert">
          <span>{error}</span>
          <button type="button" onClick={loadTasks}>
            Try again
          </button>
        </div>
      )}

      {tasks.length > 0 && (
        <ul className="tasks">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={handleToggle}
              onEdit={(t) => setModal({ mode: 'edit', task: t })}
              onDelete={handleDelete}
            />
          ))}
        </ul>
      )}

      {isEmpty && <p className="empty">You have no pending tasks.</p>}

      <div className="fab-row">
        <button
          type="button"
          className="fab"
          aria-label="Create task"
          onClick={() => setModal({ mode: 'create' })}
        >
          <PlusIcon width={28} height={28} strokeWidth={2.4} />
        </button>
      </div>

      {modal && (
        <TaskModal
          key={modal.mode === 'edit' ? modal.task.id : 'create'}
          mode={modal.mode}
          task={modal.task}
          onClose={closeModal}
          onSubmit={handleSave}
        />
      )}
    </main>
  );
}
