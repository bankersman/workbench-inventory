import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

import { fetchJson } from '../api';
import { PageBody, PageHero, SectionCard } from '../components/PageShell';

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
    <div>
      <PageHero>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Inventory
            </h1>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              Browse shelves and bins. Add a storage area when the shop layout changes.
            </p>
          </div>
          <Link
            to="/inventory/new"
            className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-xl bg-violet-600 px-5 font-medium text-white shadow-sm transition hover:bg-violet-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 dark:bg-violet-500 dark:hover:bg-violet-400"
          >
            Add storage area
          </Link>
        </div>
      </PageHero>
      <PageBody>
        <SectionCard title="Storage units">
          {units.length === 0 ? (
            <p className="rounded-xl border border-dashed border-stone-300 p-8 text-center text-zinc-500 dark:border-zinc-600 dark:text-zinc-400">
              No storage units yet. Use <strong>Add storage area</strong> to add a shelf or zone.
            </p>
          ) : (
            <ul className="divide-y divide-stone-200 overflow-hidden rounded-xl border border-stone-200 dark:divide-zinc-700 dark:border-zinc-700">
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
        </SectionCard>
        <Link
          to="/"
          className="inline-flex min-h-11 items-center font-medium text-violet-700 underline-offset-4 hover:underline dark:text-violet-400"
        >
          ← Home
        </Link>
      </PageBody>
    </div>
  );
}
