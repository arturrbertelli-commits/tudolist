import { useEffect, useRef, useState } from 'react';

export default function TaskModal({ mode, task, onClose, onSubmit }) {
  const isEdit = mode === 'edit';
  const [title, setTitle] = useState(task?.title ?? '');
  const [dueDate, setDueDate] = useState(task?.due_date?.slice(0, 10) ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const titleRef = useRef(null);

  // Foco no campo ao abrir e devolve o foco ao elemento anterior ao fechar
  useEffect(() => {
    const previous = document.activeElement;
    titleRef.current?.focus();
    return () => previous?.focus?.();
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!title.trim()) {
      setError('Task name is required.');
      titleRef.current?.focus();
      return;
    }

    setSaving(true);
    setError('');
    try {
      await onSubmit({ title: title.trim(), dueDate: dueDate || null });
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <div
      className="backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <h2 id="modal-title">{isEdit ? 'Edit Task' : 'Create Task'}</h2>

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="task-title">Task name</label>
            <input
              id="task-title"
              ref={titleRef}
              type="text"
              maxLength={255}
              value={title}
              placeholder="What needs to be done?"
              onChange={(event) => setTitle(event.target.value)}
              aria-invalid={Boolean(error) && !title.trim()}
            />
          </div>

          <div className="field">
            <label htmlFor="task-due">Due date (optional)</label>
            <input
              id="task-due"
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
            />
          </div>

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
