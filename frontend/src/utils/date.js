// A API devolve due_date como 'YYYY-MM-DD' (dateStrings: true no mysql2).
// Comparamos strings ISO para evitar problemas de fuso horário.

export function todayISO() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

export function isOverdue(task) {
  if (task.completed || !task.due_date) return false;
  return task.due_date.slice(0, 10) < todayISO();
}

export function formatDate(iso) {
  const [year, month, day] = iso.slice(0, 10).split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('pt-BR');
}
