import { useId } from 'react';
import { PencilIcon, TrashIcon } from './Icons.jsx';
import { formatDate, isOverdue } from '../utils/date.js';

export default function TaskItem({ task, onToggle, onEdit, onDelete }) {
  const inputId = useId();
  const completed = Boolean(task.completed);
  const overdue = isOverdue(task);

  const classes = ['task', completed && 'is-done', overdue && 'is-overdue']
    .filter(Boolean)
    .join(' ');

  return (
    <li className={classes}>
      <input
        id={inputId}
        type="checkbox"
        className="check"
        checked={completed}
        onChange={() => onToggle(task)}
      />

      <div className="task-body">
        <label htmlFor={inputId} className="task-title">
          {task.title}
        </label>
        {task.due_date && (
          <span className="task-meta">
            <span className="task-date">{formatDate(task.due_date)}</span>
            {overdue && <span className="badge">Em atraso</span>}
          </span>
        )}
      </div>

      <div className="task-actions">
        <button
          type="button"
          className="icon-btn"
          aria-label={`Edit task: ${task.title}`}
          onClick={() => onEdit(task)}
        >
          <PencilIcon />
        </button>
        <button
          type="button"
          className="icon-btn icon-btn-danger"
          aria-label={`Delete task: ${task.title}`}
          onClick={() => onDelete(task)}
        >
          <TrashIcon />
        </button>
      </div>
    </li>
  );
}
