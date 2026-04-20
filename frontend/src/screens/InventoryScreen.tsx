import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { fetchJson } from '../api';

interface SuRow {
  id: number;
  barcode: string;
  name: string;
}

export function InventoryScreen() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [parentId, setParentId] = useState<string>('');
  const [createErr, setCreateErr] = useState<string | null>(null);

  const q = useQuery({
    queryKey: ['storage-units'],
    queryFn: () => fetchJson<SuRow[]>('/storage-units'),
  });

  const createMut = useMutation({
    mutationFn: (body: { name: string; notes?: string | null; parentId?: number | null }) =>
      fetchJson<SuRow>('/storage-units', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    onSuccess: async (row) => {
      setCreateErr(null);
      setDialogOpen(false);
      setName('');
      setNotes('');
      setParentId('');
      await qc.invalidateQueries({ queryKey: ['storage-units'] });
      navigate(`/storage-units/${row.id}`);
    },
    onError: (e: Error) => setCreateErr(e.message),
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Inventory
          </h1>
          <p className="mt-1 text-zinc-600 dark:text-zinc-400">
            Browse shelves and bins. Add a storage area when the shop layout changes.
          </p>
          <h2 className="mt-3 text-lg font-medium text-zinc-800 dark:text-zinc-200">
            Storage units
          </h2>
        </div>
        <button
          type="button"
          onClick={() => {
            setCreateErr(null);
            setDialogOpen(true);
          }}
          className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-xl bg-violet-600 px-5 font-medium text-white shadow-sm transition hover:bg-violet-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 dark:bg-violet-500 dark:hover:bg-violet-400"
        >
          Add storage area
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
            aria-labelledby="new-su-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="new-su-title" className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              New storage area
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              A shelf, wall, or zone. You get a scannable barcode automatically.
            </p>
            <form
              className="mt-4 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                const trimmed = name.trim();
                if (!trimmed) {
                  setCreateErr('Name is required');
                  return;
                }
                const n = notes.trim();
                const body: { name: string; notes?: string | null; parentId?: number | null } = {
                  name: trimmed,
                };
                if (n) {
                  body.notes = n;
                }
                if (parentId !== '') {
                  body.parentId = Number(parentId);
                }
                createMut.mutate(body);
              }}
            >
              <div>
                <label
                  htmlFor="su-name"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Name
                </label>
                <input
                  id="su-name"
                  className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                />
              </div>
              <div>
                <label
                  htmlFor="su-parent"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Inside (optional)
                </label>
                <select
                  id="su-parent"
                  className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-zinc-900 shadow-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                >
                  <option value="">— Top level —</option>
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="su-notes"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Notes
                </label>
                <textarea
                  id="su-notes"
                  rows={2}
                  className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-zinc-900 shadow-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional"
                />
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

      {units.length === 0 ? (
        <p className="rounded-xl border border-dashed border-stone-300 p-8 text-center text-zinc-500 dark:border-zinc-600 dark:text-zinc-400">
          No storage units yet. Tap <strong>Add storage area</strong> to add a shelf or zone.
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
