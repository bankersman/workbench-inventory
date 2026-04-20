import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

import { fetchJson } from '../api';

interface SuRow {
  id: number;
  barcode: string;
  name: string;
}

export function InventoryScreen() {
  const q = useQuery({
    queryKey: ['storage-units'],
    queryFn: () => fetchJson<SuRow[]>('/storage-units'),
  });

  if (q.isPending) {
    return (
      <section className="rounded-2xl border border-stone-200 bg-white/80 p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/80">
        <p className="text-zinc-500 dark:text-zinc-400">Loading storage units…</p>
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

  const units = q.data ?? [];

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Inventory
        </h1>
        <h2 className="mt-2 text-lg font-medium text-zinc-700 dark:text-zinc-300">Storage units</h2>
      </div>
      {units.length === 0 ? (
        <p className="rounded-xl border border-dashed border-stone-300 p-8 text-center text-zinc-500 dark:border-zinc-600 dark:text-zinc-400">
          No storage units yet.
        </p>
      ) : (
        <ul className="divide-y divide-stone-200 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm dark:divide-zinc-700 dark:border-zinc-700 dark:bg-zinc-900/80">
          {units.map((u) => (
            <li key={u.id}>
              <Link
                to={`/storage-units/${u.id}`}
                className="flex min-h-14 flex-col gap-0.5 px-4 py-3 transition hover:bg-stone-50 sm:flex-row sm:items-center sm:justify-between dark:hover:bg-zinc-800/80"
              >
                <span className="font-medium text-zinc-900 dark:text-zinc-100">{u.name}</span>
                <span className="font-mono text-sm text-zinc-500 dark:text-zinc-400">
                  {u.barcode}
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
