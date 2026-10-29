const BASE_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:3333').replace(/\/$/, '');

async function request(path, { method = 'GET', body, signal } = {}) {
  const headers = {};
  const init = { method, headers, signal };

  // Só envia Content-Type quando há corpo: o Fastify rejeita (400)
  // requisições com "application/json" e corpo vazio, como o DELETE.
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    init.body = JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, init);
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new Error('Could not reach the server. Check that the backend is running.');
  }

  if (response.status === 204) return null;

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.message ?? 'Something went wrong. Try again.');
  }
  return data;
}

export const api = {
  list: ({ search, status }, signal) => {
    const query = new URLSearchParams({ search, status });
    return request(`/api/tasks?${query}`, { signal });
  },
  create: ({ title, dueDate }) =>
    request('/api/tasks', { method: 'POST', body: { title, dueDate } }),
  update: (id, changes) => request(`/api/tasks/${id}`, { method: 'PATCH', body: changes }),
  remove: (id) => request(`/api/tasks/${id}`, { method: 'DELETE' }),
};
