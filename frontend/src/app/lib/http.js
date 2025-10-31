/** Fetches JSON from the API base URL with automatic abort on timeout and error handling. */
const API_BASE = import.meta.env?.VITE_API_BASE || 'http://localhost:8000';

export async function fetchJSON(path, opts = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), opts.timeoutMs ?? 10000);
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...opts,
      signal: ctrl.signal
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}
