/** Base URL for REST (e.g. `/api` when using Vite dev proxy). */
export function apiBase(): string {
  const raw = import.meta.env.VITE_API_BASE as string | undefined;
  if (raw && raw.length > 0) {
    return raw.replace(/\/$/, '');
  }
  return '/api';
}

export async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${apiBase()}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json() as Promise<T>;
}
