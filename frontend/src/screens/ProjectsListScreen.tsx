import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { fetchJson } from '../api';

interface ProjectRow {
  id: number;
  name: string;
  status: string;
}

const STATUSES = ['draft', 'active', 'hibernating', 'complete', 'archived'] as const;

export function ProjectsListScreen() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState('');
  const [status, setStatus] = useState<(typeof STATUSES)[number]>('draft');
  const [createErr, setCreateErr] = useState<string | null>(null);

  const q = useQuery({
    queryKey: ['projects'],
    queryFn: () => fetchJson<ProjectRow[]>('/projects'),
  });

  const createMut = useMutation({
    mutationFn: (body: { name: string; status: string }) =>
      fetchJson<ProjectRow>('/projects', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    onSuccess: async (row) => {
      setCreateErr(null);
      setDialogOpen(false);
      setName('');
      setStatus('draft');
      await qc.invalidateQueries({ queryKey: ['projects'] });
      navigate(`/projects/${row.id}`);
    },
    onError: (e: Error) => setCreateErr(e.message),
  });

  if (q.isPending) {
    return (
      <section className="rounded-2xl border border-stone-200 bg-white/80 p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/80">
        <p className="text-zinc-500 dark:text-zinc-400">Loading projects…</p>
      </section>
    );
  }

  if (q.isError) {
    return (
      <section className="rounded-2xl border border-red-200 bg-red-50/90 p-6 dark:border-red-900 dark:bg-red-950/40">
        <p className="text-red-800 dark:text-red-200">
          {q.error instanceof Error ? q.error.message : 'Error'}
        </p>
      </section>
    );
  }

  const rows = q.data ?? [];

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Projects
          </h1>
          <p className="mt-1 text-zinc-600 dark:text-zinc-400">Plan builds and manage BOMs.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setCreateErr(null);
            setDialogOpen(true);
          }}
          className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-xl bg-violet-600 px-5 font-medium text-white shadow-sm transition hover:bg-violet-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 dark:bg-violet-500 dark:hover:bg-violet-400"
        >
          New project
        </button>
      </div>

      {dialogOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
          role="presentation"
          onClick={() => setDialogOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
            role="dialog"
            aria-labelledby="new-project-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="new-project-title"
              className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
            >
              New project
            </h2>
            <form
              className="mt-4 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                const trimmed = name.trim();
                if (!trimmed) {
                  setCreateErr('Name is required');
                  return;
                }
                createMut.mutate({ name: trimmed, status });
              }}
            >
              <div>
                <label
                  htmlFor="proj-name"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Name
                </label>
                <input
                  id="proj-name"
                  className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                />
              </div>
              <div>
                <label
                  htmlFor="proj-status"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Status
                </label>
                <select
                  id="proj-status"
                  className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-zinc-900 shadow-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as (typeof STATUSES)[number])}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              {createErr ? (
                <p className="text-sm text-red-600 dark:text-red-400">{createErr}</p>
              ) : null}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  className="rounded-xl border border-stone-300 px-4 py-2 text-sm font-medium text-zinc-800 dark:border-zinc-600 dark:text-zinc-200"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMut.isPending}
                  className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-60 dark:bg-violet-500"
                >
                  {createMut.isPending ? 'Creating…' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-stone-300 p-8 text-center text-zinc-500 dark:border-zinc-600 dark:text-zinc-400">
          No projects yet. Tap <strong>New project</strong> to create one.
        </p>
      ) : (
        <ul className="divide-y divide-stone-200 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm dark:divide-zinc-700 dark:border-zinc-700 dark:bg-zinc-900/80">
          {rows.map((p) => (
            <li key={p.id}>
              <Link
                to={`/projects/${p.id}`}
                className="flex min-h-14 items-center justify-between gap-3 px-4 py-3 transition hover:bg-stone-50 dark:hover:bg-zinc-800/80"
              >
                <span className="font-medium text-zinc-900 dark:text-zinc-100">{p.name}</span>
                <span className="shrink-0 rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                  {p.status}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <Link
        to="/"
        className="inline-flex min-h-11 items-center font-medium text-violet-700 underline-offset-4 hover:underline dark:text-violet-400"
      >
        ← Home
      </Link>
    </section>
  );
}
