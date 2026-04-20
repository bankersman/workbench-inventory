/** Base URL for REST (e.g. `/api` when using Vite dev proxy). */
export function apiBase(): string {
  const raw = import.meta.env.VITE_API_BASE as string | undefined;
  if (raw && raw.length > 0) {
    return raw.replace(/\/$/, '');
  }
  return '/api';
}

/** Turn Nest/JSON error bodies into a short user-facing string. */
export function parseApiErrorMessage(body: string, status: number, statusText: string): string {
  const trimmed = body.trim();
  if (!trimmed) {
    return statusText ? `${statusText} (${status})` : `Request failed (${status})`;
  }
  try {
    const j = JSON.parse(trimmed) as {
      message?: string | string[];
      error?: string;
    };
    if (Array.isArray(j.message)) {
      return j.message.filter(Boolean).join('; ');
    }
    if (typeof j.message === 'string' && j.message.length > 0) {
      return j.message;
    }
    if (typeof j.error === 'string' && j.error.length > 0) {
      return j.error;
    }
  } catch {
    /* not JSON */
  }
  return trimmed.length > 800 ? `${trimmed.slice(0, 800)}…` : trimmed;
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
    throw new Error(parseApiErrorMessage(text, res.status, res.statusText));
  }
  return res.json() as Promise<T>;
}
