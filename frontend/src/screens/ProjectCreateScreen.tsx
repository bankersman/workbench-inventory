import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { fetchJson } from '../api';
import { PageBody, PageHero } from '../components/PageShell';

interface ProjectRow {
  id: number;
  name: string;
  status: string;
}

const STATUSES = ['draft', 'active', 'hibernating', 'complete', 'archived'] as const;

export function ProjectCreateScreen() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [status, setStatus] = useState<(typeof STATUSES)[number]>('draft');
  const [createErr, setCreateErr] = useState<string | null>(null);

  const createMut = useMutation({
    mutationFn: (body: { name: string; status: string }) =>
      fetchJson<ProjectRow>('/projects', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    onSuccess: async (row) => {
      setCreateErr(null);
      await qc.invalidateQueries({ queryKey: ['projects'] });
      navigate(`/projects/${row.id}`);
    },
    onError: (e: Error) => setCreateErr(e.message),
  });

  return (
    <div>
      <PageHero>
        <p className="text-sm font-medium text-violet-700 dark:text-violet-400">
          <Link to="/projects" className="hover:underline">
            ← Projects
          </Link>
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          New project
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">Plan builds and manage BOMs.</p>
      </PageHero>
      <PageBody>
        <form
          className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/80"
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
          <div className="mt-4">
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
            <p className="mt-3 text-sm text-red-600 dark:text-red-400">{createErr}</p>
          ) : null}
          <div className="mt-6 flex flex-wrap justify-end gap-2">
            <Link
              to="/projects"
              className="inline-flex min-h-11 items-center rounded-xl border border-stone-300 px-4 py-2 text-sm font-medium dark:border-zinc-600 dark:text-zinc-200"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={createMut.isPending}
              className="inline-flex min-h-11 items-center rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-violet-500"
            >
              {createMut.isPending ? 'Creating…' : 'Create'}
            </button>
          </div>
        </form>
      </PageBody>
    </div>
  );
}
