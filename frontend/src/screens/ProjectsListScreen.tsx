import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

import { fetchJson } from '../api';

interface ProjectRow {
  id: number;
  name: string;
  status: string;
}

export function ProjectsListScreen() {
  const q = useQuery({
    queryKey: ['projects'],
    queryFn: () => fetchJson<ProjectRow[]>('/projects'),
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
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Projects
        </h1>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">Open a project to manage its BOM.</p>
      </div>
      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-stone-300 p-8 text-center text-zinc-500 dark:border-zinc-600 dark:text-zinc-400">
          No projects yet. Create one from the API or a future “New project” action.
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
